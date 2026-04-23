'use client';

/**
 * PeopleGraph — Freelance & Temp Escrow Ledger
 * ==============================================
 * Smart contract milestone payments for flexible workforce.
 */

import { useState } from 'react';

const mockContracts = [
  {
    id: 'ESC-1042',
    worker: 'Sarah Wong (Graphic Designer)',
    amount: 3000,
    status: 'escrowed',
    milestone: 'Deliver Q4 Marketing Assets (Drafts)',
    created: '2024-03-15',
    expires: '2024-03-22',
  },
  {
    id: 'ESC-1043',
    worker: 'Agensi Pekerjaan Boleh (Raya Temp Packers - 2 Pax)',
    amount: 3600,
    status: 'escrowed',
    milestone: '14 Days Warehouse Fulfillment',
    created: '2024-03-12',
    expires: '2024-03-26',
  },
  {
    id: 'ESC-1044',
    worker: 'Jason Lee (IT Contractor)',
    amount: 5000,
    status: 'released',
    milestone: 'POS System Migration',
    created: '2024-03-10',
    expires: '2024-04-10',
    completedAt: '2024-03-20',
  },
];

export default function BlockchainView() {
  const [searchTerm, setSearchTerm] = useState('');

  const statusConfig = {
    escrowed: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'ESCROWED' },
    released: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'RELEASED' },
    disputed: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'DISPUTED' },
  };

  const totalEscrowed = mockContracts.filter(c => c.status === 'escrowed').reduce((s, c) => s + c.amount, 0);
  const activeContracts = mockContracts.filter(c => c.status === 'escrowed').length;

  const filteredContracts = mockContracts.filter(contract =>
    contract.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.milestone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Freelance & Temp Escrow Ledger</h1>
        <p className="text-slate-400">Smart contract milestone payments for flexible workforce</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">TOTAL FUNDS ESCROWED</p>
          <p className="text-3xl font-bold text-white mt-2">RM {totalEscrowed.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl"></div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">OVERHEAD SAVED (YTD)</p>
          <p className="text-3xl font-bold text-white mt-2">RM 15,000</p>
          <p className="text-xs text-slate-400 mt-1">Vs. full-time equivalent payroll</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">ACTIVE CONTRACTS</p>
          <p className="text-3xl font-bold text-white mt-2">{activeContracts}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors">
          + Create Escrow Contract
        </button>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredContracts.map(contract => {
          const cfg = statusConfig[contract.status];
          return (
            <div key={contract.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{contract.worker}</h3>
                  <p className="text-sm text-slate-400">Smart Contract: #{contract.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">RM {contract.amount.toLocaleString()}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.bg} ${cfg.text} border border-current`}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Milestone Section */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 mb-2">
                  <span className="font-semibold text-white">Milestone:</span> {contract.milestone}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Created: {contract.created}</span>
                  <span>Expires: {contract.expires}</span>
                  {contract.completedAt && <span className="text-emerald-400">Completed: {contract.completedAt}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              {contract.status === 'escrowed' && (
                <div className="flex gap-3">
                  <button className="flex-1 py-2 rounded-lg text-sm font-semibold border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                    Release Funds
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-sm font-semibold border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors">
                    Dispute
                  </button>
                </div>
              )}
              {contract.status === 'released' && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-400">Funds Cleared</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
