import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Article, mapSupabaseArticle as mapArticleData, getCategoryFallbackImage } from '../lib/mockData';
import { fetchArticleById, fetchPublishedArticles } from '../lib/articlesService';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Play, Pause, Volume2, Square, Linkedin, Link as LinkIcon, Check, Type } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import { CommentSection } from '../components/CommentSection';
import { Lightbox } from '../components/Lightbox';

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [lightboxState, setLightboxState] = useState<{images: {src: string, alt: string}[], index: number, isOpen: boolean}>({
    images: [],
    index: 0,
    isOpen: false
  });

  const handleImageClick = (clickedSrc: string, clickedAlt: string) => {
    if (!article) return;
    
    const featuredSrc = article.featured_image_url || '';
    const allImages = featuredSrc ? [{ src: featuredSrc, alt: title }] : [];
    
    const contentContainer = document.querySelector('.prose');
    if (contentContainer) {
      const contentImgs = contentContainer.querySelectorAll('img');
      contentImgs.forEach(img => {
        allImages.push({ src: img.src, alt: img.alt });
      });
    }
    
    const index = allImages.findIndex(img => img.src === clickedSrc);
    
    setLightboxState({
      images: allImages,
      index: Math.max(0, index),
      isOpen: true
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticle() {
      if (!slug) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const found = await fetchArticleById(slug);
        if (!found) {
          if (isMounted) {
            setArticle(null);
            setRelatedArticles([]);
            setLoading(false);
          }
          return;
        }

        if (isMounted) setArticle(found);

        // Fetch related articles
        const allPublished = await fetchPublishedArticles();
        if (isMounted) {
          const related = allPublished
            .filter(a => a.category === found.category && a.id !== found.id)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (error) {
        if (isMounted) {
          setArticle(null);
          setRelatedArticles([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slug) {
      fetchArticle();
    }

    const handleArticlesChanged = () => {
      if (isMounted && slug) fetchArticle();
    };

    window.addEventListener('yamtv_articles_changed', handleArticlesChanged);
    window.addEventListener('storage', handleArticlesChanged);
    window.addEventListener('focus', handleArticlesChanged);
    document.addEventListener('visibilitychange', handleArticlesChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('yamtv_articles_changed', handleArticlesChanged);
      window.removeEventListener('storage', handleArticlesChanged);
      window.removeEventListener('focus', handleArticlesChanged);
      document.removeEventListener('visibilitychange', handleArticlesChanged);
    };
  }, [slug]);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once to set initial state if we already have content
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Article non trouvé</h1>
        <Link to="/actualites" className="text-primary hover:underline font-serif italic">Retour aux actualités</Link>
      </div>
    );
  }

  const title = lang === 'fr' ? article.title_fr : article.title_en;
  const content = lang === 'fr' ? article.content_fr : article.content_en;
  const excerpt = lang === 'fr' ? article.excerpt_fr : article.excerpt_en;
  
  const wordCount = content ? content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = format(new Date(article.published_at), 'dd MMMM yyyy', {
    locale: lang === 'fr' ? fr : enUS,
  });

  const handleListen = () => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'fr' ? "Votre navigateur ne supporte pas la lecture audio." : "Your browser does not support text-to-speech.");
      return;
    }

    if (isPlaying && !isPaused) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (err) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    } else if (isPlaying && isPaused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch (err) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    } else {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Clean up text for better reading
        const rawText = `${title}. ${tempDiv.textContent || tempDiv.innerText || ''}`
          .replace(/\s+/g, ' ')
          .trim();
        
        if (!rawText) return;

        // Truncate to a reasonable character length if needed for stability across browsers
        const textToRead = rawText.length > 3000 ? rawText.slice(0, 3000) + '...' : rawText;
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 0.95; // Slightly slower for better comprehension
        
        // Try to find a premium/natural voice
        try {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoices = voices.filter(v => v.lang.startsWith(lang === 'fr' ? 'fr' : 'en'));
          if (preferredVoices.length > 0) {
            const googleVoice = preferredVoices.find(v => v.name.includes('Google'));
            utterance.voice = googleVoice || preferredVoices[0];
          }
        } catch (vErr) {
          // Ignore voice selection errors
        }
        
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        
        utterance.onerror = (e) => {
          // Quietly handle interruptions or synthesis errors
          setIsPlaying(false);
          setIsPaused(false);
        };
        
        try {
          window.speechSynthesis.cancel();
        } catch (cErr) {}

        setTimeout(() => {
          try {
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            setIsPaused(false);
          } catch (speakErr) {
            setIsPlaying(false);
            setIsPaused(false);
          }
        }, 30);
      } catch (err) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <>
      {/* Premium Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[4px] bg-primary z-[100] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(192,0,0,0.5)] print:hidden"
        style={{ width: `${scrollProgress}%` }}
      />

      <Helmet>
        <title>{title} | YAMtv</title>
        <meta name="description" content={excerpt} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        {article.featured_image_url && <meta property="og:image" content={article.featured_image_url} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt} />
        {article.featured_image_url && <meta name="twitter:image" content={article.featured_image_url} />}
      </Helmet>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[128px] pb-[96px] print:pt-8 print:pb-8">
        <Link to="/actualites" className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-charcoal mb-[64px] transition-colors hover:-translate-x-[4px] duration-300 print:hidden">
          <ArrowLeft size={16} className="mr-[8px]" />
          Retour
        </Link>

        <header className="mb-[64px] border-b border-gray-100 dark:border-gray-800 pb-[64px] relative">
          <div className="flex justify-center mb-[48px] animate-fade-in-up">
            <span className="bg-[#E0F2FE] text-[#0369A1] px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full">
              {article.category}
            </span>
          </div>
          <h1 className="text-[48px] md:text-[56px] lg:text-[64px] font-sans font-black text-black dark:text-white leading-[1.15] mb-[40px] text-center tracking-tight max-w-[900px] mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {title}
          </h1>
          <div className="text-center animate-fade-in-up flex items-center justify-center gap-3 text-gray-500 font-medium text-[14px]" style={{ animationDelay: '200ms' }}>
            <span className="text-black dark:text-gray-300 font-bold">Rédaction YamTV</span>
            <div className="w-[4px] h-[4px] rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <span>
              {t('published_on')} {formattedDate}
            </span>
            <div className="w-[4px] h-[4px] rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <span className="flex items-center gap-2">
              <Clock size={14} />
              {readingTime} min
            </span>
          </div>
          
          <div className="flex justify-center mt-8 animate-fade-in-up print:hidden" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleListen}
                className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 dark:border-white/20 hover:border-charcoal dark:hover:border-white text-charcoal dark:text-white rounded-none text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
              >
                {isPlaying && !isPaused ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying && !isPaused 
                  ? (lang === 'fr' ? 'Pause' : 'Pause') 
                  : isPlaying && isPaused 
                    ? (lang === 'fr' ? 'Reprendre' : 'Resume') 
                    : (lang === 'fr' ? 'Écouter l\'article' : 'Listen to Article')}
              </button>
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="p-2.5 border border-charcoal/20 dark:border-white/20 hover:border-red-500 hover:text-red-500 text-charcoal dark:text-white transition-all duration-300"
                  aria-label="Stop audio"
                >
                  <Square size={14} className="fill-current" />
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white dark:bg-[#1A1A1A] px-6 py-3 rounded-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(255,255,255,0.05)] border border-gray-100 dark:border-gray-800 animate-fade-in-up print:hidden" style={{ animationDelay: '300ms' }}>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mr-2">
              {lang === 'fr' ? 'Outils' : 'Tools'}
            </span>
            <button 
              onClick={() => setFontSize(prev => Math.min(prev + 4, 26))}
              className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
              aria-label="Increase text size"
            >
              <Type size={18} />
              <span className="text-[10px] font-bold absolute -mt-2 ml-4">+</span>
            </button>
            <button 
              onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
              className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
              aria-label="Decrease text size"
            >
              <Type size={14} />
              <span className="text-[10px] font-bold absolute -mt-1 ml-3">-</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700"></div>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: title,
                    url: window.location.href,
                  });
                }
              }}
              className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
              aria-label="Native Share"
            >
              <Share2 size={18} />
            </button>
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors hidden sm:block"
              aria-label="Share on X (Twitter)"
            >
              <Twitter size={18} />
            </a>
            <button 
              onClick={handleCopyLink}
              className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
              aria-label="Copy Link"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
            </button>
          </div>
        </header>

        {article.featured_image_url ? (
          <figure 
            className="mb-[64px] aspect-[16/9] overflow-hidden shadow-sm relative cursor-zoom-in"
            onClick={() => handleImageClick(
              article.featured_image_url,
              title
            )}
          >
            <img 
              src={article.featured_image_url} 
              alt={title}
              className="w-full h-full object-cover grayscale-[20%] transition-transform duration-700 hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getCategoryFallbackImage(article.category);
              }}
            />
            <div className="absolute inset-0 border border-black/5 mix-blend-overlay pointer-events-none"></div>
          </figure>
        ) : null}

        <div className="max-w-[720px] mx-auto">
          <div 
            className="prose prose-xl dark:prose-invert prose-p:leading-[1.9] prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-charcoal dark:prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-charcoal dark:prose-blockquote:text-white prose-blockquote:text-[24px] prose-blockquote:border-l-[2px] prose-blockquote:border-primary prose-blockquote:pl-[32px] prose-blockquote:my-[48px] prose-img:rounded-none prose-img:shadow-sm prose-img:grayscale-[10%] hover:prose-img:cursor-zoom-in transition-all duration-300"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: content }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                handleImageClick(img.src, img.alt);
              }
            }}
          />

          {/* Social Share Bottom */}
          <div className="mt-[64px] pt-[32px] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
            <span className="text-[14px] font-bold uppercase tracking-[0.1em] text-gray-500">
              {lang === 'fr' ? 'Partager cet article' : 'Share this article'}
            </span>
            <div className="flex items-center gap-4">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Share on X (Twitter)"
              >
                <Twitter size={18} />
              </a>
              <a 
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Share on WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
              <button 
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-charcoal dark:hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Copy Link"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
              </button>
            </div>
          </div>

          <div className="print:hidden">
            <CommentSection articleId={article.id} />
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="bg-[#FAFAFA] dark:bg-[#050505] py-[96px] border-t border-gray-100 dark:border-gray-800 transition-colors print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-[48px]">
              <h2 className="text-[32px] md:text-[40px] font-serif font-bold tracking-tight text-charcoal dark:text-white">
                {lang === 'fr' ? 'Articles similaires' : 'Related Articles'}
              </h2>
              <Link to="/actualites" className="hidden sm:inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary hover:text-charcoal dark:hover:text-white transition-colors">
                {lang === 'fr' ? 'Voir tout' : 'View all'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <div className="mt-[48px] text-center sm:hidden">
              <Link to="/actualites" className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary hover:text-charcoal dark:hover:text-white transition-colors">
                {lang === 'fr' ? 'Voir tout' : 'View all'}
              </Link>
            </div>
          </div>
        </section>
      )}

      <Lightbox 
        images={lightboxState.images}
        initialIndex={lightboxState.index}
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))} 
      />
    </>
  );
}
