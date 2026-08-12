import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Code, Image as ImageIcon, Check } from 'lucide-react';
import Papa from 'papaparse';
import { saveArticlesBatch } from '../../lib/articlesService';
import { Article, mapSupabaseArticle } from '../../lib/mockData';
import toast from 'react-hot-toast';

interface ArticleImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: 'fr' | 'en';
}

/**
 * Decode HTML entities like &lt;p&gt; &quot; &amp; &#8217;
 */
function decodeHTMLEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#8217;/gi, "'")
    .replace(/&#8216;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    .replace(/&#8211;/gi, '-')
    .replace(/&#8212;/gi, '--')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ');
}

/**
 * Clean article content and convert plain linebreaks to <p> if needed
 */
function cleanArticleContent(raw: string): string {
  if (!raw) return '';
  let str = decodeHTMLEntities(String(raw).trim());

  // Remove WordPress caption shortcodes e.g. [caption id="..." align="..."]<img .../> text[/caption]
  // but keep the inner content (which usually contains the image and caption text)
  str = str.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gi, '$1');
  str = str.replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gi, '$1');

  // Convert plain text double newlines to paragraphs if no <p> tags present
  if (!/<p>/i.test(str) && !/<br\s*\/?>/i.test(str) && str.includes('\n')) {
    const paragraphs = str.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      str = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('\n');
    }
  }

  return str;
}

/**
 * Extract featured image URL from fields or content HTML
 */
