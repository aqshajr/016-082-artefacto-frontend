import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, FileText, MapPin, DollarSign } from 'lucide-react';
import { ticketAPI, templeAPI } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const CreateTicketPage = () => {
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    templeID: '',
  });
  const [temples, setTemples] = useState([]);
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
      case 'description':
        if (!value.trim()) {
          errors.description = 'Deskripsi tiket harus diisi';
        } else if (value.trim().length < 10) {
          errors.description = 'Deskripsi minimal 10 karakter';
        } else if (value.trim().length > 500) {
          errors.description = 'Deskripsi maksimal 500 karakter';
        }
        break;
        
      case 'price':
        if (!value.trim()) {
          errors.price = 'Harga tiket harus diisi';
        } else {
          const priceNum = parseFloat(value);
          if (isNaN(priceNum) || priceNum < 0) {
            errors.price = 'Harga harus berupa angka positif';
          } else if (priceNum > 10000000) {
            errors.price = 'Harga maksimal Rp 10.000.000';
          }
        }
        break;
        
      case 'templeID':
        if (!value) {
          errors.templeID = 'Candi harus dipilih';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
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
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setFieldErrors({});

      // Prepare data for submission
      const submitData = {
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        templeID: parseInt(formData.templeID),
      };

      const response = await ticketAPI.createTicket(submitData);
      
      if (response) {
        alert('Tiket berhasil ditambahkan!');
        navigate('/admin/tickets');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      
      let errorMessage = 'Gagal menambahkan tiket. Silakan coba lagi.';
      
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
    navigate('/admin/tickets');
  };

  if (templesLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Menambahkan tiket..." />;
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
              <h1 className="text-xl font-bold text-secondary">Tambah Tiket Baru</h1>
              <p className="text-gray text-sm mt-1">Lengkapi informasi tiket yang akan ditambahkan</p>
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
                  Deskripsi Tiket *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  rows={3}
                  className={`input-field resize-none ${fieldErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Jelaskan jenis tiket dan fasilitas yang didapat..."
                  required
                />
                {fieldErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Minimal 10 karakter, maksimal 500 karakter ({formData.description.length}/500)
                </p>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Informasi Harga</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Harga Tiket *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field pl-10 ${fieldErrors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              {fieldErrors.price && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
              )}
              {formData.price && !fieldErrors.price && (
                <p className="text-green-600 text-xs mt-1">
                  Preview: {formatPrice(parseFloat(formData.price) || 0)}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Masukkan harga dalam Rupiah (maksimal Rp 10.000.000)
              </p>
            </div>
          </div>

          {/* Temple Selection */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-secondary">Lokasi Candi</h2>
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
                Pilih candi untuk tiket ini
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
              {isLoading ? 'Menyimpan...' : 'Simpan Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage; 