import type { Prompt, UploadHistory } from '../types';

export const api = {
  async getAllPrompts(): Promise<Prompt[]> {
    try {
      return await window.api.getPrompts();
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      throw new Error('Failed to fetch prompts');
    }
  },

  async getPromptById(id: string): Promise<Prompt | null> {
    try {
      return await window.api.getPrompt(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Prompt not found') {
        return null;
      }
      console.error('Failed to fetch prompt:', error);
      throw new Error('Failed to fetch prompt');
    }
  },

  async createPrompt(prompt: Prompt): Promise<Prompt[]> {
    try {
      return await window.api.createPrompt(prompt);
    } catch (error) {
      console.error('Failed to create prompt:', error);
      throw new Error(`Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updatePrompt(prompt: Prompt): Promise<Prompt[]> {
    try {
      return await window.api.updatePrompt(prompt.id, prompt);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      throw new Error(`Failed to update prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async deletePrompt(id: string): Promise<Prompt[]> {
    try {
      return await window.api.deletePrompt(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      throw new Error('Failed to delete prompt');
    }
  },

  async searchPrompts(searchTerm: string): Promise<Prompt[]> {
    try {
      return await window.api.searchPrompts(searchTerm);
    } catch (error) {
      console.error('Failed to search prompts:', error);
      throw new Error('Failed to search prompts');
    }
  },

  async getAllHistory(): Promise<UploadHistory[]> {
    try {
      return await window.api.getHistory();
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw new Error('Failed to fetch history');
    }
  },

  async createHistory(history: UploadHistory): Promise<UploadHistory[]> {
    try {
      return await window.api.createHistory(history);
    } catch (error) {
      console.error('Failed to create history entry:', error);
      throw new Error('Failed to create history entry');
    }
  },

  async toggleHistoryActive(id: string): Promise<UploadHistory[]> {
    try {
      return await window.api.toggleHistoryActive(id);
    } catch (error) {
      console.error('Failed to toggle history active state:', error);
      throw new Error('Failed to toggle history active state');
    }
  },
};
