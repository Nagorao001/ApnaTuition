import { Pool } from 'pg';

let pool;

export function getDb() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('Database connection string is missing! (POSTGRES_URL or DATABASE_URL)');
    }
    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function initTables() {
  const db = getDb();

  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      student_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('admin', 'student')),
      password_hash TEXT NOT NULL,
      grade TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
      theme_preference TEXT DEFAULT 'system',
      photo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      folder TEXT,
      grade TEXT,
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER DEFAULT 0,
      assigned_to TEXT DEFAULT 'all',
      uploaded_by TEXT REFERENCES users(id),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'weekly' CHECK(type IN ('weekly', 'monthly')),
      date TEXT,
      duration INTEGER DEFAULT 60,
      questions_json TEXT,
      file_path TEXT,
      file_name TEXT,
      assigned_to TEXT DEFAULT 'all',
      start_time TEXT,
      end_time TEXT,
      created_by TEXT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      test_id TEXT NOT NULL REFERENCES tests(id),
      score REAL NOT NULL,
      max_score REAL DEFAULT 100,
      feedback TEXT,
      status TEXT DEFAULT 'graded' CHECK(status IN ('pending', 'graded')),
      graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
      description TEXT,
      url TEXT,
      type TEXT DEFAULT 'embed' CHECK(type IN ('embed', 'html5')),
      icon TEXT DEFAULT 'gamepad',
      enabled INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      game_id TEXT NOT NULL REFERENCES games(id),
      duration_seconds INTEGER DEFAULT 0,
      played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL REFERENCES users(id),
      receiver_id TEXT NOT NULL REFERENCES users(id),
      subject TEXT,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const q of queries) {
    try {
      await db.query(q);
    } catch (err) {
      console.error('Error creating table:', err);
      // Don't throw so other tables can try to create
    }
  }
}

export default getDb;
