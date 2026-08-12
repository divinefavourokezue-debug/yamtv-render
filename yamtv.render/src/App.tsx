/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Advertising from './pages/Advertising';
import Contact from './pages/Contact';
import ArticleDetail from './pages/ArticleDetail';

import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Editor from './pages/admin/Editor';
import AdminArticles from './pages/admin/AdminArticles';
import AdminComments from './pages/admin/AdminComments';
import Media from './pages/admin/Media';
import Settings from './pages/admin/Settings';
import ContentManager from './pages/admin/ContentManager';
import { FloatingActions } from './components/FloatingActions';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <BrowserRouter>
              <ScrollToTop />
              <FloatingActions />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="a-propos" element={<About />} />
                <Route path="actualites" element={<News />} />
                <Route path="publicite" element={<Advertising />} />
                <Route path="contact" element={<Contact />} />
                <Route path="article/:slug" element={<ArticleDetail />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="articles/new" element={<Editor />} />
                <Route path="articles/edit/:id" element={<Editor />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="media" element={<Media />} />
                <Route path="content" element={<ContentManager />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}


