import { ipcMain } from 'electron';
import { db } from '../server/src/db';

export function setupIpcHandlers() {
  // Initialize database
  db.init().catch((error) => {
    console.error('Error initializing database:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
  });

  // Get all prompts
  ipcMain.handle('get-prompts', async () => {
    try {
      return await db.getAllPrompts();
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  });

  // Get prompt by ID
  ipcMain.handle('get-prompt', async (_, id: string) => {
    try {
      const prompt = await db.getPromptById(id);
      if (!prompt) {
        throw new Error('Prompt not found');
      }
      return prompt;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }
  });

  // Create prompt
  ipcMain.handle('create-prompt', async (_, promptData) => {
    try {
      return await db.createPrompt(promptData);
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  });

  // Update prompt
  ipcMain.handle('update-prompt', async (_, id: string, promptData) => {
    try {
      return await db.updatePrompt(id, promptData);
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  });

  // Delete prompt
  ipcMain.handle('delete-prompt', async (_, id: string) => {
    try {
      return await db.deletePrompt(id);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  });

  // Search prompts
  ipcMain.handle('search-prompts', async (_, searchTerm: string) => {
    try {
      return await db.searchPrompts(searchTerm);
    } catch (error) {
      console.error('Error searching prompts:', error);
      throw error;
    }
  });

  // Get all history
  ipcMain.handle('get-history', async () => {
    try {
      return await db.getAllHistory();
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  });

  // Create history entry
  ipcMain.handle('create-history', async (_, historyData) => {
    try {
      return await db.createHistory(historyData);
    } catch (error) {
      console.error('Error creating history:', error);
      throw error;
    }
  });

  // Toggle history active state
  ipcMain.handle('toggle-history-active', async (_, id: string) => {
    try {
      return await db.toggleHistoryActive(id);
    } catch (error) {
      console.error('Error toggling history:', error);
      throw error;
    }
  });
}
