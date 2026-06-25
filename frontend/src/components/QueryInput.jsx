import React, { useState } from 'react';

const DEFAULT_SUGGESTIONS = [
  'What were total sales last month?',
  'Show me top 5 products by revenue this year',
  'How many orders per region in 2025?',
  'What is the average order value by category?',
  'Show monthly sales trend for 2025',
  'Which customers spent the most?',
  'What is the refund rate by product category?',
  'Show daily sales for the last 30 days',
];

export default function QueryInput({ onQuery, loading, suggestions }) {
  const [value, setValue] = useState('');

  const activeSuggestions = suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim() && !loading) onQuery(value.trim());
  }

  function handleSuggestion(s) {
    setValue(s);
    if (!loading) onQuery(s);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <span style={styles.icon}>◈</span> AI SQL Analytics
      </h1>
      <p style={styles.subtitle}>Ask questions about your data in plain English</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>?</span>
          <input
            style={styles.input}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={suggestions?.length ? 'Ask a question about your dataset...' : 'e.g. What were total sales last month?'}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !value.trim()} style={styles.button}>
            {loading ? <span style={styles.spinner} /> : 'Analyze →'}
          </button>
        </div>
      </form>

      <div style={styles.suggestions}>
        {activeSuggestions.map(s => (
          <button key={s} style={styles.chip} className="chip-btn" onClick={() => handleSuggestion(s)} disabled={loading}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  icon: { color: '#6c63ff', fontSize: '1.8rem' },
  subtitle: { color: '#8892b0', marginBottom: '1.5rem' },
  form: { marginBottom: '1rem' },
  inputWrapper: { display: 'flex', gap: '0.5rem', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, padding: '0.25rem 0.5rem', alignItems: 'center' },
  inputIcon: { color: '#6c63ff', fontWeight: 700, fontSize: '1.2rem', padding: '0 0.5rem' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '1rem', padding: '0.75rem 0.5rem', fontFamily: 'inherit' },
  button: { background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 },
  spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  chip: { background: '#21253a', border: '1px solid #2d3148', borderRadius: 20, padding: '0.35rem 0.85rem', color: '#8892b0', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' },
};
