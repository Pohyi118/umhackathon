'use client';

/**
 * PeopleGraph — Manglish NLP Engine
 * ==================================
 * Process unstructured Malaysian text with Malaya NLP
 * for immediate business decisions.
 */

import { useState, useRef, useEffect } from 'react';

export default function NLPView() {
  const [messages, setMessages] = useState([
    {
      role: 'user',
      content: 'Boss, budak warehouse 3 orang MC harini. Barang J&T semalam tak jalan lagi. Gila babi byk order masuk sbb Raya. Camne ni?',
      timestamp: new Date(),
    },
    {
      role: 'assistant',
      type: 'structured',
      header: 'AI Extraction Complete',
      threat: 'CRITICAL',
      department: 'Logistics & Fulfillment',
      issue: '3 Staff Absent (MC) + High Raya Volume backlog. J&T processing halted.',
      action: 'Deploy 2 Temp Staff via Escrow',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Mock AI response - for demo, just add a simple response
      const assistantMessage = {
        role: 'assistant',
        content: 'Input processed. Analyzing for operational insights...',
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, assistantMessage]);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Analyze today\'s Warehouse WhatsApp Group',
    'Why is the J&T waybill processing so slow?',
    'Extract OT claims from Admin logs',
  ];

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
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              // User Message
              <div className="max-w-[70%] bg-gray-800 px-4 py-3 rounded-2xl rounded-br-md">
                <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {msg.timestamp.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : msg.type === 'structured' ? (
              // Structured AI Response
              <div className="max-w-[80%] bg-black/40 border border-purple-500/30 rounded-xl p-4">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-400 text-sm font-semibold">AI Extraction Complete</span>
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-bold">Threat: CRITICAL</span>
                </div>
                {/* Card Body */}
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-slate-400 text-sm">Department:</span>
                    <span className="text-white font-semibold ml-2">{msg.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Core Issue:</span>
                    <span className="text-white font-semibold ml-2">{msg.issue}</span>
                  </div>
                </div>
                {/* Card Footer / Action */}
                <button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                  {msg.action}
                </button>
              </div>
            ) : (
              // Regular AI Response
              <div className="max-w-[70%] bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                <p className="text-slate-400 text-xs mt-2">
                  {msg.timestamp.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/10">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Suggestion Bar */}
      <div className="px-1">
        {/* Suggested Prompts */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="flex-shrink-0 px-4 py-2 rounded-full border border-white/20 text-slate-300 hover:text-white hover:border-white/40 transition-colors text-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste Manglish text, WhatsApp logs, or ask a question..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm bg-gray-900 text-white placeholder:text-slate-400 border border-white/10 focus:border-purple-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="px-4 rounded-xl text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors flex items-center gap-2 self-end disabled:opacity-50"
            style={{ height: '48px' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
