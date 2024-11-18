import express from 'express';
import cors from 'cors';
import { db } from './db';
import type { Prompt, UploadHistory } from '../../src/types';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database
db.init().catch(console.error);

// Prompts endpoints
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await db.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

app.get('/api/prompts/:id', async (req, res) => {
  try {
    const prompt = await db.getPromptById(req.params.id);
    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

app.post('/api/prompts', async (req, res) => {
  try {
    const prompt = req.body as Prompt;
    console.log('Creating prompt:', prompt);
    await db.createPrompt(prompt);
    console.log('Prompt created successfully');
    const prompts = await db.getAllPrompts();
    res.status(201).json(prompts);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt', details: error.message });
  }
});

app.put('/api/prompts/:id', async (req, res) => {
  try {
    const updatedPrompt = {
      ...req.body,
      id: req.params.id,
      lastModified: new Date().toISOString()
    } as Prompt;
    
    await db.updatePrompt(updatedPrompt);
    const prompts = await db.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt', details: error.message });
  }
});

app.delete('/api/prompts/:id', async (req, res) => {
  try {
    await db.deletePrompt(req.params.id);
    const prompts = await db.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// History endpoints
app.get('/api/history', async (req, res) => {
  try {
    const history = await db.getAllHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    await db.createHistory(req.body as UploadHistory);
    const history = await db.getAllHistory();
    res.status(201).json(history);
  } catch (error) {
    console.error('Error creating history:', error);
    res.status(500).json({ error: 'Failed to create history entry' });
  }
});

app.put('/api/history/:id/toggle', async (req, res) => {
  try {
    await db.toggleHistoryActive(req.params.id);
    const history = await db.getAllHistory();
    res.json(history);
  } catch (error) {
    console.error('Error toggling history active state:', error);
    res.status(500).json({ error: 'Failed to toggle history active state' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
