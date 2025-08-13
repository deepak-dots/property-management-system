import { useEffect, useState, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar';
import AdminSidebar from '../../components/AdminSidebar';



function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isNotification = false, // new flag to show simple message modal
  onCloseNotification,    // callback to close notification modal
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <p className="mb-6">{message}</p>

        {isNotification ? (
          <div className="flex justify-end">
            <button
              onClick={onCloseNotification}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeout = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  // Modal state for confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'delete' or 'duplicate'
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Modal state for notification messages
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');

  // Fetch properties with optional search param, pagination
  const fetchProperties = async (search = '', page = 1, limit = 9) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await axios.get('/properties', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search,
          page,
          limit,
        },
      });

      if (Array.isArray(res.data.properties)) {
        setProperties(res.data.properties);
      } else if (Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        setProperties([]);
      }

      // Set total pages or calculate it from totalCount
      if (res.data.totalPages) {
        setTotalPages(res.data.totalPages);
      } else if (res.data.totalCount) {
        setTotalPages(Math.ceil(res.data.totalCount / limit));
      } else {
        setTotalPages(1); // fallback
      }
    } catch (err) {
      openNotification('Error', 'Failed to fetch properties');
      console.error(err);
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search) => {
    setSearchQuery(search);
    setCurrentPage(1);
    fetchProperties(search, 1, itemsPerPage);
  };

  const handleSearchChange = (search) => {
    setSearchQuery(search);
    setCurrentPage(1);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchProperties(search, 1, itemsPerPage);
    }, 500);
  };

  useEffect(() => {
    fetchProperties(searchQuery, currentPage, itemsPerPage);
  }, [searchQuery, currentPage]);

  const openModal = (action, propertyId) => {
    setModalAction(action);
    setSelectedPropertyId(propertyId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedPropertyId(null);
  };

  const openNotification = (title, message) => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationOpen(true);
  };

  const closeNotification = () => {
    setNotificationOpen(false);
    setNotificationTitle('');
    setNotificationMessage('');
  };

  const confirmModalAction = async () => {
    if (!selectedPropertyId || !modalAction) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      if (modalAction === 'delete') {
        await axios.delete(`/properties/${selectedPropertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        openNotification('Success', 'Property deleted successfully!');
      } else if (modalAction === 'duplicate') {
        await axios.post(
          `/properties/${selectedPropertyId}/duplicate`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        openNotification('Success', 'Property duplicated successfully!');
      }
      fetchProperties(searchQuery, currentPage, itemsPerPage);
    } catch (err) {
      openNotification(
        'Error',
        modalAction === 'delete'
          ? 'Failed to delete'
          : 'Failed to duplicate property'
      );
      console.error(err);
    } finally {
      closeModal();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('logout')); 
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

        <AdminSidebar onLogout={handleLogout} />

        <main className="flex-1 p-8">

          <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <Link href="/admin/add-property">
                <button className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add New Property
                </button>
              </Link>

              <Link href="/properties" target="_blank">
                <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
                  View All Properties
                </button>
              </Link>
            </div>

            <div className="mb-6">
              <SearchBar
                initialSearch={searchQuery}
                onSearch={handleSearch}
                onSearchChange={handleSearchChange}
              />
            </div>

            {properties.length === 0 ? (
              <p className="text-gray-500">No properties found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">S.N.</th>
                        <th className="px-4 py-2 border">Property Name</th>
                        <th className="px-4 py-2 border">Furnishing (BHK Type)</th>
                        <th className="px-4 py-2 border">Price</th>
                        <th className="px-4 py-2 border">City</th>
                        <th className="px-4 py-2 border">Status</th>
                        <th className="px-4 py-2 border">Image</th>
                        <th className="px-4 py-2 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p, index) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-2 border">
                            <Link
                              href={`/admin/edit-property/${p._id}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                            >
                              {p.title}
                            </Link>
                          </td>
                          <td className="px-4 py-2 border">
                            {p.furnishing || '-'} ({p.bhkType || '-'})
                          </td>
                          <td className="px-4 py-2 border">
                            {p.price ? `₹${p.price}` : '-'}
                          </td>
                          <td className="px-4 py-2 border">{p.city || '-'}</td>
                          <td className="px-4 py-2 border">{p.status || '-'}</td>
                          <td className="px-4 py-2 border">
                            {p.images && p.images.length > 0 ? (
                              <img
                                src={`http://localhost:5000/uploads/${p.images[0]}`}
                                alt={p.title}
                                className="h-16 w-24 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400">No Image</span>
                            )}
                          </td>
                          <td className="px-4 py-2 border">
                            <div className="relative inline-block text-left">
                              <details className="group">
                                <summary className="bg-gray-200 text-gray-800 px-3 py-1 rounded cursor-pointer hover:bg-gray-300">
                                  Actions
                                </summary>
                                <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md">
                                  <ul className="py-1 text-sm text-gray-700">
                                    <li>
                                      <Link
                                        href={`/admin/edit-property/${p._id}`}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                      >
                                        Edit
                                      </Link>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => openModal('delete', p._id)}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                      >
                                        Delete
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => openModal('duplicate', p._id)}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                      >
                                        Duplicate
                                      </button>
                                    </li>
                                    <li>
                                      <Link
                                        href={`/properties/${p._id}`}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                        target="_blank"
                                      >
                                        View
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </details>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                <div className="flex justify-center space-x-2 mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Confirmation modal */}
            <ConfirmationModal
              isOpen={modalOpen}
              title={modalAction === 'delete' ? 'Delete Property' : 'Duplicate Property'}
              message={
                modalAction === 'delete'
                  ? 'Are you sure you want to delete this property? This action cannot be undone.'
                  : 'Do you want to duplicate this property?'
              }
              onConfirm={confirmModalAction}
              onCancel={closeModal}
              confirmText="Yes"
              cancelText="Cancel"
            />

            {/* Notification modal */}
            <ConfirmationModal
              isOpen={notificationOpen}
              isNotification={true}
              title={notificationTitle}
              message={notificationMessage}
              onCloseNotification={closeNotification}
            />
          </div>
        </main>
    </div>
  );
}
