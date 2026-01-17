import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListOrdered,
  TrendingUp,
  Wallet,
  Repeat,
  Users,
  Download,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export default function DashboardLayout({ mpesaData, onClearData }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const localData = localStorage.getItem("mpesaData");
    if (!mpesaData && !localData) {
      navigate("/", { replace: true });
    }
  }, [mpesaData, navigate]);

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [pathname]);

  // Demo Mode Detection
  const isDemoMode = mpesaData?.some(
    (row) =>
      String(row["Receipt No."]).includes("DEMO") ||
      row["Receipt No."] === "RQA9XJ101"
  );

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

  if (!mpesaData && !localStorage.getItem("mpesaData")) return null;

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden">
      {/* 1. Subtle Background Blurs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* 2. Demo Watermark */}
      {isDemoMode && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03] z-50 select-none">
          <h1 className="text-[15vw] font-black -rotate-12 uppercase tracking-tighter text-white">
            SAMPLE DATA
          </h1>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-white/[0.01] backdrop-blur-2xl flex flex-col z-20">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black italic shadow-lg shadow-emerald-500/20">
              M
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              M-Pesa Lens
            </h1>
          </div>

          {isDemoMode && (
            <div className="mb-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Demo Active
              </span>
            </div>
          )}

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }
                `}
              >
                {/* Fixed: We check isActive via a function to color the icon correctly */}
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={
                        isActive ? "text-emerald-400" : "group-hover:text-white"
                      }
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => {
                if (window.confirm("Clear all session data?")) {
                  onClearData();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
            >
              <Trash2 size={18} />
              <span className="text-sm font-medium">Clear Session</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth"
      >
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
