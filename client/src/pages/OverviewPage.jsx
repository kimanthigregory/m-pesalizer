import React, { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const BentoCard = ({ children, className = "", title = "" }) => (
  <div
    className={`bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-6 hover:border-white/20 transition-colors ${className}`}
  >
    {title && (
      <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>
    )}
    {children}
  </div>
);

const formatCurrency = (val) => {
  const num = parseFloat(String(val || "0").replace(/,/g, ""));
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(num || 0);
};

export default function OverviewPage({ rawData = [] }) {
  // 1. DATA GUARD: Ensure data exists before running logic
  if (!rawData || rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Activity className="mb-4 opacity-20" size={48} />
        <p className="text-xl font-semibold">Waiting for data...</p>
        <p className="text-sm">
          If this persists, please try re-uploading your statement.
        </p>
      </div>
    );
  }

  const stats = useMemo(() => {
    // 2. Find the TOTAL row
    const totalRow = rawData.find(
      (item) => item["TRANSACTION TYPE"] === "TOTAL:"
    );

    // 3. Find Transactions
    const transactions = rawData.filter((item) => item["Receipt No."]);
    const latestBalance =
      transactions.length > 0 ? transactions[0]["Balance"] : "0.00";

    // 4. Calculate Fees
    const totalFees = transactions.reduce((acc, curr) => {
      const details = (curr.Details || "").toLowerCase();
      const isFee =
        details.includes("charge") ||
        details.includes("cost") ||
        details.includes("fee");
      if (isFee) {
        const val = parseFloat(String(curr.Withdrawn || "0").replace(/,/g, ""));
        return acc + Math.abs(isNaN(val) ? 0 : val);
      }
      return acc;
    }, 0);

    const pIn = parseFloat(
      String(totalRow?.["PAID IN"] || "0").replace(/,/g, "")
    );
    const pOut = parseFloat(
      String(totalRow?.["PAID OUT"] || "0").replace(/,/g, "")
    );

    return {
      totalIn: totalRow?.["PAID IN"] || "0.00",
      totalOut: totalRow?.["PAID OUT"] || "0.00",
      netFlow: (pIn - pOut).toFixed(2),
      balance: latestBalance,
      fees: totalFees.toFixed(2),
    };
  }, [rawData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Financial Pulse
          </h2>
          <p className="text-slate-400 mt-2">
            Summary based on your latest statement upload.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
            Current Balance
          </p>
          <p className="text-2xl font-mono text-emerald-400">
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BentoCard className="md:col-span-2 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Activity size={20} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50 italic">
                Statement Net
              </span>
            </div>
            <div className="mt-8">
              <p className="text-slate-400 text-sm">Net Cash Flow</p>
              <h4
                className={`text-4xl font-bold mt-1 ${
                  parseFloat(stats.netFlow) >= 0
                    ? "text-white"
                    : "text-rose-400"
                }`}
              >
                {formatCurrency(stats.netFlow)}
              </h4>
            </div>
          </div>
        </BentoCard>

        <BentoCard className="flex flex-col justify-between">
          <div className="p-2 w-fit bg-emerald-500/10 rounded-lg">
            <ArrowDownRight className="text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total In</p>
            <h4 className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(stats.totalIn)}
            </h4>
          </div>
        </BentoCard>

        <BentoCard className="flex flex-col justify-between">
          <div className="p-2 w-fit bg-rose-500/10 rounded-lg">
            <ArrowUpRight className="text-rose-400" size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Out</p>
            <h4 className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(stats.totalOut)}
            </h4>
          </div>
        </BentoCard>

        <BentoCard
          className="md:col-span-3 h-64"
          title="Transaction Volume Activity"
        >
          <div className="w-full h-full flex items-end gap-2 pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/20 border-t border-emerald-500/40 rounded-t-lg transition-all hover:bg-emerald-500/40"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </BentoCard>

        <BentoCard title="Transaction Fees">
          <div className="flex flex-col">
            <h4 className="text-3xl font-bold text-orange-400">
              {formatCurrency(stats.fees)}
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Lost to charges this period
            </p>
            <div className="mt-6 space-y-3">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[65%]" />
              </div>
              <p className="text-[10px] text-slate-500 italic text-center">
                Calculated from Details
              </p>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
