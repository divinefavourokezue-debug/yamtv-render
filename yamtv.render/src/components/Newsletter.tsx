import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Newsletter() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    // Mock API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setEmail('');
      
      // Reset status after a few seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#1A1A1A] dark:bg-[#111111] rounded-[24px] p-[48px] md:p-[64px] mb-[96px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-[48px]">
      <div className="max-w-xl text-center lg:text-left">
        <h3 className="font-serif text-[32px] font-bold mb-[16px] tracking-tight text-white">
          {lang === 'fr' ? 'Rejoignez notre Newsletter' : 'Join our Newsletter'}
        </h3>
        <p className="text-gray-400 text-[18px] leading-[1.7]">
          {lang === 'fr' 
            ? 'Recevez les dernières actualités et nos articles exclusifs directement dans votre boîte de réception.'
            : 'Get the latest news and our exclusive articles delivered straight to your inbox.'}
        </p>
      </div>
      
      <form className="w-full lg:w-auto flex flex-col gap-4 relative" onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder={lang === 'fr' ? 'Votre adresse email' : 'Your email address'}
            className="bg-[#2A2A2A] dark:bg-[#1A1A1A] border border-white/10 text-white px-[24px] py-[16px] rounded-[12px] w-full sm:min-w-[320px] focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="bg-primary hover:bg-white text-white hover:text-charcoal px-[32px] py-[16px] rounded-[12px] font-bold text-[14px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary disabled:hover:text-white"
          >
            {status === 'loading' ? (
              <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <Send size={18} />
            )}
            {status === 'loading' 
              ? (lang === 'fr' ? 'Envoi...' : 'Sending...') 
              : status === 'success'
                ? (lang === 'fr' ? 'Abonné !' : 'Subscribed!')
                : (lang === 'fr' ? "S'abonner" : 'Subscribe')}
          </button>
        </div>
        
        {/* Success Message */}
        <div className={`absolute -bottom-8 left-0 right-0 text-center transition-all duration-300 ${status === 'success' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <span className="text-green-400 text-sm font-medium">
            {lang === 'fr' 
              ? 'Merci pour votre inscription !' 
              : 'Thank you for subscribing!'}
          </span>
        </div>
      </form>
    </div>
  );
}
