import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { Prompt } from '../types';
import EditPromptModal from './EditPromptModal';
import { TagList } from './Tag';
import Rating from './Rating';
import FavoriteButton from './FavoriteButton';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedPrompt: Prompt) => {
    onEdit(updatedPrompt);
    setIsEditModalOpen(false);
  };

  const handleRatingChange = (newRating: number) => {
    onEdit({
      ...prompt,
      rating: newRating,
      ratingCount: (prompt.ratingCount || 0) + 1,
      lastModified: new Date().toISOString()
    });
  };

  const handleFavoriteChange = (isFavorite: boolean) => {
    onEdit({
      ...prompt,
      isFavorite,
      lastModified: new Date().toISOString()
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{prompt.title}</h3>
            <FavoriteButton
              isFavorite={prompt.isFavorite || false}
              onChange={handleFavoriteChange}
              size="sm"
            />
          </div>
          <div className="mt-2">
            <Rating
              value={prompt.rating || 0}
              count={prompt.ratingCount}
              onChange={handleRatingChange}
              size="sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit prompt"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Delete prompt"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-400 mb-4">{prompt.description}</p>

      <div className="mb-4">
        <div
          className={`text-gray-300 ${!showFullContent && 'line-clamp-3'}`}
        >
          {prompt.content}
        </div>
        {prompt.content.length > 150 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-2"
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <TagList 
        tags={prompt.tags} 
        showIcons={true}
        tagStyle={{
          backgroundColor: '#D5FFFF',
          color: '#1D4ED8',
          border: '1px solid rgba(29, 78, 216, 0.1)'
        }}
      />

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Last modified: {format(new Date(prompt.lastModified), 'MMM d, yyyy')}
        </div>
      </div>

      {isEditModalOpen && (
        <EditPromptModal
          prompt={prompt}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PromptCard;