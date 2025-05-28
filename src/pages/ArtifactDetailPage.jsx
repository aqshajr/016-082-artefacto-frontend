import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Bookmark, BookmarkCheck, Calendar, Palette, Ruler, Layers } from 'lucide-react';
import { artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ArtifactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtifactData();
  }, [id]);

  const fetchArtifactData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await artifactAPI.getArtifactById(id);
      console.log('Artifact detail response:', response);

      if (response && response.data && response.data.artifact) {
        setArtifact(response.data.artifact);
      }

      // TODO: Fetch bookmark status from API
      // For now, use localStorage for demo
      const bookmarkStatus = localStorage.getItem(`bookmark_${id}`) === 'true';
      setIsBookmarked(bookmarkStatus);

    } catch (err) {
      console.error('Error fetching artifact data:', err);
      setError('Gagal memuat data artefak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const newBookmarkStatus = !isBookmarked;
      setIsBookmarked(newBookmarkStatus);
      
      // Save to localStorage for demo
      localStorage.setItem(`bookmark_${id}`, newBookmarkStatus.toString());
      
      // TODO: Call bookmark API
      // await artifactAPI.bookmarkArtifact(id, newBookmarkStatus);
      console.log('Bookmark toggled:', newBookmarkStatus);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setIsBookmarked(!isBookmarked); // Revert on error
    }
  };

  const playAudio = () => {
    // TODO: Implement audio playback
    console.log('Playing audio for artifact:', id);
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat detail artefak..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchArtifactData} />;
  }

  if (!artifact) {
    return <ErrorMessage message="Artefak tidak ditemukan." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm sticky top-12 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-secondary-light rounded-lg transition-colors mr-3"
              >
                <ArrowLeft size={18} className="text-secondary" />
              </button>
              <h1 className="text-lg font-semibold text-secondary">Detail Artefak</h1>
            </div>
            
            <button
              onClick={toggleBookmark}
              className="p-2 hover:bg-secondary-light rounded-lg transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck size={18} className="text-primary" />
              ) : (
                <Bookmark size={18} className="text-gray" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Artifact Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
          <img 
            src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center'}
            alt={artifact.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center';
            }}
          />
        </div>

        {/* Artifact Title */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-secondary mb-4">{artifact.title}</h2>
          
          {/* Audio and Bookmark Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={playAudio}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-yellow transition-colors"
            >
              <Volume2 size={16} />
              <span>Dengarkan</span>
            </button>
            
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-light text-secondary hover:bg-primary hover:text-white'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-gray leading-relaxed">{artifact.description}</p>
        </div>

        {/* Artifact Details */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Detail Artefak</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-1">Periode</h4>
                <p className="text-gray">{artifact.period || 'Abad ke-9'}</p>
              </div>
            </div>

            {/* Material */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Layers size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-1">Material</h4>
                <p className="text-gray">{artifact.material || 'Batu Vulkanik (Andesit)'}</p>
              </div>
            </div>

            {/* Size */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ruler size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-1">Ukuran</h4>
                <p className="text-gray">{artifact.size || 'Seukuran Manusia'}</p>
              </div>
            </div>

            {/* Style */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-1">Gaya</h4>
                <p className="text-gray">{artifact.style || 'Ukiran Detail Khas Periode'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        {artifact.funfact && (
          <div className="bg-gradient-to-r from-primary/10 to-primary-yellow/10 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">!</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Tahukah Anda?</h3>
                <p className="text-secondary leading-relaxed">{artifact.funfact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {artifact.additionalInfo && (
          <div className="bg-white rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Informasi Tambahan</h3>
            <p className="text-gray leading-relaxed">{artifact.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactDetailPage; 