import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosInstance';
import PropertyCard from '../../components/PropertyCard';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    priceMin: '',
    priceMax: '',
    city: '',
    bhkType: '',
    furnishing: '',
    transactionType: '',
    status: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    bhkTypes: [],
    furnishings: [],
    transactionTypes: [],
    statuses: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  const router = useRouter();

  // Fetch filtered properties with pagination
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Add pagination params to query
        const params = { ...router.query, page: currentPage, limit: itemsPerPage };

        const res = await axios.get('/properties', { params });
        const propertyList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.properties)
          ? res.data.properties
          : [];

        setProperties(propertyList);

        // Set pagination info from API response
        if (res.data.totalPages) {
          setTotalPages(res.data.totalPages);
        } else if (res.data.totalCount) {
          setTotalPages(Math.ceil(res.data.totalCount / itemsPerPage));
        } else {
          setTotalPages(1);
        }

        // Update filters from query params
        const query = router.query;
        setFilters({
          search: query.search || '',
          city: query.city || '',
          bhkType: query.bhkType || '',
          furnishing: query.furnishing || '',
          transactionType: query.transactionType || '',
          status: query.status || '',
          priceMin: query.priceMin || '',
          priceMax: query.priceMax || '',
        });
      } catch (error) {
        console.error(error);
        setProperties([]);
        setTotalPages(1);
      }finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [router.query, currentPage]);

  // Fetch ALL properties once to generate filter options
  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const res = await axios.get('/properties');
        const allProperties = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.properties)
          ? res.data.properties
          : [];

        setFilterOptions({
          cities: [...new Set(allProperties.map((p) => p.city).filter(Boolean))].sort(),
          bhkTypes: [...new Set(allProperties.map((p) => p.bhkType).filter(Boolean))].sort(),
          furnishings: [...new Set(allProperties.map((p) => p.furnishing).filter(Boolean))].sort(),
          transactionTypes: [...new Set(allProperties.map((p) => p.transactionType).filter(Boolean))].sort(),
          statuses: [...new Set(allProperties.map((p) => p.status).filter(Boolean))].sort(),
        });
      } catch (error) {
        console.error('Failed to fetch all properties for filter options', error);
      }
    };

    fetchAllProperties();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    // Remove empty filters for clean URL
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === '') delete newFilters[key];
    });

    // Convert price filters to numbers
    const paramsForUrl = { ...newFilters };
    if (paramsForUrl.priceMin) paramsForUrl.priceMin = Number(paramsForUrl.priceMin);
    if (paramsForUrl.priceMax) paramsForUrl.priceMax = Number(paramsForUrl.priceMax);

    setFilters(newFilters);
    setCurrentPage(1); // reset to first page on filter change

    const params = new URLSearchParams(paramsForUrl).toString();
    router.push(`/properties?${params}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priceMin: '',
      priceMax: '',
      city: '',
      bhkType: '',
      furnishing: '',
      transactionType: '',
      status: '',
    });
    setCurrentPage(1);
    router.push('/properties');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Properties</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="md:w-1/4 w-full bg-white shadow p-4 rounded h-fit space-y-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFilterChange({ target: { name: 'search', value: filters.search } });
              }}
              className="flex items-center w-full mb-4 h-10"
            >
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
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
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded px-2 py-1"
                  min={0}
                />
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
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
                  onChange={handleFilterChange}
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
              onClick={clearFilters}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
            >
              Clear Filters
            </button>
          </div>

          {/* Property Grid */}
          <div className="md:w-3/4 w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-gray-500">Loading...</p>
            ) : properties.length === 0 ? (
              <p className="text-center col-span-full text-gray-500">No properties found.</p>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
