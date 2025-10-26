import pdfParse from 'pdf-parse';
import fs from 'fs';
import { getChatModel } from '../config/gemini.js';

export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);    
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction error: ${error.message}`);
  }
};

export const chunkTextByParagraphs = (text, paragraphsPerChunk = 2) => {
  // Split by multiple newlines to identify paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const chunks = [];
  for (let i = 0; i < paragraphs.length; i += paragraphsPerChunk) {
    const chunk = paragraphs.slice(i, i + paragraphsPerChunk).join('\n\n');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
};

export const deletePDFFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting PDF file:', error);
  }
};