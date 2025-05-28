import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Zap, Eye, Bookmark } from 'lucide-react';
import { mlAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
      setScanResult(null);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setSelectedImage(blob);
        setPreviewImage(canvas.toDataURL());
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Pilih gambar terlebih dahulu');
      return;
    }

    try {
      setIsScanning(true);
      setError('');
      setScanResult(null);

      const formData = new FormData();
      formData.append('image', selectedImage);

      console.log('Scanning artifact...');
      const response = await mlAPI.predictArtifact(formData);
      console.log('Scan response:', response);

      if (response && response.data) {
        setScanResult(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Scan error:', err);
      
      // Handle different types of errors
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Tidak dapat terhubung ke server AI. Pastikan koneksi internet Anda stabil dan coba lagi nanti.');
      } else if (err.response?.status === 400) {
        setError('Format gambar tidak valid. Gunakan gambar JPG atau PNG.');
      } else if (err.response?.status === 500) {
        setError('Server sedang mengalami masalah. Silakan coba lagi nanti.');
      } else {
        setError('Gagal memindai artefak. Silakan coba lagi.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBookmark = (artifactId) => {
    const isBookmarked = localStorage.getItem(`bookmark_${artifactId}`) === 'true';
    
    if (isBookmarked) {
      localStorage.removeItem(`bookmark_${artifactId}`);
    } else {
      localStorage.setItem(`bookmark_${artifactId}`, 'true');
    }
    
    // Update scan result to reflect bookmark status
    setScanResult(prev => ({
      ...prev,
      isBookmarked: !isBookmarked
    }));
  };

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Scan Artefak</h1>
          <p className="text-gray text-sm mt-1">Identifikasi artefak dengan AI</p>
        </div>
      </div>

      <div className="container py-6">
        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black/50">
              <h3 className="text-white font-semibold">Ambil Foto</h3>
              <button
                onClick={stopCamera}
                className="p-2 bg-white/20 rounded-full text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <Camera size={24} className="text-gray-800" />
                </button>
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Upload Section */}
        {!scanResult && (
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-secondary mb-4">Pilih Gambar Artefak</h2>
            
            {previewImage ? (
              <div className="mb-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={resetScan}
                  className="mt-3 text-red-500 text-sm flex items-center space-x-1"
                >
                  <X size={16} />
                  <span>Hapus Gambar</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary transition-colors"
                >
                  <Camera size={32} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-secondary">Ambil Foto</span>
                  <span className="text-xs text-gray">Gunakan kamera</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary transition-colors"
                >
                  <Upload size={32} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-secondary">Upload Gambar</span>
                  <span className="text-xs text-gray">Dari galeri</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedImage && (
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memindai...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Scan Artefak</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Hasil Scan</h3>
                <button
                  onClick={resetScan}
                  className="text-primary text-sm font-medium"
                >
                  Scan Lagi
                </button>
              </div>

              {scanResult.artifact ? (
                <div>
                  <h4 className="text-xl font-bold text-secondary mb-2">
                    {scanResult.artifact.title}
                  </h4>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-sm text-gray">
                      Confidence: {Math.round(scanResult.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray">
                      Period: {scanResult.artifact.period || 'Unknown'}
                    </div>
                  </div>

                  <p className="text-gray mb-4">
                    {scanResult.artifact.description}
                  </p>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.location.href = `/artifacts/${scanResult.artifact.artifactID}`}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>Lihat Detail</span>
                    </button>
                    
                    <button
                      onClick={() => handleBookmark(scanResult.artifact.artifactID)}
                      className={`btn ${scanResult.isBookmarked ? 'btn-secondary' : 'btn-outline'} flex items-center space-x-2`}
                    >
                      <Bookmark size={16} />
                      <span>{scanResult.isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-secondary mb-2">
                    Artefak Tidak Dikenali
                  </h4>
                  <p className="text-gray mb-4">
                    Maaf, kami tidak dapat mengidentifikasi artefak ini. Coba dengan gambar yang lebih jelas atau artefak lain.
                  </p>
                  <button
                    onClick={resetScan}
                    className="btn btn-primary"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isScanning && (
          <div className="bg-white rounded-xl p-8">
            <LoadingSpinner text="Menganalisis artefak dengan AI..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage; 