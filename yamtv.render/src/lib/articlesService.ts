import { 
  fetchArticlesFromFirebase, 
  saveArticleToFirebase as fbSave, 
  batchSaveArticlesToFirebase as fbBatchSave, 
  deleteArticleFromFirebase as fbDelete 
} from './firebase';
let memoryCache: Article[] | null = null;
const PRIMARY_CACHE_KEY = 'yamtv_articles_cache_v8';

// Clear legacy stale caches from localStorage on module initialization
if (typeof window !== 'undefined') {
  try {
    ['yamtv_articles_cache_v7', 'yamtv_articles_overrides_v3', 'yamtv_articles_deletions_v3', 'yamtv_articles_overrides', 'yamtv_articles_deletions'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {}
}

export function checkQuotaExceeded(err: any): boolean {
  return false;
}

export function isQuotaExceeded(): boolean {
  return false;
}

export function getLocalDeletions(): string[] {
  return [];
}

export function getLocalOverrides(): Record<string, Article> {
  return {};
}

export function setLocalOverride(article: Article) {
  const mapped = mapArticleData(article);
  if (memoryCache) {
    const idx = memoryCache.findIndex(a => a.id === mapped.id || (a.slug && a.slug === mapped.slug));
    if (idx >= 0) memoryCache[idx] = mapped;
    else memoryCache.unshift(mapped);
  }
  try {
    window.dispatchEvent(new CustomEvent('yamtv_articles_changed'));
  } catch (e) {}
}

export function setLocalDeletion(id: string, slug?: string) {
  if (memoryCache) {
    memoryCache = memoryCache.filter(a => String(a.id) !== String(id) && String(a.slug) !== String(id) && (slug ? String(a.slug) !== String(slug) && String(a.id) !== String(slug) : true));
  }
  try {
    window.dispatchEvent(new CustomEvent('yamtv_articles_changed'));
  } catch (e) {}
}

export function getCachedArticlesFromStorage(): Article[] | null {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }
  try {
    const raw = sessionStorage.getItem(PRIMARY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed.map(mapArticleData);
        return memoryCache;
      }
    }
  } catch (e) {}
  return null;
}

export function setArticlesCache(articles: Article[]) {
  memoryCache = articles;
  try {
    sessionStorage.setItem(PRIMARY_CACHE_KEY, JSON.stringify(articles));
  } catch (e) {}
}

export function clearArticlesCache() {
  memoryCache = null;
  try {
    sessionStorage.removeItem(PRIMARY_CACHE_KEY);
  } catch (e) {}
}

/**
 * Fetch published articles from server (Single Source of Truth across ALL devices)
 */
export async function fetchPublishedArticles(): Promise<Article[]> {
  let appwriteArticles: Article[] | null = null;
  try {
    appwriteArticles = await fetchAppwriteArticles();
  } catch (e) {
    console.warn('Appwrite articles fetch notice:', e);
  }

  let articles: Article[] = [];

  if (Array.isArray(appwriteArticles)) {
    articles = appwriteArticles.map(mapArticleData);
  } else if (memoryCache && memoryCache.length > 0) {
    articles = memoryCache;
  } else {
    articles = initialArticles.map(mapArticleData);
  }

  // Filter out unpublished articles
  articles = articles.filter(a => a.is_published !== false);

  // Sort newest first
  articles.sort((a, b) => {
    const timeA = new Date((a as any).created_at || a.published_at || 0).getTime();
    const timeB = new Date((b as any).created_at || b.published_at || 0).getTime();
    return timeB - timeA;
  });

  memoryCache = articles;
  setArticlesCache(articles);
  return articles;
}

/**
 * Fetch all articles (including drafts) for admin operations
 */
export async function fetchAllArticles(): Promise<Article[]> {
  let appwriteArticles: Article[] | null = null;
  try {
    appwriteArticles = await fetchAppwriteArticles();
  } catch (e) {
    console.warn('Appwrite articles fetch notice:', e);
  }

  let articles: Article[] = [];

  if (Array.isArray(appwriteArticles)) {
    articles = appwriteArticles.map(mapArticleData);
  } else {
    articles = initialArticles.map(mapArticleData);
  }

  articles.sort((a, b) => {
    const timeA = new Date((a as any).created_at || a.published_at || 0).getTime();
    const timeB = new Date((b as any).created_at || b.published_at || 0).getTime();
    return timeB - timeA;
  });

  return articles;
}

export async function fetchArticleById(idOrSlug: string): Promise<Article | null> {
  if (!idOrSlug) return null;

  if (memoryCache) {
    const found = memoryCache.find(a => String(a.id) === String(idOrSlug) || String(a.slug) === String(idOrSlug));
    if (found) return mapArticleData(found);
  }

  const articles = await fetchPublishedArticles();
  const found = articles.find(a => String(a.id) === String(idOrSlug) || String(a.slug) === String(idOrSlug));
  return found ? mapArticleData(found) : null;
}

export async function saveArticle(articleData: any): Promise<Article> {
  const articleId = String(articleData.id || `article_${Date.now()}`);
  const now = new Date().toISOString();

  const isPub =
    articleData.is_published !== undefined
      ? !!articleData.is_published
      : articleData.published !== undefined
      ? !!articleData.published
      : true;

  const docData = {
    ...articleData,
    id: articleId,
    slug: articleData.slug || articleId,
    updated_at: now,
    created_at: articleData.created_at || articleData.published_at || now,
    published: isPub,
    is_published: isPub,
  };

  const mapped = mapArticleData(docData);

  // Update local memory cache immediately
  if (!memoryCache) memoryCache = [];
  const idx = memoryCache.findIndex(a => String(a.id) === String(mapped.id) || (mapped.slug && String(a.slug) === String(mapped.slug)));
  if (idx >= 0) {
    memoryCache[idx] = mapped;
  } else {
    memoryCache.unshift(mapped);
  }
  setArticlesCache(memoryCache);

  // Sync to server disk/database synchronously
  try {
    await saveAppwriteArticle(mapped);
  } catch (e) {
    console.warn('Server article save notice:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('yamtv_articles_changed'));
  } catch (e) {}

  return mapped;
}

export async function saveArticlesBatch(articlesList: any[]): Promise<Article[]> {
  const mappedList = articlesList.map(a => mapArticleData(a));

  if (!memoryCache) memoryCache = [];
  const map = new Map<string, Article>();
  memoryCache.forEach(a => map.set(String(a.id), a));
  mappedList.forEach(a => map.set(String(a.id), a));

  memoryCache = Array.from(map.values());
  setArticlesCache(memoryCache);

  try {
    await saveAppwriteArticlesBatch(mappedList);
  } catch (e) {
    console.warn('Server batch save notice:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('yamtv_articles_changed'));
  } catch (e) {}

  return mappedList;
}

export async function deleteArticle(articleId: string, slug?: string): Promise<void> {
  if (!articleId) return;

  if (memoryCache) {
    memoryCache = memoryCache.filter(
      a => String(a.id) !== String(articleId) && String(a.slug) !== String(articleId) && (slug ? String(a.slug) !== String(slug) && String(a.id) !== String(slug) : true)
    );
    setArticlesCache(memoryCache);
  }

  try {
    await deleteAppwriteArticle(articleId, slug);
  } catch (e) {
    console.warn('Server article delete notice:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('yamtv_articles_changed'));
  } catch (e) {}
}

// Aliases for compatibility
export const saveArticleToFirebase = saveArticle;
export const deleteArticleFromFirebase = deleteArticle;
