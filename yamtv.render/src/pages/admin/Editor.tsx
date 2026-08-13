import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ImagePlus, Trash2, ArrowLeft, Save, Eye, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import JoditEditor from 'jodit-react';
import { fetchArticleById, saveArticle, deleteArticle } from '../../lib/articlesService';
import { uploadImageToFirebase } from '../../lib/firebase';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isEditing = Boolean(id);

  const editorFrRef = useRef(null);
  const editorEnRef = useRef(null);

  const contentFrRef = useRef('');
  const contentEnRef = useRef('');

  const [activeLangTab, setActiveLangTab] = useState<'fr' | 'en'>('fr');
  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    slug: '',
    category: 'Politique',
    content_fr: '',
    content_en: '',
    featured_image_url: '',
    is_published: true,
    is_featured: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Jodit config - stable reference without activeLangTab dependency to prevent re-initialization loops
  const joditConfig = useMemo(() => ({
    readonly: false,
    height: 400,
    placeholder: lang === 'fr' ? 'Rédigez votre article ici...' : 'Write your article here...',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', '|',
      'paragraph', 'align', 'list', '|',
      'link', 'customImage', '|',
      'hr', 'table', 'fullsize', 'undo', 'redo'
    ],
    extraButtons: [
      {
        name: 'customImage',
        iconURL: 'https://cdn-icons-png.flaticon.com/512/1083/1083286.png',
        tooltip: lang === 'fr' ? 'Insérer une image' : 'Insert image',
        exec: (editor: any) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e: any) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              const toastId = toast.loading(lang === 'fr' ? 'Téléchargement de l\'image...' : 'Uploading image...');
              try {
                const { uploadImageToFirebase } = await import('../../lib/firebase');
                const url = await uploadImageToFirebase(file);
                editor.selection.insertHTML(`<img src="${url}" alt="image" style="max-width:100%; height:auto; margin:10px 0; border-radius:8px;" />`);
                const updatedHTML = editor.value || editor.getEditorValue();
                if (contentFrRef.current !== undefined) {
                  setFormData(prev => ({ ...prev, content_fr: updatedHTML }));
                  contentFrRef.current = updatedHTML;
                  setFormData(prev => ({ ...prev, content_en: updatedHTML }));
                }
                toast.success(lang === 'fr' ? 'Image insérée !' : 'Image inserted!', { id: toastId });
              } catch (err: any) {
                console.error("Error inserting image:", err);
                toast.error((lang === 'fr' ? 'Échec de l\'insertion: ' : 'Failed to insert image: ') + err.message, { id: toastId });
              }
            }
          };
          input.click();
        }
      }
    ],
    uploader: {
      insertImageAsBase64URI: true
    }
  }), [lang]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchArticleById(id)
        .then(article => {
          if (article) {
            setFormData({
              title_fr: article.title_fr || '',
              title_en: article.title_en || '',
              slug: article.slug || '',
              category: article.category || 'Politique',
              content_fr: article.content_fr || '',
              content_en: article.content_en || '',
              featured_image_url: article.featured_image_url || article.image_url || '',
              is_published: article.is_published ?? true,
              is_featured: article.is_featured ?? false,
            });
            contentFrRef.current = article.content_fr || '';
            contentEnRef.current = article.content_en || '';
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const downloadURL = await uploadImageToFirebase(file);
      setFormData(prev => ({ ...prev, featured_image_url: downloadURL }));
      setUploadingImage(false);
      toast.success(lang === 'fr' ? 'Image téléchargée avec succès' : 'Image uploaded successfully');
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error(lang === 'fr' ? 'Erreur lors du traitement de l\'image: ' + error.message : 'Error processing image: ' + error.message);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    let currentContentFr = contentFrRef.current || formData.content_fr;
    let currentContentEn = contentEnRef.current || formData.content_en;

    if (editorFrRef.current && (editorFrRef.current as any).value !== undefined) {
      currentContentFr = (editorFrRef.current as any).value;
    }
    if (editorEnRef.current && (editorEnRef.current as any).value !== undefined) {
      currentContentEn = (editorEnRef.current as any).value;
    }

    const titleFr = (formData.title_fr || '').trim();
    const titleEn = (formData.title_en || '').trim();

    if (!titleFr && !titleEn) {
      toast.error(lang === 'fr' ? 'Veuillez saisir un titre' : 'Please enter a title');
      return;
    }
    if (!currentContentFr && !currentContentEn) {
      toast.error(lang === 'fr' ? 'Veuillez saisir le contenu de l\'article' : 'Please enter article content');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(lang === 'fr' ? 'Publication en cours...' : 'Publishing...');

    try {
      const articleId = id || 'art_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const cleanContentFr = currentContentFr ? currentContentFr.replace(/<[^>]*>?/gm, '').trim() : '';
      const cleanContentEn = currentContentEn ? currentContentEn.replace(/<[^>]*>?/gm, '').trim() : cleanContentFr;

      const payload = {
        id: articleId,
        title_fr: titleFr || titleEn,
        title_en: titleEn || '',
        slug: formData.slug || articleId,
        category: formData.category,
        content_fr: currentContentFr || currentContentEn,
        content_en: currentContentEn || '',
        excerpt_fr: cleanContentFr ? cleanContentFr.substring(0, 150) + '...' : '',
        excerpt_en: cleanContentEn ? cleanContentEn.substring(0, 150) + '...' : '',
        image_url: formData.featured_image_url || '',
        featured_image_url: formData.featured_image_url || '',
        published: publish,
        is_published: publish,
        featured: formData.is_featured,
        is_featured: formData.is_featured,
      };

      await saveArticle(payload);
      toast.success(lang === 'fr' ? 'Article publié avec succès !' : 'Article published successfully!', { id: toastId });
      navigate('/admin/articles');
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast.error((lang === 'fr' ? 'Erreur de publication: ' : 'Publishing error: ') + (error?.message || 'Erreur inconnue'), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!id) return;
    if (!window.confirm(lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet article ?' : 'Are you sure you want to delete this article?')) return;
    setSaving(true);
    try {
      await deleteArticle(id, formData.slug);
      toast.success(lang === 'fr' ? 'Article supprimé avec succès !' : 'Article deleted successfully!');
      navigate('/admin/articles');
    } catch (e: any) {
      console.error('Error deleting article:', e);
      toast.error(lang === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => navigate('/admin/articles')}
          className="flex items-center gap-2 text-gray-600 hover:text-charcoal font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          {lang === 'fr' ? 'Retour aux articles' : 'Back to articles'}
        </button>

        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              onClick={handleDeleteArticle}
              disabled={saving}
              className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
              title={lang === 'fr' ? 'Supprimer' : 'Delete'}
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-charcoal font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {lang === 'fr' ? 'Enregistrer en brouillon' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-charcoal text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={18} />
            )}
            {lang === 'fr' ? 'Publier l\'article' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-serif font-bold text-charcoal">
          {isEditing ? (lang === 'fr' ? 'Modifier l\'article' : 'Edit Article') : (lang === 'fr' ? 'Nouvel article' : 'New Article')}
        </h1>

        {/* Category & Featured */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              {lang === 'fr' ? 'Catégorie' : 'Category'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-charcoal focus:outline-none focus:border-charcoal"
            >
              <option value="Politique">Politique</option>
              <option value="Economie">Économie</option>
              <option value="Société">Société</option>
              <option value="Culture">Culture</option>
              <option value="Sport">Sport</option>
              <option value="Santé">Santé</option>
              <option value="International">International</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 accent-charcoal rounded cursor-pointer"
            />
            <label htmlFor="is_featured" className="text-sm font-semibold text-charcoal cursor-pointer">
              {lang === 'fr' ? 'Mettre l\'article à la une (Carrousel principal)' : 'Feature article (Main carousel)'}
            </label>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
            {lang === 'fr' ? 'Image à la une' : 'Featured Image'}
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="text"
              name="featured_image_url"
              value={formData.featured_image_url}
              onChange={handleChange}
              placeholder="https://..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal"
            />
            <label className="bg-gray-100 hover:bg-gray-200 text-charcoal px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2">
              <ImagePlus size={18} />
              <span>{uploadingImage ? (lang === 'fr' ? 'Chargement...' : 'Uploading...') : (lang === 'fr' ? 'Télécharger' : 'Upload')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
          {formData.featured_image_url && (
            <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={formData.featured_image_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Language Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveLangTab('fr')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeLangTab === 'fr'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang === 'fr' ? 'Français (Obligatoire)' : 'French (Required)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveLangTab('en')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeLangTab === 'en'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang === 'fr' ? 'Anglais (Optionnel)' : 'English (Optional)'}
          </button>
        </div>

        {/* Form Fields - Keep BOTH mounted in DOM so Jodit instance & state is never lost when toggling tabs */}
        <div className={activeLangTab === 'fr' ? 'block space-y-6' : 'hidden space-y-6'}>
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              {lang === 'fr' ? 'Titre (Français)' : 'Title (French)'} *
            </label>
            <input
              type="text"
              name="title_fr"
              value={formData.title_fr}
              onChange={handleChange}
              placeholder="Ex: Titre de l'article"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-charcoal focus:outline-none focus:border-charcoal"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              {lang === 'fr' ? 'Contenu (Français)' : 'Content (French)'} *
            </label>
            <div className="prose-editor">
              <JoditEditor
                ref={editorFrRef}
                value={formData.content_fr}
                config={joditConfig}
                onBlur={newContent => {
                  contentFrRef.current = newContent;
                  setFormData(prev => ({ ...prev, content_fr: newContent }));
                }}
              />
            </div>
          </div>
        </div>

        <div className={activeLangTab === 'en' ? 'block space-y-6' : 'hidden space-y-6'}>
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              {lang === 'fr' ? 'Titre (Anglais)' : 'Title (English)'}
            </label>
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              placeholder="Ex: Article title"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-charcoal focus:outline-none focus:border-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              {lang === 'fr' ? 'Contenu (Anglais)' : 'Content (English)'}
            </label>
            <div className="prose-editor">
              <JoditEditor
                ref={editorEnRef}
                value={formData.content_en}
                config={joditConfig}
                onBlur={newContent => {
                  contentEnRef.current = newContent;
                  setFormData(prev => ({ ...prev, content_en: newContent }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
