'use client';

/**
 * PeopleGraph — Statutory Compliance Engine View (Enhanced)
 * ==========================================================
 * Interactive compliance calculator with EA1955, EPF, SOCSO, EIS, PCB.
 * Now includes massive bold "Total Employer Burden: X%" metric.
 */

import { useState } from 'react';

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
  const [salary, setSalary] = useState(3500);
  const [tenure, setTenure] = useState(5);
  const [showSeverance, setShowSeverance] = useState(false);

  const epfEmployee = salary * statutoryRates.epf_employee;
  const epfEmployer = salary * (salary <= 5000 ? statutoryRates.epf_employer_lte5k : statutoryRates.epf_employer_gt5k);
  const socsoCap = Math.min(salary, statutoryRates.socso_cap);
  const socsoEmployer = socsoCap * statutoryRates.socso_employer;
  const socsoEmployee = socsoCap * statutoryRates.socso_employee;
  const eisCap = Math.min(salary, statutoryRates.eis_cap);
  const eisEmployer = eisCap * statutoryRates.eis_rate;
  const eisEmployee = eisCap * statutoryRates.eis_rate;
  const totalEmployerCost = salary + epfEmployer + socsoEmployer + eisEmployer;
  const netTakeHome = salary - epfEmployee - socsoEmployee - eisEmployee;
  const employerBurdenPercent = ((totalEmployerCost - salary) / salary * 100).toFixed(1);

  // EA1955 Severance calculation
  const severanceDaysPerYear = tenure < 2 ? 10 : tenure < 5 ? 15 : 20;
  const dailyWage = salary / 26;
  const totalSeverance = severanceDaysPerYear * tenure * dailyWage;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Calculator */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Statutory Cost Calculator</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-6">True cost of employment under Malaysian law (EA1955, EPF Act 1991, SOCSO Act 1969)</p>

        {/* ── EMPLOYER BURDEN HERO ────────────────────────────────── */}
        <div className="mb-6 p-5 rounded-xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(245,158,11,0.06))',
          border: '1px solid rgba(124,58,237,0.15)',
        }}>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(124,58,237,0.08)' }} />
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Employer Burden</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>
              {employerBurdenPercent}%
            </span>
            <span className="text-sm text-[var(--text-muted)]">on top of base salary</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            For every <span className="font-bold text-[var(--primary-light)]">RM 1.00</span> you pay in salary, you actually spend{' '}
            <span className="font-bold text-amber-400">RM {(totalEmployerCost / salary).toFixed(2)}</span>
          </p>
          <div className="mt-3 h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            <div className="h-full bg-[var(--primary)]" style={{ width: `${(salary / totalEmployerCost) * 100}%` }} title="Base Salary" />
            <div className="h-full bg-[#A78BFA]" style={{ width: `${(epfEmployer / totalEmployerCost) * 100}%` }} title="EPF" />
            <div className="h-full bg-[#C4B5FD]" style={{ width: `${(socsoEmployer / totalEmployerCost) * 100}%` }} title="SOCSO" />
            <div className="h-full bg-[#DDD6FE]" style={{ width: `${(eisEmployer / totalEmployerCost) * 100}%` }} title="EIS" />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" /> Base
            </span>
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" /> EPF
            </span>
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD]" /> SOCSO
            </span>
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DDD6FE]" /> EIS
            </span>
          </div>
        </div>

        {/* Salary Input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Monthly Base Salary</label>
            <span className="text-sm font-bold text-[var(--primary-light)]">RM {salary.toLocaleString()}</span>
          </div>
          <input type="range" min="1700" max="20000" step="100" value={salary}
            onChange={(e) => setSalary(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((salary - 1700) / 18300) * 100}%, var(--bg-elevated) ${((salary - 1700) / 18300) * 100}%, var(--bg-elevated) 100%)` }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[var(--text-muted)]">RM1,700 (min wage)</span>
            <span className="text-[9px] text-[var(--text-muted)]">RM20,000</span>
          </div>
          {salary < 1700 && (
            <p className="text-[10px] text-red-400 mt-1">Below RM1,700 minimum wage mandate!</p>
          )}
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
                <span className="text-xs font-bold text-[var(--text-primary)] w-20 text-right">RM {row.value.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Net Take-Home</p>
            <p className="text-xl font-bold text-emerald-400">RM {netTakeHome.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">True Employer Cost</p>
            <p className="text-xl font-bold text-amber-400">RM {totalEmployerCost.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* EA1955 Severance Calculator */}
      <div className="card p-6">
        <button onClick={() => setShowSeverance(!showSeverance)} className="w-full flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">EA1955 Severance Calculator</h3>
          <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${showSeverance ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSeverance && (
          <div className="mt-4 space-y-4 animate-fadeInUp" style={{ opacity: 1 }}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Years of Service</label>
                <span className="text-sm font-bold text-[var(--primary-light)]">{tenure} years</span>
              </div>
              <input type="range" min="1" max="30" value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(tenure / 30) * 100}%, var(--bg-elevated) ${(tenure / 30) * 100}%, var(--bg-elevated) 100%)` }}
              />
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] text-[var(--text-muted)] uppercase">Formula</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-1">{severanceDaysPerYear} days/year</p>
                  <p className="text-[9px] text-[var(--text-muted)]">{tenure < 2 ? '< 2 years' : tenure < 5 ? '2-5 years' : '5+ years'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--text-muted)] uppercase">Daily Wage</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-1">RM {dailyWage.toFixed(2)}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">salary / 26 days</p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--text-muted)] uppercase">Total Severance</p>
                  <p className="text-lg font-bold text-red-400 mt-1">RM {totalSeverance.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Compliance */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Upcoming Regulatory Changes</h3>
        <div className="space-y-2">
          {[
            { date: 'Jul 2026', title: 'LHDN e-Invoicing Phase 4', desc: 'Required for businesses earning < RM1M', status: 'upcoming' },
            { date: '2025', title: 'Multi-tier Foreign Worker Levy', desc: 'New levy mechanism for foreign workers', status: 'active' },
            { date: '2024', title: 'SOCSO Cap Increase to RM6,000', desc: 'Wage ceiling increased from RM4,000', status: 'enforced' },
            { date: '2023', title: 'Minimum Wage RM1,700', desc: 'Mandatory for all employers', status: 'enforced' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                item.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400' :
                item.status === 'active' ? 'bg-blue-500/10 text-blue-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>{item.date}</span>
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
