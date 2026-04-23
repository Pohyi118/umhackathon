/**
 * StrategicInsightPanel Component Reference
 * ==========================================
 * Complete technical specification and implementation guide.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE LOCATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 frontend/app/components/StrategicInsightPanel.js

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT SIGNATURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StrategicInsightPanelProps {
  baseSalary: number;    // Employee monthly base salary (e.g., 3500)
  trueCost: number;      // Total monthly cost to employer (e.g., 3955 = salary + EPF + SOCSO + EIS)
}

export default function StrategicInsightPanel({ 
  baseSalary = 3500, 
  trueCost = 3955 
}): React.ReactElement;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE IN StatutoryView.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ CORRECT INTEGRATION (Already implemented)
import StrategicInsightPanel from './StrategicInsightPanel';

export default function StatutoryView() {
  const [salary, setSalary] = useState(3500);
  
  // ... statutory calculations ...
  
  const totalEmployerCost = salary + epfEmployer + socsoEmployer + eisEmployer;
  
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Statutory Calculator Card */}
      <div className="card p-6">
        {/* ... salary slider, breakdown table, etc ... */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>Net Take-Home</div>
          <div>True Employer Cost</div>
        </div>
      </div>

      {/* 🆕 Strategic Insight Panel inserted here */}
      <StrategicInsightPanel 
        baseSalary={salary}           // ✅ Reactive: updates when salary slider changes
        trueCost={totalEmployerCost}  // ✅ Reactive: updates when calculations change
      />

      {/* Upcoming Compliance Card */}
      <div className="card p-6">
        {/* ... compliance items ... */}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL STATE & HOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const [mode, setMode] = useState('roi');                    // 'roi' | 'severance'
const [expectedRevenue, setExpectedRevenue] = useState(...); // User-controlled slider
const [yearsOfService, setYearsOfService] = useState(5);    // User-controlled slider

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPUTED VALUES (ROI MODE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

targetBreakeven      = trueCost * 3                                    // RM [X,XXX]
roiIsPositive        = expectedRevenue >= targetBreakeven              // boolean
roiPercentage        = (expectedRevenue / targetBreakeven * 100)       // "150%", "63%", etc.

// Examples:
// trueCost = 3955 RM
// targetBreakeven = 11,865 RM (3x multiple)
// If expectedRevenue = 15,000 RM → roiPercentage = "126%" → Profitable Hire 🟢
// If expectedRevenue = 7,000 RM → roiPercentage = "59%" → High-Risk Hire 🔴

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPUTED VALUES (SEVERANCE MODE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

severanceDaysPerYear = tenure < 2 ? 10 : tenure < 5 ? 15 : 20         // 10 | 15 | 20
dailyWage            = baseSalary / 26                                  // RM [XXX.XX]
severanceCost        = severanceDaysPerYear * yearsOfService * dailyWage // RM [X,XXX]
recoveryMonths       = severanceCost / trueCost                        // "12.5", "8.3", etc.

// Examples:
// baseSalary = 3500 RM
// dailyWage = 134.62 RM (3500 ÷ 26)
// yearsOfService = 5
// severanceDaysPerYear = 15 (because 5 years falls in 2-5 range)
// severanceCost = 15 × 5 × 134.62 = 10,096.50 RM
// trueCost = 3955 RM
// recoveryMonths = 10,096.50 / 3955 = "2.55" months

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDERING LOGIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 🎯 ROI MODE (when mode === 'roi')
// ──────────────────────────────────
// Displays:
//   1. "Expected Monthly Revenue" slider (min: trueCost, max: trueCost × 10, step: 100)
//   2. Target Break-Even card (shows 3x multiple)
//   3. Verdict box:
//      ├─ 🟢 Profitable Hire (if expectedRevenue >= targetBreakeven)
//      │   Background: rgba(16,185,129,0.06) — emerald tint
//      │   Border: rgba(16,185,129,0.3)
//      └─ 🔴 High-Risk Hire (if expectedRevenue < targetBreakeven)
//          Background: rgba(239,68,68,0.06) — red tint
//          Border: rgba(239,68,68,0.3)
//   4. Progress bar (0% to 100%+, capped at screen):
//      ├─ Green gradient (purple → cyan) if profitable
//      └─ Orange gradient (orange → red) if high-risk
//   5. "Coverage Progress" percentage display

// 🎯 SEVERANCE MODE (when mode === 'severance')
// ───────────────────────────────────────────────
// Displays:
//   1. "Years of Service" slider (min: 1, max: 30)
//   2. Severance breakdown card:
//      ├─ Formula: [10/15/20] days/year
//      ├─ Daily Wage: RM [XXX.XX]
//      └─ Total Severance: RM [X,XXX]
//   3. Verdict box (always amber):
//      ├─ 🟡 [X] Months to Recover Severance
//      ├─ Background: rgba(245,158,11,0.06)
//      └─ Border: rgba(245,158,11,0.3)
//   4. Recovery Timeline progress bar:
//      ├─ Gradient: orange → red
//      ├─ Width: min(recoveryMonths / 24, 1) × 100%
//      └─ Capped at 100% width for 24+ month scenarios

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOGGLE SWITCH BEHAVIOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Location: Top-right of panel header
// Style: Pill-shaped container (rounded-full), dark background
// Active button: bg-purple-600 text-white
// Inactive button: text-muted, hover darkens
// Animation: Smooth transition (duration-200)

<div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
  <button
    onClick={() => setMode('roi')}
    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
      mode === 'roi' ? 'bg-purple-600 text-white' : 'text-[var(--text-muted)]'
    }`}
  >
    Hiring ROI
  </button>
  <button
    onClick={() => setMode('severance')}
    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
      mode === 'severance' ? 'bg-purple-600 text-white' : 'text-[var(--text-muted)]'
    }`}
  >
    Severance Risk
  </button>
</div>

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACTIONABLE SUMMARY BOX
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Location: Bottom of panel (always visible, both modes)
// Background: var(--bg-elevated)
// Border: var(--border)
// Content: Humanized one-sentence explanation

// ROI MODE examples:
// ✅ "Expected revenue of RM 15,000 exceeds the RM 11,865 breakeven target—this hire generates 
//     surplus value within ~3.3 months."
// ❌ "Revenue projection of RM 7,000 falls short by RM 4,865. Consider increasing productivity 
//     expectations or optimizing role scope before hiring."

// SEVERANCE MODE examples:
// ⚠️  "Based on 5-year tenure and severance formula of 15 days/year, severance cost is RM 10,096—
//     recoverable in ~2.5 months of operational value."

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLING & TAILWIND CLASSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// CSS Variables Used (all dashboard-standard):
// • var(--bg-card) — Main card background
// • var(--bg-elevated) — Slightly lighter nested background
// • var(--border) — Subtle border color
// • var(--text-primary) — Main text color (white-ish)
// • var(--text-secondary) — Secondary text color
// • var(--text-muted) — Muted/gray text
// • var(--primary-light) — Primary accent lighter shade

// Tailwind Classes:
// • text-[10px]/[9px]/[xs] — Font sizes for labels/values
// • text-amber-400/emerald-400/red-400 — Semantic colors
// • bg-purple-600 — Active toggle
// • rounded-full/rounded-xl — Border radius variants
// • border-gray-800 — Card borders (dark mode)
// • transition-all duration-200/300 — Smooth animations

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSIVE BEHAVIOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// • Mobile (< 640px): Full-width, stacked layout adapts gracefully
// • Tablet/Desktop: Inherits parent max-w-3xl constraint from StatutoryView
// • All sliders: Touch-friendly (min height), smooth drag
// • All progress bars: Capped at 100% visual width, percentages may exceed 100%

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERFORMANCE NOTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// • Component re-renders when baseSalary or trueCost props change
// • Uses local state (mode, expectedRevenue, yearsOfService) for quick interactions
// • Computed values recalculate on every render (lightweight math)
// • No external API calls or side effects
// • No images or heavy assets
// • Summary text generation happens on-render (memoize if needed for large datasets)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TESTING CHECKLIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// [ ] Toggle between Hiring ROI and Severance Risk modes
// [ ] ROI mode: Slider from min to max updates percentage 0% → 200%+
// [ ] ROI mode: Verdict changes from 🔴 to 🟢 at >= 100% mark
// [ ] ROI mode: Progress bar color switches (orange/red to purple/cyan)
// [ ] Severance mode: Slider from 1-30 years shows correct days-per-year
// [ ] Severance mode: Severance cost & recovery months update realistically
// [ ] Summary text generates humanized, grammatically correct sentences
// [ ] Summary text reflects current slider values accurately
// [ ] Dark mode colors apply correctly (no bright/jarring colors)
// [ ] Responsive: works on mobile, tablet, desktop
// [ ] Accessibility: all sliders keyboard accessible, labels descriptive
// [ ] Props update correctly when parent salary slider changes
// [ ] No console errors or warnings

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTEGRATION WITH STATUTORY MATH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// The component receives trueCost (True Employer Cost) from StatutoryView:
// 
// trueCost = salary + epfEmployer + socsoEmployer + eisEmployer
// 
// This means when the user moves the salary slider in StatutoryView:
// 1. EPF/SOCSO/EIS calculations update
// 2. trueCost is recalculated
// 3. StrategicInsightPanel receives new trueCost prop
// 4. All verdicts/progress bars update reactively
// 
// No additional API calls needed—all logic is client-side math.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMIZATION EXAMPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Example 1: Change ROI breakeven from 3x to 2.5x
// Line 19: const targetBreakeven = trueCost * 2.5;

// Example 2: Change severance days per year
// Lines 22-23:
// const severanceDaysPerYear = 
//   yearsOfService < 2 ? 12 : 
//   yearsOfService < 5 ? 18 : 
//   24;

// Example 3: Change slider ranges
// ROI Revenue slider (line 78): min={trueCost * 0.5} max={trueCost * 15}
// Severity slider (line 141): min="0.5" max="50"

// Example 4: Add additional verdict thresholds
// if (roiPercentage >= 200) return "🟢🟢 Exceptional Hire";
// if (roiPercentage >= 100) return "🟢 Profitable Hire";
// etc...
