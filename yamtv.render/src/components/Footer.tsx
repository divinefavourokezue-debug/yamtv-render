import React from 'react';
import { Link } from 'react-router';
import { Facebook, Youtube, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { Newsletter } from './Newsletter';

const WhatsAppIcon = ({ size = 24, strokeWidth = 1.5 }: { size?: number, strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-charcoal dark:bg-[#050505] text-[#FAFAFA] pt-[96px] pb-[48px] transition-colors relative overflow-hidden print:hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Newsletter Section */}
        <Newsletter />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-[48px] lg:gap-[64px] mb-[96px]">
          <div className="md:col-span-4">
            <Link to="/" className="inline-block mb-[32px] text-primary">
              <Logo className="h-8 text-primary" />
            </Link>
            <p className="text-gray-400 text-[16px] leading-[1.7] mb-[48px] max-w-sm">
              {t('footer.description')}
            </p>
            <div className="flex space-x-[24px]">
              <a href="https://www.facebook.com/profile.php?id=100077754341075" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:-translate-y-[2px]">
                <Facebook size={24} strokeWidth={1.5} />
              </a>
              <a href="https://youtube.com/@votremediadeproximite?si=Q0ec0RuRYw1C_p6d" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:-translate-y-[2px]">
                <Youtube size={24} strokeWidth={1.5} />
              </a>
              <a href="https://whatsapp.com/channel/0029VbAeson0AgWDwdBvmm3O" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:-translate-y-[2px]">
                <WhatsAppIcon size={24} strokeWidth={1.5} />
              </a>
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-[32px]">{t('footer.navigation')}</h3>
            <ul className="space-y-[16px]">
              <li><Link to="/" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/actualites" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.news')}</Link></li>
              <li><Link to="/a-propos" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-[32px]">{t('footer.services')}</h3>
            <ul className="space-y-[16px]">
              <li><Link to="/publicite" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.advertising')}</Link></li>
              <li><Link to="/contact" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/admin" className="text-[16px] text-gray-300 hover:text-white transition-colors">{t('nav.admin')}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-[32px]">{t('footer.contact')}</h3>
            <div className="space-y-[24px] text-[16px]">
              <div>
                <div className="text-gray-500 mb-[4px] text-[12px] uppercase tracking-[0.1em] font-semibold">{t('footer.email')}</div>
                <a href="mailto:yamtvcontact@gmail.com" className="text-gray-300 hover:text-white transition-colors">yamtvcontact@gmail.com</a>
              </div>
              <div>
                <div className="text-gray-500 mb-[4px] text-[12px] uppercase tracking-[0.1em] font-semibold">{t('footer.office')}</div>
                <div className="text-gray-300 leading-[1.7]">Ouagadougou,<br/>Burkina Faso</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-[32px] flex flex-col md:flex-row justify-between items-center gap-[16px]">
          <div className="text-[11px] text-gray-500 tracking-[0.2em] uppercase font-semibold">
            &copy; {new Date().getFullYear()} YAMtv — {t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}
