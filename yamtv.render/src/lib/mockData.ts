export interface Article {
  id: string;
  title_fr: string;
  title_en: string;
  slug: string;
  category: string;
  excerpt_fr: string;
  excerpt_en: string;
  content_fr: string;
  content_en: string;
  featured_image_url: string;
  published_at: string;
  is_published: boolean;
  is_featured?: boolean;
}

export const mockArticles: Article[] = [];
export const initialArticles = mockArticles;

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  is_approved: boolean;
}

export function decodeHTMLEntities(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&#8217;/gi, "'")
    .replace(/&#8216;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8211;/gi, '–')
    .replace(/&#8212;/gi, '—');
}

export function cleanTitle(raw: any): string {
  if (!raw) return 'Sans titre';
  let t = decodeHTMLEntities(String(raw)).trim();
  t = t.replace(/^["']|["']$/g, '').replace(/<[^>]*>?/gm, '').trim();
  return t || 'Sans titre';
}

export function cleanAndFormatContent(raw: any): string {
  if (!raw || typeof raw !== 'string') return '';
  
  let str = decodeHTMLEntities(raw).trim();

  // Strip WordPress Gutenberg block comment wrappers
  str = str.replace(/<!--\s*\/?wp:[^>]+-->/gi, '');
  
  // Clean surrounding quote wrappers or escaped quotes
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.substring(1, str.length - 1);
  }
  str = str.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, "\n");

  // Detect if content is plain text vs structured HTML
  const hasHTMLTags = /<(p|div|h[1-6]|ul|ol|li|blockquote|table|br|article|section)\b/i.test(str);

  if (!hasHTMLTags) {
    // Split plain text into paragraphs safely
    const paragraphs = str
      .split(/\r?\n\r?\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\r?\n/g, '<br />')}</p>`);

    if (paragraphs.length > 0) {
      str = paragraphs.join('\n');
    } else {
      str = `<p class="mb-4 leading-relaxed">${str.replace(/\r?\n/g, '<br />')}</p>`;
    }
  }

  return str;
}

export function getCategoryFallbackImage(categoryName: string): string {
  const cat = (categoryName || '').toLowerCase().trim();
  if (cat.includes('polit') || cat.includes('gouv') || cat.includes('état') || cat.includes('nation')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('écon') || cat.includes('econ') || cat.includes('finan') || cat.includes('burs') || cat.includes('affair')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('cult') || cat.includes('art') || cat.includes('musiqu') || cat.includes('ciné') || cat.includes('spectacl')) {
    return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('sport') || cat.includes('foot') || cat.includes('match') || cat.includes('jeu')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('tech') || cat.includes('innov') || cat.includes('digital') || cat.includes('scien') || cat.includes('web')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('sociét') || cat.includes('societ') || cat.includes('sant') || cat.includes('éduc') || cat.includes('vie')) {
    return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('monde') || cat.includes('internat') || cat.includes('afriq') || cat.includes('europ') || cat.includes('diplom')) {
    return 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
}

export function extractImageFromData(data: any, contentFr: string, contentEn: string, category: string): string {
  let featuredImg = data.featured_image_url || data.featured_image || data.image_url || data.image || data.cover_image || data.cover || data.cover_url || data.thumbnail || data.thumbnail_url || data.photo || data.photo_url || data.picture || data.picture_url || data.media_url || data.media || data.img || data.img_url || data.banner || data.banner_url || data.hero_image || data.hero || data.main_image || data.image_path || data.src || data.file_url || data.url || data.guid || data.post_image || data.attachment_url;

  if (featuredImg && typeof featuredImg === 'string') {
    let cleaned = featuredImg.trim();
    if (cleaned.startsWith('//')) cleaned = 'https:' + cleaned;
    else if (cleaned.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9.]+\//)) cleaned = 'https://' + cleaned;
    
    if (
      cleaned.startsWith('http://') ||
      cleaned.startsWith('https://') ||
      cleaned.startsWith('data:image/') ||
      cleaned.startsWith('/')
    ) {
      return cleaned;
    }
  }

  // Search inside content HTML for img tags or direct image URLs
  const combined = (contentFr || '') + (contentEn || '');
  const imgMatch = combined.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    let src = imgMatch[1].trim();
    if (src.startsWith('//')) src = 'https:' + src;
    return src;
  }

  const urlMatch = combined.match(/(https?:\/\/[^\s<"']+\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?[^\s<"']*)?)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return getCategoryFallbackImage(category);
}

// Maps any raw CSV/DB row to the frontend Article interface with immaculate formatting
export function mapSupabaseArticle(data: any): Article {
  const rawTitleFr = data.title_fr || data.title_en || data.title || data.post_title || data.name || 'Sans titre';
  const rawTitleEn = data.title_en || data.title_fr || data.title || data.post_title || data.name || 'Untitled';
  
  const titleFr = cleanTitle(rawTitleFr);
  const titleEn = cleanTitle(rawTitleEn);

  const rawContentFr = data.content_fr || data.content || data.body_fr || data.body || data.post_content || data.text || data.details || data.html || '';
  const rawContentEn = data.content_en || data.content_fr || data.content || data.body_en || data.body || data.post_content || data.text || data.details || data.html || '';

  const contentFr = cleanAndFormatContent(rawContentFr);
  const contentEn = cleanAndFormatContent(rawContentEn);

  const cleanTextFr = contentFr.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  const cleanTextEn = contentEn.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

  let category = data.category || data.category_fr || data.category_name || data.topic || data.section || 'Actualités';
  category = decodeHTMLEntities(String(category)).trim();
  if (category) {
    category = category.charAt(0).toUpperCase() + category.slice(1);
  } else {
    category = 'Actualités';
  }

  let excerptFr = data.excerpt_fr || data.excerpt || data.summary_fr || data.summary || data.description || data.post_excerpt || '';
  excerptFr = decodeHTMLEntities(String(excerptFr)).replace(/<[^>]*>?/gm, ' ').trim();
  if (!excerptFr) {
    excerptFr = cleanTextFr ? (cleanTextFr.length > 180 ? cleanTextFr.substring(0, 180) + '...' : cleanTextFr) : '';
  }

  let excerptEn = data.excerpt_en || data.excerpt || data.summary_en || data.summary || data.description || data.post_excerpt || '';
  excerptEn = decodeHTMLEntities(String(excerptEn)).replace(/<[^>]*>?/gm, ' ').trim();
  if (!excerptEn) {
    excerptEn = cleanTextEn ? (cleanTextEn.length > 180 ? cleanTextEn.substring(0, 180) + '...' : cleanTextEn) : excerptFr;
  }

  let isPublished = true;
  if (data.published !== undefined && data.published !== null) {
    if (typeof data.published === 'boolean') {
      isPublished = data.published;
    } else {
      const p = String(data.published).toLowerCase().trim();
      isPublished = !(p === 'false' || p === '0' || p === 'draft' || p === 'brouillon' || p === 'f');
    }
  } else if (data.is_published !== undefined && data.is_published !== null) {
    if (typeof data.is_published === 'boolean') {
      isPublished = data.is_published;
    } else {
      const p = String(data.is_published).toLowerCase().trim();
      isPublished = !(p === 'false' || p === '0' || p === 'draft' || p === 'brouillon' || p === 'f');
    }
  } else if (data.status !== undefined && data.status !== null) {
    const s = String(data.status).toLowerCase().trim();
    isPublished = !(s === 'draft' || s === 'brouillon' || s === 'false' || s === '0' || s === 'f');
  }

  let isFeatured = false;
  if (data.featured !== undefined && data.featured !== null) {
    isFeatured = !!data.featured;
  } else if (data.is_featured !== undefined && data.is_featured !== null) {
    isFeatured = !!data.is_featured;
  }

  const featuredImg = extractImageFromData(data, contentFr, contentEn, category);

  const rawId = data.id || data.article_id || data.post_id || data._id || `art_${Date.now()}`;

  return {
    id: String(rawId).trim(),
    title_fr: titleFr,
    title_en: titleEn,
    slug: data.slug || data.post_name || String(rawId).trim(),
    category: category,
    excerpt_fr: excerptFr,
    excerpt_en: excerptEn,
    content_fr: contentFr,
    content_en: contentEn,
    featured_image_url: featuredImg,
    published_at: data.published_at || data.created_at || data.date || data.post_date || new Date().toISOString(),
    is_published: isPublished,
    is_featured: isFeatured,
  };
}

export const mockComments: Comment[] = [
  {
    id: '1',
    article_id: '1',
    user_id: 'user1',
    user_name: 'Alice Dubois',
    content: 'Very informative article about the summit!',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_approved: true,
  },
  {
    id: '2',
    article_id: '1',
    user_id: 'user2',
    user_name: 'Jean Paul',
    content: 'Waiting to see the outcomes.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    is_approved: true,
  },
  {
    id: '3',
    article_id: '2',
    user_id: 'user3',
    user_name: 'Marie Curie',
    content: 'Inappropriate spam comment.',
    created_at: new Date(Date.now() - 50000).toISOString(),
    is_approved: false,
  }
];

