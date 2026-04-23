"use client";

import { useNavigation } from "../context/NavigationContext";

export default function Overview() {
  const { setActiveView } = useNavigation();
  const actions = [
    {
      tone: "red",
      title: "AUTOMATE: Admin Waybills",
      insight: "3 Admin Clerks spend 120hrs/week manually typing J&T waybills.",
      impactPrefix: "Deploy AI OCR API. Saves ",
      impactHighlight: "RM 4,500/mo",
      impactSuffix: " & shifts staff to VIP retention.",
      cta: "Deploy Automation",
    },
    {
      tone: "green",
      title: "HIRE: Supply Chain Bottleneck",
      insight: "Adding Sales Reps will cause a 4-day shipping delay during the Raya peak.",
      impactPrefix: "Freeze sales hiring. Hire 1 Supply Chain Manager to unlock ",
      impactHighlight: "+30% capacity",
      impactSuffix: ".",
      cta: "View Candidate Pipeline",
    },
    {
      tone: "yellow",
      title: "OUTSOURCE: Seasonal Overhead",
      insight: "Graphic Designer ROI drops 60% during the off-season (May-Aug).",
      impactPrefix: "Transition to freelance Escrow for Q4/Q1. Reduces fixed overhead by ",
      impactHighlight: "RM 60k/yr",
      impactSuffix: ".",
      cta: "Setup Escrow Contract",
    },
  ];

  const toneStyles = {
    red: {
      glow: "from-red-500/35 via-red-500/10 to-transparent",
      border: "border-red-500/30",
    },
    green: {
      glow: "from-emerald-500/35 via-emerald-500/10 to-transparent",
      border: "border-emerald-500/30",
    },
    yellow: {
      glow: "from-amber-500/35 via-amber-500/10 to-transparent",
      border: "border-amber-500/30",
    },
  };

  return (
    <div className="space-y-4 max-h-[140vh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
            Revenue vs. Labor Cost (Current Month)
          </p>
          <p className="text-2xl font-bold text-emerald-400">RM 783,400</p>
          <p className="text-xs text-slate-400 mt-1">Labor Cost: RM 186,400 (23.8% ratio)</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
            Labor Efficiency Ratio (LER)
          </p>
          <p className="text-2xl font-bold text-white">RM 4.20</p>
          <p className="text-xs text-slate-400 mt-1">RM earned per RM 1 spent. 0% above avg</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
            Raya Peak Readiness
          </p>
          <p className="text-2xl font-bold text-amber-400">4 Weeks to Peak</p>
          <p className="text-xs text-slate-400 mt-1">Current fulfillment capacity at 82% (High Risk)</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-sm p-4">
        <div className="mb-3">
          <h2 className="text-sm md:text-base font-semibold text-white">
            Decision Intelligence: +30% Revenue Target Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {actions.map((action) => (
            <article
              key={action.title}
              className="relative rounded-xl border border-white/10 bg-slate-950/70 p-4 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${toneStyles[action.tone].glow}`} />
              <div
                className={`absolute -top-16 left-6 w-48 h-24 blur-2xl bg-gradient-to-b ${toneStyles[action.tone].glow} pointer-events-none`}
              />
              <div className={`inline-block mb-3 px-2 py-1 rounded-md text-[9px] uppercase tracking-wider border ${toneStyles[action.tone].border} text-slate-300`}>
                Priority Action
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{action.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{action.insight}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {action.impactPrefix}
                <span className="text-purple-400 font-semibold">{action.impactHighlight}</span>
                {action.impactSuffix}
              </p>
              <button className="w-full rounded-lg bg-purple-500 hover:bg-purple-400 transition-colors text-white text-xs font-semibold py-2.5">
                {action.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4">
        <h3 className="text-gray-300 text-lg font-semibold mb-4">
          Priority Business Optimization Summary: Raya Peak &amp; Resource Efficiency
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-red-400 mb-1">Manual Waybill Waste</p>
            <p className="text-base font-bold text-white">RM 4,500/mo lost</p>
            <p className="text-xs text-slate-400 mt-1">To 120hrs/week of manual entry.</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-emerald-400 mb-1">Raya Peak Critical Risk</p>
            <p className="text-base font-bold text-white">Logistics capacity capped at 82%</p>
            <p className="text-xs text-slate-400 mt-1">Due to 4 staff on sudden leave.</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-amber-400 mb-1">Designer Fixed Cost Review</p>
            <p className="text-base font-bold text-white">Utilization &lt; 40%</p>
            <p className="text-xs text-slate-400 mt-1">Off-season inefficiency.</p>
          </article>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Executive Intelligence Conversation
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button className="px-3 py-1.5 rounded-full border border-purple-500/50 text-xs text-purple-200 hover:bg-purple-500/10 transition-colors">
              How can I reduce the waybill cost faster?
            </button>
            <button className="px-3 py-1.5 rounded-full border border-purple-500/50 text-xs text-purple-200 hover:bg-purple-500/10 transition-colors">
              What&apos;s the best logistics strategy for Q4?
            </button>
            <button className="px-3 py-1.5 rounded-full border border-purple-500/50 text-xs text-purple-200 hover:bg-purple-500/10 transition-colors">
              Show projected refund risk if sales grows 20%
            </button>
          </div>

          <div className="rounded-lg bg-black/20 border border-white/10 p-3 space-y-3 min-h-[180px] mb-3">
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-xl rounded-br-sm bg-purple-500/20 border border-purple-400/30 px-3 py-2">
                <p className="text-xs text-slate-100">Why shouldn&apos;t I hire salespeople?</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[85%] border-l-2 border-purple-500 pl-3 py-1">
                <p className="text-xs leading-relaxed text-slate-200">
                  Based on 1,200 WhatsApp logs, warehouse fulfillment is capping at 82%. Hiring sales will increase
                  refund rates. Focus on logistics first.
                  <span className="text-purple-200 italic">
                    {' '}
                    Note: We also detected a high correlation between negative WhatsApp sentiment and waybill printer
                    complaints during last year&apos;s 11.11 sale.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask the data..."
              className="flex-1 h-10 rounded-lg border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white transition-colors"
              style={{ background: '#8B5CF6' }}
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
