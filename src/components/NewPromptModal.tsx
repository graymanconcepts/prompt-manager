import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Prompt } from '../types';

interface NewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
}

const NewPromptModal: React.FC<NewPromptModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasUnsavedChanges = title.trim() !== '' || content.trim() !== '' || tags.trim() !== '';

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title,
      description: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: false
    };
    onSave(newPrompt);
    setTitle('');
    setContent('');
    setTags('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-blue-400">Create New Prompt</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
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
                  className="mt-1 block w-full rounded-md bg-gray-700 border-0 text-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none sm:text-sm placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                  Prompt Content
                </label>
                <textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-0 text-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none sm:text-sm placeholder-gray-400"
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
                  placeholder="art, landscape, fantasy"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-0 text-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none sm:text-sm placeholder-gray-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Prompt
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Discard changes?</h3>
            <p className="text-gray-300 mb-6">
              You have unsaved changes. Are you sure you want to close the editor? Your changes will be lost.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setTitle('');
                  setContent('');
                  setTags('');
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPromptModal;