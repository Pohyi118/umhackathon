'use client';

/**
 * PeopleGraph — Manglish NLP Engine View
 * ========================================
 * Process unstructured WhatsApp/chat logs with Malaya NLP normalization.
 */

import { useState } from 'react';

const slangDictionary = {
  'kompom': 'confirm', 'otw': 'on the way', 'mc': 'medical certificate',
  'gg': 'gone/done for', 'saje': 'just/only', 'tapau': 'takeaway/pack',
  'gostan': 'reverse', 'cincai': 'whatever/careless', 'kiasu': 'afraid to lose',
  'syok': 'enjoyable', 'lepak': 'relax/hang out', 'jom': 'let\'s go',
};

export default function NLPView() {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      // Simulate Manglish normalization
      let normalized = inputText;
      const detectedSlang = [];

      // Strip suffixes
      normalized = normalized.replace(/\b(\w+)(la|lah|nya|kan|ke|meh)\b/gi, (match, word, suffix) => {
        detectedSlang.push({ original: match, normalized: word, type: 'suffix' });
        return word;
      });

      // Replace known slang
      Object.entries(slangDictionary).forEach(([slang, replacement]) => {
        const regex = new RegExp(`\\b${slang}\\b`, 'gi');
        if (regex.test(normalized)) {
          detectedSlang.push({ original: slang, normalized: replacement, type: 'slang' });
          normalized = normalized.replace(regex, replacement);
        }
      });

      // Mock sentiment
      const positiveWords = ['bagus', 'good', 'syok', 'best', 'ok', 'done', 'settled'];
      const negativeWords = ['problem', 'issue', 'lambat', 'late', 'tak', 'cannot', 'broken', 'rosak'];
      const words = normalized.toLowerCase().split(/\s+/);
      const posCount = words.filter(w => positiveWords.includes(w)).length;
      const negCount = words.filter(w => negativeWords.includes(w)).length;
      const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

      // Mock entities
      const entities = [];
      if (/\bRM\s?\d+/i.test(inputText)) entities.push({ type: 'currency', value: inputText.match(/RM\s?\d[\d,]*/i)?.[0] });
      if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|isnin|selasa|rabu|khamis|jumaat)\b/i.test(inputText))
        entities.push({ type: 'date', value: inputText.match(/\b(monday|tuesday|wednesday|thursday|friday|isnin|selasa|rabu|khamis|jumaat)\b/i)?.[0] });

      setResult({ normalized, detectedSlang, sentiment, entities, wordCount: words.length });
      setProcessing(false);
    }, 800);
  };

  const sampleTexts = [
    "Boss, hari ni warehouse team lambat la. Ahmad MC lagi, kompom tak datang. Siti otw tapi stuck jam kat LDP.",
    "Bro stock kosong dah la, customer complaint banyak nya. Kena restock cepat before Raya rush.",
    "Kak Yah dah settle semua invoice. Total RM45,000 collection this week. Syok la boss!",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Input Area */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Manglish NLP Processor</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Paste WhatsApp logs, inventory notes, or any unstructured Malaysian text. Our Malaya NLP engine will normalize slang, strip suffixes, and extract operational insights.
        </p>

        {/* Quick Templates */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mr-1 self-center">Samples:</span>
          {sampleTexts.map((text, i) => (
            <button key={i} onClick={() => setInputText(text)}
              className="px-2.5 py-1 rounded-lg text-[10px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)]
                         hover:border-[var(--border-focus)] transition-all duration-200 truncate max-w-[200px]">
              {text.substring(0, 40)}...
            </button>
          ))}
        </div>

        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste WhatsApp log, inventory note, or any Manglish text here..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--bg-input)] text-[var(--text-primary)]
                     placeholder:text-[var(--text-muted)] border border-[var(--border)]
                     focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30
                     transition-all duration-200 resize-none leading-relaxed"
        />

        <button onClick={handleProcess} disabled={processing || !inputText.trim()}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]
                     flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', opacity: processing || !inputText.trim() ? 0.6 : 1 }}>
          {processing ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
          ) : 'Process with Malaya NLP'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fadeInUp" style={{ opacity: 1 }}>
          {/* Normalized Output */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Normalized Output</h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              {result.normalized}
            </p>
          </div>

          {/* Detected Slang */}
          {result.detectedSlang.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Detected Manglish ({result.detectedSlang.length} normalizations)
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.detectedSlang.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <span className="text-red-400 line-through">{s.original}</span>
                    <span className="text-[var(--text-muted)]">→</span>
                    <span className="text-emerald-400 font-semibold">{s.normalized}</span>
                    <span className="text-[var(--text-muted)] px-1 rounded bg-[var(--bg-card)]">{s.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment + Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Sentiment</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {result.sentiment === 'positive' ? '😊' : result.sentiment === 'negative' ? '😟' : '😐'}
                </span>
                <div>
                  <p className={`text-sm font-bold capitalize ${
                    result.sentiment === 'positive' ? 'text-emerald-400' :
                    result.sentiment === 'negative' ? 'text-red-400' : 'text-[var(--text-muted)]'
                  }`}>{result.sentiment}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{result.wordCount} words analyzed</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Extracted Entities</h3>
              {result.entities.length > 0 ? (
                <div className="space-y-1.5">
                  {result.entities.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--primary)]/10 text-[var(--primary-light)] uppercase">{e.type}</span>
                      <span className="text-xs text-[var(--text-primary)]">{e.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">No named entities detected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
