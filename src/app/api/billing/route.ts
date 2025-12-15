import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Bill from '@/models/Bill';

// GET: List all bills
export async function GET() {
  await dbConnect();
  const bills = await Bill.find().sort({ dateIssued: -1 });
  return NextResponse.json(bills);
}

// POST: Add a new bill
export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const bill = await Bill.create(data);
  return NextResponse.json(bill);
}
