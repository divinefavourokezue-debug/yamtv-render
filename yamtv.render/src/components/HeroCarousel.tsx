import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Article, getCategoryFallbackImage } from '../lib/mockData';

interface HeroCarouselProps {
  articles: Article[];
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const { lang } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  if (!articles || articles.length === 0) return null;

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] lg:h-[680px] flex items-end overflow-hidden group bg-charcoal">
      <div className="embla w-full h-full absolute inset-0" ref={emblaRef}>
        <div className="embla__container h-full">
          {articles.map((article, index) => (
            <div key={article.id} className="embla__slide relative flex-[0_0_100%] h-full min-w-0">
              <div className="absolute inset-0">
                {article.featured_image_url ? (
                  <img 
                    src={article.featured_image_url}
                    alt={lang === 'fr' ? article.title_fr : article.title_en}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-[10s] ease-out",
                      selectedIndex === index ? "scale-105" : "scale-100"
                    )}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryFallbackImage(article.category);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-charcoal to-black"></div>
                )}
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 z-10 flex items-end pb-[72px] md:pb-[90px]">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <span className="bg-[#E0F2FE] text-[#0369A1] px-[12px] py-[4px] text-[11px] md:text-[12px] uppercase tracking-wider font-bold rounded-full">
                      {article.category}
                    </span>
                    <div className="w-[4px] h-[4px] rounded-full bg-primary"></div>
                    <span className="text-white/90 text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold">
                      {format(new Date(article.published_at || new Date()), "d MMMM yyyy", { locale: lang === 'fr' ? fr : enUS })}
                    </span>
                  </div>
                  
                  <h1 className="font-sans font-black text-[26px] sm:text-[38px] md:text-[48px] lg:text-[56px] uppercase leading-[1.1] mb-4 md:mb-6 text-white max-w-4xl tracking-tight line-clamp-3">
                    {lang === 'fr' ? article.title_fr : article.title_en}
                  </h1>
                  
                  <div className="flex items-center gap-6">
                    <Link 
                      to={`/article/${article.slug}`}
                      className="group/btn flex items-center gap-3 text-white font-bold text-[12px] uppercase tracking-[0.2em] hover:text-primary transition-colors duration-300"
                    >
                      <span className="w-8 h-[2px] bg-primary group-hover/btn:w-12 transition-all duration-300"></span>
                      {lang === 'fr' ? 'Lire l\'article' : 'Read Article'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      {articles.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] md:w-[56px] md:h-[56px] bg-black/30 hover:bg-black/60 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-80 md:opacity-0 group-hover:opacity-100 no-lift"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] md:w-[56px] md:h-[56px] bg-black/30 hover:bg-black/60 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-80 md:opacity-0 group-hover:opacity-100 no-lift"
            aria-label="Next slide"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-[24px] md:bottom-[32px] left-1/2 -translate-x-1/2 z-20 flex gap-[10px]">
            {articles.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  "h-[4px] rounded-full transition-all duration-300 no-lift",
                  idx === selectedIndex ? "w-[40px] bg-primary" : "w-[20px] bg-white/40 hover:bg-white/70"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
