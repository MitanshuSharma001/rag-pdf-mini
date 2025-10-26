import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 1.5 Flash for fast responses with good quality
export const getChatModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
};

// Use text-embedding-004 for best embeddings
export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
};
export const querygenembedding = async(query)=>{
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(query)
    return result.embedding.values
  } catch (error) {
    console.log(error);
  }
}

export const generateEmbedding = async (text) => {
  try {
    const model = getEmbeddingModel();
     const requests =text.map((df)=>({
        model:'models/gemini-embedding-001',
        content:{ parts:[{text:df}] }
    }))
    const result = await model.batchEmbedContents({requests:requests});
    return result.embeddings;
    // return result.embedding.values;
  } catch (error) {
    throw new Error(`Gemini embedding errorkaisa: ${error.message}`);

  }
};

export const generateChatResponse = async (query, context, retryCount = 0) => {
  try {
    const model = getChatModel();
    
    const prompt = `You are a helpful assistant that answers questions based on the provided context. 
Use the following context to answer the user's question. If the answer cannot be found in the context, say so.

Context:
${context}

User Question: ${query}

Please provide a clear, concise, and accurate answer based on the context above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (retryCount < 1) {
      console.log('Retrying Gemini API call...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateChatResponse(query, context, retryCount + 1);
    }
    throw new Error(`Gemini chat error: ${error.message}`);
  }
};

export default genAI;