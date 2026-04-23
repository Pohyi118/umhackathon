'use client';

/**
 * PeopleGraph — Business Risk & Resolution Dashboard
 * ===================================================
 * Executive-level operational risk tracking with AI-driven
 * financial exposure and compliance monitoring.
 */

import { useState } from 'react';

const mockThreats = [
  {
    id: 1,
    employee: 'Ahmad bin Ismail',
    dept: 'Warehouse',
    issue: 'OT Discrepancy',
    severity: 'high',
    impact: 'RM 1,200 Exposure',
    date: '2024-03-15',
    aiSummary: 'AI Analysis: Ahmad logged 14 hours OT over the weekend. This correlates directly with the manual waybill bottleneck delaying warehouse fulfillment.',
  },
  {
    id: 2,
    employee: 'Lee Wei Ming',
    dept: 'Warehouse',
    issue: 'OT Violation',
    severity: 'high',
    impact: 'Legal Compliance Risk',
    date: '2024-03-08',
    aiSummary: 'AI Analysis: Monthly OT exceeds 104-hour EA1955 cap: logged 118 hours. Immediate compliance review required to avoid statutory penalties.',
  },
  {
    id: 3,
    employee: 'Siti Aminah',
    dept: 'Sales',
    issue: 'Attendance Pattern',
    severity: 'medium',
    impact: 'RM 400 Exposure',
    date: '2024-03-12',
    aiSummary: 'AI Analysis: Clock-in at 08:59 every day for 30 consecutive days — statistically improbable. Potential attendance manipulation detected.',
  },
];

export default function AnomalyView() {
  const [filter, setFilter] = useState('all');
  const [expandedThreat, setExpandedThreat] = useState(null);

  const filtered = filter === 'all' ? mockThreats : mockThreats.filter(t => t.severity === filter);

  const severityConfig = {
    high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Operational Risk & Resolution Audit</h1>
        <p className="text-slate-400">AI-driven financial exposure and compliance tracking</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">TOTAL ACTIVE THREATS</p>
          <p className="text-3xl font-bold text-white mt-2">4</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">HIGH SEVERITY</p>
          <p className="text-3xl font-bold text-red-400 mt-2">2</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-t-xl"></div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">TOTAL FINANCIAL EXPOSURE</p>
          <p className="text-4xl font-bold text-white mt-2">RM 1,600</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Business Threats</h2>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase transition-all duration-200 ${
                  filter === f
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Threat List - Accordion */}
      <div className="space-y-3">
        {filtered.map(threat => {
          const cfg = severityConfig[threat.severity];
          const isExpanded = expandedThreat === threat.id;
          return (
            <div
              key={threat.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
            >
              {/* Unexpanded Row */}
              <div
                className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setExpandedThreat(isExpanded ? null : threat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
                      {threat.severity}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{threat.employee}</p>
                      <p className="text-slate-400 text-sm">{threat.dept} • {threat.issue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${threat.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                        {threat.impact}
                      </p>
                      <p className="text-slate-400 text-xs">{threat.date}</p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Row */}
              {isExpanded && (
                <div className="bg-black/20 px-4 pb-4">
                  <div className="border-l-4 border-[#8B5CF6] pl-4 py-4">
                    <p className="text-slate-300 text-sm leading-relaxed">{threat.aiSummary}</p>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg text-sm font-semibold hover:bg-[#7C3AED] transition-colors">
                      Message on WhatsApp
                    </button>
                    <button className="px-4 py-2 border border-red-500 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/10 transition-colors">
                      Reject OT Claim
                    </button>
                    <button className="px-4 py-2 text-slate-400 rounded-lg text-sm font-semibold hover:text-white transition-colors">
                      View Full Logs
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
