import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Search, LogOut, Camera, Settings, Ticket } from 'lucide-react';
import { templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTemplesPage = () => {
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setIsLoading(true);
      const response = await templeAPI.getAllTemples();
      
      if (response && response.data && response.data.temples) {
        setTemples(response.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching temples:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemple = async (templeId, templeName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus candi "${templeName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(templeId);
      await templeAPI.deleteTemple(templeId);
      
      // Refresh data setelah delete
      await fetchTemples();
      
      alert('Candi berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting temple:', err);
      alert('Gagal menghapus candi. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateTemple = () => {
    navigate('/admin/temples/create');
  };

  const handleEditTemple = (templeId) => {
    navigate(`/admin/temples/${templeId}/edit`);
  };

  const handleViewTemple = (templeId) => {
    navigate(`/temples/${templeId}`);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  // Filter temples berdasarkan search query
  const filteredTemples = temples.filter(temple =>
    temple.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    temple.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTemples} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-20">
      {/* Single Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Left: Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#d4a464', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '24px'
              }}>
                <img 
                  src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                  alt="Artefacto Logo"
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#243e3e',
                margin: '0 0 0 15px',
                whiteSpace: 'nowrap'
              }}>
                Artefacto Admin Panel
              </h1>
            </div>
            
            {/* Center: Welcome Text */}
            <div style={{ 
              textAlign: 'left',
              flex: '1 1 auto',
              paddingLeft: '40px',
              paddingRight: '40px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#243e3e',
                lineHeight: '2',
                margin: 0
              }}>
                Selamat datang, admin!
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#6c6c6c',
                lineHeight: '1.2',
                margin: '2px 0 0 0'
              }}>
                Kelola data candi dan informasinya
              </p>
            </div>
            
            {/* Right: Logout Button */}
            <div style={{ flex: '0 0 auto' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{temples.length}</div>
              <div className="text-sm text-gray">Total Candi</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray" />
              <input
                type="text"
                placeholder="Cari candi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={handleCreateTemple}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span>Tambah Candi</span>
            </button>
          </div>
        </div>

        {/* Temples List */}
        {filteredTemples.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {filteredTemples.map((temple) => (
              <div 
                key={temple.templeID} 
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                style={{ height: '360px', display: 'flex', flexDirection: 'column' }}
                onClick={() => handleViewTemple(temple.templeID)}
              >
                <div className="relative" style={{ height: '220px', flexShrink: 0 }}>
                  <img 
                    src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={temple.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4" style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
                  {/* Title and Action Buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-secondary text-lg flex-1 mr-4" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3'
                    }}>
                      {temple.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemple(temple.templeID);
                        }}
                        className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                        title="Edit Candi"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemple(temple.templeID, temple.title);
                        }}
                        disabled={deleteLoading === temple.templeID}
                        className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                        title="Hapus Candi"
                      >
                        {deleteLoading === temple.templeID ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray" style={{ 
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.5',
                    minHeight: '3em'
                  }}>
                    {temple.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {searchQuery ? 'Tidak Ada Candi yang Cocok' : 'Belum Ada Data Candi'}
            </h3>
            <p className="text-gray mb-6">
              {searchQuery 
                ? `Tidak ditemukan candi dengan kata kunci "${searchQuery}"`
                : 'Mulai dengan menambahkan candi pertama untuk sistem Artefacto.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateTemple}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Tambah Candi Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Bottom Navigation - Clean Design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50" style={{ width: '100vw', height: '70px' }}>
        <div className="flex h-full" style={{ width: '100%' }}>
          <div
            onClick={() => navigate('/admin/temples')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/temples'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <MapPin size={22} />
            <span className="text-xs font-medium">Candi</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/artifacts')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/artifacts'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Camera size={22} />
            <span className="text-xs font-medium">Artefak</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/tickets')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/tickets'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Ticket size={22} />
            <span className="text-xs font-medium">Tiket</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/transactions')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/transactions'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Settings size={22} />
            <span className="text-xs font-medium">Transaksi</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminTemplesPage; 