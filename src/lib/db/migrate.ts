import { readdir, readFile } from "fs/promises";
import path from "path";
import { query, queryOne } from "./index";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  const files = await readdir(MIGRATIONS_DIR);
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

  for (const file of sqlFiles) {
    const executed = await queryOne<{ name: string }>(
      "SELECT name FROM migrations WHERE name = $1",
      [file]
    );
    if (executed) {
      console.log(`Skipping already executed migration: ${file}`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`Running migration: ${file}`);
    await query(sql);
    await query("INSERT INTO migrations (name) VALUES ($1)", [file]);
    console.log(`Completed migration: ${file}`);
  }

  console.log("All migrations completed");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
