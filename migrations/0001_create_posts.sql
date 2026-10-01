CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quake_id TEXT NOT NULL,
  quake_title TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '匿名',
  mood TEXT NOT NULL DEFAULT 'ひとこと',
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_quake_created ON posts (quake_id, created_at DESC);
