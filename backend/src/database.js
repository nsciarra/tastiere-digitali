import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Abilita foreign keys
db.pragma('foreign_keys = ON');

// Inizializza le tabelle
const initDB = () => {
  // Tabella Clienti
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      website TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella Social Network per cliente
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_socials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      username TEXT,
      url TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      UNIQUE(client_id, platform)
    )
  `);

  // Tabella Campagne
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      social_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'planning',
      budget REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (social_id) REFERENCES client_socials(id) ON DELETE CASCADE
    )
  `);

  // Tabella Attività
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      assigned_to TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
};

initDB();

export default db;
