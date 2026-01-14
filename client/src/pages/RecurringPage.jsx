import React, { useMemo } from "react";
import { Repeat, Calendar, ArrowRight, Zap, BellRing } from "lucide-react";
import { format, parseISO } from "date-fns";

const RecurrenceCard = ({ item }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
        <Repeat size={18} />
      </div>
      <span className="text-[10px] font-bold py-1 px-2 bg-white/5 rounded-full text-slate-400 uppercase tracking-tighter">
        {item.frequency}x this period
      </span>
    </div>

    <h4 className="text-sm font-semibold text-slate-200 line-clamp-2 min-h-[40px] mb-2">
      {item.name}
    </h4>

    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">
            Total Volume
          </p>
          <p className="text-lg font-mono text-white">
            KES {item.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold">
            Avg/Trans
          </p>
          <p className="text-sm font-mono text-slate-300">
            KES {Math.round(item.totalAmount / item.frequency).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Calendar size={12} /> Last:{" "}
          {format(parseISO(item.lastDate), "MMM dd")}
        </span>
        <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default function RecurringPage({ rawData = [] }) {
  const recurringItems = useMemo(() => {
    const transactions = rawData.filter((t) => t["Receipt No."]);

    // Group by Detail (Recipient)
    const groups = transactions.reduce((acc, t) => {
      // Clean up the details to group better (remove unique IDs if possible)
      const key = t.Details.split("-")[0].trim();
      const amount = Math.abs(
        parseFloat((t.Withdrawn || t["Paid In"] || "0").replace(/,/g, ""))
      );

      if (!acc[key]) {
        acc[key] = {
          name: key,
          frequency: 0,
          totalAmount: 0,
          dates: [],
          type: t.Withdrawn ? "Expense" : "Income",
        };
      }
      acc[key].frequency += 1;
      acc[key].totalAmount += amount;
      acc[key].dates.push(t["Completion Time"]);
      return acc;
    }, {});

    // Filter for items that appear more than once and sort by total volume
    return Object.values(groups)
      .filter((item) => item.frequency > 1 && item.name.length > 3)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((item) => ({
        ...item,
        lastDate: item.dates[0], // Assuming data is sorted newest first
      }));
  }, [rawData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Recurring Activity
          </h2>
          <p className="text-slate-400 mt-2">
            Identified patterns and regular commitments.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
          <Zap className="text-emerald-400" size={18} />
          <span className="text-sm font-medium text-emerald-400">
            {recurringItems.length} Patterns Detected
          </span>
        </div>
      </header>

      {/* Insight Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recurringItems.length > 0 ? (
            recurringItems.map((item, idx) => (
              <RecurrenceCard key={idx} item={item} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-slate-500">
                No recurring patterns found in this statement period.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BellRing className="text-blue-400" size={20} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Subscription Alert
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We noticed you have regular payments to{" "}
              <strong>{recurringItems[0]?.name || "various providers"}</strong>.
              Review these to ensure you're still using the services you're
              paying for.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Pro Tip
            </h3>
            <p className="text-xs text-slate-400 italic">
              "Automating recurring Paybills through your banking app can often
              save you M-Pesa transaction fees."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
