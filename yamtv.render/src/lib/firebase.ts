
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-yamtv-9ce9f4cf-b30d-45f5-a0bf-58b0fd9847dc';
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export async function uploadImageToFirebase(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Limit max dimensions to 650px to ensure base64 string is super lightweight (~35KB-50KB)
        const max_size = 650; 

        if (width > height) {
          if (width > max_size) {
            height = Math.round(height * (max_size / width));
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width = Math.round(width * (max_size / height));
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        
        // Fill white background in case of transparent PNGs before converting to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.45 quality for maximum efficiency under Firestore 1MB limit
        const dataUrl = canvas.toDataURL('image/jpeg', 0.45);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export interface FirebaseArticlePayload {
  id: string;
  title_fr: string;
  title_en?: string;
  slug?: string;
  category?: string;
  excerpt_fr?: string;
  excerpt_en?: string;
  content_fr?: string;
  content_en?: string;
  featured_image_url?: string;
  published_at?: string;
  is_published?: boolean;
  is_featured?: boolean;
  [key: string]: any;
}

/**
 * Helper to truncate strings safely before pushing to Firestore
 */
function truncate(val: any, maxLen: number = 900000): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  return s.length > maxLen ? s.substring(0, maxLen) : s;
}

export function formatArticleForFirestore(article: any) {
  const artId = String(article.id || article.article_id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  
  let isPublished = true;
  if (article.is_published !== undefined) {
    if (typeof article.is_published === 'boolean') isPublished = article.is_published;
    else {
      const p = String(article.is_published).toLowerCase().trim();
      isPublished = !(p === 'false' || p === '0' || p === 'draft' || p === 'brouillon' || p === 'f');
    }
  } else if (article.published !== undefined) {
    if (typeof article.published === 'boolean') isPublished = article.published;
    else {
      const p = String(article.published).toLowerCase().trim();
      isPublished = !(p === 'false' || p === '0' || p === 'draft' || p === 'brouillon' || p === 'f');
    }
  } else if (article.status !== undefined) {
    const s = String(article.status).toLowerCase().trim();
    isPublished = !(s === 'draft' || s === 'brouillon' || s === 'false' || s === '0' || s === 'f');
  }

  return {
    id: artId,
    article_id: artId,
    title_fr: truncate(article.title_fr || article.title, 950) || 'Sans titre',
    title_en: truncate(article.title_en || '', 950),
    slug: truncate(article.slug || artId, 250),
    category: truncate(article.category, 200) || 'Actualités',
    excerpt_fr: truncate(article.excerpt_fr || article.excerpt, 4800),
    excerpt_en: truncate(article.excerpt_en || '', 4800),
    content_fr: truncate(article.content_fr || article.content, 900000),
    content_en: truncate(article.content_en || '', 900000),
    featured_image_url: article.featured_image_url || article.image_url || article.image || '',
    published_at: truncate(article.published_at || article.created_at || new Date().toISOString(), 90),
    is_published: isPublished,
    is_featured: !!(article.is_featured || article.featured),
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetch all articles directly from Firebase Firestore
 */
export async function fetchArticlesFromFirebase(): Promise<any[]> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, limit(500));
    const snapshot = await getDocs(q);
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push({ ...docSnap.data(), id: docSnap.id });
    });
    return list;
  } catch (err) {
    console.warn('Firebase fetch error:', err);
    return [];
  }
}

/**
 * Save or update a single article in Firebase Firestore
 */
export async function saveArticleToFirebase(article: any): Promise<any> {
  const payload = formatArticleForFirestore(article);
  
  // Check payload size against Firestore 1MB (1,048,576 bytes) document limit
  const payloadJson = JSON.stringify(payload);
  const sizeInBytes = new Blob([payloadJson]).size;
  if (sizeInBytes > 1000000) {
    throw new Error(`Article too large (${Math.round(sizeInBytes / 1024)} KB). Firebase document limit is 1000 KB. Please remove one or two images.`);
  }
  
  const docRef = doc(db, 'articles', payload.id);
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

/**
 * Save multiple articles in chunked batches (max 400 per batch) to avoid Firestore limits
 */
export async function batchSaveArticlesToFirebase(articles: any[], onProgress?: (current: number, total: number) => void): Promise<number> {
  if (!Array.isArray(articles) || articles.length === 0) return 0;

  const total = articles.length;
  const CHUNK_SIZE = 400; // Well below 500 limit for Firestore batches
  let count = 0;

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = articles.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      if (!item) continue;
      const payload = formatArticleForFirestore(item);
      const docRef = doc(db, 'articles', payload.id);
      batch.set(docRef, payload, { merge: true });
      count++;
    }

    await batch.commit();
    if (onProgress) {
      onProgress(Math.min(i + chunk.length, total), total);
    }
  }

  return count;
}

/**
 * Delete an article from Firebase Firestore
 */
export async function deleteArticleFromFirebase(articleId: string, slug?: string): Promise<void> {
  if (!articleId) return;
  try {
    const docRef = doc(db, 'articles', String(articleId));
    await deleteDoc(docRef);

    if (slug && slug !== articleId) {
      const slugRef = doc(db, 'articles', String(slug));
      await deleteDoc(slugRef).catch(() => {});
    }
  } catch (err) {
    console.warn('Firebase delete error:', err);
  }
}

/**
 * Test Firebase Firestore connection
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; count: number; projectId: string }> {
  try {
    const list = await fetchArticlesFromFirebase();
    return {
      success: true,
      count: list.length,
      projectId: firebaseConfig.projectId
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to connect to Firebase Firestore');
  }
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  is_approved: boolean;
}

export async function fetchCommentsFromFirebase(articleId?: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'comments');
    let q;
    if (articleId) {
      q = query(commentsRef, where('article_id', '==', String(articleId)), limit(500));
    } else {
      q = query(commentsRef, limit(1000));
    }
    const snapshot = await getDocs(q);
    const list: Comment[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Record<string, any>;
      list.push({ ...data, id: docSnap.id } as Comment);
    });
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.warn('Firebase comments fetch error:', err);
    return [];
  }
}

export async function saveCommentToFirebase(comment: Comment): Promise<Comment> {
  const docRef = doc(db, 'comments', String(comment.id));
  await setDoc(docRef, comment, { merge: true });
  return comment;
}

export async function deleteCommentFromFirebase(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, 'comments', String(commentId));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firebase comments delete error:', err);
  }
}
