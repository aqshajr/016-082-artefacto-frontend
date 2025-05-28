import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Package, FileText, MapPin, Lightbulb } from 'lucide-react';
import { artifactAPI, templeAPI } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const CreateArtifactPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templeID: '',
    detailPeriod: '',
    detailMaterial: '',
    detailSize: '',
    detailStyle: '',
    funfactTitle: '',
    funfactDescription: '',
    locationUrl: '',
  });
  const [temples, setTemples] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templesLoading, setTemplesLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setTemplesLoading(true);
      const response = await templeAPI.getAllTemples();
      
      if (response && response.data && response.data.temples) {
        setTemples(response.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching temples:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setTemplesLoading(false);
    }
  };

  // Validation rules
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Nama artefak harus diisi';
        } else if (value.trim().length < 3) {
          errors.title = 'Nama artefak minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.title = 'Nama artefak maksimal 100 karakter';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errors.description = 'Deskripsi artefak harus diisi';
        } else if (value.trim().length < 10) {
          errors.description = 'Deskripsi minimal 10 karakter';
        } else if (value.trim().length > 1000) {
          errors.description = 'Deskripsi maksimal 1000 karakter';
        }
        break;
        
      case 'templeID':
        if (!value) {
          errors.templeID = 'Candi harus dipilih';
        }
        break;
        
      case 'detailPeriod':
        if (!value.trim()) {
          errors.detailPeriod = 'Detail periode harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailPeriod = 'Detail periode minimal 3 karakter';
        }
        break;
        
      case 'detailMaterial':
        if (!value.trim()) {
          errors.detailMaterial = 'Detail material harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailMaterial = 'Detail material minimal 3 karakter';
        }
        break;
        
      case 'detailSize':
        if (!value.trim()) {
          errors.detailSize = 'Detail ukuran harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailSize = 'Detail ukuran minimal 3 karakter';
        }
        break;
        
      case 'detailStyle':
        if (!value.trim()) {
          errors.detailStyle = 'Detail gaya harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailStyle = 'Detail gaya minimal 3 karakter';
        }
        break;
        
      case 'funfactTitle':
        if (!value.trim()) {
          errors.funfactTitle = 'Judul fun fact harus diisi';
        } else if (value.trim().length < 3) {
          errors.funfactTitle = 'Judul fun fact minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.funfactTitle = 'Judul fun fact maksimal 100 karakter';
        }
        break;
        
      case 'funfactDescription':
        if (!value.trim()) {
          errors.funfactDescription = 'Deskripsi fun fact harus diisi';
        } else if (value.trim().length < 10) {
          errors.funfactDescription = 'Deskripsi fun fact minimal 10 karakter';
        } else if (value.trim().length > 500) {
          errors.funfactDescription = 'Deskripsi fun fact maksimal 500 karakter';
        }
        break;
        
      case 'locationUrl':
        if (!value.trim()) {
          errors.locationUrl = 'URL lokasi harus diisi';
        } else {
          try {
            new URL(value);
          } catch {
            errors.locationUrl = 'Format URL tidak valid';
          }
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only validate if field has been validated before
    if (validatedFields.has(name)) {
      const fieldError = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        ...fieldError,
        ...(Object.keys(fieldError).length === 0 ? { [name]: undefined } : {})
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as validated on blur
    setValidatedFields(prev => new Set([...prev, name]));
    
    // Validate field
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      ...fieldError,
      ...(Object.keys(fieldError).length === 0 ? { [name]: undefined } : {})
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate image file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({
          ...prev,
          image: 'Format file harus JPG atau PNG'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          image: 'Ukuran file maksimal 5MB'
        }));
        return;
      }
      
      // Clear image error if validation passes
      setFieldErrors(prev => ({
        ...prev,
        image: undefined
      }));
      
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
    
    // Mark all fields as validated
    setValidatedFields(new Set(Object.keys(formData)));
    
    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      Object.assign(allErrors, fieldError);
    });
    
    // Validate image
    if (!selectedImage) {
      allErrors.image = 'Gambar artefak harus diupload';
    }
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setFieldErrors({});

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('templeID', formData.templeID);
      submitData.append('detailPeriod', formData.detailPeriod.trim());
      submitData.append('detailMaterial', formData.detailMaterial.trim());
      submitData.append('detailSize', formData.detailSize.trim());
      submitData.append('detailStyle', formData.detailStyle.trim());
      submitData.append('funfactTitle', formData.funfactTitle.trim());
      submitData.append('funfactDescription', formData.funfactDescription.trim());
      submitData.append('locationUrl', formData.locationUrl.trim());
      
      if (selectedImage) {
        submitData.append('image', selectedImage, selectedImage.name);
      }

      const response = await artifactAPI.createArtifact(submitData);
      
      if (response) {
        alert('Artefak berhasil ditambahkan!');
        navigate('/admin/artifacts');
      }
    } catch (err) {
      console.error('Error creating artifact:', err);
      
      let errorMessage = 'Gagal menambahkan artefak. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors.map(error => {
            if (typeof error === 'object' && error.message) {
              return error.message;
            }
            return error.toString();
          }).join(', ');
          errorMessage += `: ${validationErrors}`;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/artifacts');
  };

  if (templesLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Menambahkan artefak..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="p-2 text-gray hover:text-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-secondary">Tambah Artefak Baru</h1>
              <p className="text-gray text-sm mt-1">Lengkapi informasi artefak yang akan ditambahkan</p>
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
                  Nama Artefak *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: Arca Ganesha"
                  required
                />
                {fieldErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter, maksimal 100 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Deskripsi Artefak *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  rows={4}
                  className={`input-field resize-none ${fieldErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Jelaskan sejarah, makna, dan keunikan artefak..."
                  required
                />
                {fieldErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Minimal 10 karakter, maksimal 1000 karakter ({formData.description.length}/1000)
                </p>
              </div>
            </div>
          </div>

          {/* Temple Selection */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Candi Terkait</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Pilih Candi *
              </label>
              <select
                name="templeID"
                value={formData.templeID}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`input-field ${fieldErrors.templeID ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              >
                <option value="">Pilih candi...</option>
                {temples.map((temple) => (
                  <option key={temple.templeID} value={temple.templeID}>
                    {temple.title}
                  </option>
                ))}
              </select>
              {fieldErrors.templeID && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.templeID}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Pilih candi tempat artefak ini ditemukan atau berasal
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Gambar Artefak</h2>
            </div>
            
            {previewImage ? (
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewImage(null);
                      setFieldErrors(prev => ({ ...prev, image: undefined }));
                    }}
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
              <div>
                <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer ${fieldErrors.image ? 'border-red-500' : 'border-primary/30'}`}>
                  <Upload size={32} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-secondary">Upload Gambar Artefak</span>
                  <span className="text-xs text-gray">JPG, PNG, maksimal 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                {fieldErrors.image && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.image}</p>
                )}
              </div>
            )}
          </div>

          {/* Artifact Details */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Detail Artefak</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Periode *
                </label>
                <input
                  type="text"
                  name="detailPeriod"
                  value={formData.detailPeriod}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.detailPeriod ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: Abad ke-8 Masehi"
                  required
                />
                {fieldErrors.detailPeriod && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.detailPeriod}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Material *
                </label>
                <input
                  type="text"
                  name="detailMaterial"
                  value={formData.detailMaterial}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.detailMaterial ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: Batu Andesit"
                  required
                />
                {fieldErrors.detailMaterial && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.detailMaterial}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Ukuran *
                </label>
                <input
                  type="text"
                  name="detailSize"
                  value={formData.detailSize}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.detailSize ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: 150 cm x 80 cm x 60 cm"
                  required
                />
                {fieldErrors.detailSize && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.detailSize}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Gaya Seni *
                </label>
                <input
                  type="text"
                  name="detailStyle"
                  value={formData.detailStyle}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.detailStyle ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: Gaya Jawa Tengah"
                  required
                />
                {fieldErrors.detailStyle && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.detailStyle}</p>
                )}
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
                  onBlur={handleInputBlur}
                  className={`input-field ${fieldErrors.funfactTitle ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Contoh: Rahasia Teknik Pembuatan"
                  required
                />
                {fieldErrors.funfactTitle && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.funfactTitle}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter, maksimal 100 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Deskripsi Fun Fact *
                </label>
                <textarea
                  name="funfactDescription"
                  value={formData.funfactDescription}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  rows={3}
                  className={`input-field resize-none ${fieldErrors.funfactDescription ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ceritakan fakta menarik tentang artefak ini..."
                  required
                />
                {fieldErrors.funfactDescription && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.funfactDescription}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Minimal 10 karakter, maksimal 500 karakter ({formData.funfactDescription.length}/500)
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Lokasi Penemuan</h2>
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
                onBlur={handleInputBlur}
                className={`input-field ${fieldErrors.locationUrl ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="https://maps.app.goo.gl/..."
                required
              />
              {fieldErrors.locationUrl && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.locationUrl}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Salin link dari Google Maps untuk lokasi penemuan artefak
              </p>
            </div>
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
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Artefak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArtifactPage; 