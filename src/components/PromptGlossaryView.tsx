import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import glossaryData from '../data/glossary.json';

const PromptGlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(glossaryData.glossary.map(item => item.category))];
  }, []);

  // Filter glossary data based on search term and selected category
  const filteredGlossary = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    
    if (!trimmedSearch && !selectedCategory) {
      return glossaryData.glossary;
    }

    return glossaryData.glossary
      .map(category => {
        // If a category is selected and doesn't match, return null
        if (selectedCategory && category.category !== selectedCategory) {
          return null;
        }

        // If there's no search term, return the whole category
        if (!trimmedSearch) {
          return category;
        }

        // Filter subcategories that match the search term
        const matchingSubcategories = category.subcategories.filter(sub =>
          sub.option.toLowerCase().includes(trimmedSearch) ||
          sub.description.toLowerCase().includes(trimmedSearch)
        );

        // If category name matches or has matching subcategories, return filtered category
        if (category.category.toLowerCase().includes(trimmedSearch) || matchingSubcategories.length > 0) {
          return {
            ...category,
            subcategories: matchingSubcategories
          };
        }

        return null;
      })
      .filter((category): category is typeof glossaryData.glossary[0] => category !== null);
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-400">Prompt Glossary</h1>
        <div className="flex gap-4">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search through prompts by title, content, or tags..."
              className="w-full px-4 py-2 pl-10 pr-8 rounded-md border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-400 focus:outline-none sm:text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-200 transition-colors duration-150"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            className="px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-400 focus:outline-none sm:text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter prompts by category"
          >
            <option value="">Filter by category...</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredGlossary.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-lg font-medium text-gray-200">No results found</h2>
          <p className="mt-2 text-sm text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGlossary.map((category, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">{category.category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.subcategories.map((sub, subIndex) => (
                  <div key={subIndex} className="bg-gray-700 rounded-md p-4 hover:bg-gray-600 transition-colors duration-150">
                    <h3 className="font-medium text-lg mb-2 text-white">{sub.option}</h3>
                    <p className="text-gray-300">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptGlossaryView;
