"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import {
  FaFileInvoice,
  FaRupeeSign,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

type LineItem = {
  productName: string;
  quantity: string;
  rate: string;
  total: number;
};

type Bill = {
  _id: string;
  invoiceNumber: string;
  dateIssued: string;
  dueDate?: string;
  customerName: string;
  saleRef?: string;
  lineItems: LineItem[];
  totalAmount: string;
  amountPaid: string;
  paymentMethod?: string;
  status: "Paid" | "Unpaid" | "Partial" | "Overdue";
  notes?: string;
};

type Sale = {
  _id: string;
  orderId: string;
  customerName: string;
  products: {
    productName: string;
    quantity: string;
    unitPrice: string;
    totalAmount: number;
  }[];
};

type Customer = {
  _id: string;
  name: string;
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: "",
    dateIssued: "",
    dueDate: "",
    customerName: "",
    saleRef: "",
    lineItems: [{ productName: "", quantity: "", rate: "", total: 0 }],
    totalAmount: 0,
    amountPaid: "",
    paymentMethod: "",
    status: "Unpaid",
    notes: "",
  });

  // Fetch data from APIs
  useEffect(() => {
    fetch("/api/billing")
      .then((res) => res.json())
      .then(setBills);
    fetch("/api/sales")
      .then((res) => res.json())
      .then(setSales);
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  // KPIs
  const totalInvoices = bills.length;
  const totalBilled = bills.reduce((acc, b) => acc + Number(b.totalAmount), 0);
  const totalReceived = bills.reduce((acc, b) => acc + Number(b.amountPaid), 0);
  const outstanding = bills.reduce(
    (acc, b) => acc + (Number(b.totalAmount) - Number(b.amountPaid)),
    0
  );
  const overdue = bills.filter((b) => b.status === "Overdue").length;

  // Add Bill Handler
  async function handleAddBill(e: React.FormEvent) {
    e.preventDefault();
    const lineItems = form.lineItems.map((item) => ({
      ...item,
      total: Number(item.quantity) * Number(item.rate),
    }));
    const totalAmount = lineItems.reduce((acc, li) => acc + li.total, 0);
    await fetch("/api/billing", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        lineItems,
        totalAmount,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setForm({
      invoiceNumber: "",
      dateIssued: "",
      dueDate: "",
      customerName: "",
      saleRef: "",
      lineItems: [{ productName: "", quantity: "", rate: "", total: 0 }],
      totalAmount: 0,
      amountPaid: "",
      paymentMethod: "",
      status: "Unpaid",
      notes: "",
    });
    fetch("/api/billing")
      .then((res) => res.json())
      .then(setBills);
  }

  // Add/Remove line items
  const handleLineItemChange = (
    idx: number,
    field: keyof LineItem,
    value: any
  ) => {
    setForm((f) => {
      const lineItems = [...f.lineItems];
      lineItems[idx] = { ...lineItems[idx], [field]: value };
      return { ...f, lineItems };
    });
  };

  const addLineItemRow = () =>
    setForm((f) => ({
      ...f,
      lineItems: [
        ...f.lineItems,
        { productName: "", quantity: "", rate: "", total: 0 },
      ],
    }));

  const removeLineItemRow = (idx: number) =>
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.filter((_, i) => i !== idx),
    }));

  // Autofill line items from sale
  const handleSaleSelect = (saleId: string) => {
    setForm((f) => {
      if (!saleId)
        return {
          ...f,
          saleRef: "",
          lineItems: [{ productName: "", quantity: "", rate: "", total: 0 }],
        };
      const sale = sales.find((s) => s._id === saleId);
      if (!sale) return f;
      return {
        ...f,
        saleRef: saleId,
        customerName: sale.customerName,
        lineItems: sale.products.map((p) => ({
          productName: p.productName,
          quantity: String(p.quantity),
          rate: String(p.unitPrice),
          total: Number(p.quantity) * Number(p.unitPrice),
        })),
      };
    });
  };

  return (
    <div className="p-8 bg-gradient-to-b from-mint to-cream min-h-screen">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card
          title="Total Invoices"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaFileInvoice className="text-teal" /> {totalInvoices}
            </span>
          }
        />
        <Card
          title="Total Billed"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaRupeeSign className="text-teal" /> {totalBilled}
            </span>
          }
        />
        <Card
          title="Total Received"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaCheckCircle className="text-teal" />{" "}
              <FaRupeeSign className="text-teal" /> {totalReceived}
            </span>
          }
        />
        <Card
          title="Outstanding"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaExclamationTriangle className="text-yellow-600" />{" "}
              <FaRupeeSign className="text-teal" /> {outstanding}
            </span>
          }
        />
        <Card
          title="Overdue Invoices"
          value={
            <span className="flex items-center justify-center gap-2">
              <FaExclamationTriangle className="text-red-600" /> {overdue}
            </span>
          }
        />
      </div>

      {/* Add Bill Button */}
      <button
        className="bg-teal text-cream px-4 py-2 rounded mb-4"
        onClick={() => setShowForm(true)}
      >
        Add Invoice
      </button>

      {/* Add Bill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <form className="flex flex-col gap-3" onSubmit={handleAddBill}>
              <div className="flex flex-row gap-2 mb-4">
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
                  value={form.dateIssued}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateIssued: e.target.value }))
                  }
                />
                <input
                  className="border p-2 rounded"
                  type="date"
                  placeholder="Due Date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
              <select
                className="border p-2 rounded"
                value={form.saleRef}
                onChange={(e) => handleSaleSelect(e.target.value)}
              >
                <option value="">Link to Sale/Order (optional)</option>
                {sales.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.orderId} ({s.customerName})
                  </option>
                ))}
              </select>
              <div>
                <div className="font-semibold mb-1">Line Items</div>
                {form.lineItems.map((li, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border p-2 rounded"
                      required
                      placeholder="Product/Service"
                      value={li.productName}
                      onChange={(e) =>
                        handleLineItemChange(idx, "productName", e.target.value)
                      }
                    />
                    <input
                      className="border p-2 rounded"
                      required
                      type="number"
                      placeholder="Qty"
                      value={li.quantity}
                      onChange={(e) =>
                        handleLineItemChange(
                          idx,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                    <input
                      className="border p-2 rounded"
                      required
                      type="number"
                      placeholder="Rate"
                      value={li.rate}
                      onChange={(e) =>
                        handleLineItemChange(
                          idx,
                          "rate",
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      type="button"
                      className="bg-gray-200 text-navy px-2 rounded"
                      onClick={() => removeLineItemRow(idx)}
                      disabled={form.lineItems.length === 1}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-mint text-navy px-3 py-1 rounded"
                  onClick={addLineItemRow}
                >
                  + Add Item
                </button>
              </div>
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Amount Paid"
                value={form.amountPaid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amountPaid: e.target.value }))
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Payment Method"
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentMethod: e.target.value }))
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Notes"
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
                  Save Invoice
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

      {/* Invoice Table */}
      <div className="overflow-x-auto bg-cream rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-mint text-navy">
              <th className="py-2 px-4">Invoice #</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Sale Ref</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Paid</th>
              <th className="py-2 px-4">Due</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id} className="border-b border-mint">
                <td className="py-2 px-4">{bill.invoiceNumber}</td>
                <td className="py-2 px-4">{bill.dateIssued?.slice(0, 10)}</td>
                <td className="py-2 px-4">{bill.customerName}</td>
                <td className="py-2 px-4">{bill.saleRef}</td>
                <td className="py-2 px-4">
                  <FaRupeeSign className="inline text-teal mr-1" />
                  {bill.totalAmount}
                </td>
                <td className="py-2 px-4">
                  <FaRupeeSign className="inline text-teal mr-1" />
                  {bill.amountPaid}
                </td>
                <td className="py-2 px-4">
                  <FaRupeeSign className="inline text-teal mr-1" />
                  {Number(bill.totalAmount) - Number(bill.amountPaid)}
                </td>
                <td className="py-2 px-4">
                  {bill.status === "Paid" && (
                    <span className="text-green-600 font-semibold">Paid</span>
                  )}
                  {bill.status === "Unpaid" && (
                    <span className="text-yellow-600 font-semibold">
                      Unpaid
                    </span>
                  )}
                  {bill.status === "Partial" && (
                    <span className="text-blue-600 font-semibold">Partial</span>
                  )}
                  {bill.status === "Overdue" && (
                    <span className="text-red-600 font-semibold">Overdue</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {/* Actions: View, Edit, Mark as Paid, etc. */}
                  <button className="bg-mint text-navy px-2 py-1 rounded text-xs mr-2">
                    View
                  </button>
                  <button className="bg-teal text-cream px-2 py-1 rounded text-xs">
                    Mark Paid
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
