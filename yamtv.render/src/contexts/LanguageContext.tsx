import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../lib/settings';

type Language = 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.news': 'Actualités',
    'nav.advertising': 'Publicité',
    'nav.contact': 'Contact',
    'nav.admin': 'Espace Admin',
    'home.h1': 'Bienvenue sur YAMtv',
    'home.text': "YAMtv est un média en ligne indépendant dédié à une information fiable, équilibrée et accessible à tous. Nous couvrons l'actualité nationale et internationale dans les domaines de la politique, de l'économie, de la société, de la culture et du sport. Notre mission est d'informer, d'analyser et de donner la parole aux acteurs de l'actualité.",
    'home.latest': 'Derniers articles',
    'home.edito': 'Édito',
    'home.headline.1': "L'information",
    'home.headline.2': "à la source.",
    'home.featured': 'À la une',
    'about.h1': 'À propos',
    'about.text': "Créé avec la volonté de promouvoir un journalisme de qualité, YAMtv s'engage à produire des contenus vérifiés, impartiaux et utiles au public. Notre rédaction est composée de journalistes passionnés qui respectent les principes d'éthique, d'indépendance et de responsabilité. Nous avons pour ambition de devenir une référence en matière d'information numérique.",
    'about.team': "L'équipe",
    'about.ethics': "Éthique",
    'about.ethics.desc': "Un engagement sans faille envers la vérité et l'intégrité journalistique.",
    'about.independence': "Indépendance",
    'about.independence.desc': "Une liberté éditoriale totale, loin de toute influence extérieure.",
    'about.responsibility': "Responsabilité",
    'about.responsibility.desc': "Assumer chaque information publiée et son impact sur la société.",
    'news.h1': 'Actualités',
    'news.subtext': "Notre plateforme propose une couverture diversifiée de l'actualité à travers plusieurs rubriques :",
    'news.categories.all': 'Toutes',
    'news.categories.politique': 'Politique',
    'news.categories.economie': 'Économie',
    'news.categories.societe': 'Société',
    'news.categories.culture': 'Culture',
    'news.categories.sport': 'Sport',
    'news.categories.sante': 'Santé',
    'news.categories.international': 'International',
    'advertising.h1': 'Publicité',
    'advertising.text': "Vous souhaitez promouvoir votre entreprise, vos produits ou vos événements? YAMtv met à votre disposition plusieurs plages publicitaires adaptés à vos besoins. Contactez notre équipe pour découvrir nos offres de visibilité.",
    'contact.h1': 'Contact',
    'contact.text': "Pour toute demande d'information, proposition de partenariat, communiqué de presse ou collaboration, contactez notre rédaction.",
    'contact.subtext': "Vous pouvez également nous suivre sur nos différentes plateformes de réseaux sociaux afin de rester informé de l'actualité en temps réel.",
    'contact.form.name': 'Nom',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Sujet',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Envoyer',
    'footer.description': "Média en ligne indépendant dédié à une information fiable, équilibrée et accessible à tous.",
    'footer.navigation': "Navigation",
    'footer.services': "Services",
    'footer.contact': "Contact",
    'footer.email': "Email",
    'footer.office': "Bureau",
    'footer.rights': 'Tous droits réservés.',
    'read_more': 'Lire la suite',
    'published_on': 'Publié le',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.news': 'News',
    'nav.advertising': 'Advertising',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin Area',
    'home.h1': 'Welcome to YAMtv',
    'home.text': "YAMtv is an independent online media dedicated to reliable, balanced, and accessible information for all. We cover national and international news in the fields of politics, economy, society, culture, and sports. Our mission is to inform, analyze, and give voice to newsmakers.",
    'home.latest': 'Latest Articles',
    'home.edito': 'Editorial',
    'home.headline.1': "News",
    'home.headline.2': "at the source.",
    'home.featured': 'Featured',
    'about.h1': 'About Us',
    'about.text': "Created with the desire to promote quality journalism, YAMtv is committed to producing verified, impartial, and useful content for the public. Our editorial staff consists of passionate journalists who respect the principles of ethics, independence, and responsibility. Our ambition is to become a reference in digital information.",
    'about.team': "The Team",
    'about.ethics': "Ethics",
    'about.ethics.desc': "An unwavering commitment to truth and journalistic integrity.",
    'about.independence': "Independence",
    'about.independence.desc': "Total editorial freedom, away from any outside influence.",
    'about.responsibility': "Responsibility",
    'about.responsibility.desc': "Taking responsibility for every published piece of information and its impact on society.",
    'news.h1': 'News',
    'news.subtext': "Our platform offers diverse news coverage across several categories:",
    'news.categories.all': 'All',
    'news.categories.politique': 'Politics',
    'news.categories.economie': 'Economy',
    'news.categories.societe': 'Society',
    'news.categories.culture': 'Culture',
    'news.categories.sport': 'Sports',
    'news.categories.sante': 'Health',
    'news.categories.international': 'International',
    'advertising.h1': 'Advertising',
    'advertising.text': "Do you want to promote your company, your products, or your events? YAMtv provides several advertising slots adapted to your needs. Contact our team to discover our visibility offers.",
    'contact.h1': 'Contact',
    'contact.text': "For any information request, partnership proposal, press release, or collaboration, contact our editorial team.",
    'contact.subtext': "You can also follow us on our various social media platforms to stay informed of the news in real time.",
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send',
    'footer.description': "Independent online media dedicated to reliable, balanced, and accessible information for all.",
    'footer.navigation': "Navigation",
    'footer.services': "Services",
    'footer.contact': "Contact",
    'footer.email': "Email",
    'footer.office': "Office",
    'footer.rights': 'All rights reserved.',
    'read_more': 'Read more',
    'published_on': 'Published on',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('yamtv-lang');
    return (saved === 'fr' || saved === 'en') ? saved : 'fr';
  });
  
  const [customTranslations, setCustomTranslations] = useState<Record<string, Record<string, string>>>({ fr: {}, en: {} });

  useEffect(() => {
    localStorage.setItem('yamtv-lang', lang);
  }, [lang]);

  useEffect(() => {
    getSettings().then(settings => {
      if (settings.translations) {
        setCustomTranslations(settings.translations);
      }
    });

    // Listen for custom event when settings are saved
    const handleSettingsUpdate = () => {
      getSettings().then(settings => {
        if (settings.translations) {
          setCustomTranslations(settings.translations);
        }
      });
    };
    window.addEventListener('yamtv_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('yamtv_settings_updated', handleSettingsUpdate);
  }, []);

  const t = (key: string) => {
    return customTranslations[lang]?.[key] || translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
