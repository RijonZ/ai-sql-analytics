import React, { useState } from 'react';

export default function ResultTable({ columns, rows }) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const visible = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                {columns.map(col => (
                  <td key={col} style={styles.td}>
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹ Prev</button>
          <span style={styles.pageInfo}>Page {page + 1} of {totalPages} ({rows.length.toLocaleString()} rows)</span>
          <button style={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next ›</button>
        </div>
      )}
    </div>
  );
}

function formatCell(val) {
  if (val === null || val === undefined) return <span style={{ color: '#4a5568' }}>null</span>;
  if (typeof val === 'number') return val.toLocaleString();
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

const styles = {
  wrapper: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { padding: '0.65rem 1rem', background: '#21253a', color: '#8892b0', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', borderBottom: '1px solid #2d3148' },
  td: { padding: '0.6rem 1rem', color: '#e2e8f0', borderBottom: '1px solid #1f2236', whiteSpace: 'nowrap' },
  trEven: { background: 'transparent' },
  trOdd: { background: 'rgba(45,49,72,0.3)' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderTop: '1px solid #2d3148' },
  pageBtn: { background: '#21253a', border: '1px solid #2d3148', color: '#e2e8f0', borderRadius: 6, padding: '0.35rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' },
  pageInfo: { color: '#8892b0', fontSize: '0.85rem' },
};
