import React, { useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Prompt, UploadHistory } from '../types';
import EditPromptModal from './EditPromptModal';
import ConfirmationDialog from './ConfirmationDialog';

interface PromptsViewProps {
  prompts: Prompt[];
  activePrompts: Prompt[];
  onDeletePrompt: (id: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onToggleActive: (id: string) => void;
  history: UploadHistory[];
}

const PromptsView: React.FC<PromptsViewProps> = ({ 
  prompts, 
  activePrompts,
  onDeletePrompt, 
  onEditPrompt, 
  onToggleActive,
  history
}) => {
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      await onToggleActive(id);
    } catch (error) {
      setError('Failed to toggle prompt status');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingPromptId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingPromptId) {
      onDeletePrompt(deletingPromptId);
      setDeletingPromptId(null);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-6">
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-400">Manage Your Prompts</h1>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 p-6 text-gray-200">All Prompts Listing</h2>
        
        <div className="px-6 pb-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-900"></div>
            <span className="text-green-200">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-900/70"></div>
            <span className="text-amber-200">File Disabled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <span className="text-gray-300">Inactive</span>
          </div>
        </div>

        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-900 text-gray-300 text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Content Preview</th>
              <th className="py-3 px-6 text-left w-36">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-sm">
            {prompts.map((prompt) => {
              const isIndividuallyActive = prompt.isActive;
              const isHistoryActive = prompt.historyId ? (prompt.historyIsActive ?? true) : true;
              const isEffectivelyActive = isIndividuallyActive && isHistoryActive;
              
              return (
                <tr key={prompt.id} className={`border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150 ${
                  !isEffectivelyActive ? 'opacity-50' : ''
                }`}>
                  <td className="py-4 px-6">
                    {format(new Date(prompt.created), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="py-4 px-6 font-medium text-white">
                    {prompt.title}
                  </td>
                  <td className="py-4 px-6">
                    {truncateText(prompt.content, 100)}
                  </td>
                  <td className="py-4 px-6 w-36">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs w-full text-center whitespace-nowrap ${
                        isEffectivelyActive 
                          ? 'bg-green-900 text-green-200' 
                          : !isHistoryActive 
                            ? 'bg-amber-900/70 text-amber-200'
                            : 'bg-gray-700 text-gray-300'
                      }`}>
                        {!isHistoryActive && isIndividuallyActive
                          ? 'File Disabled' 
                          : isEffectivelyActive 
                            ? 'Active' 
                            : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-150"
                        title="Edit prompt"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(prompt.id)}
                        className={`${
                          isIndividuallyActive ? 'text-gray-300' : 'text-gray-500'
                        } hover:text-gray-200 transition-colors duration-150`}
                        title={isIndividuallyActive ? 'Deactivate prompt' : 'Activate prompt'}
                      >
                        {isIndividuallyActive ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(prompt.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-150"
                        title="Delete prompt"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingPrompt && (
        <EditPromptModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPrompt(null);
          }}
          onSave={(updatedPrompt) => {
            onEditPrompt(updatedPrompt);
            setIsEditModalOpen(false);
            setEditingPrompt(null);
          }}
          prompt={editingPrompt}
        />
      )}

      <ConfirmationDialog
        isOpen={deletingPromptId !== null}
        onClose={() => setDeletingPromptId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PromptsView;