import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Prompt } from '../types';

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  prompt: Prompt;
}

const EditPromptModal: React.FC<EditPromptModalProps> = ({ isOpen, onClose, onSave, prompt }) => {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [tags, setTags] = useState(prompt.tags.join(','));
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(prompt.title);
    setContent(prompt.content);
    setTags(prompt.tags.join(','));
  }, [prompt]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      setError('Failed to copy text to clipboard');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPrompt: Prompt = {
      ...prompt,
      title,
      description: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      lastModified: new Date().toISOString(),
    };
    onSave(updatedPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Edit Prompt</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                    Prompt Content
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyClick}
                    className={`inline-flex items-center px-2 py-1 text-sm rounded-md transition-colors duration-200 
                      ${isCopied 
                        ? 'text-green-300 bg-green-900 hover:bg-green-800' 
                        : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPromptModal;
