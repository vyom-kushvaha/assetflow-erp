/**
 * Database connection singleton.
 *
 * Responsibility (per architecture doc, section 14): own the single
 * SQLite connection, apply required PRAGMAs, and hand that same
 * connection to every model. Models/services should always obtain the
 * connection via getDb() rather than opening their own.
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Single physical db file for the whole app, at backend/assetflow.db
// Override with DB_PATH env var (e.g. for tests, point at ':memory:').
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'assetflow.db');

let dbInstance = null;

/**
 * Returns the shared sqlite3.Database instance, opening it (and applying
 * required PRAGMAs) on first use.
 */
function getDb() {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Failed to open database at', DB_PATH, err);
                throw err;
            }
        });

        // Foreign keys are OFF by default per SQLite connection — must be
        // enabled explicitly, every time a connection is opened.
        dbInstance.run('PRAGMA foreign_keys = ON;');
        // WAL mode allows concurrent readers while a write is in progress —
        // useful since Express may serve several requests in parallel.
        dbInstance.run('PRAGMA journal_mode = WAL;');
    }
    return dbInstance;
}

function closeDb() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}

module.exports = { getDb, closeDb, DB_PATH };
