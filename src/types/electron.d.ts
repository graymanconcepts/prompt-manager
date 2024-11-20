import { Prompt, UploadHistory } from './index';

declare global {
  interface Window {
    api: {
      getPrompts: () => Promise<Prompt[]>;
      getPrompt: (id: string) => Promise<Prompt>;
      createPrompt: (promptData: Prompt) => Promise<Prompt[]>;
      updatePrompt: (id: string, promptData: Prompt) => Promise<Prompt[]>;
      deletePrompt: (id: string) => Promise<Prompt[]>;
      searchPrompts: (searchTerm: string) => Promise<Prompt[]>;
      getHistory: () => Promise<UploadHistory[]>;
      createHistory: (historyData: UploadHistory) => Promise<UploadHistory[]>;
      toggleHistoryActive: (id: string) => Promise<UploadHistory[]>;
    };
  }
}
