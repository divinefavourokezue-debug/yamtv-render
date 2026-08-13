import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Logo } from '../../components/Logo';
import { ThemeLangToggle } from '../../components/ThemeLangToggle';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { lang } = useLanguage();

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError(lang === 'fr' ? 'Veuillez remplir tous les champs.' : 'Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(lang === 'fr' ? 'Identifiants incorrects.' : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111111] transition-colors flex flex-col justify-center py-[48px] sm:px-6 lg:px-8 relative overflow-hidden">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{lang === 'fr' ? 'Connexion Administration - YAMtv' : 'Admin Login - YAMtv'}</title>
      </Helmet>

      {/* Theme and Language Toggle */}
      <div className="absolute top-6 right-8 z-20 flex gap-2">
        <ThemeLangToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px] z-10">
        <div className="bg-white dark:bg-[#1A1A1A] p-[48px] shadow-xl rounded-2xl flex flex-col gap-[28px] transition-colors border border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4 text-primary">
              <Logo className="h-10 text-primary" />
            </div>
            <h1 className="text-[28px] leading-tight font-serif font-bold text-charcoal dark:text-white mb-2">
              {lang === 'fr' ? 'Espace Rédaction YAMtv' : 'YAMtv Editorial Hub'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'fr'
                ? 'Accès réservé aux administrateurs autorisés'
                : 'Restricted to authorized administrators'}
            </p>
          </div>

          <form className="flex flex-col gap-[20px]" onSubmit={handleLogin}>
            {successMsg && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-medium flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="block text-[14px] font-semibold text-charcoal dark:text-gray-300"
              >
                {lang === 'fr' ? 'Adresse Email' : 'Email Address'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[16px] text-charcoal dark:text-white placeholder-gray-400"
                placeholder="admin@yamtv.bf"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="block text-[14px] font-semibold text-charcoal dark:text-gray-300"
              >
                {lang === 'fr' ? 'Mot de passe' : 'Password'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[16px] text-charcoal dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center h-[52px] border border-transparent rounded-xl shadow-sm text-[16px] font-bold text-white bg-charcoal hover:bg-gray-800 dark:bg-white dark:text-charcoal dark:hover:bg-gray-200 focus:outline-none transition-all duration-200 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : lang === 'fr' ? (
                'Se Connecter'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Lock size={12} />
              {lang === 'fr'
                ? "Accès protégé & sécurisé pour l'administration"
                : 'Protected & secured access for administration'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
