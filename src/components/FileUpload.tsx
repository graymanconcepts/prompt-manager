import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { Prompt, UploadHistory } from '../types';

interface FileUploadProps {
  onFileProcess: (prompts: Prompt[], historyEntry: UploadHistory) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    // Get filename without extension for use as name
    const fileName = file.name;
    const titleName = file.name.replace(/\.[^/.]+$/, '');
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let prompts: Prompt[] = [];

        // Try to parse as JSON first
        try {
          const jsonData = JSON.parse(text);
          if (Array.isArray(jsonData)) {
            prompts = jsonData.map(item => ({
              id: crypto.randomUUID(),
              title: titleName,
              description: item.prompt?.slice(0, 100) + (item.prompt?.length > 100 ? '...' : '') || '',
              content: item.prompt || '',
              tags: ['imported', 'json'],
              created: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              isActive: true
            }));
          }
        } catch (jsonError) {
          // Split content by empty lines to separate prompts
          const blocks = text.split('\n\n');
          prompts = blocks
            .filter(block => block.trim() !== '')
            .map(block => ({
              id: crypto.randomUUID(),
              title: titleName,
              description: block.slice(0, 100) + (block.length > 100 ? '...' : ''),
              content: block.trim(),
              tags: [
                'imported',
                file.name.endsWith('.md') || file.name.endsWith('.markdown') ? 'markdown' : 'text'
              ],
              created: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              isActive: true
            }));
        }

        if (prompts.length > 0) {
          // Create history entry with original filename
          const historyEntry: UploadHistory = {
            id: crypto.randomUUID(),
            fileName: fileName, // Use original filename
            uploadDate: new Date().toISOString(),
            status: 'success',
            isActive: true,
            promptCount: prompts.length,
            errorMessage: null
          };
          
          // Add historyId to all prompts from this file
          const promptsWithHistory = prompts.map(prompt => ({
            ...prompt,
            historyId: historyEntry.id
          }));
          
          onFileProcess(promptsWithHistory, historyEntry);
          setError(null);
        } else {
          setError('No valid content found in file');
        }
      } catch (error) {
        setError('Error processing file');
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  }, [onFileProcess]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone itself
    // not when leaving its children
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.json') || 
      file.name.endsWith('.md') ||
      file.name.endsWith('.markdown')
    );
    if (files.length === 0) {
      setError('Please drop a .txt, .json, or .md file');
      return;
    }
    files.forEach(processFile);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setError('Please select a .txt, .json, or .md file');
      return;
    }
    files.forEach(processFile);
  }, [processFile]);

  return (
    <div className="mt-4">
      <div className="flex gap-8 items-start">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 flex justify-center items-center transition-colors w-[500px]
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".txt,.json,.md,.markdown"
            multiple
          />
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your file here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports .txt, .json, .md, and .markdown files
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">File Upload Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Upload text files (.txt) or JSON files containing your prompts</li>
            <li>• Text files will be split by empty lines</li>
            <li>• JSON files should contain an array of prompt objects</li>
            <li>• Each prompt should include title and content</li>
            <li>• Optional: Add tags and categories to organize your prompts</li>
          </ul>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;