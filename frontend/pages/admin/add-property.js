import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropertyForm from '../../components/PropertyForm';
import Link from 'next/link';

export default function AddPropertyPage() {
  const router = useRouter();

  // Tracks if the user is authorized
  const [isAuthorized, setIsAuthorized] = useState(false);
  // Tracks if we're still checking auth status
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem('adminToken');

    if (!token) {
      // No token, redirect to login
      router.replace('/admin/login');
    } else {
      // Token exists, allow rendering
      setIsAuthorized(true);
    }

    // Done checking
    setCheckingAuth(false);
  }, [router.isReady, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Checking authorization...
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't render anything while redirecting
  }

  const handleSuccess = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-6 text-blue-600 hover:underline"
      >
        Back to Property List
      </button>
        <PropertyForm propertyId={null} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
