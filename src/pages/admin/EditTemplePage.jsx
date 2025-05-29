import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, FileText, Lightbulb, LogOut } from 'lucide-react';
import { templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const EditTemplePage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    funfactTitle: '',
    funfactDescription: '',
    locationUrl: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTempleData();
  }, [id]);

  const fetchTempleData = async () => {
    try {
      setIsLoading(true);
      const response = await templeAPI.getTempleById(id);
      
      if (response && response.data && response.data.temple) {
        const temple = response.data.temple;
        setFormData({
          title: temple.title || '',
          description: temple.description || '',
          funfactTitle: temple.funfactTitle || '',
          funfactDescription: temple.funfactDescription || '',
          locationUrl: temple.locationUrl || '',
        });
        
        // Add cache busting parameter to force image refresh
        if (temple.imageUrl) {
          const cacheBuster = `?v=${Date.now()}`;
          setCurrentImageUrl(temple.imageUrl + cacheBuster);
        }
      } else {
        setError('Data candi tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching temple data:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form - semua field wajib diisi
    if (!formData.title.trim()) {
      setError('Nama candi harus diisi');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Deskripsi candi harus diisi');
      return;
    }

    if (!formData.funfactTitle.trim()) {
      setError('Judul Fun Fact harus diisi');
      return;
    }

    if (!formData.funfactDescription.trim()) {
      setError('Deskripsi Fun Fact harus diisi');
      return;
    }

    if (!formData.locationUrl.trim()) {
      setError('URL Google Maps harus diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Buat FormData untuk multipart upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('funfactTitle', formData.funfactTitle);
      submitData.append('funfactDescription', formData.funfactDescription);
      submitData.append('locationUrl', formData.locationUrl);
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const response = await templeAPI.updateTemple(id, submitData);
      
      if (response) {
        alert('Candi berhasil diperbarui!');
        // Refresh the page to show updated image
        window.location.reload();
      }
    } catch (err) {
      console.error('Error updating temple:', err);
      setError('Gagal memperbarui candi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/temples');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  const removeCurrentImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setCurrentImageUrl('');
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (error && !formData.title) {
    return <ErrorMessage message={error} onRetry={fetchTempleData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Header with Logo, Title, Welcome Text, and Logout */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Left: Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#d4a464', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '24px'
              }}>
                <img 
                  src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                  alt="Artefacto Logo"
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#243e3e',
                margin: '0 0 0 15px',
                whiteSpace: 'nowrap'
              }}>
                Artefacto Admin Panel
              </h1>
            </div>
            
            {/* Center: Welcome Text */}
            <div style={{ 
              textAlign: 'left',
              flex: '1 1 auto',
              paddingLeft: '40px',
              paddingRight: '40px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#243e3e',
                lineHeight: '2',
                margin: 0
              }}>
                Selamat datang, admin!
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#6c6c6c',
                lineHeight: '1.2',
                margin: '2px 0 0 0'
              }}>
                Edit informasi candi
              </p>
            </div>
            
            {/* Right: Logout Button */}
            <div style={{ flex: '0 0 auto' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-t border-gray-100">
        <div className="container py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="p-2 text-gray hover:text-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-secondary">Edit Candi</h2>
              <p className="text-gray text-sm">Perbarui informasi candi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Informasi Dasar</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Nama Candi *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: Candi Borobudur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Deskripsi Candi *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Jelaskan sejarah, arsitektur, dan keunikan candi..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Fun Fact Section */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Fun Fact</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Judul Fun Fact *
                </label>
                <input
                  type="text"
                  name="funfactTitle"
                  value={formData.funfactTitle}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: Rahasia Relief Tersembunyi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Deskripsi Fun Fact *
                </label>
                <textarea
                  name="funfactDescription"
                  value={formData.funfactDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Ceritakan fakta menarik tentang candi ini..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Lokasi</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                URL Google Maps *
              </label>
              <input
                type="url"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://maps.app.goo.gl/..."
                required
              />
              <p className="text-xs text-gray mt-1">
                Salin link dari Google Maps untuk memudahkan pengunjung menemukan lokasi
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Gambar Candi</h2>
            </div>
            
            {previewImage ? (
              <div className="space-y-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewImage(null);
                    }}
                    className="text-red-500 text-sm hover:text-red-600 transition-colors"
                  >
                    Hapus Gambar Baru
                  </button>
                  <label className="text-primary text-sm hover:text-primary-yellow transition-colors cursor-pointer">
                    Ganti Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : currentImageUrl ? (
              <div className="space-y-4">
                <img 
                  src={currentImageUrl} 
                  alt="Current" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="text-red-500 text-sm hover:text-red-600 transition-colors"
                  >
                    Hapus Gambar
                  </button>
                  <label className="text-primary text-sm hover:text-primary-yellow transition-colors cursor-pointer">
                    Ganti Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary transition-colors cursor-pointer">
                <Upload size={32} className="text-primary mb-2" />
                <span className="text-sm font-medium text-secondary">Upload Gambar Candi</span>
                <span className="text-xs text-gray">JPG, PNG, maksimal 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplePage; 