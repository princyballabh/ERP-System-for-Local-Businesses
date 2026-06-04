"use client";

import { StringDecoder } from "node:string_decoder";
import { useEffect, useState } from "react";
import Card from "@/components/Card";

// Modal component
function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

type Item = {
  _id: string;
  prodName: string;
  prodId: string;
  category: string;
  currentQuantity: number;
  unitCost: number;
  totalCost: number;
  status: string;
  incomingStock: number;
};

type Category = { _id: string; name: string };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  
  // State for AI Prediction Modal
  const [aiPredictionModal, setAiPredictionModal] = useState<{
    isOpen: boolean;
    title: string;
    needsRefill: boolean;
    probability: number;
    error: string | null;
  }>({
    isOpen: false,
    title: "",
    needsRefill: false,
    probability: 0,
    error: null,
  });

  const [form, setForm] = useState({
    prodName: "",
    prodId: "",
    category: "",
    currentQuantity: "",
    unitCost: "",
    incomingStock: "",
  });

  // Fetch inventory and categories
  const fetchAll = () => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setItems);
    fetch("/api/category")
      .then((res) => res.json())
      .then(setCategories);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // KPIs
  const totalStockValue = items.reduce((acc, item) => acc + item.totalCost, 0);
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.status === "Low Stock").length;
  const outOfStockItems = items.filter(
    (i) => i.status === "Out of Stock"
  ).length;
  const incomingStock = items.reduce(
    (acc, item) => acc + (item.incomingStock || 0),
    0
  );

  // Add Item Handler
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    setShowModal(false);
    setForm({
      prodName: "",
      prodId: "",
      category: "",
      currentQuantity: "",
      unitCost: "",
      incomingStock: "",
    });
    fetchAll();
  }

  // Add Category Handler
  async function handleAddCategory() {
    const name = prompt("Enter new category name:");
    if (name) {
      await fetch("/api/category", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });
      fetch("/api/category")
        .then((res) => res.json())
        .then(setCategories);
    }
  }

  // AI Prediction Handler
  async function handleAIPredict(item: Item) {
    setPredictingId(item._id);
    try {
      const today = new Date();
      const isWeekend = today.getDay() === 0 || today.getDay() === 6 ? 1 : 0;
      
      const payload = {
        currentQuantity: item.currentQuantity,
        lead_time_days: 5,
        safety_stock: 40,
        day_of_week: today.getDay(),
        month: today.getMonth() + 1,
        is_weekend: isWeekend,
        sales_lag_1: Math.floor(Math.random() * 10) + 1,
        sales_lag_2: Math.floor(Math.random() * 10) + 1,
        sales_rolling_7d: parseFloat((Math.random() * 5 + 3).toFixed(2)),
        sales_rolling_14d: parseFloat((Math.random() * 5 + 3).toFixed(2)),
        stock_lag_1: item.currentQuantity + Math.floor(Math.random() * 5) + 1,
      };

      const res = await fetch("/api/inventory/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setAiPredictionModal({
          isOpen: true,
          title: `AI Prediction for ${item.prodName}`,
          needsRefill: data.needs_refill,
          probability: data.probability,
          error: null,
        });
      } else {
        setAiPredictionModal({
          isOpen: true,
          title: `AI Prediction Failed`,
          needsRefill: false,
          probability: 0,
          error: data.error || "Unknown error",
        });
      }
    } catch (err) {
        console.error(err);
        setAiPredictionModal({
          isOpen: true,
          title: `API Error`,
          needsRefill: false,
          probability: 0,
          error: "Error connecting to the ML prediction API.",
        });
    } finally {
        setPredictingId(null);
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-mint to-cream min-h-screen">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card title="Total Stock Value" value={`₹${totalStockValue}`} />
        <Card title="Total Items" value={totalItems} />
        <Card title="Low Stock Items" value={lowStockItems} />
        <Card title="Out of Stock Items" value={outOfStockItems} />
        <Card title="Incoming Stock" value={incomingStock} />
      </div>

      {/* Buttons */}
      <div className="mb-8 flex gap-2">
        <button
          className="bg-teal text-cream px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Add Item
        </button>
        <button
          className="bg-teal text-cream px-4 py-2 rounded"
          type="button"
          onClick={handleAddCategory}
        >
          Add Category
        </button>
      </div>

      {/* AI Prediction Modal */}
      <Modal isOpen={aiPredictionModal.isOpen} onClose={() => setAiPredictionModal({ ...aiPredictionModal, isOpen: false })}>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">{aiPredictionModal.title}</h2>
          
          {aiPredictionModal.error ? (
            <div className="text-red-500 bg-red-50 px-4 py-3 rounded border border-red-200">
              {aiPredictionModal.error}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="text-gray-600 block mb-1">Needs Refill?</span>
                <span className={`text-xl font-bold px-4 py-2 rounded ${aiPredictionModal.needsRefill ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {aiPredictionModal.needsRefill ? 'Yes! ⚠️' : 'No ✅'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Probability</span>
                <span className="text-3xl font-extrabold text-teal">
                  {(aiPredictionModal.probability * 100).toFixed(1)}%
                </span>
              </div>
            </>
          )}

          <button
            className="mt-8 bg-navy text-white px-6 py-2 rounded hover:bg-opacity-90"
            onClick={() => setAiPredictionModal({ ...aiPredictionModal, isOpen: false })}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <form className="flex flex-col gap-3" onSubmit={handleAddItem}>
          <input
            className="border p-2 rounded"
            required
            placeholder="Product Name"
            value={form.prodName}
            onChange={(e) =>
              setForm((f) => ({ ...f, prodName: e.target.value }))
            }
          />
          <input
            className="border p-2 rounded"
            required
            placeholder="ID"
            value={form.prodId}
            onChange={(e) => setForm((f) => ({ ...f, prodId: e.target.value }))}
          />
          <select
            className="border p-2 rounded"
            required
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="border p-2 rounded"
            required
            type="number"
            placeholder="Current Quantity"
            value={form.currentQuantity}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                currentQuantity: String(e.target.value),
              }))
            }
          />
          <input
            className="border p-2 rounded"
            required
            type="number"
            placeholder="Unit Cost"
            value={form.unitCost}
            onChange={(e) =>
              setForm((f) => ({ ...f, unitCost: String(e.target.value) }))
            }
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Incoming Stock"
            value={form.incomingStock}
            onChange={(e) =>
              setForm((f) => ({ ...f, incomingStock: String(e.target.value) }))
            }
          />
          <div className="flex gap-2 mt-2">
            <button
              className="bg-teal text-cream px-4 py-2 rounded"
              type="submit"
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-navy px-4 py-2 rounded"
              type="button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-cream rounded shadow">
        <table className="min-w-full text-sm responsive-table">
          <thead>
            <tr className="bg-mint text-navy">
              <th className="py-2 px-4">Prod Name</th>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Current Quantity</th>
              <th className="py-2 px-4">Unit Cost</th>
              <th className="py-2 px-4">Total Cost</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Incoming Stock</th>
                <th className="py-2 px-4 whitespace-nowrap hidden lg:table-cell">AI Prediction</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="text-center border-b border-mint hover:bg-white transition-colors duration-150">
                  <td className="py-2 px-4" data-label="Prod Name">{item.prodName}</td>
                  <td className="py-2 px-4 font-mono text-xs" data-label="ID">{item.prodId}</td>
                  <td className="py-2 px-4" data-label="Category">{item.category}</td>
                  <td className="py-2 px-4 font-bold" data-label="Quantity">{item.currentQuantity}</td>
                  <td className="py-2 px-4 text-gray-600" data-label="Unit Cost">₹{item.unitCost}</td>
                  <td className="py-2 px-4 text-gray-800" data-label="Total Cost">₹{item.totalCost}</td>
                  <td className="py-2 px-4" data-label="Status">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Low Stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2 px-4" data-label="Incoming Stock">{item.incomingStock}</td>
                  <td className="py-2 px-4 hidden lg:table-cell" data-label="AI Prediction">
                    <button
                      disabled={predictingId === item._id}
                      onClick={() => handleAIPredict(item)}
                      className={`text-xs px-3 py-1 rounded shadow text-white font-medium flex items-center justify-center min-w-[100px] ${
                        predictingId === item._id ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {predictingId === item._id ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Ask AI
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
