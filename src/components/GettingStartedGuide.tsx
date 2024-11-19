import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Tags, BookOpen, ToggleLeft } from 'lucide-react';

interface GettingStartedGuideProps {
  onDismiss: () => void;
  isVisible: boolean;
}

const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({ onDismiss, isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between text-left text-gray-900 hover:bg-[#f5f0e8] ${
          isExpanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          )}
          <h2 className="text-lg font-medium">Getting Started with the Prompt Manager</h2>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 bg-[#f5f0e8] rounded-b-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-900 mb-2">
                  <Plus className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Creating Your First Prompt</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Click the "New Prompt" button in the top right to create a prompt.
                  Give it a clear title and detailed content. Consider adding a
                  category to keep your prompts organized.
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-900 mb-2">
                  <Tags className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Best Practices for Tagging</h3>
                </div>
                <ul className="text-sm text-gray-600 ml-7 list-disc pl-4">
                  <li>Use descriptive, relevant tags</li>
                  <li>Add multiple tags to improve searchability</li>
                  <li>Keep tags consistent across similar prompts</li>
                  <li>Use categories for broad grouping</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-900 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Using the Glossary</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  The Prompt Glossary is your knowledge base. Search through all prompts,
                  filter by category, and find inspiration for new prompts. Use it to
                  maintain consistency in your prompt library.
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-900 mb-2">
                  <ToggleLeft className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Managing Active/Inactive Prompts</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Keep your workspace clean by managing prompt visibility. Archive
                  less-used prompts by marking them inactive. They'll still be
                  searchable in the glossary but won't clutter your dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Don't show this again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GettingStartedGuide;
