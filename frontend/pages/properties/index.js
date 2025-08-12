import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosInstance';
import PropertyCard from '../../components/PropertyCard';
import PropertyFilters from '../../components/PropertyFilter';


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
          
          <PropertyFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />

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
