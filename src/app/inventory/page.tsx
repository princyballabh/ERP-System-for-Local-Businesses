// src/app/inventory/page.tsx

"use client";

import { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaFileImport,
  FaFileExport,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const inventoryData = [
  {
    id: 1,
    name: "Product A",
    sku: "SKU001",
    category: "Electronics",
    quantity: 25,
    location: "Warehouse 1",
    value: 12500,
    supplier: "Supplier X",
    status: "Active",
  },
  {
    id: 2,
    name: "Product B",
    sku: "SKU002",
    category: "Apparel",
    quantity: 5,
    location: "Warehouse 2",
    value: 2000,
    supplier: "Supplier Y",
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Product C",
    sku: "SKU003",
    category: "Electronics",
    quantity: 0,
    location: "Warehouse 1",
    value: 0,
    supplier: "Supplier Z",
    status: "Out of Stock",
  },
  // ...more items
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  // Simple search filter
  const filteredData = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-cream p-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-cream rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-navy font-semibold text-lg">Total Items</span>
          <span className="text-2xl font-bold text-teal mt-2">3</span>
        </div>
        <div className="bg-cream rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-navy font-semibold text-lg">
            Inventory Value
          </span>
          <span className="text-2xl font-bold text-teal mt-2">₹14,500</span>
        </div>
        <div className="bg-cream rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-navy font-semibold text-lg">Low Stock</span>
          <span className="text-2xl font-bold text-teal mt-2">1</span>
        </div>
        <div className="bg-cream rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-navy font-semibold text-lg">Out of Stock</span>
          <span className="text-2xl font-bold text-teal mt-2">1</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Search */}
        <div className="flex items-center bg-cream rounded px-3 py-2 shadow w-full md:w-1/3">
          <FaSearch className="text-teal mr-2" />
          <input
            type="text"
            placeholder="Search by name or SKU"
            className="bg-transparent outline-none w-full text-navy"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-teal text-cream px-4 py-2 rounded shadow hover:bg-navy transition">
            <FaPlus /> Add Item
          </button>
          <button className="flex items-center gap-2 bg-mint text-navy px-4 py-2 rounded shadow hover:bg-teal hover:text-cream transition">
            <FaFileImport /> Import
          </button>
          <button className="flex items-center gap-2 bg-mint text-navy px-4 py-2 rounded shadow hover:bg-teal hover:text-cream transition">
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-cream rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-mint text-navy">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">SKU</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Quantity</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left">Value</th>
              <th className="py-3 px-4 text-left">Supplier</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-navy">
                  No items found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-mint hover:bg-mint/30 transition"
                >
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.sku}</td>
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4">{item.quantity}</td>
                  <td className="py-2 px-4">{item.location}</td>
                  <td className="py-2 px-4">₹{item.value.toLocaleString()}</td>
                  <td className="py-2 px-4">{item.supplier}</td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        item.status === "Active"
                          ? "text-teal font-semibold"
                          : item.status === "Low Stock"
                          ? "text-mint font-semibold"
                          : "text-navy font-semibold"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="text-teal hover:text-navy">
                      <FaEdit />
                    </button>
                    <button className="text-red-500 hover:text-navy">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
