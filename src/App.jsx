import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navigation from './components/Navigation.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// Import halaman-halaman
import OnboardingPage from './pages/OnboardingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import TemplesPage from './pages/TemplesPage.jsx';
import TempleDetailPage from './pages/TempleDetailPage.jsx';
import ArtifactDetailPage from './pages/ArtifactDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Placeholder components untuk halaman yang belum dibuat
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-secondary-light flex items-center justify-center pb-20">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-secondary mb-4">{title}</h1>
      <p className="text-gray">Halaman ini sedang dalam pengembangan</p>
    </div>
  </div>
);

// Component untuk redirect berdasarkan authentication
const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Memuat..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/onboarding" replace />;
};

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Memuat aplikasi..." />;
  }

  return (
    <div className="App">
      <Navigation />
      <Routes>
        {/* Route untuk halaman awal */}
        <Route path="/start" element={<AuthRedirect />} />
        
        {/* Route untuk onboarding dan auth */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route untuk user biasa */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-tickets" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Tiket Saya" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-tickets/:id" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Detail Tiket" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Daftar Tiket" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets/:id" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Detail Tiket" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan" 
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/temples" 
          element={
            <ProtectedRoute>
              <TemplesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/temples/:id" 
          element={
            <ProtectedRoute>
              <TempleDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/artifacts" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Daftar Artefak" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/artifacts/:id" 
          element={
            <ProtectedRoute>
              <ArtifactDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Route untuk admin */}
        <Route 
          path="/admin/temples" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Kelola Candi (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/temples/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Tambah Candi (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/temples/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Edit Candi (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Kelola Artefak (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Tambah Artefak (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Edit Artefak (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Kelola Tiket (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Tambah Tiket (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Edit Tiket (Admin)" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/transactions" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <PlaceholderPage title="Kelola Transaksi (Admin)" />
            </ProtectedRoute>
          } 
        />

        {/* Route default - redirect ke start */}
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
