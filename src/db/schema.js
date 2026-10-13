function applySchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      rank TEXT NOT NULL,
      department TEXT NOT NULL,
      annual_budget INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank_group TEXT NOT NULL,
      zone TEXT NOT NULL,
      daily_allowance INTEGER NOT NULL,
      lodging_cap INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      UNIQUE (rank_group, zone)
    );

    CREATE TABLE IF NOT EXISTS destinations (
      name TEXT PRIMARY KEY COLLATE NOCASE,
      province TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS travel_requests (
      id TEXT PRIMARY KEY,
      sppd_ref TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id),
      destination TEXT NOT NULL,
      depart_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      purpose TEXT NOT NULL,
      transport TEXT NOT NULL,
      status TEXT NOT NULL,
      estimated_cost INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_requests_user ON travel_requests(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON travel_requests(status);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(request_id);
  `)
}

module.exports = { applySchema }
