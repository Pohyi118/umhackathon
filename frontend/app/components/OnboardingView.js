'use client';

/**
 * PeopleGraph — Business Profile & Onboarding
 * ==============================================
 * Personalized onboarding via semantic business description.
 * Users describe their business goals and needs in natural language,
 * and GLM AI (ILMU-GLM-5.1) analyzes it to recommend modules.
 */

import { useState } from 'react';

const availableModules = [
  { id: 'payroll', name: 'Payroll & Statutory', desc: 'EPF, SOCSO, EIS, PCB auto-calculation', price: 49, icon: '💰' },
  { id: 'attendance', name: 'Time & Attendance', desc: 'Clock-in/out, OT tracking, EA1955 compliance', price: 29, icon: '⏰' },
  { id: 'dss', name: 'Digital Twin DSS', desc: 'Force-directed org simulation & predictive hiring', price: 99, icon: '🧬' },
  { id: 'anomaly', name: 'Anomaly Detection', desc: 'Isolation Forest fraud & irregularity detection', price: 49, icon: '🔍' },
  { id: 'nlp', name: 'Manglish NLP Engine', desc: 'WhatsApp/unstructured data processing for MY context', price: 39, icon: '💬' },
  { id: 'blockchain', name: 'Blockchain Escrow', desc: 'Polygon L2 gig-worker payment & audit trail', price: 79, icon: '⛓️' },
  { id: 'sentiment', name: 'Sentiment Analytics', desc: 'Team energy pulse surveys with HuggingFace NLP', price: 29, icon: '😊' },
  { id: 'benchmark', name: 'Industry Benchmarks', desc: 'Compare your metrics against MY SME averages', price: 19, icon: '📊' },
];

