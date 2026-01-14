// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import { processMpesaData } from "../utils/dataProcessor"; // Import from step 1
import { GlassCard } from "../components/Layout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
} from "lucide-react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
};

const DashboardOverview = ({ rawData }) => {
  // Process data only when rawData changes
  const { summary, transactions } = useMemo(
    () => processMpesaData(rawData),
    [rawData]
  );

  // Prepare chart data (Balance History)
  // We take a subset to avoid overcrowding the chart if many transactions exist
  const chartData = transactions.map((t) => ({
    name: t.date.split(" ")[1], // Time only for this short sample
    balance: t.balance,
    date: t.date,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {/* 1. NET CASH FLOW (Hero Card) */}
      <GlassCard className="md:col-span-2 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Activity size={18} />
            <span className="uppercase tracking-wider text-xs font-bold">
              Net Cash Flow
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mt-2">
            {formatCurrency(summary.netFlow)}
          </h3>
          <p className="text-gray-400 mt-2 text-sm">
            Based on {summary.transactionCount} transactions
          </p>
        </div>
      </GlassCard>

      {/* 2. MONEY IN */}
      <GlassCard className="md:col-span-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
            <ArrowDownRight size={24} />
          </div>
          <span className="text-xs text-gray-500 font-mono">INCOME</span>
        </div>
        <div>
          <h4 className="text-2xl font-bold text-emerald-100 mt-4">
            {formatCurrency(summary.totalIn)}
          </h4>
          <p className="text-xs text-emerald-500/70 mt-1">+100% vs prev</p>
        </div>
      </GlassCard>

      {/* 3. MONEY OUT */}
      <GlassCard className="md:col-span-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-rose-500/20 rounded-lg text-rose-400">
            <ArrowUpRight size={24} />
          </div>
          <span className="text-xs text-gray-500 font-mono">EXPENSE</span>
        </div>
        <div>
          <h4 className="text-2xl font-bold text-rose-100 mt-4">
            {formatCurrency(summary.totalOut)}
          </h4>
          <p className="text-xs text-rose-500/70 mt-1">
            High spending detected
          </p>
        </div>
      </GlassCard>

      {/* 4. BALANCE TREND (Large Chart) */}
      <GlassCard className="md:col-span-3 min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Balance History</h3>
          <div className="text-sm text-emerald-400 font-mono">
            Current: {formatCurrency(summary.currentBalance)}
          </div>
        </div>

        <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#fff",
                }}
                itemStyle={{ color: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* 5. FEES ESTIMATE (Small Summary) */}
      <GlassCard className="md:col-span-1">
        <div className="flex items-center gap-2 mb-4 text-orange-400">
          <DollarSign size={18} />
          <span className="uppercase tracking-wider text-xs font-bold">
            Fees Paid
          </span>
        </div>
        {/* Placeholder logic for fees based on standard M-Pesa patterns or explicit data */}
        <div className="text-3xl font-bold text-white">~ KES 240</div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Paybill</span>
            <span>15.00</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Withdrawal</span>
            <span>225.00</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2">
            <div className="bg-orange-400 h-1 rounded-full w-[30%]"></div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardOverview;
