"use client";
import { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FaShoppingCart,
  FaRupeeSign,
  FaMoneyBillWave,
  FaBoxes,
} from "react-icons/fa";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-xl">Loading dashboard...</div>;
  }

  // Prepare top 5 products for list and bar chart
  const topProducts = data.top_5_products || [];
  const productNames = topProducts.map((p: any) => p[0]);
  const productQuantities = topProducts.map((p: any) => p[1]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-mint p-8">
      {/* Welcome */}
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
        Welcome, {data.user}
      </h1>

      {/* Top 4 Compact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <FaShoppingCart className="text-2xl text-teal mb-2" />
          <div className="text-xl font-bold text-navy">
            {data.total_sales_orders}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <FaRupeeSign className="text-2xl text-teal mb-2" />
          <div className="text-xl font-bold text-navy">
            {data.total_revenue}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <FaMoneyBillWave className="text-2xl text-teal mb-2" />
          <div className="text-xl font-bold text-navy">
            {data.total_udhaar_outstanding}
          </div>
          <div className="text-sm text-gray-500 mt-1">Udhaar Outstanding</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <FaBoxes className="text-2xl text-teal mb-2" />
          <div className="text-xl font-bold text-navy">
            {data.total_items_inventory}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Items</div>
        </div>
      </div>

      {/* Top 5 Products List and Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-navy mb-4">
            Top 5 Most Selling Products
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            {topProducts.length === 0 ? (
              <li className="text-gray-400">No sales data yet.</li>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <li
                  key={p[0]}
                  className="flex justify-between items-center text-base"
                >
                  <span className="font-semibold">{p[0]}</span>
                  <span className="bg-mint text-navy px-3 py-1 rounded-full text-sm font-bold">
                    {p[1]}
                  </span>
                </li>
              ))
            )}
          </ol>
        </div>
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-navy mb-4">
            Top 5 Products (Bar Chart)
          </h2>
          <Bar
            data={{
              labels: productNames,
              datasets: [
                {
                  label: "Quantity Sold",
                  data: productQuantities,
                  backgroundColor: "#14b8a6",
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                x: { title: { display: false } },
                y: {
                  title: { display: true, text: "Quantity" },
                  beginAtZero: true,
                },
              },
            }}
            height={250}
          />
        </div>
      </div>

      {/* Other Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales Trend Line Chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-navy mb-4">Sales Trend</h2>
          <Line
            data={{
              labels: data.sales_trend.date_str,
              datasets: [
                {
                  label: "Revenue",
                  data: data.sales_trend.revenue,
                  borderColor: "#6366f1",
                  backgroundColor: "#6366f1",
                  tension: 0.4,
                  pointRadius: 3,
                  pointHoverRadius: 6,
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                x: { title: { display: true, text: "Date" } },
                y: {
                  title: { display: true, text: "Revenue (₹)" },
                  beginAtZero: true,
                },
              },
            }}
            height={250}
          />
        </div>
        {/* Inventory Status Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-navy mb-4">Inventory Status</h2>
          <Pie
            data={{
              labels: Object.keys(data.inventory_status_counts),
              datasets: [
                {
                  data: Object.values(data.inventory_status_counts),
                  backgroundColor: ["#14b8a6", "#facc15", "#ef4444", "#6366f1"],
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: { display: false },
              },
            }}
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
