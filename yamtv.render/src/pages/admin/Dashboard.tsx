import React from 'react';
import { Link } from 'react-router';
import { PenTool, Files, Image as ImageIcon, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Dashboard() {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col gap-[48px]">
      <div>
        <h1 className="text-[32px] font-serif font-bold text-charcoal dark:text-white mb-2">
          {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
        </h1>
        <p className="text-[18px] text-gray-500 dark:text-gray-400">
          {lang === 'fr' ? 'Que souhaitez-vous faire aujourd\'hui ?' : 'What would you like to do today?'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
        {/* Card 1: New Article */}
        <Link 
          to="/admin/articles/new"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-red-50 dark:bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
            <PenTool size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Nouvel Article' : 'New Article'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Rédiger et publier un nouvel article sur YAMtv.' : 'Draft and publish a new article on YAMtv.'}
            </p>
          </div>
        </Link>

        {/* Card 2: Manage Articles */}
        <Link 
          to="/admin/articles"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-charcoal dark:text-white group-hover:scale-110 transition-transform duration-200">
            <Files size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Gérer les Articles' : 'Manage Articles'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Modifier ou supprimer les articles existants.' : 'Edit or delete existing published articles.'}
            </p>
          </div>
        </Link>

        {/* Card 5: Manage Comments */}
        <Link 
          to="/admin/comments"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-charcoal dark:text-white group-hover:scale-110 transition-transform duration-200">
            <MessageSquare size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Commentaires' : 'Comments'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Modérer les commentaires laissés par les utilisateurs.' : 'Moderate comments left by users.'}
            </p>
          </div>
        </Link>

        {/* Card 3: Upload Media */}
        <Link 
          to="/admin/media"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-charcoal dark:text-white group-hover:scale-110 transition-transform duration-200">
            <ImageIcon size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Médiathèque' : 'Media Library'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Gérer les images et ressources multimédia.' : 'Manage your images and media assets.'}
            </p>
          </div>
        </Link>
        {/* Card 6: Content Manager */}
        <Link 
          to="/admin/content"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-charcoal dark:text-white group-hover:scale-110 transition-transform duration-200">
            <Files size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Contenus des Pages' : 'Page Contents'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Modifier les textes de toutes les pages (À propos, Contact...)' : 'Edit texts for all pages (About, Contact...).'}
            </p>
          </div>
        </Link>
        
        {/* Card 4: Settings */}
        <Link 
          to="/admin/settings"
          className="group bg-white dark:bg-[#1A1A1A] p-[32px] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-[4px] flex flex-col gap-[24px] border border-gray-100 dark:border-gray-800"
        >
          <div className="w-[64px] h-[64px] bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-charcoal dark:text-white group-hover:scale-110 transition-transform duration-200">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h2 className="text-[20px] font-serif font-bold text-charcoal dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
              {lang === 'fr' ? 'Paramètres' : 'Settings'}
            </h2>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 line-clamp-2">
              {lang === 'fr' ? 'Gérer les paramètres globaux du site.' : 'Manage global site settings.'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
