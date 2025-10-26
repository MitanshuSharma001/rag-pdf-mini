import express from 'express';
import { getChatHistory, createNewChat, getChatById, deleteChat, updateChatTitle } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/history', getChatHistory);
router.post('/new', createNewChat);
router.get('/:chatId', getChatById);
router.delete('/:chatId', deleteChat);
router.patch('/:chatId/title', updateChatTitle);

// File upload endpoint
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: req.file.path,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed', message: error.message });
  }
});

export default router;