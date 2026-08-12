import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import { Target, TrendingUp, Users } from 'lucide-react';

export default function Advertising() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('advertising.h1')} | YAMtv</title>
        <meta name="description" content={t('advertising.text')} />
      </Helmet>

      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1600&q=80" 
            alt="Advertising with YAMtv"
            className="w-full h-full object-cover grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-charcoal/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <span className="bg-primary text-white px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[0.2em] rounded-[6px] shadow-sm mb-[32px] inline-block">
            Espace Pro
          </span>
          <h1 className="text-[56px] md:text-[72px] font-serif font-bold text-white mb-[32px] tracking-tight leading-[1.05]">
             {t('advertising.h1')}
          </h1>
          <p className="text-[20px] md:text-[24px] font-serif italic leading-[1.6] text-gray-300 max-w-3xl mx-auto">
             {t('advertising.text')}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#111111] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[96px] md:py-[140px]">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px] mb-[96px]">
            <div className="text-center group">
              <div className="w-[80px] h-[80px] mx-auto bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mb-[24px] text-primary transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                <Users size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] text-charcoal dark:text-white mb-[16px]">Audience Large</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-[1.7]">Touchez une audience engagée et diversifiée à travers nos différentes plateformes.</p>
            </div>
            <div className="text-center group">
              <div className="w-[80px] h-[80px] mx-auto bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mb-[24px] text-primary transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                <Target size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] text-charcoal dark:text-white mb-[16px]">Ciblage Précis</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-[1.7]">Communiquez votre message exactement à ceux qui ont besoin de l'entendre.</p>
            </div>
            <div className="text-center group">
              <div className="w-[80px] h-[80px] mx-auto bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mb-[24px] text-primary transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                <TrendingUp size={32} />
              </div>
              <h3 className="font-serif font-bold text-[24px] text-charcoal dark:text-white mb-[16px]">Impact Garanti</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-[1.7]">Bénéficiez de la crédibilité de notre média pour valoriser votre marque.</p>
            </div>
          </div>

          <div className="bg-charcoal text-white p-[64px] md:p-[96px] text-center rounded-[24px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0">
               <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80" 
                alt="Business meeting"
                className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
               />
               <div className="absolute inset-0 bg-charcoal/80 mix-blend-multiply"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-[32px] md:text-[48px] font-serif font-bold mb-[32px]">Prêt à collaborer ?</h2>
              <p className="text-[18px] md:text-[20px] text-gray-300 mb-[48px] max-w-2xl mx-auto leading-[1.7]">
                Contactez notre régie publicitaire pour discuter de vos besoins et obtenir une offre personnalisée.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center bg-primary text-white hover:bg-white hover:text-charcoal py-[16px] px-[48px] text-[12px] uppercase tracking-[0.2em] font-bold rounded-[8px] transition-all relative z-10 shadow-lg hover:shadow-xl hover:-translate-y-[2px]"
              >
                {t('nav.contact')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
