const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'zephyr.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    kind        TEXT NOT NULL,            -- 'cart' (cart / event booking) or 'hello' (general message)
    name        TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    event_date  TEXT,
    guests      TEXT,
    location    TEXT,
    message     TEXT,
    status      TEXT NOT NULL DEFAULT 'new',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const STATUSES = ['new', 'contacted', 'booked', 'done', 'archived'];

module.exports = {
  STATUSES,
  insert: db.prepare(`INSERT INTO requests (kind, name, email, phone, event_date, guests, location, message)
                      VALUES (@kind, @name, @email, @phone, @event_date, @guests, @location, @message)`),
  list: db.prepare(`SELECT * FROM requests ORDER BY datetime(created_at) DESC`),
  setStatus: db.prepare(`UPDATE requests SET status = ? WHERE id = ?`),
  remove: db.prepare(`DELETE FROM requests WHERE id = ?`),
};
