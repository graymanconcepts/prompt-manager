import { useState } from 'react';
import { Eye, Search, HelpCircle } from 'lucide-react';
import { Prompt } from '../types';
import { TagList } from './Tag';
import GettingStartedGuide from './GettingStartedGuide';

interface DashboardProps {
  prompts: Prompt[];
  onEditPrompt: (updatedPrompt: Prompt) => Promise<void>;
}

const PromptCard = ({ prompt, onClick }: { prompt: Prompt; onClick: () => void }) => (
  <div 
    className="bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-gray-700"
    onClick={onClick}
  >
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white truncate">
          {prompt.title}
        </h3>
        <Eye className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-2 text-sm text-gray-300 line-clamp-2">
        {prompt.description}
      </p>
      <div className="mt-4">
        <TagList 
          tags={prompt.tags}
          showIcons={true}
          tagStyle={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ prompts, onEditPrompt }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(() => {
    return localStorage.getItem('hideGettingStarted') !== 'true';
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedPrompt?.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy text to clipboard');
    }
  };

  const handleToggleGuide = () => {
    const newState = !showGuide;
    setShowGuide(newState);
    if (!newState) {
      localStorage.setItem('hideGettingStarted', 'true');
    } else {
      localStorage.removeItem('hideGettingStarted');
    }
  };

  // Filter active prompts first, then apply search filter
  const filteredPrompts = prompts
    .filter(prompt => prompt.isActive)
    .filter(prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="p-6">
      <GettingStartedGuide 
        isVisible={showGuide}
        onDismiss={handleToggleGuide}
      />
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-400">Active Prompts</h1>
          {!showGuide && (
            <button
              onClick={handleToggleGuide}
              className="flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors duration-150"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Show getting started guide
            </button>
          )}
        </div>
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search through active prompts by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-8 rounded-md border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-400 focus:outline-none sm:text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-300 transition-colors duration-150"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">No prompts found</h2>
          <p className="mt-2 text-sm text-gray-400">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => {
                setSelectedPrompt(prompt);
                setCopied(false); // Reset copied state when opening new prompt
              }}
            />
          ))}
        </div>
      )}

      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-200">{selectedPrompt.title}</h2>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-300 transition-colors duration-150"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  <p>Modified: {new Date(selectedPrompt.lastModified).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap break-words text-gray-300">
                    <code>{selectedPrompt.content}</code>
                  </pre>
                </div>

                <div className="mt-4">
                  <TagList 
                    tags={selectedPrompt.tags}
                    showIcons={true}
                    tagStyle={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60A5FA',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 px-4 py-3 flex justify-end space-x-2">
              <button
                onClick={handleCopy}
                className={`inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  copied 
                  ? 'text-blue-400 bg-gray-800 border border-blue-400 hover:bg-gray-700' 
                  : 'text-gray-900 bg-blue-400 border border-transparent hover:bg-blue-500'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  'Copy to clipboard'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;