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
  const errorMessage = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: 'Something went wrong!', details: errorMessage });
});

// Initialize database
db.init().catch((error) => {
  console.error('Error initializing database:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
});

// Prompts endpoints
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await db.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to fetch prompts', details: errorMessage });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to fetch prompt', details: errorMessage });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to create prompt', details: errorMessage });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to update prompt', details: errorMessage });
  }
});

app.delete('/api/prompts/:id', async (req, res) => {
  try {
    await db.deletePrompt(req.params.id);
    const prompts = await db.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to delete prompt', details: errorMessage });
  }
});

// History endpoints
app.get('/api/history', async (req, res) => {
  try {
    const history = await db.getAllHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to fetch history', details: errorMessage });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    await db.createHistory(req.body as UploadHistory);
    const history = await db.getAllHistory();
    res.status(201).json(history);
  } catch (error) {
    console.error('Error creating history:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to create history entry', details: errorMessage });
  }
});

app.put('/api/history/:id/toggle', async (req, res) => {
  try {
    await db.toggleHistoryActive(req.params.id);
    const history = await db.getAllHistory();
    res.json(history);
  } catch (error) {
    console.error('Error toggling history active state:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to toggle history active state', details: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
