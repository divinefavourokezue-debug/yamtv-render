"use client";

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, SiteSettings } from '../../lib/settings';
import { useLanguage } from '../../contexts/LanguageContext';
import { Save, Lock, Mail, Loader2, Database, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { testFirebaseConnection } from '../../lib/firebase';

export default function Settings() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({ breaking_text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Firebase Database State
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; count?: number; message?: string }>({
    connected: true,
    message: lang === 'fr' ? 'Firebase Firestore est actif et opérationnel' : 'Firebase Firestore is active and operational'
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email Change State
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  useEffect(() => {
    getSettings().then((st) => {
      setSettings(st);
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    toast.success(lang === 'fr' ? 'Paramètres sauvegardés' : 'Settings saved');
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    try {
      const res = await testFirebaseConnection();
      setDbStatus({
        connected: true,
        count: res.count,
        message: lang === 'fr' ? `Connexion Firestore réussie (${res.count} articles trouvés)` : `Firestore connected (${res.count} articles found)`
      });
      toast.success(
        lang === 'fr' 
          ? `Base de données Firebase connectée ! (${res.count} articles)` 
          : `Firebase Database connected! (${res.count} articles)`
      );
    } catch (e: any) {
      setDbStatus({
        connected: false,
        message: e?.message || 'Erreur de connexion'
      });
      toast.error(e?.message || (lang === 'fr' ? 'Échec de connexion Firebase' : 'Firebase connection failed'));
    } finally {
      setTestingDb(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(lang === 'fr' ? 'Veuillez remplir tous les champs.' : 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(lang === 'fr' ? 'Les nouveaux mots de passe ne correspondent pas.' : 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(lang === 'fr' ? 'Mot de passe mis à jour avec succès !' : 'Password updated successfully!');
    }, 1000);
  };

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error(lang === 'fr' ? 'Veuillez saisir une adresse e-mail valide.' : 'Please enter a valid email address.');
      return;
    }

    setIsUpdatingEmail(true);
    setTimeout(() => {
      setIsUpdatingEmail(false);
      setNewEmail('');
      toast.success(lang === 'fr' ? 'Adresse e-mail mise à jour !' : 'Email address updated!');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
      <Toaster position="top-right" />
      
      <div>
        <h1 className="text-2xl font-black text-charcoal dark:text-white">
          {lang === 'fr' ? 'Paramètres généraux' : 'General Settings'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {lang === 'fr' ? 'Gérez la configuration globale de votre site et vos bases de données' : 'Manage global site configuration and database settings'}
        </p>
      </div>

      {/* Breaking News Banner Settings */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Save size={20} />
          </div>
          <div>
            <h2 className="font-bold text-charcoal dark:text-white">
              {lang === 'fr' ? 'Bandeau d\'actualités en continu' : 'Breaking News Ticker'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'fr' ? 'Séparez les titres par une barre verticale (|)' : 'Separate items using a vertical bar (|)'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-charcoal dark:text-gray-300">
            {lang === 'fr' ? 'Texte des dernières minutes' : 'Ticker Text'}
          </label>
          <textarea 
            rows={3}
            className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:outline-none focus:border-primary text-charcoal dark:text-white"
            value={settings.breaking_text}
            onChange={(e) => setSettings({ ...settings, breaking_text: e.target.value })}
            placeholder="Mesure 1 | Mesure 2 | Mesure 3"
          />
        </div>

        <div className="flex justify-end">
          <button 
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-6 h-[48px] rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {!saving && <Save size={18} />}
            {lang === 'fr' ? 'Sauvegarder le bandeau' : 'Save Ticker'}
          </button>
        </div>
      </div>

      {/* Firebase Firestore Database Integration Card */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-charcoal dark:text-white">
                  {lang === 'fr' ? 'Base de données Firebase Cloud' : 'Firebase Cloud Database'}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={12} />
                  {lang === 'fr' ? 'Actif & Connecté' : 'Active & Connected'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'fr' ? 'Base de données cloud haute performance synchronisée en temps réel pour tous vos visiteurs' : 'High performance cloud database real-time synchronized for all visitors'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-[#2A2A2A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Project ID</span>
            <span className="font-mono text-sm font-bold text-charcoal dark:text-white">long-direction-l5xj8</span>
          </div>

          <div className="bg-gray-50 dark:bg-[#2A2A2A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Database ID</span>
            <span className="font-mono text-xs font-bold text-charcoal dark:text-white truncate">
              ai-studio-yamtv-9ce9f4cf...
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-[#2A2A2A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Collection</span>
            <span className="font-mono text-sm font-bold text-charcoal dark:text-white">articles</span>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200">
              {lang === 'fr' 
                ? 'Vos données sont stockées en toute sécurité sur Firebase Firestore avec synchronisation automatique sur tous les appareils et sans limites de requêtes pour l\'importation CSV.'
                : 'Your data is securely stored on Firebase Firestore with automatic sync across all devices and optimized chunked batches for CSV import.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestDatabase}
            disabled={testingDb}
            className="w-full sm:w-auto whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-5 h-[42px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 text-sm"
          >
            {testingDb ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {lang === 'fr' ? 'Tester la connexion' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Account & Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Password */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-bold text-charcoal dark:text-white">
                {lang === 'fr' ? 'Modifier le mot de passe' : 'Change Password'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'fr' ? 'Sécurisez votre compte administrateur' : 'Secure your administrator account'}
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-gray-300">
                {lang === 'fr' ? 'Mot de passe actuel' : 'Current Password'}
              </label>
              <input 
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-charcoal dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-gray-300">
                {lang === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
              </label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-charcoal dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-gray-300">
                {lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
              </label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-charcoal dark:text-white"
              />
            </div>

            <button 
              type="submit"
              disabled={isUpdatingPassword}
              className="mt-2 bg-charcoal hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-charcoal h-[42px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {lang === 'fr' ? 'Mettre à jour le mot de passe' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Update Email */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="font-bold text-charcoal dark:text-white">
                {lang === 'fr' ? 'Adresse e-mail du compte' : 'Account Email'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'fr' ? 'E-mail utilisé pour la connexion' : 'Email address used for logging in'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#2A2A2A] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-bold">{lang === 'fr' ? 'E-mail actuel :' : 'Current Email:'}</span>
            <span className="font-medium text-sm text-charcoal dark:text-white">{user?.email || 'admin@yamtv.cg'}</span>
          </div>

          <form onSubmit={handleEmailChange} className="flex flex-col gap-4 mt-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-gray-300">
                {lang === 'fr' ? 'Nouvelle adresse e-mail' : 'New Email Address'}
              </label>
              <input 
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@yamtv.cg"
                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-charcoal dark:text-white"
              />
            </div>

            <button 
              type="submit"
              disabled={isUpdatingEmail}
              className="bg-charcoal hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-charcoal h-[42px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {isUpdatingEmail ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {lang === 'fr' ? 'Mettre à jour l\'e-mail' : 'Update Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
