import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function FloatingActions() {
  const { theme, toggleTheme } = useTheme();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center print:hidden">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg",
          "bg-[#DC2626] text-white hover:bg-red-700",
          showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={cn(
          "relative w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
          "border shadow-lg",
          theme === 'dark'
            ? "bg-[#1A1A1A] border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
            : "bg-white border-gray-200 text-gray-500 hover:text-charcoal hover:border-gray-300"
        )}
        aria-label="Toggle theme"
      >
        <Sun 
          size={20} 
          className={cn(
            "absolute transition-all duration-500 ease-in-out",
            theme === 'dark' ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          )} 
        />
        <Moon 
          size={20} 
          className={cn(
            "absolute transition-all duration-500 ease-in-out",
            theme === 'dark' ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )} 
        />
      </button>
    </div>
  );
}
