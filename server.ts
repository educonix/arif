import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { query } from './api/_lib/db';
import { clearAdminSession, getAdminSession, requireAdmin, setAdminSession, verifyAdminCredentials } from './api/_lib/auth';
import { deleteRows, insertRows, selectRows, updateRows, upsertRows } from './api/_lib/dbCrud';
import { readJsonBody } from './api/_lib/http';
import { deleteStorageFiles, getStorageFile, uploadStorageFile } from './api/_lib/storage';

const normalizeSettingsRow = (row: Record<string, unknown> | undefined) => {
  if (!row) return {};
  if (row.settings && typeof row.settings === 'object') return row.settings;
  if (row.content && typeof row.content === 'object') return row.content;
  return row;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  try {
    await query('select 1');
    console.log('Connected to Neon PostgreSQL.');
  } catch (error) {
    console.error('Failed to connect to Neon PostgreSQL:', error);
  }

  app.get('/api/blog', async (req, res) => {
    try {
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

  app.get('/api/research', async (req, res) => {
    try {
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

  app.get('/api/site-settings', async (req, res) => {
    try {
      const rows = await query<Record<string, unknown>>('select * from site_settings order by id asc limit 1');
      res.json(normalizeSettingsRow(rows[0]));
    } catch (error) {
      console.error('Error fetching site settings from Neon:', error);
      res.json({});
    }
  });

  app.get('/api/education', async (req, res) => {
    try {
      const rows = await query<Record<string, unknown>>(
        'select * from education_table order by sort_order asc nulls last, year desc nulls last',
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching education rows from Neon:', error);
      res.json([]);
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const rows = await query<Record<string, unknown>>(
        'select * from projects_table where coalesce(is_visible, true) = true order by sort_order asc nulls last, created_at desc nulls last',
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching project rows from Neon:', error);
      res.json([]);
    }
  });

  app.get('/api/gallery', async (req, res) => {
    try {
      const rows = await query<Record<string, unknown>>(
        'select * from gallery_table where coalesce(is_visible, true) = true order by photo_date desc nulls last, sort_order asc nulls last',
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching gallery rows from Neon:', error);
      res.json([]);
    }
  });

  app.get('/api/research-papers', async (req, res) => {
    try {
      const rows = await query<Record<string, unknown>>(
        "select * from research_papers where coalesce(status, 'draft') = 'published' order by coalesce(published_at, publish_date::timestamptz) desc nulls last, created_at desc nulls last",
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching research papers from Neon:', error);
      res.json([]);
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const body = await readJsonBody<{ email?: string; password?: string }>(req);
      const email = body.email || '';
      const password = body.password || '';
      const result = verifyAdminCredentials(email, password);

      if (!result.valid) {
        res.status(401).json({ error: result.reason });
        return;
      }

      setAdminSession(res, email);
      res.json({ user: { email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to process login request.' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    clearAdminSession(res);
    res.json({ success: true });
  });

  app.get('/api/auth/session', (req, res) => {
    const session = getAdminSession(req);

    if (!session) {
      res.json({ authenticated: false });
      return;
    }

    res.json({
      authenticated: true,
      user: { email: session.email },
    });
  });

  app.post('/api/db/select', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{
        table: string;
        columns?: string;
        filters?: { column: string; value: unknown }[];
        orders?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
        single?: boolean;
      }>(req);

      const data = await selectRows({
        table: body.table,
        columns: body.columns,
        filters: body.filters,
        orders: body.orders,
        single: body.single,
      });

      if (body.single && !data) {
        res.json({ data: null, error: { message: 'No rows found' } });
        return;
      }

      res.json({ data });
    } catch (error: any) {
      console.error('DB select error:', error);
      res.status(400).json({ error: error.message || 'Failed to query database.' });
    }
  });

  app.post('/api/db/insert', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{ table: string; values: Record<string, unknown>[] | Record<string, unknown> }>(req);
      const rows = Array.isArray(body.values) ? body.values : [body.values];
      const data = await insertRows({ table: body.table, values: rows });
      res.json({ data });
    } catch (error: any) {
      console.error('DB insert error:', error);
      res.status(400).json({ error: error.message || 'Failed to insert data.' });
    }
  });

  app.post('/api/db/update', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{
        table: string;
        values: Record<string, unknown>;
        filters: { column: string; value: unknown }[];
      }>(req);
      const data = await updateRows({ table: body.table, values: body.values, filters: body.filters || [] });
      res.json({ data });
    } catch (error: any) {
      console.error('DB update error:', error);
      res.status(400).json({ error: error.message || 'Failed to update data.' });
    }
  });

  app.post('/api/db/upsert', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{ table: string; values: Record<string, unknown>[] | Record<string, unknown> }>(req);
      const rows = Array.isArray(body.values) ? body.values : [body.values];
      const data = await upsertRows({ table: body.table, values: rows });
      res.json({ data });
    } catch (error: any) {
      console.error('DB upsert error:', error);
      res.status(400).json({ error: error.message || 'Failed to upsert data.' });
    }
  });

  app.post('/api/db/delete', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{ table: string; filters: { column: string; value: unknown }[] }>(req);
      const data = await deleteRows({ table: body.table, filters: body.filters || [] });
      res.json({ data });
    } catch (error: any) {
      console.error('DB delete error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete data.' });
    }
  });

  app.post('/api/storage/upload', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{ bucket: string; path: string; dataUrl: string }>(req);
      const data = await uploadStorageFile(body);
      res.json({ data });
    } catch (error: any) {
      console.error('Storage upload error:', error);
      res.status(400).json({ error: error.message || 'Failed to upload file.' });
    }
  });

  app.post('/api/storage/delete', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
      const body = await readJsonBody<{ bucket: string; paths: string[] }>(req);
      await deleteStorageFiles({ bucket: body.bucket, paths: body.paths || [] });
      res.json({ data: true });
    } catch (error: any) {
      console.error('Storage delete error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete file.' });
    }
  });

  app.get('/api/storage/:bucket/*', async (req, res) => {
    try {
      const bucket = req.params.bucket;
      const filePath = req.params[0] || '';
      const file = await getStorageFile({ bucket, path: decodeURIComponent(filePath) });

      if (!file) {
        res.status(404).send('Not found');
        return;
      }

      const content = Buffer.from(file.data_base64, 'base64');
      res.setHeader('Content-Type', file.content_type || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(content);
    } catch (error) {
      console.error('Storage fetch error:', error);
      res.status(404).send('Not found');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
