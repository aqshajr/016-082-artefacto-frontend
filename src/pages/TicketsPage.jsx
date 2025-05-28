import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, MapPin, Clock, Calendar, Users, Star, ChevronRight } from 'lucide-react';
import { ticketAPI, transactionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(null);
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

  const handlePurchaseTicket = async (ticketId) => {
    try {
      setPurchaseLoading(ticketId);
      
      const transactionData = {
        ticketId: ticketId,
        quantity: 1
      };
      
      const response = await transactionAPI.createTransaction(transactionData);
      
      if (response && response.data) {
        // Redirect ke halaman tiket saya setelah berhasil beli
        navigate('/my-tickets');
      }
    } catch (err) {
      console.error('Error purchasing ticket:', err);
      setError('Gagal membeli tiket. Silakan coba lagi.');
    } finally {
      setPurchaseLoading(null);
    }
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
                      alt={ticket.title}
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
                      <h3 className="text-xl font-semibold text-secondary mb-2">{ticket.title}</h3>
                      <p className="text-gray text-sm mb-3">{ticket.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(ticket.price)}
                      </div>
                      <div className="text-xs text-gray">per orang</div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray" />
                      <span className="text-sm text-gray">
                        {ticket.location || 'Lokasi akan dikonfirmasi'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray" />
                      <span className="text-sm text-gray">
                        {ticket.duration || '2-3 jam'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray" />
                      <span className="text-sm text-gray">
                        {ticket.validPeriod || 'Berlaku 30 hari'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-gray" />
                      <span className="text-sm text-gray">
                        {ticket.maxCapacity || 'Tanpa batas'} orang
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {ticket.features && (
                    <div className="mb-6">
                      <h4 className="font-medium text-secondary mb-2">Yang Termasuk:</h4>
                      <ul className="text-sm text-gray space-y-1">
                        {ticket.features.split(',').map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Star size={12} className="text-primary" />
                            <span>{feature.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchaseTicket(ticket.ticketID)}
                    disabled={purchaseLoading === ticket.ticketID}
                    className="w-full btn btn-primary flex items-center justify-center space-x-2"
                  >
                    {purchaseLoading === ticket.ticketID ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Ticket size={18} />
                        <span>Beli Tiket Sekarang</span>
                        <ChevronRight size={18} />
                      </>
                    )}
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
    </div>
  );
};

export default TicketsPage; 