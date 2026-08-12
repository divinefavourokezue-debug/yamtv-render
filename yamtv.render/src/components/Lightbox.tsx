import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex, loop: true });
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small delay to allow the DOM to render before starting animation
      requestAnimationFrame(() => setIsVisible(true));
      if (emblaApi) {
        emblaApi.scrollTo(initialIndex, true);
      }
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex, emblaApi]);

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

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev();
      if (e.key === 'ArrowRight') emblaApi?.scrollNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, emblaApi]);

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
        aria-label="Close fullscreen image"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-20 tracking-widest uppercase">
            {selectedIndex + 1} / {images.length}
          </div>
        </>
      )}

      <div className="w-full h-full embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container h-full flex items-center">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="embla__slide relative flex-[0_0_100%] h-full flex flex-col items-center justify-center p-4 md:p-16 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className={cn(
                  "relative max-w-full max-h-[85vh] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isVisible ? "scale-100" : "scale-95"
                )}
              >
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
                />
              </div>
              {img.alt && (
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <p className="text-white/90 text-sm md:text-base font-serif italic max-w-2xl mx-auto bg-black/50 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
                    {img.alt}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
