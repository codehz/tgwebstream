import sqlite3 from "better-sqlite3";

export const logDB = sqlite3("log.db");
logDB.pragma("journal_mode = WAL");
logDB.pragma("locking_mode = EXCLUSIVE");
logDB.exec(`
BEGIN;
CREATE TABLE IF NOT EXISTS requests(
  id     INTEGER PRIMARY KEY,
  time   DATATIME DEFAULT CURRENT_TIMESTAMP,
  type   TEXT,
  url    TEXT,
  result INT);
CREATE INDEX IF NOT EXISTS requests_type_idx ON requests(type);
CREATE INDEX IF NOT EXISTS requests_url_idx ON requests(url);
COMMIT;
`);

export const logRequest = logDB.prepare<[string, string, number]>(`
INSERT INTO requests(type, url, result) VALUES (?, ?, ?);
`);