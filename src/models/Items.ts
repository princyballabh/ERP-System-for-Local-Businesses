import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  prodName: { type: String, required: true },
  prodId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  currentQuantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Low Stock', 'Out of Stock'], required: true },
  incomingStock: { type: Number, default: 0 },
});

export default mongoose.models.Items ||
  mongoose.model('Items', ItemSchema);
