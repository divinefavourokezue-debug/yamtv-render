import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router';
import { Article } from '../lib/mockData';
import { getCachedArticlesFromStorage, fetchPublishedArticles } from '../lib/articlesService';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { lang, t } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Real-time search
  useEffect(() => {
    const searchArticles = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const searchTerm = query.toLowerCase();

      try {
        let articlesList = getCachedArticlesFromStorage();
        if (!articlesList || articlesList.length === 0) {
          articlesList = await fetchPublishedArticles();
        }
        
        // Filter in memory for title and category
        const filtered = (articlesList || []).filter((a: Article) => {
          const titleFr = (a.title_fr || '').toLowerCase();
          const titleEn = (a.title_en || '').toLowerCase();
          const category = (a.category || '').toLowerCase();
          return titleFr.includes(searchTerm) || titleEn.includes(searchTerm) || category.includes(searchTerm);
        });
        
        setResults(filtered.slice(0, 5));
      } catch (error) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchArticles();
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query, lang]);

  return (
    <div className="relative" ref={searchRef}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:text-charcoal dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      ) : (
        <div className="flex items-center absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1A1A1A] rounded-full border border-gray-200 dark:border-gray-700 shadow-lg px-3 py-1.5 w-[240px] md:w-[300px] z-50 transition-all duration-300">
          <Search size={16} className="text-gray-400 min-w-[16px]" />
          <input
            ref={inputRef}
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher...' : 'Search...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-charcoal dark:text-white placeholder-gray-400"
          />
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
            className="text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full mt-4 w-[300px] md:w-[400px] bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {lang === 'fr' ? 'Recherche en cours...' : 'Searching...'}
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((article) => {
                const title = lang === 'fr' ? article.title_fr : article.title_en;
                const excerpt = lang === 'fr' ? article.excerpt_fr : article.excerpt_en;
                return (
                  <li key={article.id}>
                    <Link
                      to={`/article/${article.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {article.featured_image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={article.featured_image_url} alt={title} className="w-full h-full object-cover grayscale-[20%]" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-charcoal dark:text-white line-clamp-1">{title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{excerpt}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
