"use client";

/**
 * PeopleGraph — Main Application Shell
 * =======================================
 * Sidebar navigation + dynamic view rendering.
 * All views are client-side routed for clickable prototype speed.
 *
 * Layout:
 * ┌─────────┬────────────────────────────────────────┐
 * │ Sidebar │  Header + Active View Content          │
 * │         │                                         │
 * │ Nav     │  Dashboard / Simulation / Compliance /  │
 * │ Items   │  Anomaly / NLP / Blockchain /           │
 * │         │  Onboarding / Settings                  │
 * └─────────┴────────────────────────────────────────┘
 */

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";

// Dashboard cards
import FinanceCard from "./components/FinanceCard";
import HeadcountCard from "./components/HeadcountCard";
import AttendanceHeatmap from "./components/AttendanceHeatmap";
import TeamEnergyCard from "./components/TeamEnergyCard";
import DepartmentSplitCard from "./components/DepartmentSplitCard";
import PipelineActivityCard from "./components/PipelineActivityCard";
import DigitalTwinSimulation from "./components/DigitalTwinSimulation";
import PredictiveSimulation from "./components/PredictiveSimulation";
import CostProductivityMatrix from "./components/CostProductivityMatrix";

// Full-page views
import StatutoryView from "./components/StatutoryView";
import AnomalyView from "./components/AnomalyView";
import NLPView from "./components/NLPView";
import BlockchainView from "./components/BlockchainView";
import OnboardingView from "./components/OnboardingView";
import SettingsView from "./components/SettingsView";

const viewTitles = {
  dashboard: { title: "Overview Dashboard", subtitle: "Real-time workforce intelligence for your organization" },
  simulation: { title: "Digital Twin Simulation", subtitle: "Interactive force-directed organizational modeling" },
  compliance: { title: "Statutory Compliance", subtitle: "Malaysian employment law calculator (EA1955, EPF, SOCSO, EIS)" },
  anomaly: { title: "Anomaly Detection", subtitle: "Isolation Forest forensic audit of attendance and payroll" },
  nlp: { title: "Manglish NLP Engine", subtitle: "Process unstructured Malaysian text with Malaya NLP" },
  blockchain: { title: "Blockchain Escrow", subtitle: "Polygon L2 gig-worker payments and audit trail" },
  onboarding: { title: "Business Profile", subtitle: "Personalize PeopleGraph with AI-powered module recommendations" },
  settings: { title: "Settings", subtitle: "API keys, language, and system configuration" },
};

export default function AppShell() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentView = viewTitles[activeView] || viewTitles.dashboard;
  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {currentView.title}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {currentView.subtitle}
            </p>
          </div>

          {/* ── Dashboard View ──────────────────────────────────── */}
          {activeView === "dashboard" && (
            <div className="space-y-5">
              {/* Row 1: Finance + Headcount */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 animate-fadeInUp stagger-1" style={{ opacity: 0 }}>
                  <FinanceCard />
                </div>
                <div className="animate-fadeInUp stagger-2" style={{ opacity: 0 }}>
                  <HeadcountCard />
                </div>
              </div>

              {/* Row 2: Attendance + Energy + Department */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="animate-fadeInUp stagger-3" style={{ opacity: 0 }}>
                  <AttendanceHeatmap />
                </div>
                <div className="animate-fadeInUp stagger-4" style={{ opacity: 0 }}>
                  <TeamEnergyCard />
                </div>
                <div className="animate-fadeInUp stagger-5" style={{ opacity: 0 }}>
                  <DepartmentSplitCard />
                </div>
              </div>

              {/* Row 3: Cost-Productivity + Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 animate-fadeInUp stagger-6" style={{ opacity: 0 }}>
                  <CostProductivityMatrix />
                </div>
                <div className="animate-fadeInUp stagger-6" style={{ opacity: 0 }}>
                  <PipelineActivityCard />
                </div>
              </div>

              {/* Row 4: AI Insight Card */}
              <div className="animate-fadeInUp stagger-6" style={{ opacity: 0 }}>
                <div className="card p-5 relative overflow-hidden">
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                    style={{ background: "rgba(124, 58, 237, 0.15)" }}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                      AI Insight
                    </h3>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--primary)]/10 text-[var(--primary-light)]">
                      NEW
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
                    Last quarter, your <span className="text-[var(--primary-light)] font-semibold">tech hires generated 3.2x ROI</span> within 90 days.
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Conversely, operational admin costs are{" "}
                    <span className="text-amber-400 font-semibold">40% above industry benchmarks</span>.
                    Consider automation for data-entry roles.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: "87%" }} />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">87% confidence</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Simulation View ─────────────────────────────────── */}
          {activeView === "simulation" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <DigitalTwinSimulation />
              </div>
              <div>
                <PredictiveSimulation />
              </div>
            </div>
          )}

          {/* ── Full-page Views ─────────────────────────────────── */}
          {activeView === "compliance" && <StatutoryView />}
          {activeView === "anomaly" && <AnomalyView />}
          {activeView === "nlp" && <NLPView />}
          {activeView === "blockchain" && <BlockchainView />}
          {activeView === "onboarding" && <OnboardingView />}
          {activeView === "settings" && <SettingsView />}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[var(--border)]">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <p className="text-[10px] text-[var(--text-muted)]">
              © 2025 PeopleGraph — Decision Support for Malaysian SMEs
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--text-muted)]">PDPA Compliant</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="text-[10px] text-[var(--text-muted)]">Supabase (ap-northeast-1)</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400">All Systems Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
