import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Logo } from './Logo';
import { ThemeLangToggle } from './ThemeLangToggle';
import { GlobalSearch } from './GlobalSearch';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, t } = useLanguage();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = format(new Date(), "d MMMM yyyy", { locale: lang === 'fr' ? fr : enUS });
    setDateStr(`24°C — ${d.toUpperCase()}`);
  }, [lang]);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/actualites', label: t('nav.news') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/publicite', label: t('nav.advertising') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <div className="fixed w-full top-0 z-50 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl shadow-sm transition-all duration-[250ms] ease-out print:hidden">
      <header className="px-4 sm:px-6 py-0 h-[64px] md:h-[80px] flex items-center justify-between z-10 relative max-w-7xl mx-auto">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center text-primary z-20">
          <Logo className="h-8 md:h-10 text-primary" />
        </Link>
        
        {/* Right: Actions & Menu Toggle */}
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <ThemeLangToggle />
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center gap-[48px] bg-transparent max-w-7xl mx-auto border-t border-gray-100/50 dark:border-gray-800/50 py-[16px]">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "text-[12px] uppercase tracking-[0.15em] font-semibold transition-all duration-[250ms] ease-out relative py-1",
                isActive ? "text-charcoal dark:text-white" : "text-gray-400 hover:text-charcoal dark:hover:text-white"
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white/95 dark:bg-[#111111]/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 shadow-2xl absolute w-full h-[calc(100vh-56px)] overflow-y-auto">
          <div className="flex flex-col px-6 py-8 gap-[32px]">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "text-2xl font-serif font-medium transition-all duration-[250ms] ease-out",
                    isActive ? "text-primary" : "text-charcoal dark:text-white hover:translate-x-2"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
