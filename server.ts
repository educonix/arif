import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to proxy Blogger feed (Avoids CORS issues)
  app.get("/api/blog", async (req, res) => {
    try {
      console.log('Fetching blog posts from Blogger...');
      const response = await fetch('https://arifeq.blogspot.com/feeds/posts/default?alt=json&max-results=50');
      if (!response.ok) {
        throw new Error(`Blogger API returned ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error proxying blog feed:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  app.get("/api/research", async (req, res) => {
    try {
      console.log('Fetching research posts from Blogger...');
      const response = await fetch('https://arifeq.blogspot.com/feeds/posts/default/-/Research?alt=json&max-results=50');
      if (!response.ok) {
        throw new Error(`Blogger API returned ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error proxying research feed:', error);
      res.status(500).json({ error: 'Failed to fetch research posts' });
    }
  });

  // Vite middleware for development
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
