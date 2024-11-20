import type { Prompt, UploadHistory } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async getAllPrompts(): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts`);
    if (!response.ok) {
      throw new Error('Failed to fetch prompts');
    }
    return response.json();
  },

  async getPromptById(id: string): Promise<Prompt | null> {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch prompt');
    }
    return response.json();
  },

  async createPrompt(prompt: Prompt): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create prompt: ${error.details || error.error}`);
    }
    return response.json();
  },

  async updatePrompt(prompt: Prompt): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts/${prompt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update prompt: ${error.details || error.error}`);
    }
    return response.json();
  },

  async deletePrompt(id: string): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete prompt');
    }
    return response.json();
  },

  async searchPrompts(searchTerm: string): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts/search?searchTerm=${searchTerm}`);
    if (!response.ok) {
      throw new Error('Failed to search prompts');
    }
    return response.json();
  },

  async getAllHistory(): Promise<UploadHistory[]> {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    return response.json();
  },

  async createHistory(history: UploadHistory): Promise<UploadHistory[]> {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(history),
    });
    if (!response.ok) {
      throw new Error('Failed to create history entry');
    }
    return response.json();
  },

  async toggleHistoryActive(id: string): Promise<UploadHistory[]> {
    const response = await fetch(`${API_BASE_URL}/history/${id}/toggle`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle history active state');
    }
    return response.json();
  },
};
