import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../lib/mockData';
import { getCachedArticlesFromStorage, fetchPublishedArticles } from '../lib/articlesService';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoriesFilter } from '../components/CategoriesFilter';
import { Newsletter } from '../components/Newsletter';

export default function Home() {
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, dragFree: true });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      const cached = getCachedArticlesFromStorage();
      if (cached && cached.length > 0) {
        setArticles(cached);
        setLoading(false);
      }

      fetchPublishedArticles()
        .then(data => {
          if (isMounted && Array.isArray(data)) {
            setArticles(data);
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

  const featuredArticles = articles.filter(a => a.is_featured);
  
  // If not enough featured articles, fallback to the latest ones
  const heroArticles = featuredArticles.length > 0 ? featuredArticles.slice(0, 3) : articles.slice(0, 3);
  
  const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Extract unique categories from articles
  const availableCategories = Array.from(new Set(articles.map(a => a.category).filter(Boolean))) as string[];

  const gridArticles = selectedCategory === 'all'
    ? (articles.length > 3 ? articles.filter(a => !heroArticles.find(sa => sa.id === a.id)) : articles)
    : articles.filter(a => normalize(a.category) === normalize(selectedCategory));
  
  // Use all articles for the carousel
  const carouselArticles = articles;

  return (
    <>
      <Helmet>
        <title>{t('home.h1')} | YAMtv</title>
        <meta name="description" content={t('home.text')} />
      </Helmet>
      
      {/* Featured Article Hero Slider */}
      <HeroCarousel articles={heroArticles} />

      {/* Trending Articles Carousel Section */}
      {!loading && carouselArticles.length > 0 && (
        <section className="bg-transparent py-[96px] md:py-[128px] overflow-hidden border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-[64px]">
              <h2 className="text-[32px] md:text-[48px] font-sans font-black uppercase tracking-tight text-black dark:text-white">
                {lang === 'fr' ? 'À la une' : 'Trending'}
              </h2>
              <div className="flex gap-[16px]">
                <button 
                  onClick={scrollPrev} 
                  className="w-[48px] h-[48px] rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all text-charcoal dark:text-white"
                >
                   <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={scrollNext} 
                  className="w-[48px] h-[48px] rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all text-charcoal dark:text-white"
                >
                   <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex -ml-[32px]">
                 {carouselArticles.map(article => (
                    <div key={article.id} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-[32px]">
                       <ArticleCard article={article} />
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles Section */}
      <section className="bg-transparent py-[96px] md:py-[128px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-[48px] border-b border-gray-100 dark:border-gray-800 pb-[32px] gap-6">
            <h2 className="text-[32px] md:text-[48px] font-sans font-black uppercase tracking-tight text-black dark:text-white shrink-0">
              {t('home.latest')}
            </h2>
            <CategoriesFilter 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
              availableCategories={availableCategories} 
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center py-[96px]">
              <div className="animate-spin rounded-full h-[32px] w-[32px] border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {gridArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[32px] gap-y-[64px]">
                  {gridArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="py-[64px] text-center text-gray-500">
                  {lang === 'fr' ? 'Aucun article trouvé dans cette catégorie.' : 'No articles found in this category.'}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </div>
    </>
  );
}
