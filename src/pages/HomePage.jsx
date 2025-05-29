import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  BookOpen,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { templeAPI, artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const HomePage = () => {
  const [temples, setTemples] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [templesResponse, artifactsResponse] = await Promise.all([
        templeAPI.getAllTemples(),
        artifactAPI.getAllArtifacts(),
      ]);
      setTemples(templesResponse?.data?.temples || []);
      setArtifacts(artifactsResponse?.data?.artifacts || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleBeliTiket = () => navigate('/tickets');
  const handleMulaiBelajar = () => navigate('/temples');

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (isLoading) return <LoadingSpinner text="Memuat halaman..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow pt-8 pb-28 px-4 container mx-auto">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-600 overflow-hidden rounded-2xl p-8 mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-black rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-24 h-24 bg-black rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-black rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/2 right-10 w-12 h-12 bg-black rounded-full animate-bounce delay-700"></div>
          </div>

          <div className="relative text-center text-black drop-shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {getGreeting()}, {user?.username || 'Explorer'}! 👋
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Temukan keajaiban arsitektur dan sejarah nusantara yang menakjubkan
            </p>
            <div className="flex justify-center items-center space-x-12 text-gray-100">
              <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                <MapPin size={20} />
                <span className="font-semibold">{temples.length} Candi</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                <BookOpen size={20} />
                <span className="font-semibold">{artifacts.length} Artefak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards Section */}
        <div className="bg-gray-100 rounded-3xl py-12 px-6 mb-16 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <ActionCard
              title="Beli Tiket Masuk"
              description="Pesan tiket masuk candi dengan mudah dan nikmati pengalaman wisata budaya yang tak terlupakan bersama keluarga."
              icon={<Ticket size={32} />}
              gradient="from-teal-500 to-cyan-600"
              onClick={handleBeliTiket}
            />
            <ActionCard
              title="Mulai Pembelajaran"
              description="Jelajahi sejarah dan budaya Indonesia melalui candi-candi bersejarah yang menakjubkan dengan panduan interaktif."
              icon={<BookOpen size={32} />}
              gradient="from-amber-500 to-orange-600"
              onClick={handleMulaiBelajar}
            />

          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center">
              <Sparkles size={32} className="mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-3">
                Mulai Petualangan Budayamu Sekarang!
              </h3>
              <p className="text-lg opacity-95 mb-6 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan penjelajah budaya lainnya dan temukan keajaiban Indonesia yang tersembunyi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-6 py-3 bg-black text-gray-200 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                  onClick={handleBeliTiket}
                >
                  <Ticket size={20} />
                  Beli Tiket
                </button>
                <button
                  className="px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  onClick={handleMulaiBelajar}
                >
                  <BookOpen size={20} />
                  Mulai Belajar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ActionCard = ({ title, description, icon, gradient, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-3xl p-8 cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-200 relative overflow-hidden shadow-md`}
  >
    <div
      className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-700`}
    ></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {React.cloneElement(icon, { className: 'text-black' })}
        </div>
        <ChevronRight
          size={24}
          className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-2 transition-all duration-300"
        />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
      <button
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Mulai Sekarang
      </button>
    </div>
  </div>
);


export default HomePage;
