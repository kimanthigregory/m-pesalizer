import React, { useMemo, useState } from "react";
import {
  Users,
  Search,
  Phone,
  ArrowRight,
  TrendingUp,
  UserPlus,
} from "lucide-react";

const RecipientRow = ({ person, maxVolume }) => {
  const percentage = (person.totalVolume / maxVolume) * 100;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
      {/* Avatar/Initials */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold border border-white/10 shrink-0">
        {person.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-semibold text-white truncate pr-4">
            {person.name}
          </h4>
          <span className="text-sm font-mono text-emerald-400 font-bold">
            KES {person.totalVolume.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar (Visual Volume) */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1">
            <Phone size={10} /> {person.phone || "N/A"}
          </span>
          <span>•</span>
          <span>{person.count} Transactions</span>
        </div>
      </div>
    </div>
  );
};

export default function RecipientsPage({ rawData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { recipients, topRecipient, totalUnique } = useMemo(() => {
    const transactions = rawData.filter((t) => t["Receipt No."]);

    const recipientMap = transactions.reduce((acc, t) => {
      // Logic to extract name/phone: Usually after "from - " or "to - "
      const details = t.Details || "";
      let name = "Internal Transfer/Unknown";
      let phone = "";

      if (details.includes("-")) {
        const parts = details.split("-");
        const identityPart = parts[1]?.trim() || parts[0];
        // Regex to find phone numbers like 2547... or 07...
        const phoneMatch = identityPart.match(/(254|0)\d{9}/);
        phone = phoneMatch ? phoneMatch[0] : "";
        name = identityPart.replace(phone, "").trim();
      }

      if (!acc[name]) {
        acc[name] = { name, phone, totalVolume: 0, count: 0 };
      }

      const amount = Math.abs(
        parseFloat((t.Withdrawn || t["Paid In"] || "0").replace(/,/g, ""))
      );
      acc[name].totalVolume += amount;
      acc[name].count += 1;

      return acc;
    }, {});

    const sorted = Object.values(recipientMap)
      .filter((r) => r.name.length > 2)
      .sort((a, b) => b.totalVolume - a.totalVolume);

    return {
      recipients: sorted,
      topRecipient: sorted[0],
      totalUnique: sorted.length,
    };
  }, [rawData]);

  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm)
  );

  const maxVolume = recipients[0]?.totalVolume || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Recipients
          </h2>
          <p className="text-slate-400 mt-2">
            Who is receiving or sending you money?
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search name or phone..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
          <TrendingUp className="text-emerald-400 mb-4" size={24} />
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
            Top Recipient
          </p>
          <h4 className="text-xl font-bold text-white mt-1 truncate">
            {topRecipient?.name}
          </h4>
          <p className="text-sm font-mono text-emerald-400 mt-1">
            KES {topRecipient?.totalVolume.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <Users className="text-blue-400 mb-4" size={24} />
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
            Unique Contacts
          </p>
          <h4 className="text-3xl font-bold text-white mt-1">{totalUnique}</h4>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <UserPlus className="text-purple-400 mb-4" size={24} />
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
            Avg. per Recipient
          </p>
          <h4 className="text-xl font-bold text-white mt-1">
            KES {Math.round(maxVolume / (totalUnique || 1)).toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            All Contacts
          </h3>
          <span className="text-xs text-slate-500">
            {filteredRecipients.length} results found
          </span>
        </div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredRecipients.map((person, idx) => (
            <RecipientRow key={idx} person={person} maxVolume={maxVolume} />
          ))}
        </div>
      </div>
    </div>
  );
}
