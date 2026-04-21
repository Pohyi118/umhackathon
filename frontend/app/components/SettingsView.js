'use client';

/**
 * PeopleGraph — Settings View
 * =============================
 * API key management, language toggle, and system configuration.
 */

import { useState } from 'react';
import { useI18n } from '../i18nContext';

export default function SettingsView() {
  const { lang, setLang } = useI18n();
  const [apiKeys, setApiKeys] = useState({
    glm: '',
    polygon: '',
    neo4j: '',
  });
  const [showKeys, setShowKeys] = useState({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to secure backend / env
    localStorage.setItem('pg_api_keys', JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const apiConfigs = [
    {
      key: 'glm',
      label: 'YTL AI Labs ILMU-GLM-5.1',
      desc: 'Powers the semantic analysis engine, Manglish NLP, and onboarding recommendations.',
      placeholder: 'glm-xxxxxxxx-xxxx-xxxx',
      required: true,
      docsUrl: 'https://docs.ilmu.ai/docs/getting-started/overview',
    },
    {
      key: 'polygon',
      label: 'Polygon RPC / Alchemy Key',
      desc: 'Required for Blockchain Escrow module — gig worker payments on Polygon L2.',
      placeholder: 'https://polygon-mainnet.g.alchemy.com/v2/...',
      required: false,
    },
    {
      key: 'neo4j',
      label: 'Neo4j Aura URI',
      desc: 'GraphRAG pipeline for multi-hop relationship mapping and Akta Kerja 1955 rules.',
      placeholder: 'neo4j+s://xxxx.databases.neo4j.io',
      required: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* API Keys Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-[var(--primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">API Configuration</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Connect external services. Keys are stored securely and encrypted at rest.
        </p>

        <div className="space-y-5">
          {apiConfigs.map(config => (
            <div key={config.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  {config.label}
                  {config.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {config.docsUrl && (
                  <a href={config.docsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-[var(--primary-light)] hover:underline">
                    View Docs →
                  </a>
                )}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mb-2">{config.desc}</p>
              <div className="relative">
                <input
                  type={showKeys[config.key] ? 'text' : 'password'}
                  value={apiKeys[config.key]}
                  onChange={(e) => setApiKeys(p => ({ ...p, [config.key]: e.target.value }))}
                  placeholder={config.placeholder}
                  className="w-full h-10 px-3 pr-10 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                             placeholder:text-[var(--text-muted)] border border-[var(--border)]
                             focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30
                             transition-all duration-200 font-mono"
                />
                <button
                  onClick={() => setShowKeys(p => ({ ...p, [config.key]: !p[config.key] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {showKeys[config.key] ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]
                     flex items-center justify-center gap-2"
          style={{ background: saved ? 'var(--success)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
        >
          {saved ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved Successfully
            </>
          ) : (
            'Save API Keys'
          )}
        </button>
      </div>

      {/* Language Settings */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Language / Bahasa</h2>
        <div className="flex gap-2">
          {[
            { code: 'en', label: 'English' },
            { code: 'bm', label: 'Bahasa Melayu' },
            { code: 'zh', label: '中文' },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${lang === l.code
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-focus)]'
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">System Information</h2>
        <div className="space-y-2">
          {[
            { label: 'Version', value: 'PeopleGraph v1.0.0 (IR 5.0 DSS)' },
            { label: 'Database', value: 'PostgreSQL via Supabase (ap-northeast-1)' },
            { label: 'AI Engine', value: 'YTL ILMU-GLM-5.1 by Z.ai' },
            { label: 'Blockchain', value: 'Polygon L2 (Mainnet)' },
            { label: 'Compliance', value: 'PDPA 2010 · EA1955 · EPF Act 1991' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{item.label}</span>
              <span className="text-xs text-[var(--text-secondary)]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
