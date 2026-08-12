import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Article, mapSupabaseArticle as mapArticleData } from '../../lib/mockData';
import {
  setLocalDeletion,
  getLocalDeletions,
  getLocalOverrides,
  setLocalOverride,
  getCachedArticlesFromStorage,
  deleteArticle,
  saveArticle,
  fetchPublishedArticles,
  fetchAllArticles,
  isQuotaExceeded,
  checkQuotaExceeded
} from '../../lib/articlesService';
import { isAppwriteConfigured, fetchAppwriteArticles } from '../../lib/appwrite';
import { Edit2, Trash2, Search, CheckCircle, Archive, Upload, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { ArticleImporter } from '../../components/admin/ArticleImporter';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    fetchArticles();

    const handleArticlesChanged = () => {
      fetchArticles();
    };

    window.addEventListener('yamtv_articles_changed', handleArticlesChanged);
    window.addEventListener('storage', handleArticlesChanged);
    window.addEventListener('focus', handleArticlesChanged);
    document.addEventListener('visibilitychange', handleArticlesChanged);

    // Poll server every 12s for cross-device sync
    const pollInterval = setInterval(() => {
      fetchArticles();
    }, 12000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('yamtv_articles_changed', handleArticlesChanged);
      window.removeEventListener('storage', handleArticlesChanged);
      window.removeEventListener('focus', handleArticlesChanged);
      document.removeEventListener('visibilitychange', handleArticlesChanged);
    };
  }, []);

  const fetchArticles = async () => {
    try {
      const list = await fetchAllArticles();
      setArticles(list);
      setTotalCount(list.length);
    } catch (error) {
      console.warn('Error fetching articles in AdminArticles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet article ?' : 'Are you sure you want to delete this article?')) return;

    const target = articles.find(a => a.id === id || a.slug === id);
    const slug = target?.slug;

    // Delete locally and from Firebase
    setArticles(prev => prev.filter(a => a.id !== id && a.slug !== id && (slug ? a.slug !== slug && a.id !== slug : true)));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id && selectedId !== slug));
    toast.success(lang === 'fr' ? 'Article supprimé avec succès !' : 'Article deleted successfully!');

    try {
      await deleteArticle(id, slug);
    } catch (err) {
      console.warn('Delete article notice:', err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (!window.confirm(lang === 'fr' ? `Êtes-vous sûr de vouloir ${publish ? 'publier' : 'archiver'} ${selectedIds.length} articles ?` : `Are you sure you want to ${publish ? 'publish' : 'archive'} ${selectedIds.length} articles?`)) return;

    for (const id of selectedIds) {
      const art = articles.find(a => a.id === id);
      if (art) {
        const updated = { ...art, is_published: publish, published: publish };
        setLocalOverride(updated);
        try {
          await saveArticle(updated);
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {}
      }
    }

    setArticles(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, is_published: publish, published: publish } : a));
    setSelectedIds([]);
    toast.success(lang === 'fr' ? 'Articles mis à jour !' : 'Articles updated!');
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(lang === 'fr' ? `Supprimer ${selectedIds.length} articles ?` : `Delete ${selectedIds.length} articles?`)) return;

    const toDelete = [...selectedIds];
    setSelectedIds([]);

    for (const id of toDelete) {
      const target = articles.find(a => a.id === id || a.slug === id);
      const slug = target?.slug;
      setArticles(prev => prev.filter(a => a.id !== id && a.slug !== id && (slug ? a.slug !== slug && a.id !== slug : true)));
      try {
        await deleteArticle(id, slug);
      } catch (e) {}
    }

    toast.success(lang === 'fr' ? 'Articles supprimés !' : 'Articles deleted!');
  };

  const handleExportCSV = () => {
    if (articles.length === 0) {
      toast.error(lang === 'fr' ? 'Aucun article à exporter.' : 'No articles to export.');
      return;
    }

    const headers = ['id', 'slug', 'title_fr', 'title_en', 'excerpt_fr', 'excerpt_en', 'content_fr', 'content_en', 'category', 'is_published', 'author_name', 'published_at', 'featured_image_url'];
    
    const escapeCsvCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...articles.map(article => [
        escapeCsvCell(article.id),
        escapeCsvCell(article.slug),
        escapeCsvCell(article.title_fr),
        escapeCsvCell(article.title_en),
        escapeCsvCell(article.excerpt_fr),
        escapeCsvCell(article.excerpt_en),
        escapeCsvCell(article.content_fr),
        escapeCsvCell(article.content_en),
        escapeCsvCell(article.category),
        escapeCsvCell(article.is_published ? 'true' : 'false'),
        escapeCsvCell(article.author_name),
        escapeCsvCell(article.published_at),
        escapeCsvCell(article.featured_image_url)
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `articles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(lang === 'fr' ? 'Exportation CSV réussie !' : 'CSV Export successful!');
  };

  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    const titleFr = (article.title_fr || '').toLowerCase();
    const titleEn = (article.title_en || '').toLowerCase();
    return titleFr.includes(query) || titleEn.includes(query);
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</div>;
  }

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-charcoal mb-2">
            {lang === 'fr' ? 'Articles' : 'Articles'}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-[18px] text-gray-500">
              {lang === 'fr' ? 'Gérez vos publications.' : 'Manage your publications.'}
            </p>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {lang === 'fr' ? `Articles Totaux : ${totalCount}` : `Total Articles: ${totalCount}`}
            </span>
          </div>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          {selectedIds.length > 0 && (
            <>
              <button 
                onClick={() => handleBulkPublish(true)}
                className="bg-green-50 hover:bg-green-100 text-green-600 px-4 md:px-6 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm shrink-0 gap-2 cursor-pointer"
                title={lang === 'fr' ? 'Publier' : 'Publish'}
              >
                <CheckCircle size={20} />
                <span className="hidden md:inline">{lang === 'fr' ? `Publier (${selectedIds.length})` : `Publish (${selectedIds.length})`}</span>
              </button>
              <button 
                onClick={() => handleBulkPublish(false)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 md:px-6 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm shrink-0 gap-2 cursor-pointer"
                title={lang === 'fr' ? 'Archiver' : 'Archive'}
              >
                <Archive size={20} />
                <span className="hidden md:inline">{lang === 'fr' ? `Archiver (${selectedIds.length})` : `Archive (${selectedIds.length})`}</span>
              </button>
              <button 
                onClick={handleBulkDelete}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 md:px-6 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm shrink-0 gap-2 cursor-pointer"
                title={lang === 'fr' ? 'Supprimer' : 'Delete'}
              >
                <Trash2 size={20} />
                <span className="hidden md:inline">{lang === 'fr' ? `Supprimer (${selectedIds.length})` : `Delete (${selectedIds.length})`}</span>
              </button>
            </>
          )}
          <button
            onClick={handleExportCSV}
            className="bg-gray-100 hover:bg-gray-200 text-charcoal px-6 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-[4px] shrink-0 gap-2 cursor-pointer"
          >
            <Download size={20} />
            <span>{lang === 'fr' ? 'Exporter CSV' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => setIsImporterOpen(true)}
            className="bg-primary hover:bg-orange-600 text-white px-6 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-[4px] shrink-0 gap-2 cursor-pointer"
          >
            <Upload size={20} />
            <span>{lang === 'fr' ? 'Importer CSV / JSON' : 'Import CSV / JSON'}</span>
          </button>
          <Link 
            to="/admin/articles/new" 
            className="bg-charcoal hover:bg-gray-800 text-white px-8 h-[56px] flex items-center justify-center rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-[4px] shrink-0 cursor-pointer"
          >
            {lang === 'fr' ? 'Nouvel Article' : 'New Article'}
          </Link>
        </div>
      </div>

      <ArticleImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={fetchArticles}
        lang={lang}
      />

      <div className="relative w-full max-w-md -mt-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'fr' ? 'Rechercher un article...' : 'Search articles...'}
          className="block w-full pl-12 pr-4 py-3 bg-[#FFFFFF] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal transition-all text-[16px] text-charcoal placeholder-gray-400 h-[56px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-[4px]">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 group">
              <div className="absolute top-4 left-4 z-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(article.id)}
                  onChange={() => toggleSelection(article.id)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer bg-white shadow-sm accent-primary"
                />
              </div>
              {article.featured_image_url ? (
                <img 
                  src={article.featured_image_url} 
                  alt={lang === 'fr' ? article.title_fr : article.title_en}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full shadow-sm backdrop-blur-sm ${article.is_published ? 'bg-green-500/90 text-white' : 'bg-white/90 text-charcoal'}`}>
                  {article.is_published ? (lang === 'fr' ? 'Publié' : 'Published') : (lang === 'fr' ? 'Brouillon' : 'Draft')}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">
                {article.category}
              </div>
              <h3 className="font-serif font-bold text-[20px] leading-snug text-charcoal mb-6 line-clamp-2">
                {lang === 'fr' ? article.title_fr : article.title_en}
              </h3>
              
              <div className="mt-auto flex justify-between items-center pt-6 border-t border-gray-100">
                <Link 
                  to={`/admin/articles/edit/${article.id}`} 
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-500 hover:text-charcoal transition-colors h-[56px] px-2 -ml-2"
                >
                  <Edit2 size={16} />
                  {lang === 'fr' ? 'Modifier' : 'Edit'}
                </Link>
                <button 
                  onClick={() => handleDelete(article.id)}
                  className="flex items-center gap-2 text-[14px] font-semibold text-red-400 hover:text-primary transition-colors h-[56px] px-2 -mr-2 cursor-pointer"
                >
                  <Trash2 size={16} />
                  {lang === 'fr' ? 'Supprimer' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            {lang === 'fr' ? 'Aucun article trouvé.' : 'No articles found.'}
          </div>
        )}
      </div>
    </div>
  );
}
