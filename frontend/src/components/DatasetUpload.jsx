import React, { useState, useRef } from 'react';
import { uploadDataset, deleteDataset } from '../services/api';

export default function DatasetUpload({ activeDataset, onDatasetChange }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await uploadDataset(file);
      onDatasetChange(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!activeDataset) return;
    try {
      await deleteDataset(activeDataset.tableId);
    } catch (_) {}
    onDatasetChange(null);
    setError(null);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  if (activeDataset) {
    return (
      <div style={styles.activeBox}>
        <div style={styles.activeLeft}>
          <span style={styles.fileIcon}>📄</span>
          <div>
            <div style={styles.activeTitle}>{activeDataset.fileName}</div>
            <div style={styles.activeMeta}>
              {activeDataset.rowCount.toLocaleString()} rows · {activeDataset.columns.length} columns ·
              <span style={styles.uploadedTag}> Custom dataset active</span>
            </div>
          </div>
        </div>
        <button style={styles.removeBtn} onClick={handleRemove}>
          ✕ Remove
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div
        style={{ ...styles.dropzone, ...(dragging ? styles.dropzoneDragging : {}) }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {loading ? (
          <div style={styles.loadingRow}>
            <div style={styles.spinner} />
            <span style={styles.dropText}>Uploading and processing...</span>
          </div>
        ) : (
          <>
            <span style={styles.uploadIcon}>↑</span>
            <span style={styles.dropText}>
              Drop your CSV here or <span style={styles.browseLink}>browse</span>
            </span>
            <span style={styles.dropHint}>Max 50,000 rows · 10MB</span>
          </>
        )}
      </div>
      {error && <div style={styles.error}>⚠ {error}</div>}
    </div>
  );
}

const styles = {
  wrapper: { marginBottom: '0.75rem' },
  dropzone: {
    border: '2px dashed #2d3148', borderRadius: 10, padding: '1rem 1.5rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
    background: '#1a1d27', transition: 'border-color 0.15s, background 0.15s',
  },
  dropzoneDragging: { borderColor: '#6c63ff', background: 'rgba(108,99,255,0.06)' },
  uploadIcon: { fontSize: '1.3rem', color: '#6c63ff', flexShrink: 0 },
  dropText: { color: '#8892b0', fontSize: '0.88rem' },
  browseLink: { color: '#6c63ff', fontWeight: 600 },
  dropHint: { color: '#4a5568', fontSize: '0.78rem', marginLeft: 'auto' },
  loadingRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  spinner: {
    width: 18, height: 18, borderRadius: '50%',
    border: '2px solid #2d3148', borderTop: '2px solid #6c63ff',
    animation: 'spin 0.8s linear infinite', flexShrink: 0,
  },
  error: { color: '#f87171', fontSize: '0.82rem', marginTop: '0.5rem', padding: '0 0.25rem' },
  activeBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.75rem',
  },
  activeLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  fileIcon: { fontSize: '1.3rem' },
  activeTitle: { fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' },
  activeMeta: { fontSize: '0.78rem', color: '#8892b0', marginTop: 2 },
  uploadedTag: { color: '#4ade80', fontWeight: 600 },
  removeBtn: {
    background: 'transparent', border: '1px solid #2d3148', borderRadius: 6,
    color: '#8892b0', cursor: 'pointer', fontSize: '0.78rem', padding: '0.3rem 0.75rem',
    fontFamily: 'inherit', flexShrink: 0,
  },
};
