'use client';

/**
 * Strategic Insight Panel
 * =======================
 * Interactive hiring ROI vs severance risk analyzer with dual-mode visualization.
 * Replaces the collapsed EA1955 accordion in StatutoryView.
 */

import { useState } from 'react';

export default function StrategicInsightPanel({ baseSalary = 3500, trueCost = 3955 }) {
  const [mode, setMode] = useState('roi'); // 'roi' | 'severance'
  const [expectedRevenue, setExpectedRevenue] = useState(trueCost * 3); // Default to breakeven
  const [yearsOfService, setYearsOfService] = useState(5);

  // ── Hiring ROI Mode Calculations ─────────────────────────────────
  const targetBreakeven = trueCost * 3; // 3x true cost = breakeven threshold
  const roiIsPositive = expectedRevenue >= targetBreakeven;
  const roiPercentage = ((expectedRevenue / targetBreakeven) * 100).toFixed(0);

  // ── Severance Risk Mode Calculations ─────────────────────────────
  const severanceDaysPerYear = yearsOfService < 2 ? 10 : yearsOfService < 5 ? 15 : 20;
  const dailyWage = baseSalary / 26;
  const severanceCost = severanceDaysPerYear * yearsOfService * dailyWage;
  const recoveryMonths = (severanceCost / trueCost).toFixed(1);

  // ── Actionable Summary ───────────────────────────────────────────
  const generateSummary = () => {
    if (mode === 'roi') {
      if (roiIsPositive) {
        const surplus = expectedRevenue - targetBreakeven;
        const monthsToProfit = 3 + (surplus / trueCost / 12).toFixed(1);
        return `Expected revenue of RM ${expectedRevenue.toLocaleString()} exceeds the RM ${targetBreakeven.toLocaleString()} breakeven target—this hire generates surplus value within ~${monthsToProfit} months.`;
      } else {
        const shortfall = targetBreakeven - expectedRevenue;
        return `Revenue projection of RM ${expectedRevenue.toLocaleString()} falls short by RM ${shortfall.toLocaleString()}. Consider increasing productivity expectations or optimizing role scope before hiring.`;
      }
    } else {
      const weeks = (recoveryMonths / 4.33).toFixed(1);
      return `Based on ${yearsOfService}-year tenure and severance formula of ${severanceDaysPerYear} days/year, severance cost is RM ${severanceCost.toLocaleString()}—recoverable in ~${recoveryMonths} months of operational value.`;
    }
  };

  return (
    <div className="card p-6 space-y-4">
      {/* Header & Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Strategic Insight Panel</h3>
        </div>

        {/* Pill-Shaped Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
          <button
            onClick={() => setMode('roi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              mode === 'roi'
                ? 'bg-purple-600 text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Hiring ROI
          </button>
          <button
            onClick={() => setMode('severance')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              mode === 'severance'
                ? 'bg-purple-600 text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Severance Risk
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* HIRING ROI MODE */}
      {/* ─────────────────────────────────────────────────────────── */}
      {mode === 'roi' && (
        <div className="space-y-4">
          {/* Expected Monthly Revenue Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Expected Monthly Revenue</label>
              <span className="text-sm font-bold text-[var(--primary-light)]">RM {expectedRevenue.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={trueCost}
              max={trueCost * 10}
              step={100}
              value={expectedRevenue}
              onChange={(e) => setExpectedRevenue(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((expectedRevenue - trueCost) / (trueCost * 9)) * 100}%, var(--bg-elevated) ${((expectedRevenue - trueCost) / (trueCost * 9)) * 100}%, var(--bg-elevated) 100%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[var(--text-muted)]">RM {trueCost.toLocaleString()} (min)</span>
              <span className="text-[9px] text-[var(--text-muted)]">RM {(trueCost * 10).toLocaleString()} (max)</span>
            </div>
          </div>

          {/* Breakeven Target Info */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-[var(--text-muted)] uppercase">Target Break-Even (3x True Cost)</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">RM {targetBreakeven.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[var(--text-muted)] uppercase">Your Projection</span>
              <span className={`text-sm font-bold ${roiIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>RM {expectedRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-4 rounded-xl border-2" style={{
            background: roiIsPositive ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            borderColor: roiIsPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
          }}>
            <h2 className="text-lg font-bold mb-3" style={{ color: roiIsPositive ? '#10B981' : '#EF4444' }}>
              {roiIsPositive ? '🟢 Profitable Hire' : '🔴 High-Risk Hire'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your expected revenue reaches <span className="font-bold">{roiPercentage}%</span> of the breakeven threshold.
              {roiIsPositive && (
                <> This hire generates <span className="text-emerald-400 font-bold">surplus value</span> and is recommended.</>
              )}
              {!roiIsPositive && (
                <> Consider increasing revenue projections or optimizing the role before proceeding.</>
              )}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[var(--text-muted)] uppercase">Coverage Progress</span>
              <span className="text-[9px] font-bold text-[var(--text-primary)]">{roiPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(roiPercentage, 100)}%`,
                  background: roiIsPositive
                    ? 'linear-gradient(to right, #7C3AED, #06B6D4)'
                    : 'linear-gradient(to right, #F59E0B, #EF4444)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEVERANCE RISK MODE */}
      {/* ─────────────────────────────────────────────────────────── */}
      {mode === 'severance' && (
        <div className="space-y-4">
          {/* Years of Service Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Years of Service</label>
              <span className="text-sm font-bold text-[var(--primary-light)]">{yearsOfService} years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(yearsOfService / 30) * 100}%, var(--bg-elevated) ${(yearsOfService / 30) * 100}%, var(--bg-elevated) 100%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[var(--text-muted)]">1 year</span>
              <span className="text-[9px] text-[var(--text-muted)]">30 years</span>
            </div>
          </div>

          {/* Severance Breakdown */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Formula</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-1">{severanceDaysPerYear} days/year</p>
                <p className="text-[9px] text-[var(--text-muted)]">{yearsOfService < 2 ? '< 2 years' : yearsOfService < 5 ? '2-5 years' : '5+ years'}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Daily Wage</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-1">RM {dailyWage.toFixed(2)}</p>
                <p className="text-[9px] text-[var(--text-muted)]">Base ÷ 26 days</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Total Severance</p>
                <p className="text-lg font-bold text-red-400 mt-1">RM {severanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-4 rounded-xl border-2" style={{
            background: 'rgba(245,158,11,0.06)',
            borderColor: 'rgba(245,158,11,0.3)',
          }}>
            <h2 className="text-lg font-bold text-amber-400 mb-3">
              🟡 {recoveryMonths} Months to Recover Severance
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              If employment ends after {yearsOfService} years, you'll owe <span className="font-bold text-red-400">RM {severanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> in severance.
              This represents <span className="font-bold text-amber-400">{recoveryMonths} months</span> of operational value from the employee's true cost.
            </p>
          </div>

          {/* Recovery Timeline */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[var(--text-muted)] uppercase">Recovery Timeline</span>
              <span className="text-[9px] font-bold text-[var(--text-primary)]">{recoveryMonths} months</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min((recoveryMonths / 24) * 100, 100)}%`,
                  background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actionable Summary (Both Modes) */}
      <div className="p-4 rounded-xl border border-[var(--border)]" style={{ background: 'var(--bg-elevated)' }}>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Actionable Summary</p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {generateSummary()}
        </p>
      </div>
    </div>
  );
}
