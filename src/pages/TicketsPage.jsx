import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ChevronRight, Calendar, Minus, Plus, X } from 'lucide-react';
import { ticketAPI, transactionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    validDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ticketAPI.getAllTickets();
      
      if (response && response.data && response.data.tickets) {
        setTickets(response.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Gagal memuat tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleOpenPurchaseModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowPurchaseModal(true);
    setFormData({
      quantity: 1,
      validDate: ''
    });
    setError('');
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedTicket(null);
    setFormData({
      quantity: 1,
      validDate: ''
    });
    setError('');
  };

  const handleQuantityChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + increment)
    }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      validDate: e.target.value
    }));
  };

  const handlePurchaseTicket = async () => {
    if (!formData.validDate) {
      setError('Tanggal kunjungan harus dipilih');
      return;
    }

    try {
      setPurchaseLoading(true);
      setError('');
      
      const transactionData = {
        ticketID: selectedTicket.ticketID,
        ticketQuantity: formData.quantity,
        validDate: formData.validDate
      };
      
      const response = await transactionAPI.createTransaction(transactionData);
      
      if (response && response.data) {
        alert('Tiket berhasil dibeli!');
        handleClosePurchaseModal();
        navigate('/my-tickets');
      }
    } catch (err) {
      console.error('Error purchasing ticket:', err);
      let errorMessage = 'Gagal membeli tiket. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const getTotalPrice = () => {
    if (!selectedTicket) return 0;
    return selectedTicket.price * formData.quantity;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat tiket..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTickets} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Beli Tiket</h1>
          <p className="text-gray text-sm mt-1">Pilih tiket untuk menjelajahi candi bersejarah</p>
        </div>
      </div>

      <div className="container py-6">
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.ticketID} className="bg-white rounded-xl overflow-hidden shadow-sm">
                {/* Ticket Image */}
                {ticket.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={ticket.imageUrl}
                      alt={`Tiket ${ticket.Temple?.title || 'Candi'}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=600&h=300&fit=crop&crop=center';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-secondary mb-2">
                        Tiket {ticket.Temple?.title || 'Candi'}
                      </h3>
                      <p className="text-gray text-sm mb-3">{ticket.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(ticket.price)}
                      </div>
                      <div className="text-xs text-gray">per orang</div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handleOpenPurchaseModal(ticket)}
                    className="w-full btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <Ticket size={18} />
                    <span>Beli Tiket Sekarang</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Tiket Tersedia</h3>
            <p className="text-gray mb-6">
              Saat ini belum ada tiket yang tersedia. Silakan cek kembali nanti.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary">Pesan Tiket</h2>
                <button
                  onClick={handleClosePurchaseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray" />
                </button>
              </div>

              {/* Ticket Info */}
              {selectedTicket && (
                <div className="bg-secondary-light rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-secondary mb-1">
                    Tiket {selectedTicket.Temple?.title || 'Candi'}
                  </h3>
                  <p className="text-sm text-gray mb-2">{selectedTicket.description}</p>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(selectedTicket.price)} <span className="text-sm font-normal">per orang</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Jumlah Tiket
                  </label>
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1 max-w-xs">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-white rounded transition-colors"
                      disabled={formData.quantity <= 1}
                    >
                      <Minus size={16} className="text-gray" />
                    </button>
                    <span className="px-4 py-2 text-lg font-semibold text-secondary min-w-[3rem] text-center">
                      {formData.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-white rounded transition-colors"
                    >
                      <Plus size={16} className="text-gray" />
                    </button>
                  </div>
                </div>

                {/* Date Selector */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Tanggal Kunjungan *
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
                    <input
                      type="date"
                      value={formData.validDate}
                      onChange={handleDateChange}
                      min={getMinDate()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray mt-1">Pilih tanggal kunjungan Anda</p>
                </div>

                {/* Total Price */}
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium">Total Pembayaran:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <p className="text-xs text-gray mt-1">
                    {formData.quantity} tiket × {selectedTicket ? formatPrice(selectedTicket.price) : ''}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleClosePurchaseModal}
                  className="btn btn-outline flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={handlePurchaseTicket}
                  disabled={purchaseLoading || !formData.validDate}
                  className="btn btn-primary flex-1"
                >
                  {purchaseLoading ? 'Memproses...' : 'Beli Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage; 