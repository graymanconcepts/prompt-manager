export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  created: string;
  lastModified: string;
  isActive: boolean;
  historyId?: string;  // ID of the associated upload history entry, if any
  historyIsActive?: boolean;
}

export interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'success' | 'error';
  isActive: boolean;
  promptCount: number;
  errorMessage: string | null;
}