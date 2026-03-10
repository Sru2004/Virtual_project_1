import React from "react";

export default function FiltersSidebar({
  categoryFilter,
  setCategoryFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  ratingFilter,
  setRatingFilter,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 h-fit border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-gray-900">Filters</h3>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-3">Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none transition-colors bg-white text-gray-900 font-medium"
        >
          <option value="">All Categories</option>
          <option value="abstract">Abstract</option>
          <option value="landscapes">Landscapes</option>
          <option value="portraits">Portraits</option>
          <option value="mixed media">Mixed Media</option>
          <option value="digital">Digital</option>
          <option value="sculpture">Sculpture</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-3">Price Range</label>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Minimum"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 font-medium"
          />
          <input
            type="number"
            placeholder="Maximum"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Rating Filter */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 block mb-3">Minimum Rating</label>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none transition-colors bg-white text-gray-900 font-medium"
        >
          <option value="">Any Rating</option>
          <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
          <option value="3">⭐⭐⭐ 3+ Stars</option>
          <option value="2">⭐⭐ 2+ Stars</option>
          <option value="1">⭐ 1+ Stars</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {(categoryFilter || minPrice || maxPrice || ratingFilter) && (
        <button
          onClick={() => {
            setCategoryFilter("");
            setMinPrice("");
            setMaxPrice("");
            setRatingFilter("");
          }}
          className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 font-semibold rounded-lg transition-colors border-2 border-gray-200 text-sm"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
