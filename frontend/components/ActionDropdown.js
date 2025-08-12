import { useRouter } from 'next/router';
import axios from '../utils/axiosInstance';
import { useState } from 'react';

const ActionDropdown = ({ propertyId, hideEdit = false }) => {
  const router = useRouter();
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',     // 'confirm' or 'info'
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', message: '', onConfirm: null, onCancel: null });
  };

  // Show confirm modal and execute callback if confirmed
  const showConfirm = (message, onConfirm) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      message,
      onConfirm: () => {
        closeModal();
        onConfirm();
      },
      onCancel: () => closeModal(),
    });
  };

  const showInfo = (message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type: 'info',
      message,
      onConfirm,
      onCancel: null,
    });
  };

  const handleDelete = () => {
    showConfirm('Are you sure you want to delete this property?', async () => {
      try {
        await axios.delete(`/properties/${propertyId}`, {
          headers: getAuthHeaders(),
        });
        showInfo('Property deleted.', () => router.push('/admin/dashboard'));
      } catch (error) {
        console.error('Delete failed:', error);
        showInfo('Failed to delete property.');
      }
    });
  };

  const handleDuplicate = () => {
    showConfirm('Are you sure you want to duplicate this property?', async () => {
      try {
        await axios.post(
          `/properties/${propertyId}/duplicate`,
          {},
          { headers: getAuthHeaders() }
        );
        showInfo('Property duplicated successfully.', () => router.push('/admin/dashboard'));
      } catch (error) {
        console.error('Duplicate failed:', error);
        showInfo('Failed to duplicate property.');
      }
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <details className="relative group">
          <summary className="cursor-pointer bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">
            Actions
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md">
            <ul className="py-1 text-sm text-gray-700">
              {!hideEdit && (
                <li>
                  <button
                    onClick={() => router.push(`/admin/edit-property/${propertyId}`)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Delete
                </button>
              </li>
              <li>
                <button
                  onClick={handleDuplicate}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Duplicate
                </button>
              </li>
              <li>
                <a
                  href={`/properties/${propertyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  View
                </a>
              </li>
            </ul>
          </div>
        </details>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg text-center">
            <p className="mb-6 text-gray-800">{modal.message}</p>

            {modal.type === 'confirm' ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={modal.onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={modal.onCancel}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (modal.onConfirm) {
                    modal.onConfirm();
                  } else {
                    closeModal();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ActionDropdown;
