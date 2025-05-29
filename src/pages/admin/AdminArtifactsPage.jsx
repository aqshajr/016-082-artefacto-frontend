import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, Calendar, LogOut, MapPin, Camera, Settings, Ticket } from 'lucide-react';
import { artifactAPI, templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminArtifactsPage = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch artifacts and temples simultaneously
      const [artifactsResponse, templesResponse] = await Promise.all([
        artifactAPI.getAllArtifacts(),
        templeAPI.getAllTemples()
      ]);
      
      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        setArtifacts(artifactsResponse.data.artifacts);
      } else {
        setArtifacts([]);
      }

      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        setTemples(templesResponse.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data artefak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArtifact = async (artifactId, artifactName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus artefak "${artifactName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(artifactId);
      await artifactAPI.deleteArtifact(artifactId);
      
      // Refresh data setelah delete
      await fetchData();
      
      alert('Artefak berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting artifact:', err);
      alert('Gagal menghapus artefak. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateArtifact = () => {
    navigate('/admin/artifacts/create');
  };

  const handleEditArtifact = (artifactId) => {
    navigate(`/admin/artifacts/${artifactId}/edit`);
  };

  const handleViewArtifact = (artifactId) => {
    navigate(`/artifacts/${artifactId}`);
  };

  const getTempleName = (templeId) => {
    const temple = temples.find(t => t.templeID === templeId);
    return temple ? temple.title : 'Unknown Temple';
  };

  // Filter artifacts by selected temple and search query
  const filteredArtifacts = artifacts.filter(artifact => {
    const templeMatch = !selectedTemple || artifact.templeID === parseInt(selectedTemple);
    const searchMatch = !searchQuery || 
      artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTempleName(artifact.templeID).toLowerCase().includes(searchQuery.toLowerCase());
    
    return templeMatch && searchMatch;
  });

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data artefak..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Header with Logo, Title, Welcome Text, and Logout */}
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
                Kelola data artefak dan informasinya
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

      <div className="container py-6">
        {/* Stats and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{artifacts.length}</div>
              <div className="text-sm text-gray">Total Artefak</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedTemple}
              onChange={(e) => setSelectedTemple(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Semua Candi</option>
              {temples.map((temple) => (
                <option key={temple.templeID} value={temple.templeID}>
                  {temple.title}
                </option>
              ))}
            </select>
            
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray" />
              <input
                type="text"
                placeholder="Cari artefak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
            
            <button
              onClick={handleCreateArtifact}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span>Tambah Artefak</span>
            </button>
          </div>
        </div>

        {(selectedTemple || searchQuery) && (
          <div className="text-sm text-gray mb-6">
            Menampilkan {filteredArtifacts.length} dari {artifacts.length} artefak
          </div>
        )}

        {/* Artifacts List */}
        {filteredArtifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArtifacts.map((artifact) => (
              <div 
                key={artifact.artifactID} 
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewArtifact(artifact.artifactID)}
              >
                <div className="relative h-48">
                  <img 
                    src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center'}
                    alt={artifact.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {getTempleName(artifact.templeID)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-secondary text-lg mb-2">
                    {artifact.title}
                  </h3>
                  <p className="text-sm text-gray line-clamp-2 mb-3">
                    {artifact.description}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditArtifact(artifact.artifactID);
                      }}
                      className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                      title="Edit Artefak"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArtifact(artifact.artifactID, artifact.title);
                      }}
                      disabled={deleteLoading === artifact.artifactID}
                      className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      title="Hapus Artefak"
                    >
                      {deleteLoading === artifact.artifactID ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {selectedTemple || searchQuery ? 'Tidak Ada Artefak yang Cocok' : 'Belum Ada Data Artefak'}
            </h3>
            <p className="text-gray mb-6">
              {selectedTemple || searchQuery
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan menambahkan artefak pertama untuk sistem Artefacto.'
              }
            </p>
            {!selectedTemple && !searchQuery && (
              <button
                onClick={handleCreateArtifact}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Tambah Artefak Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Bottom Navigation - Clean Design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50" style={{ width: '100vw' }}>
        <div className="flex h-20" style={{ width: '100%' }}>
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

export default AdminArtifactsPage; 