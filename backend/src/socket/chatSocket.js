import prisma from '../config/database.js';
import { processPDFAndGenerateEmbeddings, queryRAGSystem } from '../services/ragService.js';
import { deletePDFFile } from '../services/pdfService.js';
import { checkChromaHealth } from '../config/chromadb.js';
import { generateAndStoreEmbeddings } from '../services/embeddingService.js';

// Track active processing to prevent parallel requests per user
const activeProcessing = new Map();

export const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle PDF upload and embedding generation
    socket.on('upload-pdf', async (data) => {
      const { chatId, userId, filePath, fileName } = data;

      // Check if user already has an active process
      if (activeProcessing.has(userId)) {
        return socket.emit('error', { 
          message: 'Please wait for the current operation to complete' 
        });
      }

      activeProcessing.set(userId, true);

      try {
        socket.emit('status', { message: 'Working upon it...', type: 'upload' });

        // Check ChromaDB health
        const chromaHealthy = await checkChromaHealth();
        if (!chromaHealthy) {
          throw new Error('ChromaDB is down');
        }

        // Verify chat ownership
        const chat = await prisma.chat.findFirst({
          where: { id: chatId, userId }
        });

        if (!chat) {
          throw new Error('Chat not found');
        }

        // Check message limit
        if (chat.messageCount >= 40) {
          throw new Error('Message limit reached for this chat (maximum 40 messages)');
        }

        socket.emit('status', { message: 'Working upon it...', type: 'embedding' });

        // Process PDF and generate embeddings
        const result = await processPDFAndGenerateEmbeddings(
          filePath,
          chat.collectionName,
          fileName
        );
        socket.emit('waitfor',{wait:result.wait})
        await generateAndStoreEmbeddings(result.chunks, result.collectionName, result.metadata);
        // await generateAndStoreEmbeddings()

        // Update chat with PDF info
        await prisma.chat.update({
          where: { id: chatId },
          data: { 
            pdfFileName: fileName,
            pdfUploadedAt: new Date(),
            status: 'active'
          }
        });

        // Delete the uploaded PDF file
        deletePDFFile(filePath);

        socket.emit('upload-complete', {
          message: 'PDF processed successfully',
          chunksCount: result.chunksCount,
          pdfFileName: fileName,
          pdfUploadedAt: new Date()
        });

      } catch (error) {
        console.error('PDF upload error:', error);
        
        // Mark chat as failed if it was a processing error
        if (chatId) {
          await prisma.chat.update({
            where: { id: chatId },
            data: { status: 'failed' }
          }).catch(console.error);
        }

        // Delete the uploaded file
        if (filePath) {
          deletePDFFile(filePath);
        }

        if (error.message.includes('ChromaDB')) {
          socket.emit('error', { 
            message: 'ChromaDB is down', 
            type: 'chromadb_down' 
          });
        } else {
          socket.emit('error', { 
            message: error.message || 'Failed to process PDF',
            type: 'upload_failed'
          });
        }
      } finally {
        activeProcessing.delete(userId);
      }
    });

    // Handle chat query
    socket.on('send-message', async (data) => {
      const { chatId, userId, message } = data;

      // Check if user already has an active process
      if (activeProcessing.has(userId)) {
        return socket.emit('error', { 
          message: 'Please wait for the current operation to complete' 
        });
      }

      activeProcessing.set(userId, true);

      try {
        // Check ChromaDB health
        const chromaHealthy = await checkChromaHealth();
        if (!chromaHealthy) {
          throw new Error('ChromaDB is down');
        }

        // Verify chat and get collection name
        const chat = await prisma.chat.findFirst({
          where: { id: chatId, userId }
        });

        if (!chat) {
          throw new Error('Chat not found');
        }

        if (chat.status === 'failed') {
          throw new Error('This chat has failed. Please create a new chat.');
        }

        // Check message limit
        if (chat.messageCount >= 40) {
          throw new Error('Message limit reached for this chat (maximum 40 messages)');
        }

        // Check if PDF has been uploaded
        if (!chat.pdfFileName) {
          throw new Error('Please upload a PDF first');
        }

        // Save user message to database
        await prisma.message.create({
          data: {
            chatId: chatId,
            role: 'user',
            content: message
          }
        });

        // Emit status that we're processing
        socket.emit('status', { message: 'Working upon it...', type: 'query' });

        // Update chat title with first message if needed
        if (!chat.firstMessage) {
          const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
          await prisma.chat.update({
            where: { id: chatId },
            data: { 
              title,
              firstMessage: message
            }
          });
        }

        // Query RAG system
        const result = await queryRAGSystem(message, chat.collectionName);

        // Save assistant response to database
        await prisma.message.create({
          data: {
            chatId: chatId,
            role: 'assistant',
            content: result.response
          }
        });

        // Increment message count
        await prisma.chat.update({
          where: { id: chatId },
          data: { 
            messageCount: chat.messageCount + 1,
            updatedAt: new Date()
          }
        });

        socket.emit('message-response', {
          query: message,
          response: result.response,
          sourcesCount: result.sourcesCount
        });

      } catch (error) {
        console.error('Chat query error:', error);

        if (error.message.includes('ChromaDB')) {
          socket.emit('error', { 
            message: 'ChromaDB is down', 
            type: 'chromadb_down' 
          });
        } else {
          socket.emit('error', { 
            message: error.message || 'Failed to process query',
            type: 'query_failed'
          });
        }
      } finally {
        activeProcessing.delete(userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};