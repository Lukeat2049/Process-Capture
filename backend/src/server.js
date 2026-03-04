import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import workflowsRouter from './routes/workflows.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app      = express();
const PORT     = process.env.PORT || 3001;
const IS_PROD  = process.env.NODE_ENV === 'production';
const USE_MOCK  = process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY;

// In dev, allow the Vite dev server. In prod, same-origin so CORS not needed.
if (!IS_PROD) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/workflows', workflowsRouter);
app.use('/api/ai', aiRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', aiMode: USE_MOCK ? 'mock' : 'openai' });
});

// Serve built frontend in production
const distPath = join(__dirname, '../../frontend/dist');
if (IS_PROD && existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\nProcessCapture running on port ${PORT}`);
  console.log(`Mode: ${IS_PROD ? 'production' : 'development'} | AI: ${USE_MOCK ? 'mock' : 'openai'}\n`);
});
