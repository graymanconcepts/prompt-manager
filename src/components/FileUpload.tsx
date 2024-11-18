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
    console.log('Processing file:', file.name);
    const reader = new FileReader();
    
    // Get filename without extension for use as name
    const fileName = file.name;
    const titleName = file.name.replace(/\.[^/.]+$/, '');
    
    reader.onload = (e) => {
      try {
        console.log('File loaded, processing content...');
        const text = e.target?.result as string;
        let prompts: Prompt[] = [];

        // Try to parse as JSON first
        try {
          console.log('Attempting to parse as JSON...');
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
            console.log('Successfully parsed JSON, created prompts:', prompts.length);
          }
        } catch (jsonError) {
          console.log('JSON parse failed, processing as text file');
          
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
          
          console.log('Created prompts from text blocks:', prompts.length);
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
          
          console.log('Calling onFileProcess with prompts:', prompts);
          onFileProcess(prompts, historyEntry);
          setError(null);
        } else {
          setError('No valid content found in file');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing file');
      }
    };

    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
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
    console.log('Files dropped:', files.length);
    if (files.length === 0) {
      setError('Please drop a .txt, .json, or .md file');
      return;
    }
    files.forEach(processFile);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files.length);
    if (files.length === 0) {
      setError('Please select a .txt, .json, or .md file');
      return;
    }
    files.forEach(processFile);
  }, [processFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-500'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      role="presentation"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept=".txt,.json,.md,.markdown"
        multiple
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center"
      >
        <Upload className={`h-12 w-12 mb-3 ${
          isDragging ? 'text-blue-500' : 'text-gray-400'
        }`} />
        <span className="text-sm text-gray-600">
          Drop files here or click to upload
        </span>
        <span className="text-xs text-gray-500 mt-1">
          Supports .txt, .json, and .md files
        </span>
      </label>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;