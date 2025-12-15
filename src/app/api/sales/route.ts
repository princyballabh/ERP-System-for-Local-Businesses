import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Sale from '@/models/Sale';

// GET: List sales
export async function GET() {
  await dbConnect();
  const sales = await Sale.find().sort({ date: -1 });
  return NextResponse.json(sales);
}

// POST: Add sale
export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const sale = await Sale.create(data);
  return NextResponse.json(sale);
}
