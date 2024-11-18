import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Prompt } from '../types';

interface DashboardProps {
  prompts: Prompt[];
  onEditPrompt: (updatedPrompt: Prompt) => Promise<void>;
}

const PromptCard = ({ prompt, onClick }: { prompt: Prompt; onClick: () => void }) => (
  <div 
    className="bg-white/95 overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer backdrop-blur-sm border border-slate-200"
    onClick={onClick}
  >
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900 truncate">
          {prompt.title}
        </h3>
        <Eye className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
        {prompt.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = ({ prompts }: DashboardProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter active prompts first, then apply search filter
  const filteredPrompts = prompts
    .filter(prompt => prompt.isActive)
    .filter(prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleCopy = async () => {
    if (selectedPrompt) {
      try {
        await navigator.clipboard.writeText(selectedPrompt.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">All Prompts</h1>
        <div className="w-full max-w-lg lg:max-w-xs">
          <label htmlFor="search" className="sr-only">Search prompts</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-white/90 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm backdrop-blur-sm"
              placeholder="Search prompts..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 bg-white/90 rounded-lg shadow-sm backdrop-blur-sm border border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">No prompts found</h2>
          <p className="mt-2 text-sm text-slate-600">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-slate-900/75 backdrop-blur-sm" 
              aria-hidden="true"
              onClick={() => setSelectedPrompt(null)}
            >
            </div>

            <div className="inline-block align-bottom bg-white/95 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 backdrop-blur-sm border border-slate-200">
              <div className="bg-white/95 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedPrompt.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-slate-600">
                    <p>Modified: {new Date(selectedPrompt.lastModified).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  <div className="relative">
                    <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                      <code>{selectedPrompt.content}</code>
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedPrompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-2">
                <button
                  onClick={handleCopy}
                  className={`inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    copied 
                    ? 'text-green-600 bg-white border border-green-600 hover:bg-green-50' 
                    : 'text-white bg-green-600 border border-transparent hover:bg-green-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-1.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span>Use now</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;