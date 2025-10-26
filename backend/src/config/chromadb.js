import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

const chromaClient = new ChromaClient({
  path: `http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || '8000'}`
});

export const getOrCreateCollection = async (collectionName) => {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: collectionName,
      metadata: { 'hnsw:space': 'cosine' }
    });
    return collection;
  } catch (error) {
    throw new Error(`ChromaDB error: ${error.message}`);
  }
};

export const deleteCollection = async (collectionName) => {
  try {
    await chromaClient.deleteCollection({ name: collectionName });
  } catch (error) {
    console.error('Error deleting collection:', error);
  }
};

export const checkChromaHealth = async () => {
  try {
    await chromaClient.heartbeat();
    return true;
  } catch (error) {
    return false;
  }
};

export default chromaClient;