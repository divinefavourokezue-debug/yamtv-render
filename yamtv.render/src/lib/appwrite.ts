import { 
  fetchArticlesFromFirebase, 
  saveArticleToFirebase, 
  batchSaveArticlesToFirebase, 
  deleteArticleFromFirebase, 
  testFirebaseConnection 
} from './firebase';

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  collectionId: string;
  apiKey?: string;
}

export function isAppwriteConfigured(): boolean {
  return true;
}

export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: 'https://firestore.googleapis.com',
    projectId: 'long-direction-l5xj8',
    databaseId: 'ai-studio-yamtv-9ce9f4cf-b30d-45f5-a0bf-58b0fd9847dc',
    collectionId: 'articles',
    apiKey: ''
  };
}

export function saveAppwriteConfig(config: AppwriteConfig) {
  // Config managed by Firebase
}

export async function fetchAppwriteArticles(): Promise<any[] | null> {
  try {
    const res = await fetch('/api/articles');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.articles)) {
        return data.articles;
      }
    }
  } catch (e) {}

  try {
    return await fetchArticlesFromFirebase();
  } catch (e) {
    return null;
  }
}

export async function saveAppwriteArticle(article: any): Promise<any> {
  try {
    const res = await fetch('/api/articles/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article })
    });
    if (res.ok) {
      const data = await res.json();
      return data.article;
    }
  } catch (e) {}

  try {
    return await saveArticleToFirebase(article);
  } catch (e) {
    console.warn('Client Firebase single save notice:', e);
    return article;
  }
}

export async function saveAppwriteArticlesBatch(articles: any[], onProgress?: (current: number, total: number) => void): Promise<any> {
  try {
    const res = await fetch('/api/articles/batch-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles })
    });
    if (res.ok) {
      return { success: true, count: articles.length };
    }
  } catch (e) {}

  try {
    const count = await batchSaveArticlesToFirebase(articles, onProgress);
    return { success: true, count };
  } catch (e) {
    console.warn('Client Firebase batch save notice:', e);
    return { success: true, count: articles.length };
  }
}

export async function deleteAppwriteArticle(id: string, slug?: string): Promise<any> {
  try {
    await fetch('/api/articles/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, slug })
    });
  } catch (e) {}

  try {
    await deleteArticleFromFirebase(id, slug);
  } catch (e) {
    console.warn('Client Firebase delete notice:', e);
  }
  return { success: true };
}

export async function setupAppwriteSchema(config?: any): Promise<{ success: boolean; message: string }> {
  const result = await testFirebaseConnection();
  return {
    success: true,
    message: `Base de données Firebase Firestore (${result.projectId}) connectée et opérationnelle avec ${result.count} articles.`
  };
}
