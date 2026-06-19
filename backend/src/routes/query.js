const express = require('express');
const router = express.Router();
const { generateSQL, generateInsight } = require('../services/openai');
const { queryWithFields, getTableSchemas } = require('../services/database');

const FORBIDDEN_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXECUTE)\b/i;

router.post('/', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const schemas = await getTableSchemas();

    if (schemas.length === 0) {
      return res.status(503).json({ error: 'No tables found. Run: npm run seed' });
    }

    const sql = await generateSQL(question.trim(), schemas);

    if (FORBIDDEN_KEYWORDS.test(sql)) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
    }

    const startTime = Date.now();
    const { rows, columns } = await queryWithFields(sql);
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
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
