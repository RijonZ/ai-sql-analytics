import React, { useState } from 'react';
import QueryInput from './components/QueryInput';
import SQLPreview from './components/SQLPreview';
import ChartView from './components/ChartView';
import ResultTable from './components/ResultTable';
import SchemaPanel from './components/SchemaPanel';
import { runQuery } from './services/api';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  async function handleQuery(question) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runQuery(question);
      setResult({ question, ...data });
      setHistory(h => [{ question, rowCount: data.rowCount }, ...h].slice(0, 8));
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend. Make sure the server is running on port 3001.');
      } else {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .chip-btn:hover { background: #2d3148 !important; color: #e2e8f0 !important; }
        .history-btn:hover { border-color: #6c63ff !important; }
        @media (max-width: 640px) {
          .main-content { padding: 0 1rem 2rem !important; }
          .query-container { padding: 1.25rem 1rem !important; }
        }
      `}</style>

      <QueryInput onQuery={handleQuery} loading={loading} />
      <SchemaPanel />

      <div style={styles.main} className="main-content">
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinner} />
            <div>
              <div style={styles.loadingTitle}>Analyzing your question...</div>
              <div style={styles.loadingSubtitle}>Generating SQL and querying database</div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox} className="fade-in">
            <span style={styles.errorIcon}>⚠</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Error</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</div>
            </div>
            <button style={styles.dismissBtn} onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {result && !loading && (
          <div className="fade-in">
            <div style={styles.resultHeader}>
              <span style={styles.resultQuestion}>"{result.question}"</span>
              <button style={styles.clearBtn} onClick={handleClear}>✕ Clear</button>
            </div>
            <SQLPreview sql={result.sql} executionMs={result.executionMs} rowCount={result.rowCount} insight={result.insight} />
            {result.rows.length > 0 ? (
              <>
                <ChartView columns={result.columns} rows={result.rows} />
                <ResultTable columns={result.columns} rows={result.rows} />
              </>
            ) : (
              <div style={styles.noData}>No results found for this query.</div>
            )}
          </div>
        )}

        {!loading && !result && !error && history.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◈</div>
            <div style={styles.emptyTitle}>Ask anything about your sales data</div>
            <div style={styles.emptySubtitle}>Powered by GPT-4o · PostgreSQL · 3,000+ orders across 2 years</div>
          </div>
        )}

        {history.length > 0 && !result && !loading && !error && (
          <div style={styles.historySection}>
            <div style={styles.historyTitle}>Recent queries</div>
            {history.map((h, i) => (
              <button key={i} style={styles.historyItem} className="history-btn" onClick={() => handleQuery(h.question)}>
                <span style={styles.historyQ}>{h.question}</span>
                <span style={styles.historyRows}>{h.rowCount} rows</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#0f1117' },
  main: { maxWidth: 900, margin: '0 auto', padding: '0 2rem 3rem' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' },
  loadingSpinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #2d3148', borderTop: '3px solid #6c63ff', animation: 'spin 0.8s linear infinite', flexShrink: 0 },
  loadingTitle: { fontWeight: 600, marginBottom: 4 },
  loadingSubtitle: { color: '#8892b0', fontSize: '0.85rem' },
  errorBox: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '1rem 1.25rem', color: '#f87171', marginBottom: '1rem' },
  errorIcon: { fontSize: '1.2rem', flexShrink: 0 },
  dismissBtn: { background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem', flexShrink: 0, opacity: 0.7 },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' },
  resultQuestion: { color: '#8892b0', fontSize: '0.9rem', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  clearBtn: { background: 'transparent', border: '1px solid #2d3148', borderRadius: 6, color: '#8892b0', cursor: 'pointer', fontSize: '0.78rem', padding: '0.3rem 0.7rem', flexShrink: 0, fontFamily: 'inherit' },
  noData: { textAlign: 'center', color: '#8892b0', padding: '2rem', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12 },
  emptyState: { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '3.5rem', color: '#6c63ff', marginBottom: '1rem', opacity: 0.5 },
  emptyTitle: { fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem', color: '#8892b0' },
  emptySubtitle: { color: '#4a5568', fontSize: '0.9rem' },
  historySection: { padding: '1rem 0' },
  historyTitle: { color: '#8892b0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' },
  historyItem: { width: '100%', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, padding: '0.65rem 1rem', color: '#e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.88rem', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color 0.15s' },
  historyQ: { flex: 1 },
  historyRows: { color: '#6c63ff', fontSize: '0.78rem', flexShrink: 0, marginLeft: '1rem' },
};
