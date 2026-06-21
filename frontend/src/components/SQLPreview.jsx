import React, { useState } from 'react';

export default function SQLPreview({ sql, executionMs, rowCount, insight }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>Generated SQL</span>
        <div style={styles.meta}>
          {rowCount !== undefined && (
            <span style={styles.badge}>{rowCount.toLocaleString()} rows</span>
          )}
          {executionMs !== undefined && (
            <span style={styles.badge}>{executionMs}ms</span>
          )}
          <button style={styles.copyBtn} onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre style={styles.code}>{sql}</pre>
      {insight && (
        <div style={styles.insight}>
          <span style={styles.insightIcon}>◎</span>
          <span>{insight}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #2d3148', background: '#21253a' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  meta: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  badge: { background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: '#6c63ff' },
  copyBtn: { background: 'transparent', border: '1px solid #2d3148', borderRadius: 6, padding: '0.2rem 0.7rem', color: '#8892b0', cursor: 'pointer', fontSize: '0.75rem' },
  code: { padding: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#4ade80', overflowX: 'auto', lineHeight: 1.6 },
  insight: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.75rem 1rem', background: 'rgba(108,99,255,0.08)', borderTop: '1px solid #2d3148', fontSize: '0.9rem', color: '#c4b5fd' },
  insightIcon: { color: '#6c63ff', flexShrink: 0, marginTop: 2 },
};
