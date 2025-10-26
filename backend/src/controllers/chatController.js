import prisma from '../config/database.js';
import { deleteCollection } from '../config/chromadb.js';
import { v4 as uuidv4 } from 'uuid';

export const getChatHistory = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        firstMessage: true,
        messageCount: true,
        status: true,
        pdfFileName: true,
        pdfUploadedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({ chats });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history', message: error.message });
  }
};

export const createNewChat = async (req, res) => {
  try {
    const collectionName = `user_${req.user.id}_chat_${uuidv4()}`;
    
    const chat = await prisma.chat.create({
      data: {
        userId: req.user.id,
        title: 'New Chat',
        collectionName,
        status: 'active'
      }
    });

    res.status(201).json({ 
      message: 'New chat created', 
      chat: {
        id: chat.id,
        title: chat.title,
        collectionName: chat.collectionName,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat', message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: req.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to fetch chat', message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: req.user.id
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete ChromaDB collection
    await deleteCollection(chat.collectionName);

    // Delete chat from database (messages will cascade delete)
    await prisma.chat.delete({
      where: { id: chatId }
    });

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat', message: error.message });
  }
};

export const updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: req.user.id
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });

    res.status(200).json({ message: 'Title updated', chat: updatedChat });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Failed to update title', message: error.message });
  }
};