import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Eye, ChevronRight } from 'lucide-react';
import { artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const BookmarkPage = () => {
  const [bookmarkedArtifacts, setBookmarkedArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarkedArtifacts();
  }, []);

  const fetchBookmarkedArtifacts = async () => {
    try {
      setIsLoading(true);
      // Untuk sementara, kita ambil semua artifacts dan filter yang di-bookmark
      // Nanti bisa diganti dengan endpoint khusus bookmarks
      const response = await artifactAPI.getAllArtifacts();
      
      if (response && response.data && response.data.artifacts) {
        // Filter artifacts yang di-bookmark (simulasi - nanti bisa pakai data real)
        const bookmarked = response.data.artifacts.filter(artifact => 
          localStorage.getItem(`bookmark_${artifact.artifactID}`) === 'true'
        );
        setBookmarkedArtifacts(bookmarked);
      } else {
        setBookmarkedArtifacts([]);
      }
    } catch (err) {
      console.error('Error fetching bookmarked artifacts:', err);
      setError('Gagal memuat bookmark Anda. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = (artifactId) => {
    localStorage.removeItem(`bookmark_${artifactId}`);
    setBookmarkedArtifacts(prev => 
      prev.filter(artifact => artifact.artifactID !== artifactId)
    );
  };

  const handleViewArtifact = (artifactId) => {
    navigate(`/artifacts/${artifactId}`);
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat bookmark Anda..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBookmarkedArtifacts} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Bookmark</h1>
          <p className="text-gray text-sm mt-1">Artefak yang Anda simpan untuk dibaca nanti</p>
        </div>
      </div>

      <div className="container py-6">
        {bookmarkedArtifacts.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedArtifacts.map((artifact) => (
              <div key={artifact.artifactID} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center'}
                      alt={artifact.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center';
                      }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-secondary line-clamp-1">
                        {artifact.title}
                      </h3>
                      <button
                        onClick={() => handleRemoveBookmark(artifact.artifactID)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        title="Hapus dari bookmark"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray line-clamp-2 mb-3">
                      {artifact.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray">
                        {artifact.period || 'Periode tidak diketahui'}
                      </div>
                      <button
                        onClick={() => handleViewArtifact(artifact.artifactID)}
                        className="flex items-center space-x-1 text-primary text-sm font-medium hover:text-primary-yellow transition-colors"
                      >
                        <Eye size={14} />
                        <span>Lihat Detail</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Bookmark</h3>
            <p className="text-gray mb-6">
              Anda belum menyimpan artefak apapun. Jelajahi artefak dan simpan yang menarik untuk Anda.
            </p>
            <button
              onClick={() => navigate('/temples')}
              className="btn btn-primary"
            >
              Jelajahi Artefak
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage; 