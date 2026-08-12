import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface CategoriesFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  availableCategories?: string[];
}

export function CategoriesFilter({ selectedCategory, onSelectCategory, availableCategories }: CategoriesFilterProps) {
  const { lang } = useLanguage();
  
  const defaultCategories = [
    { id: 'all', label_en: 'All News', label_fr: 'Toutes les actualités' },
    { id: 'Politique', label_en: 'Politics', label_fr: 'Politique' },
    { id: 'Culture', label_en: 'Culture', label_fr: 'Culture' },
    { id: 'Musique', label_en: 'Music', label_fr: 'Musique' },
    { id: 'Economie', label_en: 'Economy', label_fr: 'Économie' },
    { id: 'Société', label_en: 'Society', label_fr: 'Société' },
    { id: 'Sport', label_en: 'Sport', label_fr: 'Sport' },
    { id: 'Sécurité', label_en: 'Security', label_fr: 'Sécurité' },
  ];

  const categories = [...defaultCategories];

  if (availableCategories && availableCategories.length > 0) {
    const existingIds = new Set(categories.map(c => c.id.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    
    availableCategories.forEach(catName => {
      if (!catName || catName === 'all') return;
      const normalized = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!existingIds.has(normalized)) {
        existingIds.add(normalized);
        const formattedName = catName.charAt(0).toUpperCase() + catName.slice(1);
        categories.push({
          id: catName,
          label_en: formattedName,
          label_fr: formattedName
        });
      }
    });
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 pb-[24px] mb-[48px]">
      <div className="flex items-center gap-[8px] md:gap-[12px] min-w-max px-4 sm:px-0">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "px-[20px] py-[10px] text-[11px] font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300",
                isSelected 
                  ? "bg-[#E0F2FE] text-[#0369A1] shadow-sm" 
                  : "bg-gray-50 text-gray-500 hover:bg-[#E0F2FE]/50 hover:text-[#0369A1] dark:bg-[#1A1A1A] dark:text-gray-400 dark:hover:bg-[#222222] dark:hover:text-white"
              )}
            >
              {lang === 'fr' ? category.label_fr : category.label_en}
            </button>
          );
        })}
      </div>
    </div>
  );
}

