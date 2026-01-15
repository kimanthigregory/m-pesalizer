import React, { useMemo } from "react";
import {
  Download,
  FileText,
  Table,
  ShieldCheck,
  Info,
  FileJson,
} from "lucide-react";
import { format } from "date-fns";

const ExportOption = ({
  icon: Icon,
  title,
  description,
  onClick,
  colorClass,
}) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] transition-all group flex flex-col justify-between h-full">
    <div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colorClass}`}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
    <button
      onClick={onClick}
      className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
    >
      <Download size={18} /> Download
    </button>
  </div>
);

export default function ExportPage({ rawData = [] }) {
  const stats = useMemo(() => {
    const transactions = rawData.filter((t) => t["Receipt No."]);
    const totalVolume = transactions.reduce(
      (acc, curr) =>
        acc +
        Math.abs(
          parseFloat(
            (curr.Withdrawn || curr["Paid In"] || "0").replace(/,/g, "")
          )
        ),
      0
    );

    return {
      count: transactions.length,
      volume: totalVolume,
      range:
        transactions.length > 0
          ? `${
              transactions[transactions.length - 1]["Completion Time"].split(
                " "
              )[0]
            } to ${transactions[0]["Completion Time"].split(" ")[0]}`
          : "N/A",
    };
  }, [rawData]);

  // --- Export Logic ---
  const downloadCSV = () => {
    if (!rawData.length) return;

    // Create CSV Header
    const headers = Object.keys(rawData[0]).join(",");

    // Create CSV Rows
    const rows = rawData
      .map((obj) =>
        Object.values(obj)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `M-Pesa_Viz_Export_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(rawData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `M-Pesa_Data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Export & Archive
        </h2>
        <p className="text-slate-400 mt-2">
          Take your financial insights with you.
        </p>
      </header>

      {/* Data Status Summary */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">
              Your data is secure
            </h4>
            <p className="text-slate-400 text-sm max-w-xs">
              All processing happens locally in your browser. No data ever
              reaches our servers.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
            Dataset contains
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {stats.count} Transactions
          </p>
          <p className="text-sm text-slate-400">Covering {stats.range}</p>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExportOption
          icon={Table}
          title="Raw CSV"
          description="Best for opening in Excel or Google Sheets to do your own complex filtering."
          colorClass="bg-blue-500/20 text-blue-400"
          onClick={downloadCSV}
        />
        <ExportOption
          icon={FileText}
          title="Visual PDF"
          description="A beautiful, one-page summary of your spending, fees, and trends."
          colorClass="bg-rose-500/20 text-rose-400"
          onClick={() => window.print()} // Simple print-to-PDF trigger
        />
        <ExportOption
          icon={FileJson}
          title="Clean JSON"
          description="Export the cleaned data structure for use in other developer tools."
          colorClass="bg-amber-500/20 text-amber-400"
          onClick={downloadJSON}
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-500 italic text-xs">
        <Info size={16} className="shrink-0" />
        <p>
          Note: This export includes sensitive data like recipient names and
          phone numbers. Ensure you store these files in a secure location.
          M-Pesa Viz does not store backups of your data.
        </p>
      </div>
    </div>
  );
}
