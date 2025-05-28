import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Search } from 'lucide-react';
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-secondary">
              Selamat datang, {user?.username || 'Admin'}!
            </h1>
            <p className="text-gray text-sm">Kelola data candi dan informasinya</p>
          </div>
          
          {/* Stats and Search */}
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 rounded-xl px-4 py-2">
              <div className="text-lg font-bold text-primary">{temples.length}</div>
              <div className="text-xs text-gray">Total Candi</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
                <input
                  type="text"
                  placeholder="Cari candi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreateTemple}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Tambah Candi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Temples List */}
        {filteredTemples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemples.map((temple) => (
              <div 
                key={temple.templeID} 
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewTemple(temple.templeID)}
              >
                <div className="relative h-48">
                  <img 
                    src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={temple.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-secondary text-lg mb-2">
                    {temple.title}
                  </h3>
                  <p className="text-sm text-gray line-clamp-2 mb-3">
                    {temple.description}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
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
    </div>
  );
};

export default AdminTemplesPage; 