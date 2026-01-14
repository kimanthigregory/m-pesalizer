// src/components/Layout.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  TrendingUp,
  Wallet,
  Repeat,
  Users,
  Download,
} from "lucide-react";

// Reusable Glass Card Component
export const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}
  >
    {children}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group
      ${
        active
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white"
          : "hover:bg-white/5 text-gray-400 hover:text-white"
      }`}
  >
    <Icon
      size={20}
      className={
        active ? "text-emerald-400" : "text-gray-400 group-hover:text-white"
      }
    />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState("Overview");

  const navItems = [
    { id: "Overview", icon: LayoutDashboard, label: "Overview" },
    { id: "Transactions", icon: ListOrdered, label: "Transactions" },
    { id: "Trends", icon: TrendingUp, label: "Trends" },
    { id: "Fees", icon: Wallet, label: "Fees & Charges" },
    { id: "Recurring", icon: Repeat, label: "Recurring" },
    { id: "Recipients", icon: Users, label: "Recipients" },
    { id: "Export", icon: Download, label: "Export" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-emerald-500/30">
      {/* Background Gradients for Glass Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="p-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              M-Pesa VIZ
            </h1>
            <p className="text-xs text-gray-500 mt-1">Financial Clarity</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={() => setActivePage(item.id)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-xs">
                JS
              </div>
              <div className="text-xs">
                <p className="font-medium text-white">John Doe</p>
                <p className="text-gray-500">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            {/* Header Area */}
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {activePage}
                </h2>
                <p className="text-gray-400 mt-1">
                  {activePage === "Overview"
                    ? "Financial health at a glance."
                    : "Detailed analysis."}
                </p>
              </div>

              {/* Date Range Place holder */}
              <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300">
                <span>Oct 13, 2024</span>
                <span className="text-gray-600">→</span>
                <span>Oct 14, 2024</span>
              </div>
            </header>

            {/* Dynamic Content - For now we hardcode Dashboard */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
