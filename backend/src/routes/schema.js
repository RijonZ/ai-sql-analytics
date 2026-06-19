const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');

router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const tableResult = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = await Promise.all(
      tableResult.rows.map(async ({ table_name }) => {
        const cols = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [table_name]);

        const count = await client.query(`SELECT COUNT(*) AS row_count FROM "${table_name}"`);

        return {
          name: table_name,
          rowCount: parseInt(count.rows[0].row_count),
          columns: cols.rows,
        };
      })
    );

    res.json({ tables });
  } catch (err) {
    console.error('Schema error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
