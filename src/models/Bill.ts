import mongoose from 'mongoose';

const LineItemSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  rate: Number,
  total: Number,
});

const BillSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  dateIssued: { type: Date, required: true },
  dueDate: { type: Date },
  customerName: { type: String, required: true },
  saleRef: { type: String }, // Linked sale/order ID
  lineItems: [LineItemSchema],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { type: String },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'], default: 'Unpaid' },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
