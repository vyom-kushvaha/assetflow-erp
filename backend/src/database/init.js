/**
 * Database initialization script.
 *
 * Creates all tables from schema.sql, and optionally loads seed.sql for
 * demo data. Safe to re-run: every statement in schema.sql uses
 * `IF NOT EXISTS`, so re-running without --seed just confirms the schema
 * is present.
 *
 * Usage:
 *   node src/database/init.js            -> create schema only
 *   node src/database/init.js --seed     -> create schema + load demo data
 *   node src/database/init.js --reset    -> delete the db file, then create
 *                                            (+ seed if --seed also passed)
 *
 * package.json scripts (suggested, not created here):
 *   "db:init": "node src/database/init.js",
 *   "db:seed": "node src/database/init.js --seed",
 *   "db:reset": "node src/database/init.js --reset --seed"
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/database');

const SCHEMA_PATH = path.join(__dirname, 'schema', 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed', 'seed.sql');

const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');
const shouldReset = args.includes('--reset');

function runSqlFile(db, filePath, label) {
    return new Promise((resolve, reject) => {
        const sql = fs.readFileSync(filePath, 'utf8');
        db.exec(sql, (err) => {
            if (err) {
                return reject(new Error(`${label} failed: ${err.message}`));
            }
            console.log(`${label} completed successfully.`);
            resolve();
        });
    });
}

async function ensureInitialized() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, async (err) => {
            if (err) return reject(err);

            try {
                await new Promise((res, rej) => {
                    db.run('PRAGMA foreign_keys = ON;', (e) => (e ? rej(e) : res()));
                });

                // Check if 'users' table exists
                const tableExists = await new Promise((res, rej) => {
                    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", [], (e, row) => {
                        if (e) return rej(e);
                        res(!!row);
                    });
                });

                if (!tableExists) {
                    console.log(`Table 'users' not found. Initializing database schema at ${DB_PATH}...`);
                    await runSqlFile(db, SCHEMA_PATH, 'Schema creation');
                    console.log(`Database schema created. Seeding default demo data...`);
                    await runSqlFile(db, SEED_PATH, 'Seed data load');
                    console.log(`Database successfully initialized and seeded.`);
                } else {
                    console.log(`Database already initialized ('users' table exists). Skipping initialization.`);
                }

                db.close((e) => (e ? reject(e) : resolve()));
            } catch (error) {
                db.close();
                reject(error);
            }
        });
    });
}

async function main() {
    if (shouldReset && fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log(`Removed existing database at ${DB_PATH}`);
    }

    const db = new sqlite3.Database(DB_PATH);

    try {
        await new Promise((resolve, reject) => {
            db.run('PRAGMA foreign_keys = ON;', (err) => (err ? reject(err) : resolve()));
        });

        await runSqlFile(db, SCHEMA_PATH, 'Schema creation');

        if (shouldSeed) {
            await runSqlFile(db, SEED_PATH, 'Seed data load');
        }

        console.log(`Database ready at ${DB_PATH}`);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
    } finally {
        db.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = { ensureInitialized };
