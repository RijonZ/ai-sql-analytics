const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'analytics',
  user: process.env.DB_USER || 'analytics_user',
  password: process.env.DB_PASSWORD || 'analytics_pass',
});

async function queryWithFields(sql) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    const columns = result.fields.map(f => f.name);
    return { rows: result.rows, columns, rowCount: result.rowCount };
  } finally {
    client.release();
  }
}

async function getTableSchemas() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        tc.constraint_type
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name AND c.table_schema = kcu.table_schema
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function getTableList() {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
    return result.rows.map(r => r.table_name);
  } finally {
    client.release();
  }
}

module.exports = { pool, queryWithFields, getTableSchemas, getTableList };
