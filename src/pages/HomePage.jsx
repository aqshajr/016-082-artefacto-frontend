import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { templeAPI, artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const HomePage = () => {
  const [temples, setTemples] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch temples and artifacts in parallel
      const [templesResponse, artifactsResponse] = await Promise.all([
        templeAPI.getAllTemples(),
        artifactAPI.getAllArtifacts()
      ]);
      
      // Handle temples response
      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        setTemples(templesResponse.data.temples);
      } else {
        setTemples([]);
      }

      // Handle artifacts response
      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        setArtifacts(artifactsResponse.data.artifacts);
      } else {
        setArtifacts([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeliTiket = () => {
    navigate('/tickets');
  };

  const handleMulaiBelajar = () => {
    navigate('/temples');
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat halaman..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div>
            <h1 className="text-xl font-bold text-secondary">
              Selamat Datang, {user?.username || 'Explorer'}!
            </h1>
            <p className="text-gray text-sm mt-1">Jelajahi keajaiban budaya Indonesia</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Main Action Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Card Beli Tiket */}
          <div 
            onClick={handleBeliTiket}
            className="card cursor-pointer group"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Ticket size={24} className="text-white" />
                </div>
                <ChevronRight size={20} className="text-gray group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Beli Tiket</h3>
              <p className="text-gray text-sm mb-4">
                Pesan tiket masuk candi dengan mudah dan nikmati pengalaman wisata budaya yang tak terlupakan.
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Lihat Tiket Tersedia</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </div>

          {/* Card Mulai Belajar */}
          <div 
            onClick={handleMulaiBelajar}
            className="card cursor-pointer group"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <ChevronRight size={20} className="text-gray group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Mulai Belajar</h3>
              <p className="text-gray text-sm mb-4">
                Jelajahi sejarah dan budaya Indonesia melalui candi-candi bersejarah yang menakjubkan.
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Jelajahi Candi</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{temples.length}</div>
            <div className="text-sm text-gray">Candi Tersedia</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{artifacts.length}</div>
            <div className="text-sm text-gray">Artefak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 