import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Items from './src/models/Items.js';
import Sale from './src/models/Sale.js';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI in your .env.local file");
  process.exit(1);
}

const CsvItems = [
    { prodName: "Smartphone X", prodId: "ITM-001", category: "Electronics", unitCost: 400 },
    { prodName: "Laptop Pro", prodId: "ITM-002", category: "Electronics", unitCost: 800 },
    { prodName: "Ergonomic Chair", prodId: "ITM-003", category: "Furniture", unitCost: 150 },
    { prodName: "Desk Lamp", prodId: "ITM-004", category: "Furniture", unitCost: 45 },
    { prodName: "Mechanical Keyboard", prodId: "ITM-005", category: "Accessories", unitCost: 90 },
    { prodName: "Wireless Mouse", prodId: "ITM-006", category: "Accessories", unitCost: 40 },
    { prodName: "USB-C Hub", prodId: "ITM-007", category: "Accessories", unitCost: 25 },
    { prodName: "27-inch Monitor", prodId: "ITM-008", category: "Electronics", unitCost: 300 },
    { prodName: "Standing Desk", prodId: "ITM-009", category: "Furniture", unitCost: 450 },
    { prodName: "Noise Cancelling Headphones", prodId: "ITM-010", category: "Electronics", unitCost: 200 }
];

async function seedDatabase() {
  await mongoose.connect(MONGODB_URI as string);
  console.log('📦 Connected to MongoDB');

  console.log('🧹 Clearing existing Items and Sales for a clean slate...');
  await Items.deleteMany({});
  await Sale.deleteMany({});

  console.log('🌱 Seeding 10 Core Retail Items...');
  const insertedItems = [];
  for (const item of CsvItems) {
    const i = new Items({
        prodName: item.prodName,
        prodId: item.prodId,
        category: item.category,
        currentQuantity: Math.floor(Math.random() * 200) + 50,
        unitCost: item.unitCost,
        totalCost: item.unitCost * 50, // rough estimate
        status: 'Active',
        incomingStock: Math.floor(Math.random() * 50)
    });
    await i.save();
    insertedItems.push(i);
  }
  
  console.log('🛍️ Generating 2,000 Historical Sales records spanning 8 months...');
  const sales = [];
  
  // Go back ~240 days
  const today = new Date();
  for(let i = 0; i < 2000; i++) {
      // Pick random date within last 240 days
      const daysAgo = Math.floor(Math.random() * 240);
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - daysAgo);
      
      // Randomly pick 1 to 3 items
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const products = [];
      let totalRevenue = 0;

      for (let p = 0; p < numProducts; p++) {
          const randomItem = insertedItems[Math.floor(Math.random() * insertedItems.length)];
          const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 bought
          const price = randomItem.unitCost * 1.3; // 30% markup
          products.push({
              productName: randomItem.prodName,
              quantity: qty,
              unitPrice: price,
              totalAmount: price * qty
          });
          totalRevenue += (price * qty);
      }

      sales.push({
          orderId: `ORD-${Date.now()}-${i}`,
          invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}-${i}`,
          date: saleDate,
          customerName: `Cust-${Math.floor(Math.random() * 500)}`,
          products: products,
          totalRevenue: totalRevenue,
          status: 'Completed',
          paymentStatus: 'Paid'
      });
  }
  
  await Sale.insertMany(sales);

  console.log('✅ Successfully seeded 10 Items and 2000 historical Sale records into your production DB schema!');
  process.exit();
}

seedDatabase().catch(console.error);