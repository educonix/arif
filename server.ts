import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const databaseUrl = process.env.DATABASE_URL;
  const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

  const runQuery = async <T>(queryText: string, params: unknown[] = []) => {
    if (!pool) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const result = await pool.query<T>(queryText, params);
    return result.rows;
  };

  const normalizeSettingsRow = (row: Record<string, unknown> | undefined) => {
    if (!row) return {};
    if (row.settings && typeof row.settings === "object") return row.settings;
    if (row.content && typeof row.content === "object") return row.content;
    return row;
  };

  if (pool) {
    try {
      await pool.query("select 1");
      console.log("Connected to Neon PostgreSQL.");
    } catch (error) {
      console.error("Failed to connect to Neon PostgreSQL:", error);
    }
  } else {
    console.warn("DATABASE_URL is not set. Neon-backed API routes will return empty data.");
  }

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

  app.get("/api/site-settings", async (req, res) => {
    try {
      const rows = await runQuery<Record<string, unknown>>(
        "select * from site_settings order by id asc limit 1",
      );
      res.json(normalizeSettingsRow(rows[0]));
    } catch (error) {
      console.error("Error fetching site settings from Neon:", error);
      res.json({});
    }
  });

  app.get("/api/education", async (req, res) => {
    try {
      const rows = await runQuery<Record<string, unknown>>(
        "select * from education_table order by sort_order asc nulls last, year desc nulls last",
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching education rows from Neon:", error);
      res.json([]);
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const rows = await runQuery<Record<string, unknown>>(
        "select * from projects_table where coalesce(is_visible, true) = true order by sort_order asc nulls last, created_at desc nulls last",
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching project rows from Neon:", error);
      res.json([]);
    }
  });

  app.get("/api/gallery", async (req, res) => {
    try {
      const rows = await runQuery<Record<string, unknown>>(
        "select * from gallery_table where coalesce(is_visible, true) = true order by photo_date desc nulls last, sort_order asc nulls last",
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching gallery rows from Neon:", error);
      res.json([]);
    }
  });

  app.get("/api/research-papers", async (req, res) => {
    try {
      const rows = await runQuery<Record<string, unknown>>(
        "select * from research_papers where coalesce(status, 'draft') = 'published' order by coalesce(published_at, publish_date::timestamptz) desc nulls last, created_at desc nulls last",
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching research papers from Neon:", error);
      res.json([]);
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
