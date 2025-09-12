import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import RatingPage from './pages/RatingPage';
import AdminBookings from './pages/AdminBookings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex justify-center items-center">
        <svg className="animate-spin h-10 w-10 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Si hay usuario logueado → Dashboard; si no → Login
  return user ? <DashboardPage /> : <LoginPage />;
};

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#');

  useEffect(() => {
  const legacyPath = window.location.pathname;
  if (
    (legacyPath === '/book' || legacyPath === '/rate' || legacyPath === '/admin/bookings') &&
    !window.location.hash
  ) {
    window.location.replace(`${window.location.origin}/${legacyPath.replace('/', '/#/')}`);
    return;
  }
  const handleHashChange = () => setRoute(window.location.hash || '#');
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  const renderPage = () => {
  if (route === '#/book') return <BookingPage />;
  if (route === '#/rate') return <RatingPage />;
  if (route === '#/admin/bookings') return <AdminBookings />; // <- debe estar
  return <AppContent />;
  };


  return (
    <AuthProvider>
      <LanguageProvider>
        {renderPage()}
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
console.log('API:', import.meta.env.VITE_API_URL);
