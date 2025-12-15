"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { FaShoppingCart, FaListOl, FaCrown, FaRupeeSign } from "react-icons/fa";

type Product = {
  productName: string;
  quantity: string;
  unitPrice: string;
  totalAmount: number;
};

type Sale = {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  products: Product[];
  totalRevenue: number;
  status: string;
  paymentStatus: string;
};

export default function SalesPage() {
  const [productsList, setProductsList] = useState<
    { prodName: string; unitCost: number }[]
  >([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    invoiceNumber: "",
    date: "",
    customerName: "",
    products: [
      { productName: "", quantity: "", unitPrice: "", totalAmount: 0 },
    ],
    status: "Completed",
    paymentStatus: "Paid",
  });

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setProductsList);
    fetch("/api/sales")
      .then((res) => res.json())
      .then(setSales);
  }, []);

  // KPIs
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const topProduct = (() => {
    const prodMap: { [key: string]: string } = {};
    sales.forEach((sale) =>
      sale.products.forEach((p) => {
        prodMap[p.productName] = (prodMap[p.productName] || 0) + p.quantity;
      })
    );
    const sorted = Object.entries(prodMap).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );
    return sorted.length ? sorted[0][0] : "-";
  })();

  async function handleAddSale(e: React.FormEvent) {
    e.preventDefault();
    // Calculate totals
    const products = form.products.map((p) => ({
      ...p,
      totalAmount: Number(p.quantity) * Number(p.unitPrice),
    }));
    const totalRevenue = products.reduce((acc, p) => acc + p.totalAmount, 0);
    await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        products,
        totalRevenue,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setForm({
      orderId: "",
      invoiceNumber: "",
      date: "",
      customerName: "",
      products: [
        { productName: "", quantity: "", unitPrice: "", totalAmount: 0 },
      ],
      status: "Completed",
      paymentStatus: "Paid",
    });
    fetch("/api/sales")
      .then((res) => res.json())
      .then(setSales);
  }

  // Add/Remove product rows
  const handleProductChange = (
    idx: number,
    field: keyof Product,
    value: any
  ) => {
    setForm((f) => {
      const products = [...f.products];
      products[idx] = { ...products[idx], [field]: value };
      return { ...f, products };
    });
  };

  const addProductRow = () =>
    setForm((f) => ({
      ...f,
      products: [
        ...f.products,
        { productName: "", quantity: "", unitPrice: "", totalAmount: 0 },
      ],
    }));

  const removeProductRow = (idx: number) =>
    setForm((f) => ({
      ...f,
      products: f.products.filter((_, i) => i !== idx),
    }));

  return (
    <div className="p-8 bg-gradient-to-b from-mint to-cream min-h-screen">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card
          title="Total Sales"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaShoppingCart className="text-teal" /> {totalSales}
            </span>
          }
        />
        <Card
          title="Total Revenue"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaRupeeSign className="text-teal" /> {totalRevenue}
            </span>
          }
        />
        <Card
          title="Top-Selling Product"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaCrown className="text-teal" /> {topProduct}
            </span>
          }
        />
        <Card
          title="Number of Sales Orders"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaListOl className="text-teal" /> {totalSales}
            </span>
          }
        />
      </div>

      {/* Add Sale Button */}
      <button
        className="bg-teal text-cream px-4 py-2 rounded mb-4"
        onClick={() => setShowForm(true)}
      >
        Add Sale
      </button>

      {/* Add Sale Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <form className="flex flex-col gap-3" onSubmit={handleAddSale}>
              <input
                className="border p-2 rounded"
                required
                placeholder="Order ID"
                value={form.orderId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, orderId: e.target.value }))
                }
              />
              <input
                className="border p-2 rounded"
                required
                placeholder="Invoice Number"
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invoiceNumber: e.target.value }))
                }
              />
              <input
                className="border p-2 rounded"
                required
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
              <input
                className="border p-2 rounded"
                required
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
              />
              <div>
                <div className="font-semibold mb-1">Products</div>
                {form.products.map((p, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      className="border p-2 rounded"
                      required
                      value={p.productName}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const selectedProduct = productsList.find(
                          (prod) => prod.prodName === selectedName
                        );
                        handleProductChange(idx, "productName", selectedName);
                        if (selectedProduct) {
                          handleProductChange(
                            idx,
                            "unitPrice",
                            selectedProduct.unitCost
                          );
                        }
                      }}
                    >
                      <option value="">Select Product</option>
                      {productsList.map((prod) => (
                        <option key={prod.prodName} value={prod.prodName}>
                          {prod.prodName}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border p-2 rounded"
                      required
                      type="string"
                      placeholder="Qty"
                      value={p.quantity}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                    <input
                      className="border p-2 rounded"
                      required
                      type="string"
                      placeholder="Unit Price"
                      value={p.unitPrice}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "unitPrice",
                          Number(e.target.value)
                        )
                      }
                      // Optionally, make this readOnly if you don't want users to edit the price
                    />
                    <button
                      type="button"
                      className="bg-gray-200 text-navy px-2 rounded"
                      onClick={() => removeProductRow(idx)}
                      disabled={form.products.length === 1}
                    >
                      &times;
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="bg-mint text-navy px-3 py-1 rounded"
                  onClick={addProductRow}
                >
                  + Add Product
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-teal text-cream px-4 py-2 rounded"
                  type="submit"
                >
                  Save Sale
                </button>
                <button
                  className="bg-gray-300 text-navy px-4 py-2 rounded"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="overflow-x-auto bg-cream rounded shadow">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="bg-mint text-navy text-center">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Invoice #</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Products</th>
              <th className="py-2 px-4">Qty</th>
              <th className="py-2 px-4">Unit Price</th>
              <th className="py-2 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) =>
              sale.products.map((p, i) => (
                <tr key={sale._id + i} className="border-b border-mint">
                  {i === 0 && (
                    <>
                      <td className="py-2 px-4" rowSpan={sale.products.length}>
                        {sale.orderId}
                      </td>
                      <td className="py-2 px-4" rowSpan={sale.products.length}>
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2 px-4" rowSpan={sale.products.length}>
                        {sale.date?.slice(0, 10)}
                      </td>
                      <td className="py-2 px-4" rowSpan={sale.products.length}>
                        {sale.customerName}
                      </td>
                    </>
                  )}
                  <td className="py-2 px-4">{p.productName}</td>
                  <td className="py-2 px-4">{p.quantity}</td>
                  <td className="py-2 px-4">
                    <FaRupeeSign className="inline text-teal mr-1" />
                    {p.unitPrice}
                  </td>
                  <td className="py-2 px-4">
                    <FaRupeeSign className="inline text-teal mr-1" />
                    {p.totalAmount}
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
