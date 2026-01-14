import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format, parseISO, startOfDay, isEqual } from "date-fns";
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight } from "lucide-react";

// --- Reusable Card Component (consistent with Overview) ---
const GlassCard = ({ children, className = "", title = "" }) => (
  <div
    className={`bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-6 ${className}`}
  >
    {title && (
      <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">
        {title}
      </h3>
    )}
    {children}
  </div>
);

// --- Tooltip Customization for Recharts ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-mono my-1"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white">
              {entry.name}:{" "}
              {entry.value.toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
              })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendsPage({ rawData = [] }) {
  // 1. Data Processing: Aggregating by Day
  const { chartData, stats } = useMemo(() => {
    // A. Filter & Clean
    const transactions = rawData
      .filter((t) => t["Receipt No."])
      .map((t) => ({
        date: parseISO(t["Completion Time"]),
        amountPaidIn: parseFloat((t["Paid In"] || "0").replace(/,/g, "")),
        amountWithdrawn: parseFloat((t["Withdrawn"] || "0").replace(/,/g, "")),
      }))
      .sort((a, b) => a.date - b.date); // Oldest first for charts

    // B. Group by Date Key (YYYY-MM-DD)
    const grouped = transactions.reduce((acc, t) => {
      const dateKey = format(t.date, "yyyy-MM-dd");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          displayDate: format(t.date, "MMM dd"),
          income: 0,
          expense: 0,
          count: 0,
        };
      }

      acc[dateKey].income += t.amountPaidIn;
      acc[dateKey].expense += Math.abs(t.amountWithdrawn);
      acc[dateKey].count += 1;

      return acc;
    }, {});

    const dailyData = Object.values(grouped);

    // C. Calculate High-Level Trend Stats
    const totalDays = dailyData.length || 1;
    const highestSpendDay = dailyData.reduce(
      (prev, current) => (prev.expense > current.expense ? prev : current),
      { expense: 0, displayDate: "-" }
    );

    // Calculate total expense for average
    const totalExpense = dailyData.reduce((sum, day) => sum + day.expense, 0);

    return {
      chartData: dailyData,
      stats: {
        avgDailySpend: totalExpense / totalDays,
        highestSpendDay,
        busiestDay: dailyData.reduce(
          (prev, current) => (prev.count > current.count ? prev : current),
          { count: 0, displayDate: "-" }
        ),
      },
    };
  }, [rawData]);

  // If no data, show empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-10 text-slate-500">
        No transaction data available for trends.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Money Movement</h2>
        <p className="text-slate-400 mt-2">
          Analyze your income and spending patterns over time.
        </p>
      </header>

      {/* 1. Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-rose-500/10 to-transparent">
          <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Highest Spend Day
            </p>
            <h4 className="text-xl font-bold text-white mt-1">
              {stats.highestSpendDay.displayDate}
            </h4>
            <p className="text-sm text-rose-400 font-mono mt-1">
              -
              {stats.highestSpendDay.expense.toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
              })}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Avg. Daily Spend
            </p>
            <h4 className="text-xl font-bold text-white mt-1">
              {stats.avgDailySpend.toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
              })}
            </h4>
            <p className="text-xs text-slate-500 mt-1">per active day</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Busiest Day
            </p>
            <h4 className="text-xl font-bold text-white mt-1">
              {stats.busiestDay.displayDate}
            </h4>
            <p className="text-sm text-emerald-400 font-mono mt-1">
              {stats.busiestDay.count} Transactions
            </p>
          </div>
        </GlassCard>
      </div>

      {/* 2. Main Chart: Income vs Expense */}
      <GlassCard title="Daily Income vs Expense" className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#ffffff05" }}
            />
            <Bar
              dataKey="income"
              name="Money In"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="expense"
              name="Money Out"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* 3. Secondary Chart: Transaction Frequency (Volume) */}
      <GlassCard title="Transaction Volume Intensity" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff05"
              vertical={false}
            />
            <XAxis dataKey="displayDate" hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Transactions"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
