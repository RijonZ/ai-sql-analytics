import React, { useEffect, useState } from 'react';
import { fetchSchema } from '../services/api';

export default function SchemaPanel({ activeDataset }) {
  const [schema, setSchema] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!activeDataset) {
      fetchSchema().then(setSchema).catch(() => {});
    }
  }, [activeDataset]);

  const tables = activeDataset
    ? [{
        name: activeDataset.fileName,
        rowCount: activeDataset.rowCount,
        columns: activeDataset.columns.map(c => ({
          column_name: c.column_name,
          data_type: c.data_type,
          is_nullable: 'YES',
        })),
      }]
    : schema?.tables || [];

  if (!tables.length) return null;

  return (
    <div style={styles.container}>
      <button style={styles.toggle} onClick={() => setOpen(o => !o)}>
        <span style={styles.dbIcon}>⬡</span>
        {activeDataset ? 'Uploaded Dataset Schema' : 'Database Schema'}
        <span style={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={styles.panel}>
          {tables.map(t => (
            <div key={t.name} style={styles.table}>
              <div style={styles.tableName}>
                <span>▤</span> {t.name}
                <span style={styles.rowCount}>{t.rowCount.toLocaleString()} rows</span>
              </div>
              <div style={styles.cols}>
                {t.columns.map(c => (
                  <div key={c.column_name} style={styles.col}>
                    <span style={styles.colName}>{c.column_name}</span>
                    <span style={styles.colType}>{c.data_type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { marginBottom: '0.5rem' },
  toggle: { width: '100%', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 10, padding: '0.65rem 1rem', color: '#8892b0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'inherit' },
  dbIcon: { color: '#6c63ff' },
  arrow: { marginLeft: 'auto' },
  panel: { background: '#1a1d27', border: '1px solid #2d3148', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  table: { background: '#21253a', border: '1px solid #2d3148', borderRadius: 8, padding: '0.65rem', minWidth: 180, flex: '1 1 180px' },
  tableName: { fontWeight: 600, fontSize: '0.85rem', color: '#6c63ff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' },
  rowCount: { marginLeft: 'auto', fontSize: '0.7rem', color: '#4ade80', fontWeight: 400 },
  cols: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  col: { display: 'flex', justifyContent: 'space-between', gap: '0.5rem' },
  colName: { color: '#e2e8f0', fontSize: '0.78rem' },
  colType: { color: '#8892b0', fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace" },
};
