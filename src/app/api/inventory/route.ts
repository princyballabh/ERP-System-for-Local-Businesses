import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Items from '@/models/Items';

export async function GET() {
  await dbConnect();
  const items = await Items.find();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  data.totalCost = data.unitCost * data.currentQuantity;
  data.status =
    data.currentQuantity === 0
      ? 'Out of Stock'
      : data.currentQuantity < 5
      ? 'Low Stock'
      : 'Active';
  const item = await Items.create(data);
  return NextResponse.json(item);
}
