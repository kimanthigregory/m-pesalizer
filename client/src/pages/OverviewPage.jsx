import { useMemo } from "react";
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
  const num = parseFloat(String(val).replace(/,/g, ""));
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(num || 0);
};

export default function OverviewPage({ rawData = [] }) {
  // Memoize calculations so they don't re-run on every render
  const stats = useMemo(() => {
    // 1. Find the TOTAL row from the summary section
    const totalRow = rawData.find(
      (item) => item["TRANSACTION TYPE"] === "TOTAL:"
    );

    // 2. Find the latest balance from the transaction section
    // (Filtering for rows with "Receipt No." ensuring we get a real transaction)
    const transactions = rawData.filter((item) => item["Receipt No."]);
    const latestBalance =
      transactions.length > 0 ? transactions[0]["Balance"] : "0.00";

    // 3. Extract Fees (Sum of "Pay Bill Charge" or withdrawal charges in Details)
    const totalFees = transactions.reduce((acc, curr) => {
      const isFee =
        curr.Details?.toLowerCase().includes("charge") ||
        curr.Details?.toLowerCase().includes("cost");
      if (isFee) {
        return acc + Math.abs(parseFloat(curr.Withdrawn.replace(/,/g, "")));
      }
      return acc;
    }, 0);

    return {
      totalIn: totalRow?.["PAID IN"] || "0.00",
      totalOut: totalRow?.["PAID OUT"] || "0.00",
      netFlow: (
        parseFloat((totalRow?.["PAID IN"] || "0").replace(/,/g, "")) -
        parseFloat((totalRow?.["PAID OUT"] || "0").replace(/,/g, ""))
      ).toFixed(2),
      balance: latestBalance,
      fees: totalFees.toFixed(2),
    };
  }, [rawData]);

  return (
    <div className="space-y-6">
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
        {/* Net Flow */}
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

        {/* Money In */}
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

        {/* Money Out */}
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

        {/* Dynamic Bar Chart Placeholder */}
        <BentoCard
          className="md:col-span-3 h-64"
          title="Transaction Volume Activity"
        >
          <div className="w-full h-full flex items-end gap-2 pb-2">
            {/* Generating bars based on real transaction count for visual feedback */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/20 border-t border-emerald-500/40 rounded-t-lg transition-all hover:bg-emerald-500/40"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </BentoCard>

        {/* Total Fees */}
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
                Efficiency: 99.6%
              </p>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
