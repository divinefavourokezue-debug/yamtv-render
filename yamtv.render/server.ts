import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  limit 
} from "firebase/firestore";

const ARTICLES_STORE_FILE = path.join(process.cwd(), "articles-store.json");
const FIREBASE_CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");

function readFirebaseConfig() {
  try {
    if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
      const data = fs.readFileSync(FIREBASE_CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to read firebase config file:", e);
  }
  return {
    projectId: "long-direction-l5xj8",
    appId: "1:20429243015:web:b30e57703455643f1a2e22",
    apiKey: "AIzaSyBSDnRsdIWgGT4T9EOEU_gRCzyU4fhe4Y4",
    authDomain: "long-direction-l5xj8.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-yamtv-9ce9f4cf-b30d-45f5-a0bf-58b0fd9847dc",
    storageBucket: "long-direction-l5xj8.firebasestorage.app"
  };
}

function getFirestoreDb() {
  try {
    const cfg = readFirebaseConfig();
    const app = !getApps().length ? initializeApp(cfg) : getApp();
    const dbId = cfg.firestoreDatabaseId || 'ai-studio-yamtv-9ce9f4cf-b30d-45f5-a0bf-58b0fd9847dc';
    return getFirestore(app, dbId);
  } catch (e) {
    console.error("Failed to initialize server Firestore:", e);
    return null;
  }
}

function readArticlesStore(): any[] {
  try {
    if (fs.existsSync(ARTICLES_STORE_FILE)) {
      const data = fs.readFileSync(ARTICLES_STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to read articles store:", e);
  }
  return [];
}

function writeArticlesStore(articles: any[]) {
  try {
    fs.writeFileSync(ARTICLES_STORE_FILE, JSON.stringify(articles, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write articles store:", e);
  }
}

function formatArticleForFirestore(article: any) {
  const truncate = (val: any, maxLen: number) => {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    return s.length > maxLen ? s.substring(0, maxLen) : s;
  };

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
    title_en: truncate(article.title_en || article.title_fr || article.title, 950),
    slug: truncate(article.slug || artId, 250),
    category: truncate(article.category, 200) || 'Actualités',
    excerpt_fr: truncate(article.excerpt_fr || article.excerpt, 4800),
    excerpt_en: truncate(article.excerpt_en || article.excerpt_fr || article.excerpt, 4800),
    content_fr: truncate(article.content_fr || article.content, 95000),
    content_en: truncate(article.content_en || article.content_fr || article.content, 95000),
   featured_image_url: article.featured_image_url || article.image_url || article.image || '',
    published_at: truncate(article.published_at || article.created_at || new Date().toISOString(), 90),
    is_published: isPublished,
    is_featured: !!(article.is_featured || article.featured),
    updated_at: new Date().toISOString()
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route: Get Firebase Config
  app.get(["/api/firebase/config", "/api/appwrite/config"], (req, res) => {
    const cfg = readFirebaseConfig();
    res.json(cfg);
  });

  // API Route: Fetch articles
  const getArticlesHandler = async (req: express.Request, res: express.Response) => {
    const db = getFirestoreDb();

    if (db) {
      try {
        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(query(articlesRef, limit(1000)));
        
        const remoteArticles: any[] = [];
        snapshot.forEach(docSnap => {
          remoteArticles.push({ ...docSnap.data(), id: docSnap.id });
        });

        // Sync local file store with exact Firestore state
        writeArticlesStore(remoteArticles);
        return res.json({ articles: remoteArticles, source: 'firestore' });
      } catch (e: any) {
        console.warn("Server Firestore fetch notice, using disk fallback:", e?.message || e);
      }
    }

    const localStore = readArticlesStore();
    return res.json({ articles: localStore, source: 'disk' });
  };

  app.get("/api/articles", getArticlesHandler);
  app.get("/api/appwrite/articles", getArticlesHandler);

  // API Route: Save Single Article
  const saveArticleHandler = async (req: express.Request, res: express.Response) => {
    const { article } = req.body;
    if (!article || (!article.id && !article.article_id)) {
      return res.status(400).json({ error: "Missing article payload" });
    }

    const formatted = formatArticleForFirestore(article);

    // 1. Save to local disk store
    const store = readArticlesStore();
    const index = store.findIndex((a: any) => String(a.id) === String(formatted.id) || (formatted.slug && String(a.slug) === String(formatted.slug)));
    if (index >= 0) {
      store[index] = { ...store[index], ...formatted };
    } else {
      store.unshift(formatted);
    }
    writeArticlesStore(store);

    // 2. Sync to Firebase Firestore
    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, 'articles', formatted.id);
        await setDoc(docRef, formatted, { merge: true });
      } catch (e: any) {
        console.warn("Server Firestore save notice:", e?.message || e);
      }
    }

    return res.json({ success: true, article: formatted });
  };

  app.post("/api/articles/save", saveArticleHandler);
  app.post("/api/appwrite/articles/save", saveArticleHandler);

  // API Route: Batch Save Articles
  const batchSaveHandler = async (req: express.Request, res: express.Response) => {
    const { articles } = req.body;
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: "Missing or empty articles array" });
    }

    const formattedList = articles.map(a => formatArticleForFirestore(a));

    // 1. Save to local disk store
    const store = readArticlesStore();
    const map = new Map<string, any>();
    store.forEach((a: any) => map.set(String(a.id), a));
    formattedList.forEach((a: any) => map.set(String(a.id), a));

    const updatedStore = Array.from(map.values());
    writeArticlesStore(updatedStore);

    // 2. Chunked Batch sync to Firebase Firestore (400 per chunk)
    const db = getFirestoreDb();
    if (db) {
      const CHUNK_SIZE = 400;
      for (let i = 0; i < formattedList.length; i += CHUNK_SIZE) {
        const chunk = formattedList.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        for (const item of chunk) {
          const docRef = doc(db, 'articles', item.id);
          batch.set(docRef, item, { merge: true });
        }

        try {
          await batch.commit();
        } catch (e: any) {
          console.warn("Server Firestore batch write notice:", e?.message || e);
        }
      }
    }

    return res.json({ success: true, count: formattedList.length });
  };

  app.post("/api/articles/batch-save", batchSaveHandler);
  app.post("/api/appwrite/articles/batch-save", batchSaveHandler);

  // API Route: Delete Article
  const deleteArticleHandler = async (req: express.Request, res: express.Response) => {
    const { id, slug } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });

    let store = readArticlesStore();
    store = store.filter((a: any) => String(a.id) !== String(id) && String(a.slug) !== String(id) && (slug ? String(a.slug) !== String(slug) && String(a.id) !== String(slug) : true));
    writeArticlesStore(store);

    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, 'articles', String(id));
        await deleteDoc(docRef);
        if (slug && slug !== id) {
          const slugRef = doc(db, 'articles', String(slug));
          await deleteDoc(slugRef).catch(() => {});
        }
      } catch (e: any) {
        console.warn("Server Firestore delete notice:", e?.message || e);
      }
    }

    return res.json({ success: true });
  };

  app.post("/api/articles/delete", deleteArticleHandler);
  app.post("/api/appwrite/articles/delete", deleteArticleHandler);

  // API Route: Clear All Articles (Purge database and disk)
  const clearAllArticlesHandler = async (req: express.Request, res: express.Response) => {
    writeArticlesStore([]);
    const db = getFirestoreDb();
    if (db) {
      try {
        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(articlesRef);
        if (!snapshot.empty) {
          const CHUNK_SIZE = 400;
          const docs = snapshot.docs;
          for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
            const chunk = docs.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach(d => batch.delete(doc(db, 'articles', d.id)));
            await batch.commit();
          }
        }
      } catch (e: any) {
        console.warn("Server Firestore clear notice:", e?.message || e);
      }
    }
    return res.json({ success: true });
  };

  app.post("/api/articles/clear", clearAllArticlesHandler);
  app.post("/api/appwrite/articles/clear", clearAllArticlesHandler);

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
