import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurum-ember';
const DB_NAME = process.env.MONGODB_DB_NAME || 'aurum-ember';
const DATA_DIR = join(__dirname, 'data');

function loadJson(name) {
  const p = join(DATA_DIR, `${name}.json`);
  if (!existsSync(p)) return [];
  const raw = readFileSync(p, 'utf-8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

async function migrate() {
  const collections = [
    'users', 'admins', 'meals', 'orders', 'order_notifications',
    'payments', 'chats', 'reservations', 'riders', 'admin_notifications',
  ];

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`\n  Migrating JSON data to MongoDB (${DB_NAME})...\n`);

  let totalDocs = 0;
  for (const name of collections) {
    const data = loadJson(name);
    const coll = db.collection(name);

    await coll.deleteMany({});

    if (data.length === 0) {
      console.log(`  ${name}: empty (skipped)`);
      continue;
    }

    await coll.insertMany(data);
    totalDocs += data.length;
    console.log(`  ${name}: ${data.length} documents migrated`);
  }

  console.log(`\n  Migration complete: ${totalDocs} total documents`);
  console.log(`  Database: ${DB_NAME} at ${MONGODB_URI}\n`);

  await client.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
