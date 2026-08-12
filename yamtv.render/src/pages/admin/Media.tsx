import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Upload, Copy, Check, Trash2, Image as ImageIcon } from 'lucide-react';

export default function Media() {
  const { lang } = useLanguage();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const saved = localStorage.getItem('yamtv_local_media');
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {}
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const newMedia = {
          id: `local_${Date.now()}`,
          name: file.name,
          url: dataUrl,
          type: file.type,
          size: file.size,
          created_at: new Date().toISOString()
        };

        setFiles(prev => {
          const newList = [newMedia, ...prev];
          try {
            localStorage.setItem('yamtv_local_media', JSON.stringify(newList));
          } catch (e) {
            console.warn("Storage full for base64 strings");
          }
          return newList;
        });
        setUploading(false);
      };
      reader.onerror = () => {
        alert(lang === 'fr' ? 'Erreur de lecture du fichier.' : 'Error reading file.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert(lang === 'fr' ? 'Erreur lors du téléchargement.' : 'Upload error.');
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'fr' ? 'Supprimer cette image ?' : 'Delete this image?')) return;

    setFiles(prev => {
      const newList = prev.filter(f => f.id !== id);
      try {
        localStorage.setItem('yamtv_local_media', JSON.stringify(newList));
      } catch (e) {}
      return newList;
    });
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-[32px]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-charcoal mb-2">
            {lang === 'fr' ? 'Médiathèque' : 'Media Library'}
          </h1>
          <p className="text-[18px] text-gray-500">
            {lang === 'fr' ? 'Gérez vos images.' : 'Manage your images.'}
          </p>
        </div>
        <div>
          <label className="bg-charcoal hover:bg-gray-800 text-white px-8 h-[56px] flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-[4px] cursor-pointer">
            <Upload size={20} />
            {uploading ? (lang === 'fr' ? 'Envoi...' : 'Uploading...') : (lang === 'fr' ? 'Uploader' : 'Upload')}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative">
              <div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              
              <div className="p-4 flex justify-between items-center bg-white border-t border-gray-100">
                <button 
                  onClick={() => copyUrl(file.url, file.id)}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-600 hover:text-charcoal transition-colors h-[56px] px-2 -ml-2 cursor-pointer"
                  title="Copy URL"
                >
                  {copiedId === file.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  <span className="truncate max-w-[100px]">{file.name}</span>
                </button>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="text-red-400 hover:text-primary transition-colors h-[56px] px-2 -mr-2 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {files.length === 0 && (
            <div className="col-span-full py-24 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center gap-4">
              <ImageIcon size={48} className="text-gray-300" />
              {lang === 'fr' ? 'Aucune image trouvée.' : 'No media found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
