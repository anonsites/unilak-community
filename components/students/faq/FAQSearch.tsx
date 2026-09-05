'use client';

import { useState } from 'react';

const CATEGORIES = ['General', 'Registration', 'Student life', 'Rules', 'Opportunities','Others'];

interface FAQSearchProps {
  onSearch: (query: string, category: string) => void;
  isLoading?: boolean;
}

export default function FAQSearch({ onSearch, isLoading = false }: FAQSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    onSearch(searchTerm, newCategory);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.5 5.5a7.5 7.5 0 0 0 10.5 10.5Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm, selectedCategory)}
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          />
        </div>
        <button
          onClick={() => onSearch(searchTerm, selectedCategory)}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border border-blue-500'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
            } disabled:opacity-50`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedCategory) && (
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            onSearch('', '');
          }}
          disabled={isLoading}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
