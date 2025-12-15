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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
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

  return (
    <div className="p-8 bg-gradient-to-b from-mint to-cream min-h-screen">
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
        <table className="min-w-full text-sm">
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
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="text-center border-b border-mint">
                <td className="py-2 px-4">{item.prodName}</td>
                <td className="py-2 px-4">{item.prodId}</td>
                <td className="py-2 px-4">{item.category}</td>
                <td className="py-2 px-4">{item.currentQuantity}</td>
                <td className="py-2 px-4">₹{item.unitCost}</td>
                <td className="py-2 px-4">₹{item.totalCost}</td>
                <td className="py-2 px-4">{item.status}</td>
                <td className="py-2 px-4">{item.incomingStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
