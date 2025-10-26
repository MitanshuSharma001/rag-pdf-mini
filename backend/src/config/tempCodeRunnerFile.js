// {// const fs = require('fs');
// // const path = require('path');
// import fs from "fs";
// import path from "path";

// /**
//  * Recursively calculate the total size of a directory
//  * @param {string} dirPath - Path to the directory
//  * @returns {number} Total size in bytes
//  */
// function getDirectorySize(dirPath) {
//   let totalSize = 0;

//   try {
//     const files = fs.readdirSync(dirPath);

//     for (const file of files) {
//       const filePath = path.join(dirPath, file);
//       const stat = fs.statSync(filePath);

//       if (stat.isDirectory()) {
//         totalSize += getDirectorySize(filePath);
//       } else {
//         totalSize += stat.size;
//       }
//     }
//   } catch (error) {
//     console.error(`Error reading directory ${dirPath}:`, error.message);
//   }

//   return totalSize;
// }

// /**
//  * Convert bytes to human readable format
//  * @param {number} bytes - Size in bytes
//  * @returns {string} Formatted size (GB or MB)
//  */
// function formatSize(bytes) {
//   const gb = bytes / (1024 * 1024 * 1024);
//   const mb = bytes / (1024 * 1024);

//   if (gb >= 1) {
//     return `${gb.toFixed(2)} GB`;
//   } else if (mb >= 1) {
//     return `${Math.round(mb)} MB`;
//   } else {
//     return `${Math.round(bytes)} KB`;
//   }
// }

// /**
//  * List all folders sorted by size in descending order
//  * @param {string} dirPath - Path to the directory to scan
//  */
// function listFoldersBySize(dirPath) {
//   try {
//     // Check if directory exists
//     if (!fs.existsSync(dirPath)) {
//       console.error(`Directory not found: ${dirPath}`);
//       return;
//     }

//     const files = fs.readdirSync(dirPath);
//     const folders = [];

//     // Get all folders and their sizes
//     for (const file of files) {
//       const filePath = path.join(dirPath, file);
//       const stat = fs.statSync(filePath);

//       if (stat.isDirectory()) {
//         const sizeInBytes = getDirectorySize(filePath);
//         folders.push({
//           'Folder Name': file,
//           'Size': formatSize(sizeInBytes),
//           'Size (Bytes)': sizeInBytes
//         });
//       }
//     }

//     // Sort by size in descending order
//     folders.sort((a, b) => b['Size (Bytes)'] - a['Size (Bytes)']);

//     // Remove the bytes column for cleaner display
//     const displayFolders = folders.map(({ 'Folder Name': name, 'Size': size }) => ({
//       'Folder Name': name,
//       'Size': size
//     }));

//     // Display using console.table
//     if (displayFolders.length === 0) {
//       console.log('No folders found in the specified directory.');
//     } else {
//       console.log(`\n📁 Folders in: ${dirPath}\n`);
//       console.table(displayFolders);
//     }

//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// // Main execution
// const targetDirectory = process.argv[2] || './';
// console.log('🔍 Scanning directories and calculating sizes...\n');
// listFoldersBySize(targetDirectory);}
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from "fs";
import { request } from 'http';

dotenv.config();

const genAI = new GoogleGenerativeAI("AIzaSyDTfbPt1-E2ZAvH1NDqRVR7hkRl5Gafb_g");

// Use Gemini 1.5 Flash for fast responses with good quality
export const getChatModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
};

// Use text-embedding-004 for best embeddings
export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
};
    const model = getEmbeddingModel();
    const dh = ['sjf','sjhhd','ajhdf','ahgd']
    const fh =dh.map((df)=>({
       
        model:'models/gemini-embedding-001',
        content:{ parts:[{text:df}] }
      
    }))
    // console.log(fh[0].content.parts);
    
    // const result = await model.batchEmbedContents({requests:fh});
    // console.log(result.embeddings);
    // fs.writeFileSync('gg.json',JSON.stringify(result))
   const fhs= fs.readFileSync('D:/miniproj/rag-pdf-qa-system/backend/src/config/gg.json','utf-8')
  const ps = JSON.parse(fhs)
  console.log(ps.embeddings);
  
    // return result.embedding.values;
