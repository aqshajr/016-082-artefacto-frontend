import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ticket, FileText, DollarSign } from 'lucide-react';
import { ticketAPI } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const EditTicketPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    description: '',
    price: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch only ticket data since temple selection is removed
      const ticketResponse = await ticketAPI.getTicketById(id);
      
      // Set ticket data
      if (ticketResponse && ticketResponse.data && ticketResponse.data.ticket) {
        const ticket = ticketResponse.data.ticket;
        setFormData({
          description: ticket.description || '',
          price: ticket.price ? ticket.price.toString() : '',
        });
      } else {
        setError('Data tiket tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data tiket. Silakan coba lagi.');
    } finally {
      setIsDataLoading(false);
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
      };

      const response = await ticketAPI.updateTicket(id, submitData);
      
      if (response) {
        alert('Tiket berhasil diperbarui!');
        navigate('/admin/tickets');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      
      let errorMessage = 'Gagal memperbarui tiket. Silakan coba lagi.';
      
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

  if (isDataLoading) {
    return <LoadingSpinner text="Memuat data tiket..." />;
  }

  if (error && !formData.description) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Memperbarui tiket..." />;
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
              <h1 className="text-xl font-bold text-secondary">Edit Tiket</h1>
              <p className="text-gray text-sm mt-1">Perbarui informasi tiket</p>
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
                  rows={4}
                  className={`input-field resize-none ${fieldErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Jelaskan detail tiket, termasuk fasilitas yang didapatkan..."
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`input-field pl-10 ${fieldErrors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="50000"
                  min="0"
                  max="10000000"
                  required
                />
              </div>
              {fieldErrors.price && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
              )}
              {formData.price && !fieldErrors.price && (
                <p className="text-green-600 text-xs mt-1">
                  Preview: {formatPrice(parseFloat(formData.price))}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">Harga dalam rupiah, maksimal Rp 10.000.000</p>
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
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketPage; 