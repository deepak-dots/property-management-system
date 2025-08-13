// pages/admin/admin-profile.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';
import axios from '../../utils/axiosInstance';

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('logout')); // optional global logout
    router.push('/admin/login');
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-600 p-8">
        <p>{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>

          {profile && (
            <div className="flex flex-col items-center space-y-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile Picture"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <svg
                  className="w-24 h-24 text-gray-400 border-2 border-gray-300 rounded-full p-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}

              <div className="w-full max-w-md bg-gray-50 p-6 rounded shadow space-y-3">
                <p>
                  <strong>Name:</strong> {profile.name || 'N/A'}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email || 'N/A'}
                </p>
                <p>
                  <strong>Phone:</strong> {profile.phone || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
