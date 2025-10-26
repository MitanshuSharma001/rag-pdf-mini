import { extractTextFromPDF, chunkTextByParagraphs } from './pdfService.js';
import { generateAndStoreEmbeddings, queryEmbeddings } from './embeddingService.js';
import { generateChatResponse, getChatModel } from '../config/gemini.js';

export const processPDFAndGenerateEmbeddings = async (filePath, collectionName, fileName) => {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    // Chunk text by 2 paragraphs
    const chunks = chunkTextByParagraphs(text, 2);
    
    if (chunks.length === 0) {
      throw new Error('No valid chunks generated from PDF');
    }

    // Generate and store embeddings
    const metadata = {
      fileName,
      uploadedAt: new Date().toISOString()
    };
    const jh = await getChatModel()
      //  console.log('chunks lenght',chunks.length);
    const total = await jh.countTokens(chunks)
    let totalLoops=2
    if (total.totalTokens >=30000) {
      totalLoops = Math.ceil(total.totalTokens/30000)
    }
    else totalLoops='<1'
    return {
      success: true,
      chunksCount: chunks.length,
      textLength: text.length,
      wait: totalLoops,
      chunks,
      collectionName,
      metadata
    }

    // await generateAndStoreEmbeddings(chunks, collectionName, metadata);

    // return {
    //   success: true,
    //   chunksCount: chunks.length,
    //   textLength: text.length
    // };
  } catch (error) {
    throw new Error(`RAG processing error: ${error.message}`);
  }
};

export const queryRAGSystem = async (query, collectionName) => {
  try {
    // Query embeddings to get top 10 relevant chunks
    const results = await queryEmbeddings(query, collectionName, 10);

    if (results.length === 0) {
      return {
        response: "I couldn't find relevant information in the document to answer your question.",
        sources: []
      };
    }

    // Prepare context from retrieved chunks
    const context = results
      .map((item, idx) => `[${idx + 1}] ${item.document}`)
      .join('\n\n');

    // Generate response using Gemini
    const response = await generateChatResponse(query, context);

    return {
      response,
      sources: results.map(r => r.document),
      sourcesCount: results.length
    };
  } catch (error) {
    throw new Error(`RAG query error: ${error.message}`);
  }
};