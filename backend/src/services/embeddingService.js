import { generateEmbedding, querygenembedding } from '../config/gemini.js';
import { getOrCreateCollection } from '../config/chromadb.js';
import { v4 as uuidv4 } from 'uuid';
import { getChatModel } from '../config/gemini.js';

export const generateAndStoreEmbeddings = async (chunks, collectionName, metadata = {}) => {
   const jh = await getChatModel()
  //  console.log('chunks lenght',chunks.length);
   
   const total = await jh.countTokens(chunks)
  //  const ajf = await jh.countTokens(chunks.slice(0,Math.floor(chunks.length/2)))
  //  const ajl = await jh.countTokens(chunks.slice(Math.floor(chunks.length/2),chunks.length))
   console.log('total tok',total.totalTokens);
try {
  const collection = await getOrCreateCollection(collectionName);

  const embeddings = [];
  const ids = [];
  const documents = [];
  const metadatas = [];

  const TOKEN_LIMIT = 30000;
  const BYTE_LIMIT = 34000; // margin under your 36000 limit
  const WAIT_MS = 1000 * 66;

  // 1️⃣ Average tokens per paragraph
  const avgTokens = total.totalTokens / chunks.length;

  // 2️⃣ Token-based batching
  const chunksPerTokenBatch = Math.floor(TOKEN_LIMIT / avgTokens) || 1;
  const tokenBatches = [];
  for (let i = 0; i < chunks.length; i += chunksPerTokenBatch) {
    tokenBatches.push(chunks.slice(i, i + chunksPerTokenBatch));
  }

  // Helper: split by bytes under BYTE_LIMIT
  const splitByByteSize = (chunkGroup) => {
    const subGroups = [];
    let currentGroup = [];
    let currentBytes = 0;

    for (const paragraph of chunkGroup) {
      const paragraphBytes = Buffer.byteLength(paragraph, 'utf-8');

      // if adding this paragraph exceeds the limit → start a new group
      if (currentBytes + paragraphBytes > BYTE_LIMIT && currentGroup.length > 0) {
        subGroups.push(currentGroup);
        currentGroup = [paragraph];
        currentBytes = paragraphBytes;
      } else {
        currentGroup.push(paragraph);
        currentBytes += paragraphBytes;
      }
    }

    if (currentGroup.length > 0) subGroups.push(currentGroup);
    return subGroups;
  };

  // 3️⃣ Process token batches
  for (let batchIndex = 0; batchIndex < tokenBatches.length; batchIndex++) {
    const batch = tokenBatches[batchIndex];
    const startIndex = batchIndex * chunksPerTokenBatch
    let processedCount = 0;
    const subBatches = splitByByteSize(batch);

    console.log(`Processing token batch ${batchIndex + 1}/${tokenBatches.length} (${batch.length} paragraphs)`);

    // 4️⃣ Process each byte-safe sub-batch sequentially
    for (const subBatch of subBatches) {
      const embedding = await generateEmbedding(subBatch);

      // Map embeddings to their corresponding paragraphs
      embedding.forEach((element, localIdx) => {
        const paragraph = subBatch[localIdx];
         const originalIndex = startIndex + processedCount + localIdx; // preserve original index

        embeddings.push(element.values);
        ids.push(uuidv4());
        documents.push(paragraph);
        metadatas.push({
          chunkIndex: originalIndex,
          ...metadata
        });
      });
      processedCount += subBatch.length;
    }

    // 5️⃣ Rate-limit delay after full token batch (except last)
    if (batchIndex < tokenBatches.length - 1) {
      console.log(`Waiting ${WAIT_MS / 1000} seconds before next token batch...`);
      await new Promise(res => setTimeout(res, WAIT_MS));
    }
  }

  // 6️⃣ Store all embeddings at once
  await collection.add({
    ids,
    embeddings,
    documents,
    metadatas
  });

  return { success: true, count: chunks.length };

} catch (error) {
  throw new Error(`Embedding storage error: ${error.message}`);
}

  // try {
  //   const collection = await getOrCreateCollection(collectionName);
    
  //   const embeddings = [];
  //   const ids = [];
  //   const documents = [];
  //   const metadatas = [];
  //   let totalLoops=2
  //   let j=0
  //   if (total.totalTokens >=40000) {
  //     totalLoops = Math.ceil(total.totalTokens/30000)
  //   }
  //   const totalChunksDivision= Math.floor(chunks.length/totalLoops)
  //   let numb = totalChunksDivision
  //   while (chunks.length%numb!=0) {
  //     numb--
  //   }
  //   const dj = chunks.reduce((acc,val,djI,arr)=>{
  //     let start=0,end=numb-1
  //     if (true) {
  //       acc.push({start:start,end:end})
  //     }
  //     if (numb%djI==0) {

  //     }

  //   },[])
  //   for (let i = 0; i < totalLoops; i++) {
  //     if (chunks.length-numb*(i+1)<numb) {
        
  //     }
  //     // const chunk = chunks[i];
  //     if (Buffer.byteLength((chunks.slice(j,numb*(i+1))).join(''),'utf-8')>=36000) {
  //       const bufdivision = Math.floor((Buffer.byteLength((chunks.slice(j,numb*(i+1))).join(''),'utf-8'))/36000)
  //       let numb1 = bufdivision
  //       while (chunks.length%numb1!=0) {
  //         numb1--
  //       }
  //       let y=0
  //       for (let inde = 0; inde < bufdivision; inde++) {
  //         const embedding = await generateEmbedding(chunks.slice(y,bufdivision*(i+1)));
  //       }
  //     }
  //     const embedding = await generateEmbedding(chunks.slice(j,numb*(i+1)));
  //     embedding.forEach((element,ind) => {
  //       embeddings.push(element.values);
  //       ids.push(uuidv4());
  //       documents.push(chunks[ind])
  //       metadatas.push({
  //         chunkIndex: j+ind,
  //         ...metadata
  //       });
  //     });

  //     j=numb*(i+1)
      
  //     y=numb*(i+1)
  //     if (i==totalLoops-1) {
  //       console.log('ended');
  //     }
  //     else {
  //       console.log(`${i} wait minute started`);
  //       await new Promise((resolve, reject) => setTimeout(()=>{resolve(console.log(`${i} wait minute ended`))},1000*65))
  //     } 
  //   }

  //   // for (let i = 0; i < chunks.length; i++) {
  //   //   const chunk = chunks[i];
  //   //   const embedding = await generateEmbedding(chunk);
      
  //   //   embeddings.push(embedding);
  //   //   ids.push(uuidv4());
  //   //   documents.push(chunk);
  //   //   metadatas.push({
  //   //     chunkIndex: i,
  //   //     ...metadata
  //   //   });
  //   //   if (i%98==0&&i!=1) {
  //   //     console.log('Waiting for 1 minute as rate limit reached')
        
  //   //     await new Promise((res,rej)=>setTimeout(()=>{res('done')},1000*62))
  //   //   }
  //   // }

  //   await collection.add({
  //     ids,
  //     embeddings,
  //     documents,
  //     metadatas
  //   });

  //   return { success: true, count: chunks.length };
  // } catch (error) {
  //   throw new Error(`Embedding storage error: ${error.message}`);
  // }
};

export const queryEmbeddings = async (query, collectionName, k = 10) => {
  try {
    const collection = await getOrCreateCollection(collectionName);
    // const queryEmbedding = await generateEmbedding(query);
    const queryEmbedding = await querygenembedding(query)

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k
    });

    // Results are ordered by similarity (cosine distance)
    const documents = results.documents[0] || [];
    const distances = results.distances[0] || [];

    // Filter by similarity threshold (optional, cosine similarity > 0.3)
    const filteredResults = documents
      .map((doc, idx) => ({
        document: doc,
        similarity: 1 - distances[idx] // Convert distance to similarity
      }))
      .filter(item => item.similarity > 0.3);

    return filteredResults;
  } catch (error) {
    throw new Error(`Query error: ${error.message}`);
  }
};