"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHourglassHalf,
} from "react-icons/fa";

type Udhaar = {
  _id: string;
  partyName: string;
  contact?: string;
  amount: number;
  paidAmount?: number;
  dateGiven: string;
  dueDate?: string;
  status: "Paid" | "Unpaid" | "Overdue";
  lastPaymentDate?: string;
  notes?: string;
};

const statusColor = {
  Paid: "text-green-600",
  Unpaid: "text-yellow-600",
  Overdue: "text-red-600",
};

const statusIcon = {
  Paid: <FaCheckCircle className="inline mr-1 text-green-600" />,
  Unpaid: <FaHourglassHalf className="inline mr-1 text-yellow-600" />,
  Overdue: <FaExclamationTriangle className="inline mr-1 text-red-600" />,
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<Udhaar[]>([]);
  const [filter, setFilter] = useState({ party: "", status: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleId, setShowSettleId] = useState<string | null>(null);
  const [form, setForm] = useState({
    partyName: "",
    contact: "",
    amount: 0,
    dateGiven: "",
    dueDate: "",
    notes: "",
  });
  const [settleForm, setSettleForm] = useState({
    payment: 0,
    paymentDate: "",
  });

  // Fetch ledger entries (with filters)
  const fetchEntries = () => {
    let url = "/api/ledger";
    const params = [];
    if (filter.party) params.push(`party=${encodeURIComponent(filter.party)}`);
    if (filter.status) params.push(`status=${filter.status}`);
    if (params.length) url += "?" + params.join("&");
    fetch(url)
      .then((res) => res.json())
      .then(setEntries);
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  // KPIs
  const totalOutstanding = entries
    .filter((e) => e.status !== "Paid")
    .reduce((acc, e) => acc + (e.amount - (e.paidAmount || 0)), 0);
  const totalRecovered = entries
    .filter((e) => e.status === "Paid")
    .reduce((acc, e) => acc + (e.paidAmount || e.amount), 0);
  const overdue = entries
    .filter((e) => e.status === "Overdue")
    .reduce((acc, e) => acc + (e.amount - (e.paidAmount || 0)), 0);
  const partiesWithUdhaar = new Set(
    entries.filter((e) => e.status !== "Paid").map((e) => e.partyName)
  ).size;

  // Add Udhaar Handler
  async function handleAddUdhaar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/ledger", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    setShowAddModal(false);
    setForm({
      partyName: "",
      contact: "",
      amount: 0,
      dateGiven: "",
      dueDate: "",
      notes: "",
    });
    fetchEntries();
  }

  // Settle Udhaar Handler
  async function handleSettleUdhaar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/ledger", {
      method: "PATCH",
      body: JSON.stringify({
        id: showSettleId,
        payment: settleForm.payment,
        paymentDate: settleForm.paymentDate,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setShowSettleId(null);
    setSettleForm({ payment: 0, paymentDate: "" });
    fetchEntries();
  }

  // Unique party names for filter dropdown
  const partyNames = Array.from(new Set(entries.map((e) => e.partyName)));

  return (
    <div className="p-8 bg-gradient-to-b from-mint to-cream min-h-screen">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Total Udhaar Outstanding" value={`₹${totalOutstanding}`} />
        <Card title="Total Udhaar Recovered" value={`₹${totalRecovered}`} />
        <Card title="Overdue Udhaar" value={`₹${overdue}`} />
        <Card title="Parties with Udhaar" value={partiesWithUdhaar} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="border p-2 rounded"
          value={filter.party}
          onChange={(e) => setFilter((f) => ({ ...f, party: e.target.value }))}
        >
          <option value="">All Parties</option>
          {partyNames.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="border p-2 rounded"
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <button
          className="bg-teal text-cream px-4 py-2 rounded"
          onClick={() => setShowAddModal(true)}
        >
          Add Udhaar
        </button>
      </div>

      {/* Add Udhaar Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
            <form className="flex flex-col gap-3" onSubmit={handleAddUdhaar}>
              <div className="flex flex-row gap-2">
                <label className="text-navy font-semibold">Party Name</label>
                <input
                  className="border p-2 rounded"
                  required
                  placeholder="Party Name"
                  value={form.partyName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, partyName: e.target.value }))
                  }
                />
                <label className="text-navy font-semibold">Contact</label>
                <input
                  className="border p-2 rounded"
                  placeholder="Contact (optional)"
                  value={form.contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact: e.target.value }))
                  }
                />
                <label className="text-navy font-semibold">Amount</label>
                <input
                  className="border p-2 rounded"
                  required
                  type="number"
                  placeholder="Amount"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                  }
                />
              </div>
              <label className="text-navy font-semibold">Date Given</label>
              <input
                className="border p-2 rounded"
                required
                type="date"
                value={form.dateGiven}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateGiven: e.target.value }))
                }
              />
              <label className="text-navy font-semibold">Due Date</label>
              <input
                className="border p-2 rounded"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
              <label className="text-navy font-semibold">Notes</label>
              <input
                className="border p-2 rounded"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-teal text-cream px-4 py-2 rounded"
                  type="submit"
                >
                  Add Udhaar
                </button>
                <button
                  className="bg-gray-300 text-navy px-4 py-2 rounded"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Udhaar Modal */}
      {showSettleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowSettleId(null)}
            >
              &times;
            </button>
            <form className="flex flex-col gap-3" onSubmit={handleSettleUdhaar}>
              <label className="text-navy font-semibold">Payment Amount</label>
              <input
                className="border p-2 rounded"
                required
                type="number"
                placeholder="Payment"
                value={settleForm.payment || ""}
                onChange={(e) =>
                  setSettleForm((f) => ({
                    ...f,
                    payment: Number(e.target.value),
                  }))
                }
              />
              <label className="text-navy font-semibold">Payment Date</label>
              <input
                className="border p-2 rounded"
                required
                type="date"
                value={settleForm.paymentDate}
                onChange={(e) =>
                  setSettleForm((f) => ({
                    ...f,
                    paymentDate: e.target.value,
                  }))
                }
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-teal text-cream px-4 py-2 rounded"
                  type="submit"
                >
                  Settle
                </button>
                <button
                  className="bg-gray-300 text-navy px-4 py-2 rounded"
                  type="button"
                  onClick={() => setShowSettleId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Udhaar Table */}
      <div className="overflow-x-auto bg-cream rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-mint text-navy">
              <th className="py-2 px-4">Party</th>
              <th className="py-2 px-4">Contact</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Paid</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Due</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Last Payment</th>
              <th className="py-2 px-4">Notes</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id} className="border-b border-mint">
                <td className="py-2 px-4">{entry.partyName}</td>
                <td className="py-2 px-4">{entry.contact}</td>
                <td className="py-2 px-4">₹{entry.amount}</td>
                <td className="py-2 px-4">₹{entry.paidAmount || 0}</td>
                <td className="py-2 px-4">{entry.dateGiven?.slice(0, 10)}</td>
                <td className="py-2 px-4">{entry.dueDate?.slice(0, 10)}</td>
                <td
                  className={`py-2 px-4 font-semibold ${
                    statusColor[entry.status]
                  }`}
                >
                  <span className="inline-flex items-center">
                    {statusIcon[entry.status]}
                    {entry.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {entry.lastPaymentDate?.slice(0, 10) || "-"}
                </td>
                <td className="py-2 px-4">{entry.notes}</td>
                <td className="py-2 px-4">
                  {entry.status !== "Paid" && (
                    <button
                      className="bg-teal text-cream px-2 py-1 rounded text-xs"
                      onClick={() => setShowSettleId(entry._id)}
                    >
                      Settle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
