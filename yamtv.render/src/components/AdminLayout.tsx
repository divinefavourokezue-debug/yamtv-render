import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { ThemeLangToggle } from './ThemeLangToggle';

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#111111] dark:text-white transition-colors">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // const userRole = user.user_metadata?.role;
  // if (userRole !== 'admin' && userRole !== 'editor') {
  //   return <Navigate to="/admin/login" replace />;
  // }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };
  
  // Extract first part of email for greeting
  const firstName = user.email ? user.email.split('@')[0] : 'User';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111111] text-charcoal dark:text-[#FAFAFA] font-sans transition-colors duration-200">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Top Header */}
      <header className="h-[80px] bg-[#FFFFFF] dark:bg-[#111111] border-b border-gray-100 dark:border-gray-800 px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200">
        <Link to="/admin/dashboard" className="flex items-center text-primary">
          <Logo className="h-8 text-primary" />
        </Link>
        
        <div className="flex items-center gap-6">
          <ThemeLangToggle />
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="text-[14px] text-gray-500 dark:text-gray-400">
            {lang === 'fr' ? 'Bonjour, ' : 'Hello, '}<span className="font-bold text-charcoal dark:text-white">{capitalizedName}</span>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[14px] text-charcoal dark:text-gray-300 font-semibold hover:text-primary dark:hover:text-primary transition-colors"
          >
            <LogOut size={18} />
            {lang === 'fr' ? 'Déconnexion' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[48px]">
        <Outlet />
      </main>
    </div>
  );
}
