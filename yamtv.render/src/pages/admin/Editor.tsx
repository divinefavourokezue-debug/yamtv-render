import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Save, Image as ImageIcon, Check, ImagePlus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import { fetchArticleById, saveArticle, deleteArticle } from '../../lib/articlesService';
import { Article } from '../../lib/mockData';

const WordLikeEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const editorRef = useRef(null);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder || 'Start typing...',
    height: 600,
    toolbarButtonSize: 'middle' as const,
    uploader: {
      insertImageAsBase64URI: true
    },
    buttons: [
      'source', '|',
      'bold',
      'strikethrough',
      'underline',
      'italic', '|',
      'superscript',
      'subscript', '|',
      'ul',
      'ol', '|',
      'outdent',
      'indent', '|',
      'font',
      'fontsize',
      'brush',
      'paragraph', '|',
      'image',
      'video',
      'table',
      'link', '|',
      'align',
      'undo',
      'redo', '|',
      'hr',
      'eraser',
      'copyformat', '|',
      'symbol',
      'fullsize',
      'print'
    ],
  }), [placeholder]);

  return (
    <div className="word-editor-container border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <JoditEditor
        ref={editorRef}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={newContent => onChange(newContent)}
        onChange={newContent => onChange(newContent)}
      />
    </div>
  );
};

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { lang } = useLanguage();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    slug: '',
    category: 'Politique',
    content_fr: '',
    content_en: '',
    featured_image_url: '',
    is_published: false,
    is_featured: false,
  });

  const categories = ['Politique', 'Economie', 'Société', 'Culture', 'Sport', 'International'];

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      if (!id) return;
      const data = await fetchArticleById(id);
        
      if (data) {
        setFormData({
          title_fr: data.title_fr || '',
          title_en: data.title_en || '',
          slug: data.slug || '',
          category: data.category || 'Politique',
          content_fr: data.content_fr || '',
          content_en: data.content_en || '',
          featured_image_url: data.featured_image_url || '',
          is_published: data.is_published || false,
          is_featured: data.is_featured || false,
        });
      } else {
        toast.error(lang === 'fr' ? 'Article introuvable' : 'Article not found');
      }
    } catch (error: any) {
      console.error("Error fetching article:", error);
      toast.error(lang === 'fr' ? 'Erreur lors du chargement de l\'article' : 'Error loading article');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value };
      
      if (name === 'title_fr' && !isEditing) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
  };

  const handleRichTextChange = (field: 'content_fr' | 'content_en', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, featured_image_url: reader.result as string }));
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error(lang === 'fr' ? 'Erreur lors de la lecture de l\'image' : 'Error reading image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error(lang === 'fr' ? 'Erreur lors du traitement de l\'image: ' + error.message : 'Error processing image: ' + error.message);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title_fr && !formData.title_en) {
      toast.error(lang === 'fr' ? 'Le titre est obligatoire' : 'Title is required');
      return;
    }

    setSaving(true);
    try {
      const articleId = id || 'art_' + Date.now();
      const cleanContentFr = formData.content_fr ? formData.content_fr.replace(/<[^>]*>?/gm, '').trim() : '';
      const cleanContentEn = formData.content_en ? formData.content_en.replace(/<[^>]*>?/gm, '').trim() : cleanContentFr;

      const payload = {
        id: articleId,
        title_fr: formData.title_fr,
        title_en: formData.title_en || formData.title_fr,
        slug: formData.slug || articleId,
        category: formData.category,
        content_fr: formData.content_fr,
        content_en: formData.content_en || formData.content_fr,
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

      toast.success(lang === 'fr' ? 'Article enregistré avec succès !' : 'Article saved successfully!');
      navigate('/admin/articles');
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast.error((lang === 'fr' ? 'Erreur lors de l\'enregistrement de l\'article: ' : 'Error saving article: ') + (error.message || ''));
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
    <div className="max-w-4xl mx-auto flex flex-col gap-[32px]">
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/articles" 
          className="flex items-center gap-2 text-gray-500 hover:text-charcoal transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          {lang === 'fr' ? 'Retour aux articles' : 'Back to articles'}
        </Link>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDeleteArticle}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={16} />
              {lang === 'fr' ? 'Supprimer' : 'Delete'}
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-charcoal focus:ring-charcoal accent-charcoal cursor-pointer"
            />
            <label htmlFor="is_featured" className="text-sm font-semibold text-charcoal cursor-pointer">
              {lang === 'fr' ? 'Mettre à la une (A la Une)' : 'Feature on homepage'}
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
            {lang === 'fr' ? 'Image de couverture' : 'Cover Image'}
          </label>
          {formData.featured_image_url ? (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-gray-200 group mb-3">
              <img src={formData.featured_image_url} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <label className="bg-white text-charcoal px-4 py-2 rounded-lg font-semibold text-xs cursor-pointer hover:bg-gray-100 transition-colors">
                  {lang === 'fr' ? 'Changer' : 'Change'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {lang === 'fr' ? 'Supprimer' : 'Remove'}
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50/50">
              <ImagePlus size={32} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-600">
                {uploadingImage ? (lang === 'fr' ? 'Chargement de l\'image...' : 'Uploading image...') : (lang === 'fr' ? 'Cliquer pour télécharger une image' : 'Click to upload an image')}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
          )}
        </div>

        {/* Bilingual Tabs */}
        <div className="border-b border-gray-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveLangTab('fr')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors cursor-pointer ${activeLangTab === 'fr' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            🇫🇷 {lang === 'fr' ? 'Contenu en Français' : 'French Content'}
          </button>
          <button
            type="button"
            onClick={() => setActiveLangTab('en')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors cursor-pointer ${activeLangTab === 'en' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            🇬🇧 {lang === 'fr' ? 'Contenu en Anglais' : 'English Content'}
          </button>
        </div>

        {/* Content Form Fields */}
        {activeLangTab === 'fr' ? (
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                {lang === 'fr' ? 'Titre (Français)' : 'Title (French)'}
              </label>
              <input
                type="text"
                name="title_fr"
                value={formData.title_fr}
                onChange={handleChange}
                placeholder="Entrez le titre en français..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-serif text-lg font-bold text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                {lang === 'fr' ? 'Contenu de l\'article (Français)' : 'Article Content (French)'}
              </label>
              <WordLikeEditor
                value={formData.content_fr}
                onChange={(val) => handleRichTextChange('content_fr', val)}
                placeholder="Rédigez l'article en français..."
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                {lang === 'fr' ? 'Titre (Anglais)' : 'Title (English)'}
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleChange}
                placeholder="Enter English title..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-serif text-lg font-bold text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                {lang === 'fr' ? 'Contenu de l\'article (Anglais)' : 'Article Content (English)'}
              </label>
              <WordLikeEditor
                value={formData.content_en}
                onChange={(val) => handleRichTextChange('content_en', val)}
                placeholder="Write article content in English..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
