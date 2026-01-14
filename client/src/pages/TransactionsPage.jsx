import React, { useState, useMemo } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import { format, parseISO } from "date-fns";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

// --- Helper: Data Processor (Move to utils if preferred) ---
const processTransactions = (rawData) => {
  // Filter out the summary rows (they don't have Receipt No.)
  const cleanData = rawData
    .filter((item) => item["Receipt No."])
    .map((t) => {
      // Parse Amount: remove commas, handle negatives
      const paidIn = parseFloat((t["Paid In"] || "0").replace(/,/g, ""));
      const withdrawn = parseFloat((t["Withdrawn"] || "0").replace(/,/g, ""));
      const amount = paidIn > 0 ? paidIn : Math.abs(withdrawn);
      const isIncome = paidIn > 0;

      return {
        id: t["Receipt No."],
        date: t["Completion Time"], // "2024-10-14 16:26:49"
        rawDate: t["Completion Time"].split(" ")[0], // "2024-10-14" for grouping
        details: t["Details"], // e.g., "Funds received from - ..."
        name: t["Details"].split("-")[1]?.trim() || t["Details"].split("\n")[0], // Simple extraction
        amount: amount,
        isIncome: isIncome,
        status: t["Transaction Status"],
        type: isIncome ? "Income" : "Expense", // simplified for now
      };
    });

  // Sort: Newest First
  return cleanData.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export default function TransactionsPage({ rawData }) {
  // Accept rawData as prop or fetch it here
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Income, Expense

  // 1. Process and Filter Data
  const { groups, groupCounts, filteredData } = useMemo(() => {
    const allTransactions = processTransactions(rawData || []);

    // Filter Logic
    const filtered = allTransactions.filter((t) => {
      const matchesSearch =
        t.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery);

      const matchesType =
        filterType === "All"
          ? true
          : filterType === "Income"
          ? t.isIncome
          : !t.isIncome;

      return matchesSearch && matchesType;
    });

    // Grouping Logic for Virtuoso
    // We need:
    // 1. A flat list of items (filtered)
    // 2. An array of group counts (how many items in each date)
    // 3. An array of group values (the actual dates)

    const groupsMap = filtered.reduce((acc, t) => {
      const dateKey = t.rawDate;
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey]++;
      return acc;
    }, {});

    const uniqueDates = Object.keys(groupsMap); // The "Group Headers"
    const counts = Object.values(groupsMap); // The "Counts"

    return {
      groups: uniqueDates,
      groupCounts: counts,
      filteredData: filtered,
    };
  }, [rawData, searchQuery, filterType]);

  // --- Render Components ---

  // The sticky header for each date group
  const GroupHeader = ({ index, ...props }) => {
    const dateStr = groups[index];
    // Formatter: "Today", "Yesterday", or "Mon, 14 Oct"
    const label = format(parseISO(dateStr), "EEE, dd MMM yyyy");

    return (
      <div
        {...props}
        className="bg-[#020617]/95 backdrop-blur-md border-b border-white/5 py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10"
      >
        {label}
      </div>
    );
  };

  // The individual transaction row
  const Row = ({ index, ...props }) => {
    const t = filteredData[index];
    if (!t) return null;

    return (
      <div
        {...props} // Vital for virtualization to measure height
        className="flex items-center justify-between p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default"
      >
        <div className="flex items-center gap-4">
          {/* Icon Badge */}
          <div
            className={`
            w-10 h-10 rounded-full flex items-center justify-center border
            ${
              t.isIncome
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-slate-700/30 border-slate-600/30 text-slate-400"
            }
          `}
          >
            {t.isIncome ? (
              <ArrowDownRight size={18} />
            ) : (
              <ArrowUpRight size={18} />
            )}
          </div>

          {/* Details */}
          <div>
            <div className="text-sm font-medium text-slate-200 whitespace-pre-line leading-tight">
              {/* Clean up the newlines in details for cleaner view */}
              {t.details.replace(/\n/g, " ")}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-500 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">
                {format(parseISO(t.date), "HH:mm")}
              </span>
              <span className="text-[10px] text-slate-500">{t.id}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div
            className={`font-bold font-mono ${
              t.isIncome ? "text-emerald-400" : "text-slate-200"
            }`}
          >
            {t.isIncome ? "+" : "-"}
            {t.amount.toLocaleString("en-KE", {
              style: "currency",
              currency: "KES",
            })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 capitalize">
            {t.status.toLowerCase()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {" "}
      {/* Constrain height for virtualization */}
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <p className="text-slate-400 text-sm">
            Verify every shilling in and out.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search receipt, name, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            {["All", "Income", "Expense"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                  ${
                    filterType === type
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* The Virtualized List */}
      <div className="flex-1 border border-white/10 rounded-2xl bg-white/[0.01] overflow-hidden backdrop-blur-sm">
        {filteredData.length > 0 ? (
          <GroupedVirtuoso
            groupCounts={groupCounts}
            groupContent={(index) => <GroupHeader index={index} />}
            itemContent={(index) => <Row index={index} />}
            className="h-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No transactions found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
