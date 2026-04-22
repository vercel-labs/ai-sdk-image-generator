import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'products';

// Lazy client initialization - create only when needed
let _client: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!_client) {
    console.log('🔍 Initializing Qdrant Client:');
    console.log('  URL:', process.env.QDRANT_URL);
    console.log('  Has API key:', !!process.env.QDRANT_API_KEY);
    
    if (!process.env.QDRANT_URL) {
      throw new Error('QDRANT_URL environment variable is not set');
    }
    
    _client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      checkCompatibility: false,
    });
  }
  return _client;
}

// Initialize collection
export async function initQdrantCollection() {
  try {
    const client = getClient();
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // all-MiniLM-L6-v2 produces 384-dim vectors
          distance: 'Cosine',
        },
      });
      console.log('✅ Qdrant collection created:', COLLECTION_NAME);
    } else {
      console.log('✅ Qdrant collection exists:', COLLECTION_NAME);
    }
  } catch (error) {
    console.error('❌ Qdrant init error:', error);
    throw error;
  }
}

// Insert products with embeddings
export async function upsertProducts(products: Array<{
  id: string | number;
  name: string;
  description: string;
  price?: number;
  category?: string;
  color?: string;
  material?: string;
  embedding: number[];
}>) {
  try {
    const client = getClient();
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: products.map(p => ({
        id: typeof p.id === 'string' ? parseInt(p.id) : p.id,
        vector: p.embedding,
        payload: {
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          color: p.color,
          material: p.material,
        },
      })),
    });
    console.log(`✅ Upserted ${products.length} products to Qdrant`);
  } catch (error) {
    console.error('❌ Upsert error:', error);
    throw error;
  }
}

// Search for similar products
export async function searchProducts(queryEmbedding: number[], limit = 5) {
  try {
    const client = getClient();
    console.log('🔍 searchProducts called with:');
    console.log('  - Collection:', COLLECTION_NAME);
    console.log('  - Embedding length:', queryEmbedding.length);
    console.log('  - Limit:', limit);
    console.log('  - Qdrant URL:', process.env.QDRANT_URL);
    console.log('  - Has API Key:', !!process.env.QDRANT_API_KEY);
    
    // First, check collection info
    const collectionInfo = await client.getCollection(COLLECTION_NAME);
    console.log('  - Points in collection:', collectionInfo.points_count);
    
    const results = await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
      score_threshold: 0.3,
    });
    
    console.log('  - Raw results count:', results.length);
    console.log('  - Raw results:', JSON.stringify(results, null, 2));
    
    const mappedResults = results.map(r => ({
      id: r.id,
      score: r.score,
      ...(r.payload as {
        name?: string;
        description?: string;
        price?: number;
        category?: string;
        color?: string;
        material?: string;
      }),
    }));
    
    console.log('  - Mapped results:', JSON.stringify(mappedResults, null, 2));
    
    return mappedResults;
  } catch (error) {
    console.error('❌ Search error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

// Delete all products (useful for testing)
export async function clearAllProducts() {
  try {
    const client = getClient();
    await client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'name',
            match: { any: ['*'] }
          }
        ]
      }
    });
    console.log('✅ Cleared all products');
  } catch (error) {
    console.error('❌ Clear error:', error);
  }
}

// Export client getter for backwards compatibility
export { getClient as client, COLLECTION_NAME };