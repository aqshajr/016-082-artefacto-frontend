import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, BookOpen, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { templeAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const HomePage = () => {
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setIsLoading(true);
      const response = await templeAPI.getAllTemples();
      
      // Server returns: { status: 'sukses', data: { temples: [...] } }
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
    return <ErrorMessage message={error} onRetry={fetchTemples} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-secondary">
                Selamat Datang, {user?.username || 'Explorer'}!
              </h1>
              <p className="text-gray text-sm mt-1">Jelajahi keajaiban budaya Indonesia</p>
            </div>
            <button className="p-2 bg-secondary-light rounded-lg">
              <Bell size={18} className="text-secondary" />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        {/* Featured Temples Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">Candi Populer</h2>
            <button 
              onClick={handleMulaiBelajar}
              className="text-primary text-sm font-medium hover:text-primary-yellow transition-colors"
            >
              Lihat Semua
            </button>
          </div>

          {temples.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {temples.slice(0, 3).map((temple) => (
                <div 
                  key={temple.templeID}
                  onClick={() => navigate(`/temples/${temple.templeID}`)}
                  className="card cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                      alt={temple.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-semibold text-lg mb-1">{temple.title}</h3>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {temple.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray">Belum ada data candi tersedia.</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{temples.length}</div>
            <div className="text-sm text-gray">Candi Tersedia</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">50+</div>
            <div className="text-sm text-gray">Artefak</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">1000+</div>
            <div className="text-sm text-gray">Pengunjung</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">4.8</div>
            <div className="text-sm text-gray">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 