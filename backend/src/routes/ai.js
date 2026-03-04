import express from 'express';
import { chat, generateWorkflow } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/chat
// Body: { messages: [{ role: 'user'|'assistant', content: string }] }
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '"messages" must be an array' });
    }

    const raw = await chat(messages);
    const isComplete = raw.includes('[READY_TO_GENERATE]');
    const message = raw.replace('[READY_TO_GENERATE]', '').trim();

    res.json({ message, isComplete });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'AI service error. Check your API key or enable MOCK_AI.' });
  }
});

// POST /api/ai/generate
// Body: { messages: [{ role, content }] }
router.post('/generate', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '"messages" must be an array' });
    }

    const workflow = await generateWorkflow(messages);
    res.json(workflow);
  } catch (err) {
    console.error('AI generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate workflow. Try again.' });
  }
});

export default router;
