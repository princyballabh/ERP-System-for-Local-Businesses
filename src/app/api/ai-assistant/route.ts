import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Items from '@/models/Items';
import Sale from '@/models/Sale';
import Bill from '@/models/Bill';
import Udhaar from '@/models/Udhaar';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Fetch all relevant data from database
    const [items, sales, bills, udhaar] = await Promise.all([
      Items.find().lean(),
      Sale.find().sort({ date: -1 }).limit(100).lean(),
      Bill.find().sort({ date: -1 }).limit(50).lean(),
      Udhaar.find().lean(),
    ]);

    // Calculate key metrics
    const totalInventoryValue = Number(items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0));
    const lowStockItems = items.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');
    const totalSales = Number(sales.reduce((sum, sale) => sum + (Number(sale.totalRevenue) || 0), 0));
    const totalUdhaar = Number(udhaar.reduce((sum, u) => sum + (Number(u.amount) || 0), 0));
    
    // Get party-wise udhaar details
    const udhaarByParty = udhaar.map((u: any) => ({
      partyName: u.partyName,
      amount: Number(u.amount) || 0,
      status: u.status,
      dueDate: u.dueDate,
      paidAmount: Number(u.paidAmount) || 0,
    }));
    
    // Get top selling items
    const productSales: { [key: string]: number } = {};
    sales.forEach((sale: any) => {
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach((product: any) => {
          const name = product.productName || product.name;
          if (name) {
            productSales[name] = (productSales[name] || 0) + (Number(product.quantity) || 0);
          }
        });
      }
    });
    
    const topSellingItems = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, qty]) => ({ name, quantity: qty }));

    // Prepare context for LLM
    const context = {
      totalItems: items.length,
      totalInventoryValue: totalInventoryValue.toFixed(2),
      lowStockItems: lowStockItems.map(item => ({
        name: item.prodName,
        quantity: item.currentQuantity,
        status: item.status,
      })),
      topSellingItems,
      totalSales: totalSales.toFixed(2),
      totalUdhaar: totalUdhaar.toFixed(2),
      udhaarByParty,
      recentSales: sales.slice(0, 10).map((sale: any) => ({
        date: sale.date,
        amount: sale.totalRevenue,
        customer: sale.customerName,
      })),
    };

    // Call LLM API (using Groq as example - it's free)
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not configured. Please add it to your .env.local file' 
      }, { status: 500 });
    }

    const prompt = `You are a helpful business assistant for an ERP system. 
    
Here is the current business data:
${JSON.stringify(context, null, 2)}

User question: ${question}

Provide a clear, concise, and helpful answer based on the data above. Use numbers and be specific. Format your response in a friendly, professional manner. 

Important formatting rules:
- Do not use asterisks (*) or markdown formatting
- Use plain text with proper punctuation
- Add blank lines between different topics or sections for better readability
- Keep paragraphs short (2-3 sentences max)
- Use simple bullet points with dashes (-) if listing items`;

    const llmResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and free model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful business assistant analyzing ERP data. Be concise and data-driven. Never use asterisks or markdown formatting in your responses - use plain text only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error('LLM API Error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to get AI response. Please check your API key.' 
      }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ answer, context });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
