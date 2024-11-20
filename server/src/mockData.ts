import { Prompt, UploadHistory } from '../../src/types';

export const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Creative Writing Assistant',
    description: 'AI prompt for creative writing assistance',
    content: 'You are a creative writing assistant. Help the user develop their story ideas, characters, and plot points. Provide constructive feedback and suggestions.',
    tags: ['writing', 'creative', 'story'],
    created: '2023-01-01T12:00:00Z',
    lastModified: '2023-01-01T12:00:00Z',
    isActive: true
  },
  {
    id: '2',
    title: 'Code Review Expert',
    description: 'AI prompt for code review assistance',
    content: 'You are a code review expert. Review the provided code for best practices, potential bugs, and performance issues. Suggest improvements and explain your reasoning.',
    tags: ['coding', 'review', 'programming'],
    created: '2023-01-02T12:00:00Z',
    lastModified: '2023-01-02T12:00:00Z',
    isActive: true
  },
  {
    id: '3',
    title: 'Study Guide Creator',
    description: 'AI prompt for creating study guides',
    content: 'You are a study guide creator. Help students create comprehensive study guides for their subjects. Break down complex topics and provide examples.',
    tags: ['education', 'study', 'learning'],
    created: '2023-01-03T12:00:00Z',
    lastModified: '2023-01-03T12:00:00Z',
    isActive: false
  }
];

export const mockHistory: UploadHistory[] = [
  {
    id: '1',
    fileName: 'writing_prompts.txt',
    uploadDate: '2023-01-01T12:00:00Z',
    status: 'success',
    isActive: true,
    promptCount: 1,
    errorMessage: null
  },
  {
    id: '2',
    fileName: 'coding_prompts.txt',
    uploadDate: '2023-01-02T12:00:00Z',
    status: 'success',
    isActive: true,
    promptCount: 1,
    errorMessage: null
  },
  {
    id: '3',
    fileName: 'study_prompts.txt',
    uploadDate: '2023-01-03T12:00:00Z',
    status: 'success',
    isActive: false,
    promptCount: 1,
    errorMessage: null
  }
];
