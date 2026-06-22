import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6c63ff', '#4ade80', '#f472b6', '#fbbf24', '#38bdf8', '#fb923c', '#a78bfa', '#34d399'];

export default function ChartView({ columns, rows }) {
  const { numericCols, labelCol, chartData } = useMemo(() => deriveChart(columns, rows), [columns, rows]);
  const [chartType, setChartType] = useState('bar');

  if (!numericCols.length || !labelCol || rows.length < 2) return null;

  const isPie = chartType === 'pie' && numericCols.length === 1;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>Visualization</span>
        <div style={styles.tabs}>
          {['bar', 'line', 'pie'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(chartType === t ? styles.tabActive : {}) }} onClick={() => setChartType(t)}>
              {t === 'bar' ? '▦ Bar' : t === 'line' ? '↗ Line' : '◎ Pie'}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.chart}>
        <ResponsiveContainer width="100%" height={320}>
          {isPie ? (
            <PieChart>
              <Pie data={chartData} dataKey={numericCols[0]} nameKey={labelCol} cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatNum(v)} contentStyle={tooltipStyle} />
            </PieChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey={labelCol} tick={axisStyle} angle={-30} textAnchor="end" interval="preserveStartEnd" />
              <YAxis tick={axisStyle} tickFormatter={formatNum} />
              <Tooltip formatter={v => formatNum(v)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#8892b0', fontSize: 12 }} />
              {numericCols.map((col, i) => (
                <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey={labelCol} tick={axisStyle} angle={-30} textAnchor="end" interval="preserveStartEnd" />
              <YAxis tick={axisStyle} tickFormatter={formatNum} />
              <Tooltip formatter={v => formatNum(v)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#8892b0', fontSize: 12 }} />
              {numericCols.map((col, i) => (
                <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function deriveChart(columns, rows) {
  const numericCols = columns.filter(col => {
    const vals = rows.slice(0, 10).map(r => r[col]);
    return vals.every(v => v !== null && !isNaN(Number(v)));
  });
  const labelCols = columns.filter(col => !numericCols.includes(col));
  const labelCol = labelCols[0] || null;
  const limit = 30;
  const chartData = rows.slice(0, limit).map(row => {
    const obj = { [labelCol]: labelCol ? String(row[labelCol]).slice(0, 20) : '' };
    for (const col of numericCols) obj[col] = Number(row[col]);
    return obj;
  });
  return { numericCols: numericCols.slice(0, 4), labelCol, chartData };
}

function formatNum(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return typeof v === 'number' ? v.toLocaleString() : v;
}

const axisStyle = { fill: '#8892b0', fontSize: 11 };
const tooltipStyle = { background: '#21253a', border: '1px solid #2d3148', borderRadius: 8, color: '#e2e8f0', fontSize: 12 };

const styles = {
  card: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #2d3148', background: '#21253a' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tabs: { display: 'flex', gap: '0.25rem' },
  tab: { background: 'transparent', border: '1px solid #2d3148', color: '#8892b0', borderRadius: 6, padding: '0.25rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem' },
  tabActive: { background: '#6c63ff', border: '1px solid #6c63ff', color: '#fff' },
  chart: { padding: '1rem 0.5rem 0.5rem' },
};
