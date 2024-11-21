import { useState } from 'react';
import { Eye, Search, HelpCircle, Heart } from 'lucide-react';
import { Prompt } from '../types';
import { TagList } from './Tag';
import GettingStartedGuide from './GettingStartedGuide';
import Rating from './Rating';
import FavoriteButton from './FavoriteButton';

interface DashboardViewProps {
  prompts: Prompt[];
  onEditPrompt: (prompt: Prompt) => void;
}

const PromptCard = ({ prompt, onClick, onEdit }: { prompt: Prompt; onClick: () => void; onEdit: (prompt: Prompt) => void }) => {
  const handleRatingChange = (newRating: number) => {
    // If the rating is being cleared (newRating === 0), don't increment the count
    // If it's a new rating (prompt.rating === 0), increment the count
    // If it's updating an existing rating, keep the count the same
    const ratingCount = newRating === 0 
      ? Math.max(0, (prompt.ratingCount || 0) - 1)
      : prompt.rating === 0
        ? (prompt.ratingCount || 0) + 1
        : prompt.ratingCount || 0;

    onEdit({
      ...prompt,
      rating: newRating,
      ratingCount,
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
    <div 
      className="bg-gray-800 overflow-hidden shadow-xl rounded-lg hover:bg-blue-900/90 border border-gray-500 relative transition-colors duration-300"
    >
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <FavoriteButton
          isFavorite={Boolean(prompt.isFavorite)}
          onChange={handleFavoriteChange}
          size="md"
        />
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white truncate">
            {prompt.title}
          </h3>
        </div>
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <Rating
            value={prompt.rating || 0}
            count={prompt.ratingCount || 0}
            onChange={handleRatingChange}
            size="sm"
          />
        </div>
        <p className="text-sm text-gray-300 line-clamp-2">
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
        <button 
          onClick={onClick}
          className="absolute bottom-3 right-3 flex items-center text-gray-300 hover:text-blue-300 transition-colors bg-gray-700/30 hover:bg-blue-800/40 rounded-full px-3 py-1.5 gap-1.5 shadow-md"
        >
          <Eye className="h-5 w-5" />
          <span className="text-sm font-medium">View Details</span>
        </button>
      </div>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({ prompts, onEditPrompt }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  // Filter active prompts first, then apply search and favorites filters
  const filteredPrompts = prompts
    .filter(prompt => prompt.isActive)
    .filter(prompt => !showFavoritesOnly || prompt.isFavorite)
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFavoritesOnly
                ? 'bg-gray-700 border-gray-600 text-gray-300'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30'
            }`}
          >
            <Heart className={`h-5 w-5 ${showFavoritesOnly ? 'fill-blue-400' : ''}`} />
            <span className="text-sm font-medium">Favorites</span>
          </button>
        </div>
        {!showGuide && (
          <button
            onClick={handleToggleGuide}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-150"
          >
            <span>Show getting started guide</span>
            <HelpCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">No prompts found</h2>
          <p className="mt-2 text-sm text-gray-400">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => {
                setSelectedPrompt(prompt);
                setCopied(false);
              }}
              onEdit={onEditPrompt}
            />
          ))}
        </div>
      )}

      {selectedPrompt && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPrompt(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-white">{selectedPrompt.title}</h2>
              <button
                onClick={() => setSelectedPrompt(null)}
                className="text-gray-400 hover:text-gray-300 p-1 hover:bg-gray-700 rounded-full transition-colors"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 mb-4">{selectedPrompt.description}</p>
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-gray-300 whitespace-pre-wrap">{selectedPrompt.content}</pre>
            </div>
            <div className="mt-6 flex justify-between gap-4">
              <button
                onClick={() => setSelectedPrompt(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                  copied ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;