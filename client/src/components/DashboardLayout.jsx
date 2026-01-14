import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListOrdered,
  TrendingUp,
  Wallet,
  Repeat,
  Users,
  Download,
} from "lucide-react";

export default function DashboardLayout() {
  const navItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      label: "Overview",
      path: "/dashboard",
    },
    {
      id: "transactions",
      icon: ListOrdered,
      label: "Transactions",
      path: "/dashboard/transactions",
    },
    {
      id: "trends",
      icon: TrendingUp,
      label: "Trends",
      path: "/dashboard/trends",
    },
    { id: "fees", icon: Wallet, label: "Fees", path: "/dashboard/fees" },
    {
      id: "recurring",
      icon: Repeat,
      label: "Recurring",
      path: "/dashboard/recurring",
    },
    {
      id: "recipients",
      icon: Users,
      label: "Recipients",
      path: "/dashboard/recipients",
    },
    {
      id: "export",
      icon: Download,
      label: "Export",
      path: "/dashboard/export",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Glass Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black italic">
              M
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              M-Pesa Viz
            </h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <Outlet /> {/* This is where the OverviewPage will render */}
        </div>
      </main>
    </div>
  );
}
