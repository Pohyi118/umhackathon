'use client';

/**
 * PeopleGraph — Manglish NLP Engine
 * ==================================
 * Process unstructured Malaysian text with Malaya NLP
 * for immediate business decisions.
 */

import { useState } from 'react';

export default function NLPView() {
  const [messages] = useState([
    {
      role: 'assistant',
      type: 'structured',
      header: 'AI Extraction Complete',
      threat: 'CRITICAL',
      department: 'Logistics & Fulfillment',
      issue: '3 Staff Absent (MC) + High Raya Volume backlog. J&T processing halted.',
      action: 'Deploy 2 Temp Staff (Est. RM 300)',
      source: 'Logistics WhatsApp Group • 04:00 PM',
      raw: 'Boss, budak warehouse 3 orang MC harini. Barang J&T semalam tak jalan lagi. Gila babi byk order masuk sbb Raya. Camne ni?',
      timestamp: new Date(),
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Manglish NLP Engine</h2>
          <p className="text-sm text-slate-400">Process unstructured Malaysian text with Malaya NLP</p>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Logs Processed (7 Days):</span>
              <span className="text-white font-semibold ml-2">1,248</span>
            </div>
            <div>
              <span className="text-slate-400">Primary Sentiment:</span>
              <span className="text-amber-400 font-semibold ml-2">High Stress (Logistics)</span>
            </div>
            <div>
              <span className="text-slate-400">Unresolved Flags:</span>
              <span className="text-red-400 font-semibold ml-2">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex flex-col gap-6">
          {messages
            .filter((msg) => msg.type === 'structured')
            .map((msg, i) => (
              <div key={i} className="bg-[#16161e] border border-gray-800 rounded-3xl p-5 shadow-sm">
                {/* Command Row */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                  <span className="bg-red-900/50 text-red-400 font-bold px-3 py-1 rounded-full text-xs">
                    🚨 CRITICAL: {msg.department}
                  </span>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                    {msg.action}
                  </button>
                </div>

                {/* Core Insight */}
                <div className="mb-5">
                  <p className="text-white text-base font-semibold leading-7">
                    Core Issue: {msg.issue} Prevents estimated RM 2,500 in fulfillment refunds.
                  </p>
                </div>

                {/* Raw Evidence */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Intercepted Source: {msg.source}</p>
                  <div className="bg-[#0d0d12] p-3 rounded text-gray-400 text-sm italic">
                    {msg.raw}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
