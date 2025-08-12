import React from 'react';

export default function PropertyFilters({ filters, filterOptions, onFilterChange, onClearFilters }) {
  return (
    <div className="md:w-1/4 w-full bg-white shadow p-4 rounded h-fit space-y-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFilterChange({ target: { name: 'search', value: filters.search } });
        }}
        className="flex items-center w-full mb-4 h-10"
      >
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={(e) => onFilterChange(e)}
          placeholder="Search properties..."
          className="w-20 flex-grow border border-gray-300 rounded-l px-3 py-1 h-full focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r h-full flex items-center justify-center"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </button>
      </form>

      {/* Price Range */}
      <div>
        <label className="block mb-1 font-medium">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="priceMin"
            value={filters.priceMin}
            onChange={onFilterChange}
            placeholder="Min"
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
            min={0}
          />
          <input
            type="number"
            name="priceMax"
            value={filters.priceMax}
            onChange={onFilterChange}
            placeholder="Max"
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
            min={0}
          />
        </div>
      </div>

      {/* Other filters */}
      {[
        { label: 'City', name: 'city', options: filterOptions.cities },
        { label: 'BHK Type', name: 'bhkType', options: filterOptions.bhkTypes },
        { label: 'Furnishing', name: 'furnishing', options: filterOptions.furnishings },
        { label: 'Transaction Type', name: 'transactionType', options: filterOptions.transactionTypes },
        { label: 'Status', name: 'status', options: filterOptions.statuses },
      ].map(({ label, name, options }) => (
        <div key={name}>
          <label className="block mb-1 font-medium">{label}</label>
          <select
            name={name}
            value={filters[name]}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={onClearFilters}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
      >
        Clear Filters
      </button>
    </div>
  );
}
