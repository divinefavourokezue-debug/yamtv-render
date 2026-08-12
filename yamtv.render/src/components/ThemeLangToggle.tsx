import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeLangToggle() {
  const { lang, setLang } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-[12px] md:gap-[16px]">
      {/* Language Toggle - Premium Look */}
      <div className={cn(
        "flex items-center p-[4px] rounded-full transition-all duration-300",
        "border",
        theme === 'dark'
          ? "bg-[#1A1A1A] border-gray-800"
          : "bg-gray-50 border-gray-200 shadow-sm"
      )}>
        <div className="flex items-center relative">
          <div 
            className={cn(
              "absolute inset-0 rounded-full shadow-sm transition-all duration-300 ease-out",
              theme === 'dark' ? "bg-charcoal border border-gray-700" : "bg-white border border-gray-200"
            )} 
            style={{ 
              width: '44px', 
              left: lang === 'en' ? '44px' : '0px',
              height: '100%'
            }}
          ></div>
          <button
            onClick={() => setLang('fr')}
            className={cn(
              "relative z-10 w-[44px] h-[28px] md:h-[32px] flex items-center justify-center text-[11px] md:text-[12px] font-bold tracking-[0.05em] rounded-full transition-colors duration-300",
              lang === 'fr' 
                ? (theme === 'dark' ? "text-white" : "text-charcoal") 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
            )}
          >
            FR
          </button>
          <button
            onClick={() => setLang('en')}
            className={cn(
              "relative z-10 w-[44px] h-[28px] md:h-[32px] flex items-center justify-center text-[11px] md:text-[12px] font-bold tracking-[0.05em] rounded-full transition-colors duration-300",
              lang === 'en' 
                ? (theme === 'dark' ? "text-white" : "text-charcoal") 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
            )}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}
