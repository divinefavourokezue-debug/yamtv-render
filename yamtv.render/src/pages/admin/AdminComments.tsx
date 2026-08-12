import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockComments, Comment } from '../../lib/mockData';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Check, X, Trash2 } from 'lucide-react';

export default function AdminComments() {
  const { lang } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setComments([...mockComments]);
    setLoading(false);
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setComments(comments.map(c => c.id === id ? { ...c, is_approved: nextStatus } : c));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'fr' ? 'Supprimer ce commentaire ?' : 'Delete this comment?')) return;
    setComments(comments.filter(c => c.id !== id));
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex flex-col gap-[32px]">
      <div>
        <h1 className="text-[32px] font-serif font-bold text-charcoal dark:text-white mb-2">
          {lang === 'fr' ? 'Modération des commentaires' : 'Comment Moderation'}
        </h1>
        <p className="text-[18px] text-gray-500 dark:text-gray-400">
          {lang === 'fr' ? 'Gérer les commentaires laissés par les utilisateurs.' : 'Manage comments left by users.'}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[12px] uppercase tracking-[0.1em] text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Auteur' : 'Author'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Commentaire' : 'Comment'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Date' : 'Date'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Statut' : 'Status'}</th>
                <th className="px-6 py-4 font-semibold text-right">{lang === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[14px] text-charcoal dark:text-white">{comment.user_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-600 dark:text-gray-400 max-w-md line-clamp-2">
                      {comment.content}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-500">
                      {format(new Date(comment.created_at), 'dd MMM yyyy, HH:mm', { locale: lang === 'fr' ? fr : enUS })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {comment.is_approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {lang === 'fr' ? 'Approuvé' : 'Approved'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {lang === 'fr' ? 'En attente' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(comment.id, comment.is_approved)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${comment.is_approved ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40' : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'}`}
                        title={comment.is_approved ? (lang === 'fr' ? 'Masquer' : 'Hide') : (lang === 'fr' ? 'Approuver' : 'Approve')}
                      >
                        {comment.is_approved ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-2 rounded-lg text-primary bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                        title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {lang === 'fr' ? 'Aucun commentaire trouvé.' : 'No comments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