export default function OnboardingView() {
  const [step, setStep] = useState(1);
  const [businessDesc, setBusinessDesc] = useState('');
  const [businessDetails, setBusinessDetails] = useState({
    companyName: '',
    industry: '',
    headcount: '',
    revenue: '',
    hrNeeds: '',
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    // Simulate GLM AI analysis (in production, this calls ILMU-GLM-5.1)
    setTimeout(() => {
      const headcount = parseInt(businessDetails.headcount) || 10;
      const isRetail = businessDesc.toLowerCase().includes('retail') || businessDesc.toLowerCase().includes('kedai') || businessDetails.industry.toLowerCase().includes('retail');
      const needsOT = businessDesc.toLowerCase().includes('overtime') || businessDesc.toLowerCase().includes('ot') || businessDesc.toLowerCase().includes('shift');
      const needsGig = businessDesc.toLowerCase().includes('freelance') || businessDesc.toLowerCase().includes('part-time') || businessDesc.toLowerCase().includes('seasonal');
      const needsWhatsApp = businessDesc.toLowerCase().includes('whatsapp') || businessDesc.toLowerCase().includes('chat');

      const recommended = ['payroll', 'attendance'];
      if (headcount >= 15) recommended.push('dss');
      if (headcount >= 10) recommended.push('anomaly');
      if (needsWhatsApp || isRetail) recommended.push('nlp');
      if (needsGig || isRetail) recommended.push('blockchain');
      if (headcount >= 5) recommended.push('sentiment');
      recommended.push('benchmark');

      const monthlyTotal = availableModules
        .filter(m => recommended.includes(m.id))
        .reduce((s, m) => s + m.price, 0);

      setRecommendations({
        modules: recommended,
        monthlyTotal,
        insights: [
          headcount >= 15
            ? `With ${headcount} employees, the Digital Twin simulation will help you model restructuring before committing resources.`
            : `At ${headcount} employees, focus on automating statutory compliance first to save 8+ hours/month.`,
          isRetail
            ? 'Retail businesses in Malaysia benefit significantly from Manglish NLP to process unstructured supplier communications.'
            : 'Consider enabling NLP later as your communication channels grow.',
          needsGig
            ? 'Blockchain escrow will streamline your freelancer payments during peak seasons like CNY and Raya.'
            : 'Blockchain escrow can be added later when you start outsourcing.',
          `You may be eligible for the MSME Digital Grant Madani 2025 — up to RM5,000 (50% matching) for digital adoption.`,
        ],
        grantEligible: headcount <= 200,
      });

      setSelectedModules(recommended);
      setAnalyzing(false);
      setStep(3);
    }, 1500);
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectedTotal = availableModules
    .filter(m => selectedModules.includes(m.id))
    .reduce((s, m) => s + m.price, 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= s
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            }`}>
              {step > s ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              {s === 1 ? 'Company Info' : s === 2 ? 'Describe Needs' : 'Recommendations'}
            </span>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Company Details */}
      {step === 1 && (
        <div className="card p-6 animate-fadeInUp" style={{ opacity: 1 }}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Tell us about your business</h2>
          <p className="text-xs text-[var(--text-muted)] mb-6">We&apos;ll personalize PeopleGraph to fit your exact SME needs.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Company Name</label>
              <input
                type="text"
                value={businessDetails.companyName}
                onChange={(e) => setBusinessDetails(p => ({ ...p, companyName: e.target.value }))}
                placeholder="e.g. Chong Wholesale Sdn Bhd"
                className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] border border-[var(--border)]
                           focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30
                           transition-all duration-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Industry</label>
                <select
                  value={businessDetails.industry}
                  onChange={(e) => setBusinessDetails(p => ({ ...p, industry: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                             border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none
                             transition-all duration-200"
                >
                  <option value="">Select industry</option>
                  <option value="retail">Retail & Wholesale</option>
                  <option value="fnb">F&B / Restaurant</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Professional Services</option>
                  <option value="tech">Technology / IT</option>
                  <option value="construction">Construction</option>
                  <option value="logistics">Logistics & Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Approx. Headcount</label>
                <input
                  type="number"
                  value={businessDetails.headcount}
                  onChange={(e) => setBusinessDetails(p => ({ ...p, headcount: e.target.value }))}
                  placeholder="e.g. 14"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                             placeholder:text-[var(--text-muted)] border border-[var(--border)]
                             focus:border-[var(--border-focus)] focus:outline-none
                             transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Approx. Monthly Revenue (RM)</label>
              <input
                type="text"
                value={businessDetails.revenue}
                onChange={(e) => setBusinessDetails(p => ({ ...p, revenue: e.target.value }))}
                placeholder="e.g. 500,000"
                className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] border border-[var(--border)]
                           focus:border-[var(--border-focus)] focus:outline-none
                           transition-all duration-200"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Semantic Description */}
      {step === 2 && (
        <div className="card p-6 animate-fadeInUp" style={{ opacity: 1 }}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Describe your HR needs</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Write naturally about your business challenges. Our AI (powered by ILMU-GLM-5.1) will analyze and recommend the right modules.
          </p>

          <textarea
            value={businessDesc}
            onChange={(e) => setBusinessDesc(e.target.value)}
            placeholder="e.g. We are a retail wholesale company with 14 staff. We struggle with tracking overtime hours for warehouse workers — they often claim OT but we can't verify via WhatsApp logs. We also hire part-time workers during Raya season and need a fast payment system. Our payroll is still done manually in Excel..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                       placeholder:text-[var(--text-muted)] border border-[var(--border)]
                       focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30
                       transition-all duration-200 resize-none leading-relaxed"
          />

          <div className="flex items-center gap-2 mt-2 mb-4">
            <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] text-[var(--text-muted)]">
              You can write in English, BM, or Manglish. Our NLP engine understands all three.
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)]
                         hover:bg-[var(--bg-elevated)] transition-all duration-200"
            >
              Back
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !businessDesc.trim()}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]
                         flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                opacity: analyzing || !businessDesc.trim() ? 0.6 : 1,
              }}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with GLM AI...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze & Recommend
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Recommendations */}
      {step === 3 && recommendations && (
        <div className="space-y-5 animate-fadeInUp" style={{ opacity: 1 }}>
          {/* AI Insights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Recommendations</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--primary)]/10 text-[var(--primary-light)]">
                ILMU-GLM-5.1
              </span>
            </div>
            <div className="space-y-2">
              {recommendations.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-emerald-400 text-xs mt-0.5">●</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>

            {recommendations.grantEligible && (
              <div className="mt-3 p-3 rounded-lg flex items-start gap-2"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-xs font-bold text-emerald-400">MSME Digital Grant Madani 2025</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Your business may qualify for up to RM5,000 (50% matching) to subsidize PeopleGraph adoption.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Module Selection */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Your Recommended Modules</h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-4">Toggle modules on/off to customize your plan. Pay only for what you use.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableModules.map(mod => {
                const isSelected = selectedModules.includes(mod.id);
                const isRecommended = recommendations.modules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-focus)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mod.icon}</span>
                        <div>
                          <p className={`text-xs font-semibold ${isSelected ? 'text-[var(--primary-light)]' : 'text-[var(--text-primary)]'}`}>
                            {mod.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{mod.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[var(--text-primary)]">RM{mod.price}/mo</span>
                        {isRecommended && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400">
                            AI PICK
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pricing Summary */}
            <div className="mt-5 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(16,185,129,0.05))', border: '1px solid rgba(124,58,237,0.15)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary)]">{selectedModules.length} modules selected</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-[var(--text-primary)]">RM{selectedTotal}</span>
                  <span className="text-xs text-[var(--text-muted)]">/month</span>
                </div>
              </div>
              {recommendations.grantEligible && (
                <p className="text-[10px] text-emerald-400">
                  With Digital Grant Madani: as low as RM{Math.round(selectedTotal * 0.5)}/month for first year
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)]
                           hover:bg-[var(--bg-elevated)] transition-all duration-200"
              >
                Re-analyze
              </button>
              <button
                className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
              >
                Activate Selected Modules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
