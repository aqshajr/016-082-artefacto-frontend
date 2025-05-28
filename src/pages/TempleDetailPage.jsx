import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BookOpen, Bookmark, BookmarkCheck, Edit } from 'lucide-react';
import { templeAPI, artifactAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TempleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [temple, setTemple] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [readArtifacts, setReadArtifacts] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTempleData();
  }, [id]);

  const fetchTempleData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch temple details
      const templeResponse = await templeAPI.getTempleById(id);
      console.log('Temple detail response:', templeResponse);

      if (templeResponse && templeResponse.data && templeResponse.data.temple) {
        setTemple(templeResponse.data.temple);
      }

      // Fetch artifacts for this temple
      const artifactsResponse = await artifactAPI.getAllArtifacts();
      console.log('Artifacts response:', artifactsResponse);

      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        // Filter artifacts by temple ID
        const templeArtifacts = artifactsResponse.data.artifacts.filter(
          artifact => artifact.templeID === parseInt(id)
        );
        setArtifacts(templeArtifacts);
      }

      // TODO: Fetch read status from API
      // For now, use localStorage for demo
      const readStatus = JSON.parse(localStorage.getItem(`readArtifacts_${id}`) || '[]');
      setReadArtifacts(new Set(readStatus));

    } catch (err) {
      console.error('Error fetching temple data:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtifactClick = (artifact) => {
    navigate(`/artifacts/${artifact.artifactID}`);
  };

  const markAsRead = (artifactId) => {
    const newReadArtifacts = new Set(readArtifacts);
    newReadArtifacts.add(artifactId);
    setReadArtifacts(newReadArtifacts);
    
    // Save to localStorage for demo
    localStorage.setItem(`readArtifacts_${id}`, JSON.stringify([...newReadArtifacts]));
    
    // TODO: Call mark as read API
    // artifactAPI.markAsRead(artifactId);
  };

  const explorationProgress = artifacts.length > 0 ? (readArtifacts.size / artifacts.length) * 100 : 0;

  if (isLoading) {
    return <LoadingSpinner text="Memuat detail candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTempleData} />;
  }

  if (!temple) {
    return <ErrorMessage message="Candi tidak ditemukan." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm sticky top-12 z-10">
        <div className="container py-3">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary-light rounded-lg transition-colors mr-3"
            >
              <ArrowLeft size={18} className="text-secondary" />
            </button>
            <h1 className="text-lg font-semibold text-secondary">{temple.title}</h1>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Temple Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
          <img 
            src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=800&h=400&fit=crop&crop=center'}
            alt={temple.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=800&h=400&fit=crop&crop=center';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{temple.title}</h2>
          </div>
        </div>

        {/* Temple Description */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-secondary mb-3">Tentang Candi</h3>
          <p className="text-gray leading-relaxed mb-4">{temple.description}</p>
          
          {/* Location Link */}
          {temple.locationUrl && (
            <a
              href={temple.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:text-primary-yellow transition-colors"
            >
              <MapPin size={16} className="mr-2" />
              <span>Lihat Lokasi di Maps</span>
            </a>
          )}
        </div>

        {/* Fun Fact */}
        {temple.funfactTitle && (
          <div className="bg-primary/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-3">{temple.funfactTitle}</h3>
            <p className="text-secondary leading-relaxed">{temple.funfactDescription}</p>
          </div>
        )}

        {/* Edit Button for Admin */}
        {isAdmin() && (
          <div className="bg-white rounded-xl p-6 mb-6">
            <button
              onClick={() => navigate(`/admin/temples/${id}/edit`)}
              className="flex items-center text-primary hover:text-primary-yellow transition-colors"
            >
              <Edit size={16} className="mr-2" />
              <span>Edit Candi</span>
            </button>
          </div>
        )}

        {/* Artifacts Section - Only show for regular users */}
        {!isAdmin() && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-secondary mb-6">Jelajahi Artefak</h3>
            
            {artifacts.length > 0 ? (
              <div className="space-y-4">
                {artifacts.map((artifact) => {
                  const isRead = readArtifacts.has(artifact.artifactID);
                  
                  return (
                    <div 
                      key={artifact.artifactID}
                      onClick={() => {
                        handleArtifactClick(artifact);
                        markAsRead(artifact.artifactID);
                      }}
                      className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isRead 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      {/* Artifact Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                        <img 
                          src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center'}
                          alt={artifact.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center';
                          }}
                        />
                      </div>

                      {/* Artifact Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary mb-1">{artifact.title}</h4>
                        <p className="text-gray text-sm line-clamp-2 mb-2">
                          {artifact.description}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
                        </span>
                      </div>

                      {/* Read Status Icon */}
                      <div className="ml-4">
                        {isRead ? (
                          <BookmarkCheck size={24} className="text-green-500" />
                        ) : (
                          <BookOpen size={24} className="text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-secondary mb-2">Belum Ada Artefak</h4>
                <p className="text-gray">Artefak untuk candi ini belum tersedia.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TempleDetailPage; 