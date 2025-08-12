'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

import SearchBar from './SearchBar';
import FilterBar from './FilterBar';

export default function Header() {
  const router = useRouter();

  // Filter & search states
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [status, setStatus] = useState('');

  // Filter option lists
  const [cities, setCities] = useState([]);
  const [bhkTypes, setBhkTypes] = useState([]);
  const [furnishings, setFurnishings] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On router ready, sync filters/search from query params
  useEffect(() => {
    if (!router.isReady) return;

    setSearch(router.query.search || '');
    setCity(router.query.city || '');
    setBhkType(router.query.bhkType || '');
    setFurnishing(router.query.furnishing || '');
    setTransactionType(router.query.transactionType || '');
    setStatus(router.query.status || '');
    }, [router.isReady, router.query]);
    
    useEffect(() => {
      const updateLoginStatus = () => {
        const token = localStorage.getItem('adminToken');
        setIsLoggedIn(!!token);
      };
    
      updateLoginStatus(); // check once on mount
    
      window.addEventListener('login', updateLoginStatus);
      window.addEventListener('logout', updateLoginStatus);
    
      return () => {
        window.removeEventListener('login', updateLoginStatus);
        window.removeEventListener('logout', updateLoginStatus);
      };
    }, []);

  // Fetch all properties once to extract filter options
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get('/properties')
      .then((res) => {
        // Support response either as array or { properties: [...] }
        const properties = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.properties)
          ? res.data.properties
          : [];

        if (properties.length === 0) {
          setError('No properties found to build filters.');
          setCities([]);
          setBhkTypes([]);
          setFurnishings([]);
          setTransactionTypes([]);
          setStatuses([]);
          return;
        }

        // Extract unique values for each filter
        const citySet = new Set();
        const bhkSet = new Set();
        const furnishingSet = new Set();
        const transactionTypeSet = new Set();
        const statusSet = new Set();

        properties.forEach((p) => {
          if (p.city) citySet.add(p.city);
          if (p.bhkType) bhkSet.add(p.bhkType);
          if (p.furnishing) furnishingSet.add(p.furnishing);
          if (p.transactionType) transactionTypeSet.add(p.transactionType);
          if (p.status) statusSet.add(p.status);
        });

        setCities([...citySet].sort());
        setBhkTypes([...bhkSet].sort());
        setFurnishings([...furnishingSet].sort());
        setTransactionTypes([...transactionTypeSet].sort());
        setStatuses([...statusSet].sort());
      })
      .catch(() => {
        setError('Failed to load filter options.');
        setCities([]);
        setBhkTypes([]);
        setFurnishings([]);
        setTransactionTypes([]);
        setStatuses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update search query in URL without losing filters
  const handleSearch = (searchValue) => {
    setSearch(searchValue);

    const query = {
      ...router.query,
      search: searchValue || undefined,
      page: undefined,
    };

    router.push({
      pathname: '/properties',
      query,
    });
  };

  // Update filters in URL query without losing search
  const handleFilter = ({
    city: newCity,
    bhkType: newBhkType,
    furnishing: newFurnishing,
    transactionType: newTransactionType,
    status: newStatus,
  }) => {
    setCity(newCity);
    setBhkType(newBhkType);
    setFurnishing(newFurnishing);
    setTransactionType(newTransactionType);
    setStatus(newStatus);

    const query = {
      ...router.query,
      city: newCity || undefined,
      bhkType: newBhkType || undefined,
      furnishing: newFurnishing || undefined,
      transactionType: newTransactionType || undefined,
      status: newStatus || undefined,
      page: undefined,
    };

    router.push({
      pathname: '/properties',
      query,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="bg-black shadow-md py-4 px-8">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex-shrink-0">
          <Link href="/">
            <img
              src="https://www.dotsquares.com/assets/dots-logo.svg"
              alt="Logo"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="flex flex-col gap-2 w-full md:max-w-3xl">
          <SearchBar initialSearch={search} onSearch={handleSearch} />
        </div>

        <nav className="flex space-x-6 text-white font-medium">
          <Link href="/properties" className="hover:text-blue-400">
            Properties
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/admin/dashboard" className="hover:text-blue-400">Dashboard
              </Link>
            </>
          ) : (
            <Link href="/admin/login" className="hover:text-blue-400">Admin Login
            </Link>
          )}
        </nav>
      </div>

      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mt-6">
        <FilterBar
          initialCity={city}
          initialBhkType={bhkType}
          initialFurnishing={furnishing}
          initialTransactionType={transactionType}
          initialStatus={status}
          cities={cities}
          bhkTypes={bhkTypes}
          furnishings={furnishings}
          transactionTypes={transactionTypes}
          statuses={statuses}
          onFilter={handleFilter}
          loading={loading}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </header>
  );
}
