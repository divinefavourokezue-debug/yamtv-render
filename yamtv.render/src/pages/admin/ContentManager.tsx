import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, SiteSettings } from '../../lib/settings';
import { useLanguage } from '../../contexts/LanguageContext';
import { Save, Loader2, Globe, Layout, Edit3 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const SECTIONS = [
  {
    id: 'home',
    label: { fr: 'Accueil', en: 'Home' },
    keys: ['home.h1', 'home.text', 'home.headline.1', 'home.headline.2']
  },
  {
    id: 'about',
    label: { fr: 'À propos', en: 'About' },
    keys: ['about.h1', 'about.text', 'about.ethics', 'about.ethics.desc', 'about.independence', 'about.independence.desc', 'about.responsibility', 'about.responsibility.desc']
  },
  {
    id: 'news',
    label: { fr: 'Actualités', en: 'News' },
    keys: ['news.h1', 'news.subtext']
  },
  {
    id: 'advertising',
    label: { fr: 'Publicité', en: 'Advertising' },
    keys: ['advertising.h1', 'advertising.text']
  },
  {
    id: 'contact',
    label: { fr: 'Contact', en: 'Contact' },
    keys: ['contact.h1', 'contact.text', 'contact.subtext']
  },
  {
    id: 'footer',
    label: { fr: 'Pied de page', en: 'Footer' },
    keys: ['footer.description']
  }
];

export default function ContentManager() {
  const { lang, t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({ fr: {}, en: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [editLang, setEditLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    getSettings().then(data => {
      setSettings(data);
      if (data.translations) {
        setTranslations({
          fr: { ...data.translations.fr },
          en: { ...data.translations.en }
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    
    const newSettings = {
      ...settings,
      translations
    };
    
    await saveSettings(newSettings);
    setSaving(false);
    toast.success(lang === 'fr' ? 'Contenus sauvegardés avec succès' : 'Content saved successfully');
  };

  const handleTextChange = (key: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [editLang]: {
        ...prev[editLang],
        [key]: value
      }
    }));
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const activeKeys = SECTIONS.find(s => s.id === activeSection)?.keys || [];

  return (
    <div className="flex flex-col gap-[32px]">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-charcoal dark:text-white mb-2 flex items-center gap-3">
            <Layout className="text-primary" />
            {lang === 'fr' ? 'Gestionnaire de Contenu' : 'Content Manager'}
          </h1>
          <p className="text-[18px] text-gray-500 dark:text-gray-400">
            {lang === 'fr' ? 'Modifiez tous les textes des pages statiques.' : 'Edit all texts of static pages.'}
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white px-6 h-[48px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          {saving ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Enregistrer' : 'Save')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-[32px]">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[280px] flex-shrink-0">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sticky top-[100px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">
              {lang === 'fr' ? 'Pages' : 'Pages'}
            </h3>
            <div className="flex flex-col gap-1">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between
                    ${activeSection === section.id 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                      : 'text-charcoal dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'}`}
                >
                  {lang === 'fr' ? section.label.fr : section.label.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Editor Area */}
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
            <h2 className="text-[24px] font-serif font-bold text-charcoal dark:text-white flex items-center gap-2">
              <Edit3 size={24} className="text-primary" />
              {lang === 'fr' ? SECTIONS.find(s => s.id === activeSection)?.label.fr : SECTIONS.find(s => s.id === activeSection)?.label.en}
            </h2>
            
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#2A2A2A] p-1 rounded-lg">
              <button
                onClick={() => setEditLang('fr')}
                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${editLang === 'fr' ? 'bg-white dark:bg-charcoal text-primary shadow-sm' : 'text-gray-500 hover:text-charcoal dark:hover:text-white'}`}
              >
                Français
              </button>
              <button
                onClick={() => setEditLang('en')}
                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${editLang === 'en' ? 'bg-white dark:bg-charcoal text-primary shadow-sm' : 'text-gray-500 hover:text-charcoal dark:hover:text-white'}`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {activeKeys.map(key => {
              const currentVal = translations[editLang]?.[key] || t(key);
              const isLongText = currentVal.length > 60 || key.includes('text') || key.includes('desc');
              
              return (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-charcoal dark:text-white font-bold flex justify-between items-center">
                    <span className="capitalize">{key.split('.').slice(1).join(' ').replace(/[-_]/g, ' ')}</span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-[#2A2A2A] px-2 py-1 rounded">{key}</span>
                  </label>
                  
                  {isLongText ? (
                    <textarea
                      value={translations[editLang]?.[key] !== undefined ? translations[editLang][key] : t(key)}
                      onChange={(e) => handleTextChange(key, e.target.value)}
                      rows={5}
                      className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-charcoal dark:text-white resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={translations[editLang]?.[key] !== undefined ? translations[editLang][key] : t(key)}
                      onChange={(e) => handleTextChange(key, e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-charcoal dark:text-white"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
