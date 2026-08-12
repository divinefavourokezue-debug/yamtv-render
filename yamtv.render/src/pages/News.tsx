import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../lib/mockData';
import { getCachedArticlesFromStorage, fetchPublishedArticles } from '../lib/articlesService';
import { cn } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

export default function News() {
  const { t, lang } = useLanguage();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const defaultCategories = [
    { id: 'all', label: t('news.categories.all') },
    { id: 'Politique', label: t('news.categories.politique') },
    { id: 'Economie', label: t('news.categories.economie') },
    { id: 'Société', label: t('news.categories.societe') },
    { id: 'Culture', label: t('news.categories.culture') },
    { id: 'Sport', label: t('news.categories.sport') },
    { id: 'Santé', label: t('news.categories.sante') },
    { id: 'International', label: t('news.categories.international') },
  ];

  const categories = [...defaultCategories];
  if (allArticles.length > 0) {
    const existingIds = new Set(defaultCategories.map(c => c.id.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    allArticles.forEach(a => {
      if (!a.category || a.category === 'all') return;
      const normalized = a.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!existingIds.has(normalized)) {
        existingIds.add(normalized);
        const formatted = a.category.charAt(0).toUpperCase() + a.category.slice(1);
        categories.push({ id: a.category, label: formatted });
      }
    });
  }

  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      const cached = getCachedArticlesFromStorage();
      if (cached && cached.length > 0) {
        setAllArticles(cached);
        setLoading(false);
      }

      fetchPublishedArticles()
        .then(data => {
          if (isMounted && Array.isArray(data)) {
            setAllArticles(data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    loadData();

    const handleArticlesChanged = () => {
      if (isMounted) loadData();
    };

    window.addEventListener('yamtv_articles_changed', handleArticlesChanged);
    window.addEventListener('storage', handleArticlesChanged);
    window.addEventListener('focus', handleArticlesChanged);
    document.addEventListener('visibilitychange', handleArticlesChanged);

    // Poll server every 12s for cross-device sync
    const pollInterval = setInterval(() => {
      if (isMounted) loadData();
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('yamtv_articles_changed', handleArticlesChanged);
      window.removeEventListener('storage', handleArticlesChanged);
      window.removeEventListener('focus', handleArticlesChanged);
      document.removeEventListener('visibilitychange', handleArticlesChanged);
    };
  }, []);

  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const displayedArticles = activeCategory === 'all' 
    ? allArticles 
    : allArticles.filter(a => normalize(a.category) === normalize(activeCategory));

  return (
    <>
      <Helmet>
        <title>{t('news.h1')} | YAMtv</title>
        <meta name="description" content={t('news.subtext')} />
      </Helmet>

      <div className="bg-[#FAFAFA] dark:bg-[#111111] py-[120px] md:py-[160px] border-b border-gray-200 dark:border-gray-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-white dark:from-[#1A1A1A] to-transparent opacity-50 blur-3xl transition-colors"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-[40px] animate-fade-in-up">
            <span className="bg-[#E0F2FE] text-[#0369A1] px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[0.2em] rounded-[6px] shadow-sm transition-colors">
              Toutes les infos
            </span>
          </div>
          <h1 className="text-[56px] md:text-[72px] font-sans font-black uppercase text-black dark:text-white mb-[40px] tracking-tight leading-[1.05] animate-fade-in-up transition-colors" style={{ animationDelay: '100ms' }}>
            {t('news.h1')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[18px] md:text-[20px] leading-[1.7] animate-fade-in-up transition-colors" style={{ animationDelay: '200ms' }}>
            {t('news.subtext')}
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#111111] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[96px] md:py-[140px]">
          {/* Categories / Tabs */}
          <div className="flex flex-wrap justify-center gap-[12px] md:gap-[16px] mb-[64px] md:mb-[96px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-[24px] py-[12px] text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-[250ms] ease-out rounded-xl",
                  activeCategory === cat.id
                    ? "bg-[#E0F2FE] text-[#0369A1] shadow-sm"
                    : "bg-white dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-[#0369A1] hover:text-[#0369A1] hover:bg-[#E0F2FE]/50 hover:shadow-sm hover:-translate-y-1"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex justify-center py-[96px]">
              <div className="animate-spin rounded-full h-[32px] w-[32px] border-t-2 border-b-2 border-charcoal dark:border-white"></div>
            </div>
          ) : displayedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[32px] gap-y-[64px]">
              {displayedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-[96px] text-gray-400 dark:text-gray-600 font-serif italic text-[20px]">
              Aucun article trouvé dans cette catégorie.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
