import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    getPrompts: () => ipcRenderer.invoke('get-prompts'),
    getPrompt: (id) => ipcRenderer.invoke('get-prompt', id),
    createPrompt: (promptData) => ipcRenderer.invoke('create-prompt', promptData),
    updatePrompt: (id, promptData) => ipcRenderer.invoke('update-prompt', id, promptData),
    deletePrompt: (id) => ipcRenderer.invoke('delete-prompt', id),
    searchPrompts: (searchTerm) => ipcRenderer.invoke('search-prompts', searchTerm),
    getHistory: () => ipcRenderer.invoke('get-history'),
    createHistory: (historyData) => ipcRenderer.invoke('create-history', historyData),
    toggleHistoryActive: (id) => ipcRenderer.invoke('toggle-history-active', id),
  }
);
