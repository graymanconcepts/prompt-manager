import React, { useState, useEffect, useMemo } from 'react';
import glossaryData from '../data/glossary.json';
import { Plus } from 'lucide-react';

interface IntelligentPromptEditorProps {
  onComplete: (prompt: string, title: string, tags: string[]) => void;
  onCancel: () => void;
}

interface GlossaryTerm {
  option: string;
  description: string;
  category: string;
}

const IntelligentPromptEditor: React.FC<IntelligentPromptEditorProps> = ({
  onComplete,
  onCancel,
}) => {
  const [promptText, setPromptText] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  const [suggestions, setSuggestions] = useState<GlossaryTerm[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showTitleError, setShowTitleError] = useState(false);

  // Flatten glossary data for easier searching
  const allTerms = useMemo(() => {
    const terms: GlossaryTerm[] = [];
    glossaryData.glossary.forEach(category => {
      category.subcategories.forEach(term => {
        terms.push({
          ...term,
          category: category.category,
        });
      });
    });
    return terms;
  }, []);

  // Find relevant suggestions based on current word
  const findSuggestions = (text: string, position: number) => {
    // Get the current word being typed
    const beforeCursor = text.slice(0, position);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1].toLowerCase();

    if (currentWord.length < 2) {
      setSuggestions([]);
      return;
    }

    // Find matching terms
    const matches = allTerms.filter(term =>
      term.option.toLowerCase().includes(currentWord) ||
      term.description.toLowerCase().includes(currentWord)
    ).slice(0, 5); // Limit to 5 suggestions

    setSuggestions(matches);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newPosition = e.target.selectionStart;
    setPromptText(newText);
    setCursorPosition(newPosition);
    findSuggestions(newText, newPosition);
  };

  const insertSuggestion = (term: GlossaryTerm) => {
    // Get the current word boundaries
    const beforeCursor = promptText.slice(0, cursorPosition);
    const afterCursor = promptText.slice(cursorPosition);
    const words = beforeCursor.split(/\s+/);
    const lastWord = words.pop() || '';
    const beforeLastWord = words.join(' ');

    // Insert the suggestion
    const newText = `${beforeLastWord}${beforeLastWord ? ' ' : ''}${term.option}${afterCursor ? ' ' : ''}${afterCursor}`;
    setPromptText(newText);
    setSuggestions([]);

    // Add as a tag if not already present
    if (!selectedTags.includes(term.option)) {
      setSelectedTags([...selectedTags, term.option]);
    }
  };

  const handleComplete = () => {
    if (!promptTitle.trim()) {
      setShowTitleError(true);
      return;
    }
    onComplete(promptText, promptTitle, selectedTags);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Image Prompt</h2>
        <p className="text-gray-600">
          Write your prompt naturally. Suggestions will appear as you type.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="promptTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="promptTitle"
            type="text"
            value={promptTitle}
            onChange={(e) => {
              setPromptTitle(e.target.value);
              setShowTitleError(false);
            }}
            placeholder="Give your prompt a meaningful title..."
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              showTitleError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {showTitleError && (
            <p className="mt-1 text-sm text-red-500">Please provide a title for your prompt</p>
          )}
        </div>

        <div>
          <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt
          </label>
          <textarea
            value={promptText}
            onChange={handleTextChange}
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your image... (e.g., 'an alien woman standing next to...')"
          />

          {/* Suggestions Panel */}
          {suggestions.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1/3 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((term, index) => (
                  <div
                    key={`${term.option}-${index}`}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => insertSuggestion(term)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{term.option}</span>
                        <span className="ml-2 text-sm text-blue-600">({term.category})</span>
                        <p className="mt-1 text-sm text-gray-500">{term.description}</p>
                      </div>
                      <button
                        className="ml-2 p-1 text-gray-400 hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          insertSuggestion(term);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Terms */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Included Terms:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                    className="hover:text-blue-600"
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reference Panel */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Start with your main subject</li>
            <li>• Add artistic style references</li>
            <li>• Include specific details about appearance</li>
            <li>• Consider adding mood or atmosphere terms</li>
            <li>• Technical terms can improve results</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleComplete}
          disabled={!promptText.trim() || !promptTitle.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Prompt
        </button>
      </div>
    </div>
  );
};

export default IntelligentPromptEditor;
