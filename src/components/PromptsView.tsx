import React, { useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Prompt } from '../types';
import EditPromptModal from './EditPromptModal';
import FileUpload from './FileUpload';
import { api } from '../api/client';

interface PromptsViewProps {
  prompts: Prompt[];
  onDeletePrompt: (id: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onUpdatePrompts: (prompts: Prompt[]) => void;
  onAddPrompts: (newPrompts: Prompt[]) => void;
}

const PromptsView: React.FC<PromptsViewProps> = ({ 
  prompts, 
  onDeletePrompt, 
  onEditPrompt, 
  onUpdatePrompts,
  onAddPrompts 
}) => {
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (prompt: Prompt) => {
    try {
      const updatedPrompt = {
        ...prompt,
        isActive: !prompt.isActive,
        lastModified: new Date().toISOString()
      };
      const updatedPrompts = await api.updatePrompt(updatedPrompt);
      onUpdatePrompts(updatedPrompts);
    } catch (error) {
      console.error('Error toggling prompt active state:', error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FileUpload onFileProcess={onAddPrompts} />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">All Prompts Listing</h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Content Preview</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-6">
                  {format(new Date(prompt.created), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="py-4 px-6 font-medium">
                  {prompt.title}
                </td>
                <td className="py-4 px-6">
                  {truncateText(prompt.content, 100)}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prompt.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prompt.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit prompt"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(prompt)}
                      className={`${
                        prompt.isActive ? 'text-gray-600' : 'text-gray-400'
                      } hover:text-gray-800`}
                      title={prompt.isActive ? 'Deactivate prompt' : 'Activate prompt'}
                    >
                      {prompt.isActive ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeletePrompt(prompt.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete prompt"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
    </div>
  );
};

export default PromptsView;