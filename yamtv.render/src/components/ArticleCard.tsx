import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Article, getCategoryFallbackImage } from '../lib/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface ArticleCardProps {
  article: Article;
  key?: React.Key;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { lang, t } = useLanguage();
  const title = lang === 'fr' ? article.title_fr : article.title_en;
  const excerpt = lang === 'fr' ? article.excerpt_fr : article.excerpt_en;
  const ref = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formattedDate = format(new Date(article.published_at || new Date()), 'dd MMM yyyy', {
    locale: lang === 'fr' ? fr : enUS,
  });

  // Calculate reading time
  const content = lang === 'fr' ? article.content_fr : article.content_en;
  const wordCount = content ? content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link 
      ref={ref}
      to={`/article/${article.slug}`} 
      className={cn(
        "group news-card flex flex-col h-full bg-white dark:bg-[#1A1A1A] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-[300ms] ease-out overflow-hidden border border-gray-100 dark:border-gray-800",
        isVisible ? "is-visible" : ""
      )}
    >
      {article.featured_image_url ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src={article.featured_image_url} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[700ms] ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getCategoryFallbackImage(article.category);
            }}
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#E0F2FE] text-[#0369A1] px-[12px] py-[6px] text-[12px] uppercase tracking-wider font-bold rounded-full">
              {article.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 md:p-6 pb-0">
          <span className="inline-block bg-[#E0F2FE] text-[#0369A1] px-[12px] py-[6px] text-[12px] uppercase tracking-wider font-bold rounded-full">
            {article.category}
          </span>
        </div>
      )}
      <div className="flex flex-col flex-grow p-5 md:p-6">
        <div className="flex flex-wrap items-center text-[12px] text-gray-500 font-medium gap-2 mb-[16px]">
          <span className="text-gray-700 dark:text-gray-300 font-bold">Rédaction YamTV</span>
          <div className="w-[4px] h-[4px] rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span>{formattedDate}</span>
          <div className="w-[4px] h-[4px] rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {((article.id.charCodeAt(0) || 5) % 35 + 8)}k {lang === 'fr' ? 'vues' : 'views'}
          </span>
        </div>
        <h3 className="font-serif font-bold text-[20px] md:text-[22px] leading-[1.3] mb-[12px] text-black dark:text-white transition-colors duration-[300ms] ease-out line-clamp-2 tracking-tight group-hover:text-primary">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-[24px] flex-grow line-clamp-3 leading-[1.6]">
          {excerpt}
        </p>
        <div className="mt-auto">
          <span className="inline-block bg-[#DC2626] text-white px-5 py-2.5 rounded text-[14px] font-bold hover:bg-red-700 transition-colors">
            {lang === 'fr' ? 'Lire la suite' : 'Read more'}
          </span>
        </div>
      </div>
    </Link>
  );
}
