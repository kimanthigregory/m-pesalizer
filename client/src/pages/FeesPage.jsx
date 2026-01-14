import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Wallet, Info, Receipt, Percent } from "lucide-react";
import { format, parseISO } from "date-fns";

const BentoCard = ({ children, className = "", title = "" }) => (
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

const COLORS = ["#fb923c", "#f87171", "#60a5fa", "#a78bfa"];

export default function FeesPage({ rawData = [] }) {
  const { totalFees, feeHistory, feesByType, avgFee, feeRatio } =
    useMemo(() => {
      const transactions = rawData.filter((t) => t["Receipt No."]);

      // 1. Identify rows that are explicitly charges
      const feeRows = transactions.filter(
        (t) =>
          t.Details?.toLowerCase().includes("charge") ||
          t.Details?.toLowerCase().includes("cost")
      );

      // 2. Calculate Totals
      const total = feeRows.reduce(
        (acc, curr) =>
          acc + Math.abs(parseFloat(curr.Withdrawn.replace(/,/g, ""))),
        0
      );

      // 3. Fee History (Fees over time)
      const historyMap = feeRows.reduce((acc, curr) => {
        const dateKey = curr["Completion Time"].split(" ")[0];
        acc[dateKey] =
          (acc[dateKey] || 0) +
          Math.abs(parseFloat(curr.Withdrawn.replace(/,/g, "")));
        return acc;
      }, {});

      const historyData = Object.keys(historyMap)
        .sort()
        .map((date) => ({
          date: format(parseISO(date), "MMM dd"),
          amount: historyMap[date],
        }));

      // 4. Fees by Type (Logic based on keywords in details)
      const typeMap = feeRows.reduce((acc, curr) => {
        let type = "Other Charges";
        if (curr.Details.toLowerCase().includes("pay bill"))
          type = "Paybill Fees";
        if (curr.Details.toLowerCase().includes("withdrawal"))
          type = "Withdrawal Fees";
        if (curr.Details.toLowerCase().includes("fuliza"))
          type = "Fuliza Interest";

        acc[type] =
          (acc[type] || 0) +
          Math.abs(parseFloat(curr.Withdrawn.replace(/,/g, "")));
        return acc;
      }, {});

      const typeData = Object.keys(typeMap).map((name) => ({
        name,
        value: typeMap[name],
      }));

      // 5. Contextual Stats
      const totalSpent = transactions.reduce(
        (acc, curr) =>
          acc + Math.abs(parseFloat((curr.Withdrawn || "0").replace(/,/g, ""))),
        0
      );

      return {
        totalFees: total,
        feeHistory: historyData,
        feesByType: typeData,
        avgFee: total / (feeRows.length || 1),
        feeRatio: ((total / totalSpent) * 100).toFixed(2),
      };
    }, [rawData]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Fees & Charges</h2>
        <p className="text-slate-400 mt-2">The cost of moving your money.</p>
      </header>

      {/* 1. Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BentoCard className="bg-orange-500/10 border-orange-500/20">
          <Wallet className="text-orange-400 mb-4" size={24} />
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">
            Total Fees
          </p>
          <h4 className="text-2xl font-bold text-white mt-1">
            KES {totalFees.toLocaleString()}
          </h4>
        </BentoCard>

        <BentoCard>
          <Receipt className="text-blue-400 mb-4" size={24} />
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">
            Avg Fee / Trans
          </p>
          <h4 className="text-2xl font-bold text-white mt-1">
            KES {avgFee.toFixed(2)}
          </h4>
        </BentoCard>

        <BentoCard>
          <Percent className="text-emerald-400 mb-4" size={24} />
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">
            Fee Leakage
          </p>
          <h4 className="text-2xl font-bold text-white mt-1">{feeRatio}%</h4>
          <p className="text-[10px] text-slate-500 mt-1">
            of total withdrawals
          </p>
        </BentoCard>

        <BentoCard>
          <Info className="text-slate-400 mb-4" size={24} />
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">
            Charge Events
          </p>
          <h4 className="text-2xl font-bold text-white mt-1">
            {feeHistory.length} Days
          </h4>
        </BentoCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2. Fees Over Time Chart */}
        <BentoCard
          title="Fee Trend (Daily)"
          className="md:col-span-2 h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={feeHistory}>
              <defs>
                <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
                itemStyle={{ color: "#fb923c" }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#fb923c"
                fillOpacity={1}
                fill="url(#colorFees)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* 3. Fees by Type Bar Chart */}
        <BentoCard title="Fees by Category" className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={feesByType}
              layout="vertical"
              margin={{ left: -20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                fontSize={10}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {feesByType.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {feesByType.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-slate-400 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="text-white font-mono">
                  KES {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
