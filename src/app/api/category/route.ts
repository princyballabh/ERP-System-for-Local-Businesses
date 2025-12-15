import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';

export async function GET() {
  await dbConnect();
  const categories = await Category.find();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  const category = await Category.create(data);
  return NextResponse.json(category);
}
