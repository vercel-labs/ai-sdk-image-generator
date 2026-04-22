
import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { generateEmbedding } from '@/lib/embeddings';
import { searchProducts } from '@/lib/qdrant';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Define types for better type safety
interface Product {
  id: string | number;
  name?: string;
  description?: string;
  price?: number;
  color?: string;
  material?: string;
  category?: string;
  score?: number;
}

export async function POST(req: NextRequest) {
  try {
    console.log('\n========== NEW REQUEST ==========');
    const { prompt, useRAG } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🔍 User query:', prompt);
    console.log('🔧 RAG enabled:', useRAG);
    console.log('🔑 Environment check:');
    console.log('  - HUGGINGFACE_API_KEY exists:', !!process.env.HUGGINGFACE_API_KEY);
    console.log('  - QDRANT_URL:', process.env.QDRANT_URL || 'not set');

    let products: Product[] = [];
    let productsContext = '';

    // If RAG is enabled, search for relevant products
    if (useRAG) {
      console.log('🔄 Generating query embedding...');
      console.log('Original prompt:', prompt);
      console.log('Lowercased prompt:', prompt.toLowerCase());
      
      // Generate embedding for the user's query
      const queryEmbedding = await generateEmbedding(prompt.toLowerCase());
      console.log(`✅ Query embedding generated (length: ${queryEmbedding.length})`);
      console.log('First 5 values:', queryEmbedding.slice(0, 5));
      console.log('Embedding type:', typeof queryEmbedding[0]);
      
      // Search Qdrant for similar products
      console.log('🔍 Searching Qdrant for matching products...');
      console.log('Calling searchProducts with embedding length:', queryEmbedding.length);
      
      products = await searchProducts(queryEmbedding, 5);
      
      console.log(`📦 Found ${products.length} matching products`);
      console.log('Raw products data:', JSON.stringify(products, null, 2));
      
      if (products.length > 0) {
        console.log('Top matches:');
        products.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name} (score: ${p.score ? (p.score * 100).toFixed(1) : 'N/A'}%)`);
        });
        
        // Build context from retrieved products
        productsContext = '\n\nRelevant products from our catalog:\n';
        products.forEach((p, i) => {
          productsContext += `\n${i + 1}. ${p.name || 'Unknown Product'}`;
          if (p.description) productsContext += ` - ${p.description}`;
          if (p.price) productsContext += ` (Price: ${p.price})`;
          if (p.color) productsContext += ` [Color: ${p.color}]`;
          if (p.material) productsContext += ` [Material: ${p.material}]`;
          if (p.category) productsContext += ` [Category: ${p.category}]`;
        });
        productsContext += '\n';
        console.log('📝 Products context built:', productsContext);
      }
    }

    // Create system message with product context
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful product recommendation assistant for a furniture store. ${
        products.length > 0
          ? `Use the following products to answer the user's question: ${productsContext}`
          : 'No matching products were found in our current inventory. Politely inform the user and ask for more details about what they are looking for (style, material, price range, features, etc.).'
      }`
    };

    // Generate response using the chat model
    console.log('🤖 Generating AI response...');
    
    const response = await hf.chatCompletion({
      model: 'openai/gpt-oss-20b',
      messages: [
        systemMessage,
        {
          role: 'user' as const,
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const result = response.choices[0]?.message?.content || '';
    
    console.log('✅ AI response generated');

    return NextResponse.json({
      result,
      products: products,
      ragUsed: useRAG && products.length > 0,
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    
    let errorMessage = 'Failed to generate response';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.stack);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}