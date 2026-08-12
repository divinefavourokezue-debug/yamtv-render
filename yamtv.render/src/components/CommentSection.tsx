import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockComments, Comment } from '../lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MessageSquare, Send } from 'lucide-react';

export function CommentSection({ articleId }: { articleId: string }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    setLoading(true);
    const filteredMock = mockComments.filter(c => c.article_id === articleId && c.is_approved);
    setComments(filteredMock);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const authorName = user?.user_metadata?.full_name || user?.displayName || user?.email?.split('@')[0] || anonymousName.trim() || (lang === 'fr' ? 'Lecteur' : 'Reader');
    const nowISO = new Date().toISOString();

    const localComment: Comment = {
      id: `local_comment_${Date.now()}`,
      article_id: articleId,
      user_id: user?.id || 'guest',
      user_name: authorName,
      content: newComment.trim(),
      created_at: nowISO,
      is_approved: true,
    };
    
    setComments(prev => [...prev, localComment]);
    setNewComment('');
    setSubmitting(false);
  };

  return (
    <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-2xl font-serif font-bold text-charcoal dark:text-white mb-8 flex items-center gap-2">
        <MessageSquare size={24} />
        {lang === 'fr' ? 'Commentaires' : 'Comments'} ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre nom (optionnel)' : 'Your name (optional)'}
                className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-charcoal dark:text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(user?.user_metadata?.full_name || user?.email || anonymousName || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={lang === 'fr' ? 'Écrire un commentaire...' : 'Write a comment...'}
                className="w-full min-h-[100px] bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-charcoal dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary dark:hover:bg-primary dark:hover:text-white hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {lang === 'fr' ? 'Publier' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 text-charcoal dark:text-gray-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {(comment.user_name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="font-bold text-charcoal dark:text-white text-sm">{comment.user_name}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: lang === 'fr' ? fr : enUS })}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {lang === 'fr' ? 'Aucun commentaire pour le moment. Soyez le premier !' : 'No comments yet. Be the first!'}
          </div>
        )}
      </div>
    </div>
  );
}
