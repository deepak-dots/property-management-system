import { useEffect, useState, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { useRouter } from 'next/router';


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
      const token = localStorage.getItem('userToken');
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

    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/user/login');
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
    localStorage.removeItem('userToken');
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

       
        <main className="flex-1 p-8">

          <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}