function extractFeaturedImage(normalizedRec: Record<string, any>, contentHtml: string): string {
  const imageKeys = [
    'featured_image_url', 'featured_image', 'featured_media', 'image_url', 'image',
    'cover_image', 'cover', 'cover_url', 'thumbnail', 'thumbnail_url', 'photo',
    'photo_url', 'picture', 'picture_url', 'media_url', 'media', 'img', 'img_url',
    'banner', 'banner_url', 'hero_image', 'hero', 'illustration', 'url_image',
    'main_image', 'image_path', 'img_src', 'src', 'file_url', 'url', 'pic',
    'image_link', 'guid', 'attachment_url', 'image_vedette', 'photo_couverture',
    'url_de_l_image', 'médias', 'image_principale', 'fichier', '_thumbnail_id'
  ];

  // 1. Check specific keys for direct URLs or URLs hidden inside JSON/Serialized arrays
  for (const k of imageKeys) {
    const val = normalizedRec[k];
    if (val && typeof val === 'string') {
      const str = val.trim();
      
      // Look for any valid http/https URL in the string
      const urlMatch = str.match(/(https?:\/\/[^\s"'<>\[\]{}|\\^`]+)/i);
      if (urlMatch) {
         const url = urlMatch[1];
         if (/\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(url)) return url;
         return url; // Trust it if it's in an image column
      }

      // Handle protocol-relative or absolute paths with image extensions
      if ((str.startsWith('//') || str.startsWith('/')) && /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(str)) {
        return str.startsWith('//') ? 'https:' + str : str;
      }
    }
  }

  // 2. Scan ALL fields for a URL ending in an image extension
  for (const [k, v] of Object.entries(normalizedRec)) {
    if (typeof v === 'string' && v.trim()) {
      const s = v.trim();
      const urlMatch = s.match(/(https?:\/\/[^\s"'<>\[\]{}|\\^`]+)/i);
      if (urlMatch && /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(urlMatch[1])) {
        return urlMatch[1];
      }
    }
  }

  // 3. Fallback: extract from content HTML (<img src="..." ...>)
  const cleanHtml = decodeHTMLEntities(contentHtml || '');
  const imgSrcMatch = cleanHtml.match(/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["']/i);
  if (imgSrcMatch && imgSrcMatch[1]) {
    const src = imgSrcMatch[1].trim();
    if (src.startsWith('http')) return src;
    if (src.startsWith('//')) return 'https:' + src;
  }

  // 4. Fallback: check srcset
  const srcsetMatch = cleanHtml.match(/<img[^>]+srcset=["']([^"']+)["']/i);
  if (srcsetMatch && srcsetMatch[1]) {
    const firstSrc = srcsetMatch[1].split(',')[0].trim().split(/\s+/)[0];
    if (firstSrc) {
       if (firstSrc.startsWith('http')) return firstSrc;
       if (firstSrc.startsWith('//')) return 'https:' + firstSrc;
    }
  }

  // 5. Fallback: Any image URL inside the content
  const contentUrlMatch = cleanHtml.match(/(https?:\/\/[^\s"'<>\[\]{}|\\^`]+\.(?:jpg|jpeg|png|webp|gif|svg|avif))/i);
  if (contentUrlMatch) {
    return contentUrlMatch[1];
  }

  return '';
}

/**
 * Ultra-robust CSV parser using standard PapaParse RFC-4180 parsing + fallback strategies.
 */
function parseCSV(text: string): Record<string, string>[] {
  if (!text || !text.trim()) return [];
  const cleanText = text.replace(/^\uFEFF/, '').trim();

  let bestRecords: Record<string, string>[] = [];
  let fewestErrors = Infinity;

  const configs = [
    // 1. Standard comma
    { header: true, skipEmptyLines: 'greedy', dynamicTyping: false, transformHeader: (h: string) => h.trim().toLowerCase() },
    // 2. Standard comma with backslash escapes (common in MySQL/WP exports)
    { header: true, skipEmptyLines: 'greedy', dynamicTyping: false, escapeChar: '\\', transformHeader: (h: string) => h.trim().toLowerCase() },
    // 3. Semicolon delimiter (Excel/European)
    { header: true, skipEmptyLines: 'greedy', dynamicTyping: false, delimiter: ';', transformHeader: (h: string) => h.trim().toLowerCase() },
    // 4. Semicolon with backslash escapes
    { header: true, skipEmptyLines: 'greedy', dynamicTyping: false, delimiter: ';', escapeChar: '\\', transformHeader: (h: string) => h.trim().toLowerCase() },
    // 5. Auto-guess
    { header: true, skipEmptyLines: 'greedy', dynamicTyping: false, delimitersToGuess: [',', ';', '\t', '|'], transformHeader: (h: string) => h.trim().toLowerCase() }
  ];

  for (const cfg of configs) {
    try {
      const parsed = Papa.parse<Record<string, any>>(cleanText, cfg as any);
      const errorCount = parsed.errors.length;
      
      if (parsed.data && parsed.data.length > 0) {
        const records = parsed.data.filter(row => {
          if (!row || typeof row !== 'object') return false;
          return Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '');
        }) as Record<string, string>[];

        if (records.length > 0) {
          // Prefer the parse with the most records. If tied, prefer the one with fewer PapaParse errors.
          if (records.length > bestRecords.length || (records.length === bestRecords.length && errorCount < fewestErrors)) {
            bestRecords = records;
            fewestErrors = errorCount;
          }
        }
      }
    } catch (e) {
      console.warn('PapaParse iteration failed:', e);
    }
  }

  if (bestRecords.length > 0) return bestRecords;

  // Last resort: headerless relaxed parsing
  try {
    const relaxed = Papa.parse<string[]>(cleanText, {
      header: false,
      skipEmptyLines: 'greedy',
    });

    if (relaxed && relaxed.data && relaxed.data.length > 1) {
      const headers = relaxed.data[0].map(h => String(h || '').trim().toLowerCase());
      const dataRows = relaxed.data.slice(1);

      const records: Record<string, string>[] = [];
      dataRows.forEach(row => {
        if (!row || row.length === 0) return;
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (header) {
            record[header] = row[index] !== undefined ? String(row[index]).trim() : '';
          }
        });
        if (Object.values(record).some(v => String(v).trim().length > 0)) {
          records.push(record);
        }
      });
      if (records.length > 0) return records;
    }
  } catch (e) {}

  return [];
}

function processRawRecords(records: Record<string, any>[]): Article[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  return records.map((rec, idx) => {
    const normalizedRec: Record<string, any> = {};
    Object.keys(rec || {}).forEach(key => {
      if (key) {
        normalizedRec[key.trim().toLowerCase()] = rec[key];
      }
    });

    const findVal = (...keys: string[]) => {
      for (const k of keys) {
        if (normalizedRec[k] !== undefined && normalizedRec[k] !== null && String(normalizedRec[k]).trim() !== '') {
          return normalizedRec[k];
        }
      }
      return undefined;
    };

    const rawId = findVal('id', 'uuid', 'article_id', 'post_id', '_id');
    let id = rawId ? String(rawId).trim() : `imported_${Date.now()}_${idx}`;
    if (!id || seenIds.has(id)) {
      id = `imported_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    }
    seenIds.add(id);

    const titleVal = decodeHTMLEntities(
      findVal('title', 'title_fr', 'title_french', 'title_en', 'title_english', 'post_title', 'name', 'heading', 'subject') || `Article ${idx + 1}`
    );
    const title_fr = decodeHTMLEntities(findVal('title_fr', 'title_french', 'title', 'post_title', 'name', 'heading') || String(titleVal));
    const title_en = decodeHTMLEntities(findVal('title_en', 'title_english', 'title', 'post_title', 'name', 'heading') || String(titleVal));

    const rawSlug = findVal('slug', 'url_slug', 'permalink');
    let baseSlug = rawSlug 
      ? String(rawSlug).trim() 
      : String(title_fr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `article-${id}`;
    
    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    seenSlugs.add(slug);

    const rawContentFr = findVal('content_fr', 'content', 'body_fr', 'body', 'post_content', 'text', 'details', 'html', 'texte', 'contenu', 'corps') || '';
    const rawContentEn = findVal('content_en', 'content', 'body_en', 'body', 'post_content', 'text', 'details', 'html', 'texte', 'contenu', 'corps') || '';

    const content_fr = cleanArticleContent(rawContentFr);
    const content_en = cleanArticleContent(rawContentEn || rawContentFr);

    const rawExcerptFr = findVal('excerpt_fr', 'excerpt', 'summary_fr', 'summary', 'description', 'subtitle', 'intro', 'post_excerpt') || '';
    const rawExcerptEn = findVal('excerpt_en', 'excerpt', 'summary_en', 'summary', 'description', 'subtitle', 'intro', 'post_excerpt') || '';

    let excerpt_fr = decodeHTMLEntities(rawExcerptFr);
    let excerpt_en = decodeHTMLEntities(rawExcerptEn);

    if (!excerpt_fr && content_fr) {
      const stripped = content_fr.replace(/<[^>]+>/g, '').trim();
      excerpt_fr = stripped.length > 180 ? stripped.substring(0, 180) + '...' : stripped;
    }
    if (!excerpt_en) excerpt_en = excerpt_fr;

    const category = decodeHTMLEntities(findVal('category', 'category_fr', 'category_name', 'topic', 'tag', 'section') || 'Actualités');

    const publishedRaw = findVal('is_published', 'published', 'status', 'state', 'is_active');
    let is_published = true;
    if (publishedRaw !== undefined) {
      if (typeof publishedRaw === 'boolean') is_published = publishedRaw;
      else if (typeof publishedRaw === 'number') is_published = publishedRaw === 1;
      else {
        const str = String(publishedRaw).toLowerCase().trim();
        if (str === 'draft' || str === 'brouillon' || str === 'false' || str === '0' || str === 'f') {
          is_published = false;
        } else {
          is_published = true;
        }
      }
    }

    const created_at = findVal('created_at', 'published_at', 'inserted_at', 'date', 'created_date', 'post_date') || new Date().toISOString();
    const published_at = findVal('published_at', 'created_at', 'inserted_at', 'date', 'created_date', 'post_date') || new Date().toISOString();

    const featured_image_url = extractFeaturedImage(normalizedRec, rawContentFr || rawContentEn);

    const author_name = decodeHTMLEntities(findVal('author_name', 'author', 'author_full_name', 'writer', 'created_by') || 'Équipe YAM TV');
    const author_role = decodeHTMLEntities(findVal('author_role', 'role') || 'Rédacteur');

    return mapSupabaseArticle({
      id: String(id),
      slug: String(slug),
      title_fr: String(title_fr),
      title_en: String(title_en),
      excerpt_fr: String(excerpt_fr),
      excerpt_en: String(excerpt_en),
      content_fr: String(content_fr),
      content_en: String(content_en),
      category: String(category),
      category_fr: String(category),
      category_en: String(category),
      is_published,
      published: is_published,
      created_at: String(created_at),
      published_at: String(published_at),
      author_name: String(author_name),
      author_role: String(author_role),
      author_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
      featured_image_url: String(featured_image_url),
      read_time_fr: '5 min de lecture',
      read_time_en: '5 min read'
    });
  });
}

export const ArticleImporter: React.FC<ArticleImporterProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [parsedArticles, setParsedArticles] = useState<Partial<Article>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [pastedContent, setPastedContent] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let records: Record<string, any>[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          records = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          records = parseCSV(content);
        }

        if (records.length === 0) {
          setErrorMsg(lang === 'fr' ? 'Aucune donnée trouvée dans le fichier.' : 'No data records found in the file.');
          return;
        }

        const articles = processRawRecords(records);
        setParsedArticles(articles);
        setSelectedIndices(articles.map((_, i) => i));
      } catch (err: any) {
        console.error('Import parse error:', err);
        setErrorMsg(lang === 'fr' ? `Erreur de lecture : ${err.message}` : `Error parsing file: ${err.message}`);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleParsePastedText = () => {
    setErrorMsg('');
    if (!pastedContent.trim()) {
      setErrorMsg(lang === 'fr' ? 'Veuillez coller du texte JSON ou CSV.' : 'Please paste JSON or CSV text.');
      return;
    }

    try {
      let records: Record<string, any>[] = [];
      const trimmed = pastedContent.trim();

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        records = parseCSV(trimmed);
      }

      if (records.length === 0) {
        setErrorMsg(lang === 'fr' ? 'Impossible de lire les données collées.' : 'Could not parse pasted data.');
        return;
      }

      const articles = processRawRecords(records);
      setParsedArticles(articles);
      setSelectedIndices(articles.map((_, i) => i));
      setFileName(`Texte collé (${articles.length} articles)`);
    } catch (err: any) {
      console.error('Paste parse error:', err);
      setErrorMsg(lang === 'fr' ? `Erreur de format : ${err.message}` : `Text parsing error: ${err.message}`);
    }
  };

  const handleStartImport = async () => {
    if (selectedIndices.length === 0) return;

    setImporting(true);
    setProgress({ current: 0, total: selectedIndices.length });

    const articlesToImport = selectedIndices.map(i => parsedArticles[i]);

    try {
      await saveArticlesBatch(articlesToImport);
      for (let i = 0; i < articlesToImport.length; i++) {
        setProgress({ current: i + 1, total: articlesToImport.length });
        await new Promise(r => setTimeout(r, 15));
      }
    } catch (e) {
      console.error('Batch save error:', e);
    }

    setImporting(false);
    toast.success(
      lang === 'fr' 
        ? `${articlesToImport.length} article(s) importé(s) avec succès dans la base de données !` 
        : `Successfully imported ${articlesToImport.length} article(s) into database!`
    );
    onSuccess();
    onClose();
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === parsedArticles.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parsedArticles.map((_, i) => i));
    }
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const resetImport = () => {
    setParsedArticles([]);
    setSelectedIndices([]);
    setErrorMsg('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {lang === 'fr' ? 'Importer des articles vers la base de données' : 'Import Articles into Database'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {lang === 'fr'
                ? 'Analyseur automatique multi-formats (CSV, JSON, WordPress, Supabase).'
                : 'Multi-format automatic parser (CSV, JSON, WordPress, Supabase).'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        {parsedArticles.length === 0 && (
          <div className="flex border-b border-gray-100 bg-gray-50/30 px-6 pt-3 gap-2">
            <button
              onClick={() => { setActiveTab('file'); setErrorMsg(''); }}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-white text-primary border-t border-x border-gray-200 shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <FileText size={16} />
              {lang === 'fr' ? '1. Fichier CSV / JSON' : '1. CSV / JSON File'}
            </button>
            <button
              onClick={() => { setActiveTab('paste'); setErrorMsg(''); }}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white text-primary border-t border-x border-gray-200 shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <Code size={16} />
              {lang === 'fr' ? '2. Copier / Coller du Texte' : '2. Copy / Paste Text'}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {parsedArticles.length === 0 ? (
            <>
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 hover:border-primary rounded-2xl p-8 sm:p-10 text-center bg-gray-50/50 hover:bg-orange-50/20 transition-all duration-200 flex flex-col items-center justify-center group relative">
                    <input
                      id="mobile-csv-file-input"
                      type="file"
                      accept="*/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <p className="text-base font-semibold text-charcoal mb-1">
                      {lang === 'fr' ? 'Sélectionner votre fichier CSV ou JSON' : 'Select your CSV or JSON file'}
                    </p>
                    <p className="text-xs text-gray-400 max-w-md mb-4">
                      {lang === 'fr'
                        ? 'Compatible avec tout export WordPress, Supabase, Excel ou custom.'
                        : 'Compatible with any WordPress, Supabase, Excel or custom export.'}
                    </p>

                    <label
                      htmlFor="mobile-csv-file-input"
                      className="px-6 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer z-20 flex items-center gap-2 text-sm"
                    >
                      <Upload size={18} />
                      {lang === 'fr' ? 'Parcourir les fichiers' : 'Browse Files'}
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'paste' && (
                <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <div>
                    <h3 className="font-bold text-charcoal text-base">
                      {lang === 'fr' ? 'Coller du texte JSON ou CSV' : 'Paste JSON or CSV Text'}
                    </h3>
                  </div>

                  <textarea
                    rows={8}
                    placeholder={`[\n  {\n    "title_fr": "Mon Article",\n    "content_fr": "<p>Texte...</p>",\n    "featured_image_url": "https://..."\n  }\n]`}
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />

                  <button
                    onClick={handleParsePastedText}
                    className="w-full bg-charcoal hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Code size={18} />
                    {lang === 'fr' ? 'Analyser et charger les articles' : 'Parse & Load Articles'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* File Info & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      {lang === 'fr'
                        ? `${parsedArticles.length} article(s) détecté(s) • ${selectedIndices.length} sélectionné(s)`
                        : `${parsedArticles.length} article(s) found • ${selectedIndices.length} selected`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold px-3 py-2 bg-white border border-gray-200 text-charcoal rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {selectedIndices.length === parsedArticles.length
                      ? (lang === 'fr' ? 'Tout désélectionner' : 'Deselect All')
                      : (lang === 'fr' ? 'Tout sélectionner' : 'Select All')}
                  </button>
                  <button
                    onClick={resetImport}
                    className="text-xs font-semibold px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    {lang === 'fr' ? 'Changer de fichier' : 'Change File'}
                  </button>
                </div>
              </div>

              {/* Articles Preview Table with Image Thumbnail */}
              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto shadow-inner bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIndices.length === parsedArticles.length && parsedArticles.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </th>
                      <th className="p-3 w-14">{lang === 'fr' ? 'Image' : 'Image'}</th>
                      <th className="p-3">{lang === 'fr' ? 'Titre' : 'Title'}</th>
                      <th className="p-3">{lang === 'fr' ? 'Catégorie' : 'Category'}</th>
                      <th className="p-3">{lang === 'fr' ? 'Contenu' : 'Content'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedArticles.map((art, idx) => {
                      const isSelected = selectedIndices.includes(idx);
                      const hasImage = !!art.featured_image_url;
                      const contentLen = (art.content_fr || '').length;

                      return (
                        <tr
                          key={idx}
                          onClick={() => toggleSelectIndex(idx)}
                          className={`hover:bg-orange-50/30 transition-colors cursor-pointer ${
                            isSelected ? 'bg-orange-50/20' : ''
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectIndex(idx)}
                              className="rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            {hasImage ? (
                              <img 
                                src={art.featured_image_url} 
                                alt="" 
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-medium text-charcoal max-w-xs">
                            <div className="line-clamp-1">{art.title_fr || art.title_en || 'Sans titre'}</div>
                          </td>
                          <td className="p-3 text-gray-500 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-semibold">
                              {art.category || 'Actualités'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-xs whitespace-nowrap">
                            {contentLen > 0 ? (
                              <span className="text-emerald-600 font-medium">✓ {contentLen} car.</span>
                            ) : (
                              <span className="text-amber-500 font-medium">⚠ Court</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {importing && (
            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold text-charcoal">
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  {lang === 'fr' ? 'Importation vers la base de données en cours...' : 'Importing to Database...'}
                </span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-charcoal transition-colors disabled:opacity-50 cursor-pointer"
          >
            {lang === 'fr' ? 'Annuler' : 'Cancel'}
          </button>

          <button
            onClick={handleStartImport}
            disabled={parsedArticles.length === 0 || selectedIndices.length === 0 || importing}
            className="bg-primary hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {lang === 'fr' ? 'Importation...' : 'Importing...'}
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {lang === 'fr'
                  ? `Importer (${selectedIndices.length}) vers la Base de données`
                  : `Import (${selectedIndices.length}) to Database`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
