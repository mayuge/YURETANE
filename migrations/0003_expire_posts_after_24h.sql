ALTER TABLE posts ADD COLUMN expires_at TEXT;
UPDATE posts
SET expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+24 hours')
WHERE expires_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_expiry ON posts (expires_at);
