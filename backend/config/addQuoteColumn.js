import pool from "./db.js";

const addQuoteTextColumn = async () => {
  try {
    console.log("Adding quote_text column to reposts table...");

    await pool.query(`
      ALTER TABLE reposts 
      ADD COLUMN IF NOT EXISTS quote_text TEXT;
    `);

    console.log("✅ quote_text column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding column:", error);
    process.exit(1);
  }
};

addQuoteTextColumn();
