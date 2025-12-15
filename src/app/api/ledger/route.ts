import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Udhaar from '@/models/Udhaar';

// GET all udhaar entries (with optional filters)
export async function GET(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url!);
  const party = url.searchParams.get('party');
  const status = url.searchParams.get('status');
  const filter: any = {};
  if (party) filter.partyName = party;
  if (status) filter.status = status;
  const entries = await Udhaar.find(filter).sort({ dateGiven: -1 });
  return NextResponse.json(entries);
}

// POST: Add new udhaar entry
export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  // Determine status
  let status: 'Paid' | 'Unpaid' | 'Overdue' = 'Unpaid';
  if (data.paidAmount && data.paidAmount >= data.amount) status = 'Paid';
  else if (data.dueDate && new Date(data.dueDate) < new Date() && (!data.paidAmount || data.paidAmount < data.amount)) status = 'Overdue';
  data.status = status;
  const entry = await Udhaar.create(data);
  return NextResponse.json(entry);
}

// PATCH: Settle udhaar (mark as paid/partial)
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const { id, payment, paymentDate } = await req.json();
  const entry = await Udhaar.findById(id);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  entry.paidAmount = (entry.paidAmount || 0) + payment;
  entry.lastPaymentDate = paymentDate;
  if (entry.paidAmount >= entry.amount) entry.status = 'Paid';
  else if (entry.dueDate && new Date(entry.dueDate) < new Date()) entry.status = 'Overdue';
  else entry.status = 'Unpaid';
  await entry.save();
  return NextResponse.json(entry);
}
