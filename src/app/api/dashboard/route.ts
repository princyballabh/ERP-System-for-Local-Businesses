import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Items from '@/models/Items';
import Sale from '@/models/Sale';
import Udhaar from '@/models/Udhaar';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  await dbConnect();

  // Inventory KPIs
  const inventory = await Items.find();
  const totalStockValue = inventory.reduce((acc, item) => acc + (item.totalCost || 0), 0);
  const totalItemsInventory = inventory.length;
  const statusCounts = inventory.reduce((acc, item) => {
    const status = item.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = inventory.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sales KPIs and Sales Trend
  const sales = await Sale.find();
  const totalSalesOrders = sales.length;
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalRevenue || 0), 0);

  // Top-Selling Products (robust)
  const productCounts: Record<string, number> = {};
  sales.forEach(sale => {
    if (Array.isArray(sale.products)) {
      sale.products.forEach((p: any) => {
        // Accept multiple possible keys for name and quantity
        const productName = p.productName || p.name || p.title || "Unknown Product";
        const quantity = Number(p.quantity) || 0;
        productCounts[productName] = (productCounts[productName] || 0) + quantity;
      });
    }
  });
  const top_5_products = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Sales Trend (by date)
  const trendMap: Record<string, number> = {};
  sales.forEach(sale => {
    if (sale.date) {
      const date = formatDate(new Date(sale.date));
      trendMap[date] = (trendMap[date] || 0) + (sale.totalRevenue || 0);
    }
  });
  const trendDates = Object.keys(trendMap).sort();
  const trendRevenue = trendDates.map(date => trendMap[date]);

  // Udhaar KPIs
  const udhaars = await Udhaar.find();
  const totalUdhaarOutstanding = udhaars
    .filter(u => u.status !== "Paid")
    .reduce((acc, u) => acc + (u.amount - (u.paidAmount || 0)), 0);

  return NextResponse.json({
    total_stock_value: totalStockValue,
    total_items_inventory: totalItemsInventory,
    total_sales_orders: totalSalesOrders,
    total_revenue: totalRevenue,
    top_5_products,
    total_udhaar_outstanding: totalUdhaarOutstanding,
    sales_trend: {
      date_str: trendDates,
      revenue: trendRevenue
    },
    inventory_status_counts: statusCounts,
    inventory_category_counts: categoryCounts,
    user: "User"
  });
}
