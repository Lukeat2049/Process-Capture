import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'workflows.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    purpose       TEXT,
    trigger_event TEXT,
    tools_used    TEXT    DEFAULT '[]',
    steps         TEXT    DEFAULT '[]',
    decision_points TEXT  DEFAULT '[]',
    common_issues TEXT    DEFAULT '[]',
    estimated_time TEXT,
    conversation  TEXT    DEFAULT '[]',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
