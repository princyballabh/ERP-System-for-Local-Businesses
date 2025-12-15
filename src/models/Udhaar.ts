import mongoose from 'mongoose';

const UdhaarSchema = new mongoose.Schema({
  partyName: { type: String, required: true },
  contact: { type: String },
  amount: { type: String, required: true },
  dateGiven: { type: Date, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Overdue'], default: 'Unpaid' },
  lastPaymentDate: { type: Date },
  notes: { type: String },
  paidAmount: { type: String },
}, { timestamps: true });

export default mongoose.models.Udhaar || mongoose.model('Udhaar', UdhaarSchema);
