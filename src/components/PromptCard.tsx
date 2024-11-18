import React, { useState } from 'react';
import { format } from 'date-fns';
import { Tag, Edit, Trash2 } from 'lucide-react';
import { Prompt } from '../types';
import EditPromptModal from './EditPromptModal';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {prompt.title}
            </h3>
            <div className="flex space-x-2">
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsEditModalOpen(true)}
                title="Edit prompt"
              >
                <Edit className="h-5 w-5" />
              </button>
              {onDelete && (
                <button 
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => onDelete(prompt.id)}
                  title="Delete prompt"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {prompt.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last modified: {format(new Date(prompt.lastModified), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {onEdit && (
        <EditPromptModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onEdit}
          prompt={prompt}
        />
      )}
    </>
  );
};

export default PromptCard;