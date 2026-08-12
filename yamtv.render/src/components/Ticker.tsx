import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSettings } from '../lib/settings';

export default function Ticker() {
  const { lang } = useLanguage();
  const [text, setText] = useState('');

  useEffect(() => {
    getSettings().then(settings => {
      setText(settings.breaking_text);
    });
    
    // Optional: add a polling interval or listen to storage events
    const handleStorage = () => {
      getSettings().then(settings => setText(settings.breaking_text));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!text) return null;

  return (
    <div className="fixed top-[56px] md:top-[80px] left-0 w-full bg-primary text-white overflow-hidden h-[40px] flex items-center shadow-md z-40 transition-all duration-[250ms] ease-out">
      <div className="absolute left-0 z-10 bg-primary px-4 h-full flex items-center font-bold text-[12px] md:text-[14px] uppercase tracking-wider whitespace-nowrap shadow-[20px_0_20px_-10px_rgba(192,0,0,1)]">
        <span className="animate-pulse mr-2">●</span>
        {lang === 'fr' ? 'INFO EN CONTINU' : 'BREAKING NEWS'}
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center ml-[170px] md:ml-[190px]">
        <div className="animate-marquee whitespace-nowrap text-[14px] font-medium inline-block hover:[animation-play-state:paused]">
          <span className="pr-8">{text}</span>
          <span className="pr-8">{text}</span>
          <span className="pr-8">{text}</span>
        </div>
      </div>
    </div>
  );
}
