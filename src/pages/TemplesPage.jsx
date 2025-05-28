import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { templeAPI, artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TemplesPage = () => {
  const [temples, setTemples] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [templeProgress, setTempleProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching temples and artifacts...');
      
      // Fetch temples
      const templesResponse = await templeAPI.getAllTemples();
      console.log('Temples API response:', templesResponse);
      
      // Fetch artifacts
      const artifactsResponse = await artifactAPI.getAllArtifacts();
      console.log('Artifacts API response:', artifactsResponse);
      
      let templesData = [];
      let artifactsData = [];
      
      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        templesData = templesResponse.data.temples;
        setTemples(templesData);
      }
      
      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        artifactsData = artifactsResponse.data.artifacts;
        setArtifacts(artifactsData);
      }
      
      // Calculate progress for each temple
      const progressData = {};
      templesData.forEach(temple => {
        const templeArtifacts = artifactsData.filter(artifact => artifact.templeID === temple.templeID);
        const readArtifacts = JSON.parse(localStorage.getItem(`readArtifacts_${temple.templeID}`) || '[]');
        const progress = templeArtifacts.length > 0 ? (readArtifacts.length / templeArtifacts.length) * 100 : 0;
        progressData[temple.templeID] = {
          progress: Math.round(progress),
          readCount: readArtifacts.length,
          totalCount: templeArtifacts.length
        };
      });
      setTempleProgress(progressData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTempleClick = (temple) => {
    navigate(`/temples/${temple.templeID}`);
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat daftar candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Jelajahi Candi</h1>
          <p className="text-gray text-sm mt-1">Temukan keajaiban warisan budaya Indonesia</p>
        </div>
      </div>

      <div className="container py-8">
        {temples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple) => (
              <div 
                key={temple.templeID}
                onClick={() => handleTempleClick(temple)}
                className="card cursor-pointer group hover:shadow-lg transition-all duration-300"
              >
                {/* Temple Image */}
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img 
                    src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={temple.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{temple.title}</h3>
                  </div>
                </div>

                {/* Temple Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-secondary mb-3">{temple.title}</h3>
                  
                  {/* Progress Bar */}
                  {templeProgress[temple.templeID] && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray">Progress Eksplorasi</span>
                        <span className="text-sm font-semibold text-primary">
                          {templeProgress[temple.templeID].progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-yellow h-2 rounded-full transition-all duration-500"
                          style={{ width: `${templeProgress[temple.templeID].progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray">
                        {templeProgress[temple.templeID].readCount} dari {templeProgress[temple.templeID].totalCount} artefak
                      </p>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center text-primary text-sm font-medium">
                      <span>Jelajahi</span>
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Candi</h3>
            <p className="text-gray">Belum ada data candi yang tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplesPage; 