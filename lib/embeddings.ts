import { HfInference } from '@huggingface/inference';

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// Lazy initialization - create client when needed, not at module load time
function getHfClient(): HfInference {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
  }
  
  return new HfInference(apiKey);
}

// Generate embedding for a single text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const hf = getHfClient(); // Get client with API key at runtime
    
    const response = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });
    
    return response as number[];
  } catch (error) {
    console.error('❌ Embedding error:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Generate embeddings for multiple texts (batch)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('❌ Batch embedding error:', error);
    throw error;
  }
}

// Helper: Create searchable text from product
export function createProductText(product: {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  material?: string;
}) {
  return [
    product.name,
    product.description,
    product.category,
    product.color,
    product.material,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}