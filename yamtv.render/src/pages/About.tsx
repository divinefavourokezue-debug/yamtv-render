import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Shield, Eye, Heart } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('about.h1')} | YAMtv</title>
        <meta name="description" content={t('about.text')} />
      </Helmet>
      
      <div className="bg-[#FAFAFA] dark:bg-[#111111] py-[120px] md:py-[160px] border-b border-gray-200 dark:border-gray-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-white dark:from-[#1A1A1A] to-transparent opacity-50 blur-3xl transition-colors"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[64px] items-center">
            <div>
              <div className="flex mb-[40px] animate-fade-in-up">
                <span className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[0.2em] rounded-[6px] shadow-sm transition-colors">{t('about.team')}</span>
              </div>
              <h1 className="text-[56px] md:text-[72px] font-sans font-black uppercase text-black dark:text-white mb-[40px] tracking-tight leading-[1.05] animate-fade-in-up transition-colors" style={{ animationDelay: '100ms' }}>
                {t('about.h1')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-[18px] md:text-[20px] leading-[1.7] font-serif italic animate-fade-in-up transition-colors" style={{ animationDelay: '200ms' }}>
                {t('about.text')}
              </p>
            </div>
            <div className="relative animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" 
                  alt="Notre équipe" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 border border-white/10 rounded-[24px]"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-charcoal/10 dark:bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[96px] md:py-[140px]">
          <div className="text-center mb-[80px]">
            <h2 className="text-[32px] md:text-[40px] font-serif font-bold tracking-tight text-charcoal dark:text-white mb-[24px]">Nos Valeurs</h2>
            <div className="w-[60px] h-[2px] bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] md:gap-[48px] text-center">
            <div className="p-[32px] lg:p-[48px] bg-white dark:bg-[#1A1A1A] rounded-[16px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-[4px] group">
              <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-[24px] text-primary group-hover:scale-110 transition-transform duration-300">
                <Shield size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] mb-[16px] text-charcoal dark:text-white tracking-tight">{t('about.ethics')}</h3>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-[1.7]">{t('about.ethics.desc')}</p>
            </div>
            
            <div className="p-[32px] lg:p-[48px] bg-white dark:bg-[#1A1A1A] rounded-[16px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-[4px] group">
              <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-[24px] text-primary group-hover:scale-110 transition-transform duration-300">
                <Eye size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] mb-[16px] text-charcoal dark:text-white tracking-tight">{t('about.independence')}</h3>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-[1.7]">{t('about.independence.desc')}</p>
            </div>
            
            <div className="p-[32px] lg:p-[48px] bg-white dark:bg-[#1A1A1A] rounded-[16px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-[4px] group">
              <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-[24px] text-primary group-hover:scale-110 transition-transform duration-300">
                <Heart size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] mb-[16px] text-charcoal dark:text-white tracking-tight">{t('about.responsibility')}</h3>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-[1.7]">{t('about.responsibility.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
