import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  unitPrice: Number,
  totalAmount: Number,
});

const SaleSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  customerName: { type: String, required: true },
  products: [ProductSchema],
  totalRevenue: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
