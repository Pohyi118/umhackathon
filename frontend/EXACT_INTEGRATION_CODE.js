/**
 * EXACT INTEGRATION CODE REFERENCE
 * ================================
 * Copy-paste ready code showing exactly where the component sits
 * and how it receives props from parent calculations.
 */

// ────────────────────────────────────────────────────────────────
// FILE: frontend/app/components/StatutoryView.js (UPDATED)
// ────────────────────────────────────────────────────────────────

'use client';

import { useState } from 'react';
import StrategicInsightPanel from './StrategicInsightPanel';  // ✅ NEW IMPORT

const statutoryRates = {
  epf_employee: 0.11,
  epf_employer_lte5k: 0.13,
  epf_employer_gt5k: 0.12,
  socso_employer: 0.0175,
  socso_employee: 0.005,
  socso_cap: 6000,
  eis_rate: 0.002,
  eis_cap: 6000,
  min_wage: 1700,
};

export default function StatutoryView() {
  // ✅ SIMPLIFIED STATE (removed tenure, showSeverance)
  const [salary, setSalary] = useState(3500);

  // Statutory Calculations
  const epfEmployee = salary * statutoryRates.epf_employee;
  const epfEmployer = salary * (salary <= 5000 ? statutoryRates.epf_employer_lte5k : statutoryRates.epf_employer_gt5k);
  const socsoCap = Math.min(salary, statutoryRates.socso_cap);
  const socsoEmployer = socsoCap * statutoryRates.socso_employer;
  const socsoEmployee = socsoCap * statutoryRates.socso_employee;
  const eisCap = Math.min(salary, statutoryRates.eis_cap);
  const eisEmployer = eisCap * statutoryRates.eis_rate;
  const eisEmployee = eisCap * statutoryRates.eis_rate;

  // Summary Calculations
  const totalEmployerCost = salary + epfEmployer + socsoEmployer + eisEmployer;
  const netTakeHome = salary - epfEmployee - socsoEmployee - eisEmployee;
  const employerBurdenPercent = ((totalEmployerCost - salary) / salary * 100).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      
      {/* ══════════════════════════════════════════════════════════ */}
      {/* MAIN CALCULATOR CARD                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" 
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" 
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" 
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Statutory Cost Calculator</h2>
        </div>
        
        <p className="text-xs text-[var(--text-muted)] mb-6">
          True cost of employment under Malaysian law (EA1955, EPF Act 1991, SOCSO Act 1969)
        </p>

        {/* Employer Burden Hero Section */}
        <div className="mb-6 p-5 rounded-xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(245,158,11,0.06))',
          border: '1px solid rgba(124,58,237,0.15)',
        }}>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Total Employer Burden
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[var(--text-primary)]">
              {employerBurdenPercent}%
            </span>
            <span className="text-sm text-[var(--text-muted)]">on top of base salary</span>
          </div>
        </div>

        {/* Salary Input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              Monthly Base Salary
            </label>
            <span className="text-sm font-bold text-[var(--primary-light)]">
              RM {salary.toLocaleString()}
            </span>
          </div>
          <input 
            type="range" 
            min="1700" 
            max="20000" 
            step="100" 
            value={salary}
            onChange={(e) => setSalary(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((salary - 1700) / 18300) * 100}%, var(--bg-elevated) ${((salary - 1700) / 18300) * 100}%, var(--bg-elevated) 100%)`
            }}
          />
        </div>

        {/* Breakdown Table */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)]">
          {[
            { label: 'EPF (Employee)', value: epfEmployee, rate: '11%', color: 'text-amber-400' },
            { label: 'EPF (Employer)', value: epfEmployer, rate: salary <= 5000 ? '13%' : '12%', color: 'text-amber-400' },
            { label: 'SOCSO (Employee)', value: socsoEmployee, rate: '0.5%', note: `cap RM${statutoryRates.socso_cap}`, color: 'text-blue-400' },
            { label: 'SOCSO (Employer)', value: socsoEmployer, rate: '1.75%', note: `cap RM${statutoryRates.socso_cap}`, color: 'text-blue-400' },
            { label: 'EIS (Employee)', value: eisEmployee, rate: '0.2%', note: `cap RM${statutoryRates.eis_cap}`, color: 'text-purple-400' },
            { label: 'EIS (Employer)', value: eisEmployer, rate: '0.2%', note: `cap RM${statutoryRates.eis_cap}`, color: 'text-purple-400' },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-card)]'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${row.color}`}>{row.label}</span>
                {row.note && <span className="text-[9px] text-[var(--text-muted)]">({row.note})</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-muted)]">{row.rate}</span>
                <span className="text-xs font-bold text-[var(--text-primary)] w-20 text-right">
                  RM {row.value.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-xl" 
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Net Take-Home
            </p>
            <p className="text-xl font-bold text-emerald-400">RM {netTakeHome.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-xl" 
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
              True Employer Cost
            </p>
            <p className="text-xl font-bold text-amber-400">RM {totalEmployerCost.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🆕 STRATEGIC INSIGHT PANEL INSERTED HERE                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <StrategicInsightPanel 
        baseSalary={salary}           // ✅ Reactive: updates when salary slider changes
        trueCost={totalEmployerCost}  // ✅ Reactive: updates when calculations change
      />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* UPCOMING COMPLIANCE SECTION (Below the new panel)          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
          Upcoming Regulatory Changes
        </h3>
        <div className="space-y-2">
          {[
            { date: 'Jul 2026', title: 'LHDN e-Invoicing Phase 4', desc: 'Required for businesses earning < RM1M', status: 'upcoming' },
            { date: '2025', title: 'Multi-tier Foreign Worker Levy', desc: 'New levy mechanism for foreign workers', status: 'active' },
            { date: '2024', title: 'SOCSO Cap Increase to RM6,000', desc: 'Wage ceiling increased from RM4,000', status: 'enforced' },
            { date: '2023', title: 'Minimum Wage RM1,700', desc: 'Mandatory for all employers', status: 'enforced' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg" 
              style={{ background: 'var(--bg-elevated)' }}>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                item.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400' :
                item.status === 'active' ? 'bg-blue-500/10 text-blue-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {item.date}
              </span>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


// ────────────────────────────────────────────────────────────────
// FILE: frontend/app/components/StrategicInsightPanel.js (NEW)
// ────────────────────────────────────────────────────────────────

'use client';

import { useState } from 'react';

export default function StrategicInsightPanel({ baseSalary = 3500, trueCost = 3955 }) {
  const [mode, setMode] = useState('roi');
  const [expectedRevenue, setExpectedRevenue] = useState(trueCost * 3);
  const [yearsOfService, setYearsOfService] = useState(5);

  // ── Hiring ROI Calculations ──
  const targetBreakeven = trueCost * 3;
  const roiIsPositive = expectedRevenue >= targetBreakeven;
  const roiPercentage = ((expectedRevenue / targetBreakeven) * 100).toFixed(0);

  // ── Severance Calculations ──
  const severanceDaysPerYear = yearsOfService < 2 ? 10 : yearsOfService < 5 ? 15 : 20;
  const dailyWage = baseSalary / 26;
  const severanceCost = severanceDaysPerYear * yearsOfService * dailyWage;
  const recoveryMonths = (severanceCost / trueCost).toFixed(1);

  // ── Actionable Summary ──
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
      
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" 
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" 
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Strategic Insight Panel</h3>
        </div>

        {/* Pill Toggle */}
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
          <button
            onClick={() => setMode('roi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              mode === 'roi' ? 'bg-purple-600 text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            Hiring ROI
          </button>
          <button
            onClick={() => setMode('severance')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              mode === 'severance' ? 'bg-purple-600 text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            Severance Risk
          </button>
        </div>
      </div>

      {/* ROI MODE */}
      {mode === 'roi' && (
        <div className="space-y-4">
          {/* Expected Revenue Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Expected Monthly Revenue
              </label>
              <span className="text-sm font-bold text-[var(--primary-light)]">
                RM {expectedRevenue.toLocaleString()}
              </span>
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
          </div>

          {/* Breakeven Info */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-[var(--text-muted)] uppercase">Target Break-Even</span>
              <span className="text-sm font-bold">RM {targetBreakeven.toLocaleString()}</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-4 rounded-xl border-2" style={{
            background: roiIsPositive ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            borderColor: roiIsPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
          }}>
            <h2 style={{ color: roiIsPositive ? '#10B981' : '#EF4444' }} className="text-lg font-bold mb-2">
              {roiIsPositive ? '🟢 Profitable Hire' : '🔴 High-Risk Hire'}
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
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

      {/* SEVERANCE MODE */}
      {mode === 'severance' && (
        <div className="space-y-4">
          {/* Years of Service Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Years of Service
              </label>
              <span className="text-sm font-bold text-[var(--primary-light)]">
                {yearsOfService} years
              </span>
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
          </div>

          {/* Severance Breakdown */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Formula</p>
                <p className="text-xs font-bold mt-1">{severanceDaysPerYear} days/year</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Daily Wage</p>
                <p className="text-xs font-bold mt-1">RM {dailyWage.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Total</p>
                <p className="text-lg font-bold text-red-400 mt-1">
                  RM {severanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-4 rounded-xl border-2" style={{
            background: 'rgba(245,158,11,0.06)',
            borderColor: 'rgba(245,158,11,0.3)',
          }}>
            <h2 className="text-lg font-bold text-amber-400 mb-2">
              🟡 {recoveryMonths} Months to Recover
            </h2>
          </div>

          {/* Recovery Timeline */}
          <div className="space-y-2">
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
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Actionable Summary
        </p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {generateSummary()}
        </p>
      </div>

    </div>
  );
}


// ────────────────────────────────────────────────────────────────
// PROP FLOW DIAGRAM
// ────────────────────────────────────────────────────────────────

/*
StatutoryView Component
│
├─ [Salary Slider] ← User drags from RM 1,700 to RM 20,000
│   │
│   ├─ salary state: 3500 RM
│   │
│   ├─ Statutory Calculations:
│   │   epfEmployer = salary × (13% or 12%)
│   │   socsoEmployer = min(salary, 6000) × 1.75%
│   │   eisEmployer = min(salary, 6000) × 0.2%
│   │
│   ├─ totalEmployerCost = salary + epfEmployer + socsoEmployer + eisEmployer
│   │   └─ Example: 3500 + 455 + 61.25 + 7 = 4,023.25 RM
│   │
│   └─ [Net Take-Home Card] ← Displays calculated value
│   └─ [True Employer Cost Card] ← Displays totalEmployerCost
│
└─ <StrategicInsightPanel baseSalary={salary} trueCost={totalEmployerCost} />
   │
   ├─ baseSalary = 3500 (receives parent state)
   │   │
   │   └─ Used for: dailyWage = baseSalary / 26
   │
   ├─ trueCost = 4023.25 (receives parent state)
   │   │
   │   ├─ Used for: targetBreakeven = trueCost × 3 = 12,069.75 RM
   │   │
   │   └─ Used for: recoveryMonths = severanceCost / trueCost
   │
   ├─ [Hiring ROI Mode]
   │   ├─ Expected Revenue Slider: min=trueCost, max=trueCost×10
   │   ├─ Verdict: 🟢 if expectedRevenue ≥ targetBreakeven
   │   └─ Summary: Humanized explanation
   │
   └─ [Severance Risk Mode]
       ├─ Years of Service Slider: 1-30 years
       ├─ Verdict: 🟡 X.X months recovery
       └─ Summary: Humanized explanation


// ────────────────────────────────────────────────────────────────
// HOW REACTIVITY WORKS
// ────────────────────────────────────────────────────────────────

User moves salary slider from RM 3,500 → RM 5,000:

1. StatutoryView state updates:
   salary = 5000

2. Statutory calculations re-run:
   epfEmployer = 5000 × 0.13 = 650 RM
   socsoEmployer = 5000 × 0.0175 = 87.50 RM
   eisEmployer = 5000 × 0.002 = 10 RM

3. totalEmployerCost recalculated:
   5000 + 650 + 87.50 + 10 = 5,747.50 RM

4. StrategicInsightPanel receives new props:
   <StrategicInsightPanel 
     baseSalary={5000}        ✅ UPDATED
     trueCost={5747.50}       ✅ UPDATED
   />

5. Component recalculates:
   targetBreakeven = 5747.50 × 3 = 17,242.50 RM
   dailyWage = 5000 / 26 = 192.31 RM
   severanceCost = 15 × 5 × 192.31 = 14,423.08 RM
   recoveryMonths = 14,423.08 / 5747.50 = 2.51 months

6. UI updates instantly WITHOUT page refresh ✨

✅ No API calls
✅ No watchers needed
✅ Pure React prop-driven re-renders
✅ Lightning-fast math calculations
*/
