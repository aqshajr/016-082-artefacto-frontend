import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { mlAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ScanPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setResult(null);
      setError('');
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await mlAPI.predictArtifact(selectedImage);
      setResult(response);
    } catch (err) {
      console.error('Scan error:', err);
      setError('Gagal memindai artefak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memindai artefak..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary mb-2">Scan Artefak</h1>
          <p className="text-gray">Ambil foto atau upload gambar artefak untuk mengetahui informasinya</p>
        </div>

        {!selectedImage ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Pilih Gambar Artefak</h3>
              <p className="text-gray text-sm mb-6">Ambil foto atau pilih dari galeri</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary flex items-center justify-center mx-auto"
              >
                <Upload size={20} className="mr-2" />
                Pilih Gambar
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-6">
              <h4 className="font-semibold text-secondary mb-3">Tips untuk hasil terbaik:</h4>
              <ul className="space-y-2 text-gray text-sm">
                <li>• Pastikan artefak terlihat jelas dalam foto</li>
                <li>• Gunakan pencahayaan yang cukup</li>
                <li>• Hindari bayangan yang menutupi artefak</li>
                <li>• Ambil foto dari jarak yang tidak terlalu jauh</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Image */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Gambar Terpilih</h3>
                <button
                  onClick={resetScan}
                  className="p-2 text-gray hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected artifact"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader size={20} className="mr-2 animate-spin" />
                      Memindai...
                    </>
                  ) : (
                    <>
                      <Camera size={20} className="mr-2" />
                      Scan Artefak
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                >
                  Ganti Gambar
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Scan Result */}
            {result && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary mb-4">Hasil Scan</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray text-sm">Nama Artefak:</span>
                    <p className="font-medium text-secondary">{result.name || 'Tidak diketahui'}</p>
                  </div>
                  <div>
                    <span className="text-gray text-sm">Tingkat Kepercayaan:</span>
                    <p className="font-medium text-secondary">{result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  {result.description && (
                    <div>
                      <span className="text-gray text-sm">Deskripsi:</span>
                      <p className="text-secondary mt-1">{result.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage; 