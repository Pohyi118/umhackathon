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
import Overview from "./components/Overview";
import { NavigationProvider } from "./context/NavigationContext";

// Dashboard cards
import DigitalTwinSimulation from "./components/DigitalTwinSimulation";
import PredictiveSimulation from "./components/PredictiveSimulation";

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

          <NavigationProvider setActiveView={setActiveView}>
            {/* ── Dashboard View ──────────────────────────────────── */}
            {activeView === "dashboard" && (
              <Overview />
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
          </NavigationProvider>
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
