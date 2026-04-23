'use client';

/**
 * PeopleGraph — Forensic Anomaly Detection View
 * ================================================
 * Displays Isolation Forest flagged anomalies from attendance
 * and payroll cross-referencing.
 */

import { useState } from 'react';

const mockAnomalies = [
  { id: 1, employee: 'Ahmad bin Ismail', dept: 'Warehouse', type: 'OT Discrepancy', severity: 'high', details: 'Claimed 22h OT but WhatsApp logs show zero activity during claimed hours.', date: '2024-03-15', score: -0.87 },
  { id: 2, employee: 'Siti Aminah', dept: 'Sales', type: 'Attendance Pattern', severity: 'medium', details: 'Clock-in at 08:59 every day for 30 consecutive days — statistically improbable.', date: '2024-03-12', score: -0.62 },
  { id: 3, employee: 'Raj Kumar', dept: 'Logistics', type: 'Expense Anomaly', severity: 'low', details: 'Fuel claims 40% above fleet average for same route.', date: '2024-03-10', score: -0.34 },
  { id: 4, employee: 'Lee Wei Ming', dept: 'Warehouse', type: 'OT Violation', severity: 'high', details: 'Monthly OT exceeds 104-hour EA1955 cap: logged 118 hours.', date: '2024-03-08', score: -0.91 },
];

export default function AnomalyView() {
  const [filter, setFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const filtered = filter === 'all' ? mockAnomalies : mockAnomalies.filter(a => a.severity === filter);

  const severityConfig = {
    high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Flagged', value: mockAnomalies.length, color: 'text-[var(--text-primary)]' },
          { label: 'High Severity', value: mockAnomalies.filter(a => a.severity === 'high').length, color: 'text-red-400' },
          { label: 'Medium', value: mockAnomalies.filter(a => a.severity === 'medium').length, color: 'text-amber-400' },
          { label: 'Avg Score', value: (mockAnomalies.reduce((s, a) => s + a.score, 0) / mockAnomalies.length).toFixed(2), color: 'text-[var(--primary-light)]' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Isolation Forest Anomalies</h2>
          </div>
          <div className="flex gap-1.5">
            {['all', 'high', 'medium', 'low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold uppercase transition-all duration-200 ${
                  filter === f ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="space-y-2">
        {filtered.map(anomaly => {
          const cfg = severityConfig[anomaly.severity];
          const isOpen = selectedAnomaly === anomaly.id;
          return (
            <div key={anomaly.id}
              className={`card p-4 cursor-pointer transition-all duration-200 ${isOpen ? 'ring-1 ring-[var(--primary)]/30' : ''}`}
              onClick={() => setSelectedAnomaly(isOpen ? null : anomaly.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
                    {anomaly.severity}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{anomaly.employee}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{anomaly.dept} · {anomaly.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-[var(--text-muted)]">{anomaly.score}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">{anomaly.date}</p>
                </div>
              </div>
              {isOpen && (
                <div className="mt-3 p-3 rounded-lg animate-fadeInUp" style={{ background: 'var(--bg-elevated)', opacity: 1 }}>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{anomaly.details}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[var(--primary)] text-white">
                      Investigate
                    </button>
                    <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
