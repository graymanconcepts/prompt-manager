import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Tags, BookOpen, Wand2, Upload } from 'lucide-react';

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
    <div className="bg-gray-800 rounded-lg shadow-sm mb-6 border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between text-left text-gray-100 hover:bg-gray-700 ${
          isExpanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          )}
          <h2 className="text-lg font-medium">Getting Started with the Prompt Library</h2>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-800 rounded-b-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-100 mb-2">
                  <Wand2 className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Smart Image Prompt Creation</h3>
                </div>
                <p className="text-sm text-gray-300 ml-7">
                  Use our intelligent editor to create image prompts with real-time suggestions
                  and smart assistance. Click the "Image Prompt" button to get started with
                  context-aware recommendations from our curated glossary.
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-100 mb-2">
                  <Plus className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Creating Other Prompts</h3>
                </div>
                <p className="text-sm text-gray-300 ml-7">
                  Click the "New Prompt" button to create general prompts.
                  Give it a clear title and detailed content. Consider adding a
                  category to keep your prompts organized.
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-100 mb-2">
                  <Upload className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Import Existing Prompts</h3>
                </div>
                <p className="text-sm text-gray-300 ml-7">
                  Already have text-based prompts? Upload your existing prompts
                  to quickly build your library. We'll help you organize and
                  tag them automatically.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-100 mb-2">
                  <Tags className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Organization Tips</h3>
                </div>
                <ul className="text-sm text-gray-300 ml-7 list-disc pl-4">
                  <li>Use descriptive, relevant tags</li>
                  <li>Add multiple tags to improve searchability</li>
                  <li>Take advantage of smart suggestions</li>
                  <li>Review and refine your prompts regularly</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center text-gray-100 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Using the Glossary</h3>
                </div>
                <p className="text-sm text-gray-300 ml-7">
                  The Prompt Glossary powers our smart suggestions and serves as your knowledge base. 
                  Browse through terms and categories to find inspiration or maintain consistency 
                  in your prompts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end">
            <button
              onClick={onDismiss}
              className="text-sm text-gray-300 hover:text-gray-100"
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
