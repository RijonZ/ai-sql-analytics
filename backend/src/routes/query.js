const express = require('express');
const router = express.Router();
const { generateSQL, generateInsight } = require('../services/openai');
const { queryWithFields, getTableSchemas } = require('../services/database');
const { pool } = require('../services/database');

const FORBIDDEN_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXECUTE)\b/i;
const MAX_QUESTION_LENGTH = 500;
const QUERY_TIMEOUT_MS = 10000;

async function getUploadedTableSchema(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows.map(r => ({
      table_name: tableName,
      column_name: r.column_name,
      data_type: r.data_type,
      is_nullable: r.is_nullable,
      constraint_type: null,
    }));
  } finally {
    client.release();
  }
}

router.post('/', async (req, res) => {
  const { question, tableId } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ error: `Question must be under ${MAX_QUESTION_LENGTH} characters.` });
  }

  try {
    let schemas;
    if (tableId) {
      if (!/^[a-f0-9]{16}$/.test(tableId)) {
        return res.status(400).json({ error: 'Invalid table ID.' });
      }
      schemas = await getUploadedTableSchema(`upload_${tableId}`);
    } else {
      schemas = await getTableSchemas();
    }

    if (schemas.length === 0) {
      return res.status(503).json({ error: 'No tables found. Run: npm run seed' });
    }

    const sql = await generateSQL(question.trim(), schemas);

    if (FORBIDDEN_KEYWORDS.test(sql)) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
    }

    const startTime = Date.now();
    const queryPromise = queryWithFields(sql);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timed out after 10 seconds')), QUERY_TIMEOUT_MS)
    );

    const { rows, columns } = await Promise.race([queryPromise, timeoutPromise]);
    const executionMs = Date.now() - startTime;

    let insight = null;
    if (rows.length > 0) {
      insight = await generateInsight(question, sql, rows);
    }

    res.json({ sql, rows, rowCount: rows.length, columns, executionMs, insight });
  } catch (err) {
    if (err.code && err.code.startsWith('42')) {
      return res.status(400).json({ error: `SQL error: ${err.message}` });
    }
    if (err.message.includes('timed out')) {
      return res.status(504).json({ error: 'Query timed out. Try a more specific question.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    console.error('Query error:', err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

module.exports = router;
