'use client';

/**
 * PeopleGraph — Blockchain Escrow Ledger View
 * ==============================================
 * Polygon L2 gig-worker payment escrow and payroll audit trail.
 */

import { useState } from 'react';

const mockContracts = [
  { id: '0x7a3f...e291', worker: 'Amir (Freelance Driver)', amount: 2500, status: 'escrowed', milestone: 'Delivery batch #47 — 120 units', created: '2024-03-15', expires: '2024-03-22' },
  { id: '0x9c1b...4f83', worker: 'Priya (Temp Packer)', amount: 1800, status: 'released', milestone: 'Raya prep packing — 500 boxes', created: '2024-03-10', expires: '2024-03-17', completedAt: '2024-03-16' },
  { id: '0x2e8d...a7c0', worker: 'Jason (IT Contractor)', amount: 5000, status: 'escrowed', milestone: 'POS system migration Phase 1', created: '2024-03-12', expires: '2024-04-12' },
  { id: '0x5f4a...1b2e', worker: 'Fatimah (CNY Temp Staff)', amount: 1500, status: 'disputed', milestone: 'CNY counter sales — 2 weeks', created: '2024-02-01', expires: '2024-02-15' },
];

const mockAuditTrail = [
  { hash: '0xabc123...def', action: 'Payroll PDF Hash Stored', date: '2024-03-25', block: 54321098, verified: true },
  { hash: '0x789fed...456', action: 'EPF Remittance Proof', date: '2024-03-20', block: 54318765, verified: true },
  { hash: '0x321abc...789', action: 'SOCSO Filing Hash', date: '2024-03-18', block: 54316432, verified: true },
];

export default function BlockchainView() {
  const [activeTab, setActiveTab] = useState('escrow');
  const [showNewContract, setShowNewContract] = useState(false);
  const [newContract, setNewContract] = useState({ worker: '', amount: '', milestone: '', duration: '7' });

  const statusConfig = {
    escrowed: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Escrowed' },
    released: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Released' },
    disputed: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Disputed' },
  };

  const totalEscrowed = mockContracts.filter(c => c.status === 'escrowed').reduce((s, c) => s + c.amount, 0);
  const totalReleased = mockContracts.filter(c => c.status === 'released').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Active Escrow</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">RM {totalEscrowed.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{mockContracts.filter(c => c.status === 'escrowed').length} contracts</p>
        </div>
        <div className="card p-4">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Released</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">RM {totalReleased.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{mockContracts.filter(c => c.status === 'released').length} completed</p>
        </div>
        <div className="card p-4">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Network</p>
          <p className="text-lg font-bold text-[var(--primary-light)] mt-1">Polygon L2</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Connected
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card p-1 flex gap-1">
        {[
          { id: 'escrow', label: 'Gig Worker Escrow' },
          { id: 'audit', label: 'Payroll Audit Trail' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Escrow Tab */}
      {activeTab === 'escrow' && (
        <div className="space-y-3">
          {/* New Contract Button */}
          <button onClick={() => setShowNewContract(!showNewContract)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-[var(--border)]
                       text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary-light)]
                       transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Escrow Contract
          </button>

          {/* New Contract Form */}
          {showNewContract && (
            <div className="card p-5 space-y-3 animate-fadeInUp" style={{ opacity: 1 }}>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">New Smart Contract</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Worker Name</label>
                  <input type="text" value={newContract.worker}
                    onChange={(e) => setNewContract(p => ({ ...p, worker: e.target.value }))}
                    placeholder="e.g. Ali (Freelance)"
                    className="w-full h-9 px-3 rounded-lg text-xs bg-[var(--bg-input)] text-[var(--text-primary)]
                               placeholder:text-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Amount (RM)</label>
                  <input type="number" value={newContract.amount}
                    onChange={(e) => setNewContract(p => ({ ...p, amount: e.target.value }))}
                    placeholder="e.g. 2000"
                    className="w-full h-9 px-3 rounded-lg text-xs bg-[var(--bg-input)] text-[var(--text-primary)]
                               placeholder:text-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Milestone Description</label>
                <input type="text" value={newContract.milestone}
                  onChange={(e) => setNewContract(p => ({ ...p, milestone: e.target.value }))}
                  placeholder="e.g. Deliver 200 units to Klang depot"
                  className="w-full h-9 px-3 rounded-lg text-xs bg-[var(--bg-input)] text-[var(--text-primary)]
                             placeholder:text-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none" />
              </div>
              <button className="w-full py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                Deploy to Polygon
              </button>
            </div>
          )}

          {/* Existing Contracts */}
          {mockContracts.map(contract => {
            const cfg = statusConfig[contract.status];
            return (
              <div key={contract.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{contract.worker}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{contract.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">RM {contract.amount.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)]">Milestone:</span> {contract.milestone}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <p className="text-[9px] text-[var(--text-muted)]">Created: {contract.created}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Expires: {contract.expires}</p>
                    {contract.completedAt && <p className="text-[9px] text-emerald-400">Completed: {contract.completedAt}</p>}
                  </div>
                </div>
                {contract.status === 'escrowed' && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      Release Funds
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      Dispute
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Tamper-Proof Payroll Audit Trail</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Every payroll run, EPF remittance, and SOCSO filing is hashed and stored on Polygon for tamper-proof verification.
          </p>
          <div className="space-y-2">
            {mockAuditTrail.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-3">
                  {entry.verified ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-amber-400 text-xs">?</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{entry.action}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{entry.hash}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-secondary)]">{entry.date}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">Block #{entry.block.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
