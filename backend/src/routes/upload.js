const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../services/database');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function detectType(values) {
  const nonEmpty = values.filter(v => v !== '' && v !== null && v !== undefined);
  if (!nonEmpty.length) return 'TEXT';
  if (nonEmpty.every(v => !isNaN(Number(v)) && v.trim() !== '')) return 'NUMERIC';
  if (nonEmpty.every(v => /^\d{4}-\d{2}-\d{2}/.test(v.trim()))) return 'DATE';
  return 'TEXT';
}

function sanitizeCol(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/^(\d)/, 'col_$1') || 'col';
}

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const ext = req.file.originalname.split('.').pop().toLowerCase();
  if (ext !== 'csv') return res.status(400).json({ error: 'Only CSV files are supported.' });

  try {
    const content = req.file.buffer.toString('utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    if (!rows.length) return res.status(400).json({ error: 'CSV file is empty.' });
    if (rows.length > 50000) return res.status(400).json({ error: 'CSV must have fewer than 50,000 rows.' });

    const originalCols = Object.keys(rows[0]);
    if (originalCols.length > 50) return res.status(400).json({ error: 'CSV must have fewer than 50 columns.' });

    const colTypes = originalCols.map(orig => ({
      original: orig,
      name: sanitizeCol(orig),
      type: detectType(rows.map(r => r[orig])),
    }));

    const tableId = uuidv4().replace(/-/g, '').slice(0, 16);
    const tableName = `upload_${tableId}`;

    const client = await pool.connect();
    try {
      const colDefs = colTypes.map(c => `"${c.name}" ${c.type}`).join(', ');
      await client.query(`CREATE TABLE "${tableName}" (${colDefs})`);

      const BATCH = 200;
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const valuePlaceholders = batch.map((_, idx) => {
          const base = idx * colTypes.length;
          return `(${colTypes.map((_, ci) => `$${base + ci + 1}`).join(', ')})`;
        }).join(', ');
        const params = batch.flatMap(row =>
          colTypes.map(c => {
            const v = row[c.original];
            return v === '' ? null : v;
          })
        );
        await client.query(
          `INSERT INTO "${tableName}" (${colTypes.map(c => `"${c.name}"`).join(', ')}) VALUES ${valuePlaceholders}`,
          params
        );
      }

      res.json({
        tableId,
        tableName,
        rowCount: rows.length,
        fileName: req.file.originalname,
        columns: colTypes.map(c => ({ column_name: c.name, data_type: c.type, original: c.original })),
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

router.delete('/:tableId', async (req, res) => {
  const { tableId } = req.params;
  if (!/^[a-f0-9]{16}$/.test(tableId)) {
    return res.status(400).json({ error: 'Invalid table ID.' });
  }
  const tableName = `upload_${tableId}`;
  const client = await pool.connect();
  try {
    await client.query(`DROP TABLE IF EXISTS "${tableName}"`);
    res.json({ success: true });
  } finally {
    client.release();
  }
});

module.exports = router;
