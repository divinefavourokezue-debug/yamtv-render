import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Mail, Facebook, Youtube } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function Contact() {
  const { t } = useLanguage();
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus('success');
    setTimeout(() => setFormStatus('idle'), 3000);
  };

  return (
    <>
      <Helmet>
        <title>{t('contact.h1')} | YAMtv</title>
        <meta name="description" content={t('contact.text')} />
      </Helmet>

      <div className="bg-[#FAFAFA] dark:bg-[#111111] py-[120px] md:py-[160px] border-b border-gray-200 dark:border-gray-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-white dark:from-[#1A1A1A] to-transparent opacity-50 blur-3xl transition-colors"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-[40px] animate-fade-in-up">
            <span className="bg-charcoal text-white dark:bg-white dark:text-charcoal px-[16px] py-[8px] text-[11px] font-bold uppercase tracking-[0.2em] rounded-[6px] shadow-sm transition-colors">Contact</span>
          </div>
          <h1 className="text-[56px] md:text-[72px] font-sans font-black uppercase text-black dark:text-white mb-[40px] tracking-tight leading-[1.05] animate-fade-in-up transition-colors" style={{ animationDelay: '100ms' }}>
            {t('contact.h1')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[18px] md:text-[20px] leading-[1.7] animate-fade-in-up transition-colors" style={{ animationDelay: '200ms' }}>
            {t('contact.text')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[96px] md:py-[140px]">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[48px] lg:gap-[80px]">
            {/* Contact Info */}
            <div className="flex flex-col gap-[32px]">
              
              {/* Added Image representing the office / headquarters */}
              <div className="w-full h-[240px] rounded-[16px] overflow-hidden shadow-sm relative border border-gray-100 dark:border-gray-800 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" 
                  alt="YAMtv Office" 
                  className="w-full h-full object-cover grayscale-[20%]"
                />
                <div className="absolute inset-0 bg-charcoal/10"></div>
              </div>

              <div className="bg-white dark:bg-[#1A1A1A] p-[32px] md:p-[48px] rounded-[16px] shadow-sm border border-gray-100 dark:border-gray-800 flex-grow transition-colors">
                <h3 className="font-serif font-bold text-[32px] mb-[48px] text-charcoal dark:text-white tracking-tight">Informations</h3>
                
                <div className="flex items-start mb-[32px]">
                  <Mail className="text-primary mr-[24px] mt-[4px]" size={24} />
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">Email</h4>
                    <p className="text-[18px] text-charcoal dark:text-gray-300 font-serif italic transition-colors">yamtvcontact@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-primary mr-[24px] mt-[4px]" size={24} />
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">Adresse</h4>
                    <p className="text-[18px] text-charcoal dark:text-gray-300 font-serif italic transition-colors">Ouagadougou, Burkina Faso</p>
                  </div>
                </div>
              </div>

              <div className="bg-charcoal text-white p-[32px] md:p-[48px] rounded-[16px] shadow-sm">
                <p className="font-serif italic text-[18px] text-gray-300 mb-[48px] leading-[1.7]">
                  {t('contact.subtext')}
                </p>
                <div className="flex space-x-[16px]">
                  <a href="https://www.facebook.com/profile.php?id=100077754341075" target="_blank" rel="noopener noreferrer" className="w-[48px] h-[48px] bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-charcoal transition-all"><Facebook size={20} /></a>
                  <a href="https://youtube.com/@votremediadeproximite?si=Q0ec0RuRYw1C_p6d" target="_blank" rel="noopener noreferrer" className="w-[48px] h-[48px] bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-charcoal transition-all"><Youtube size={20} /></a>
                  <a href="https://whatsapp.com/channel/0029VbAeson0AgWDwdBvmm3O" target="_blank" rel="noopener noreferrer" className="w-[48px] h-[48px] bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-charcoal transition-all"><WhatsAppIcon size={20} /></a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-[#1A1A1A] p-[32px] md:p-[48px] rounded-[16px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors h-fit">
              <form onSubmit={handleSubmit} className="space-y-[24px]">
                <h3 className="font-serif font-bold text-[32px] mb-[48px] text-charcoal dark:text-white tracking-tight">Envoyez-nous un message</h3>
                
                {formStatus === 'success' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-400 px-[24px] py-[16px] mb-[32px] rounded-[8px] font-serif italic">
                    Votre message a été envoyé avec succès.
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-[16px] py-[12px] bg-[#FAFAFA] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-[8px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-charcoal dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-[16px] py-[12px] bg-[#FAFAFA] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-[8px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    className="w-full px-[16px] py-[12px] bg-[#FAFAFA] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-[8px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-[8px]">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    className="w-full px-[16px] py-[12px] bg-[#FAFAFA] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-[8px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-charcoal dark:text-white resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-charcoal dark:hover:bg-white text-white dark:hover:text-charcoal py-[16px] px-[32px] text-[12px] font-bold uppercase tracking-[0.2em] rounded-[8px] transition-all mt-[32px] shadow-sm hover:shadow-md hover:-translate-y-[2px]"
                >
                  {t('contact.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
