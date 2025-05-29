import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { ownedTicketAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(null);

  useEffect(() => {
    fetchOwnedTickets();
  }, []);

  const fetchOwnedTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ownedTicketAPI.getOwnedTickets();
      
      if (response && response.data && response.data.ownedTickets) {
        setTickets(response.data.ownedTickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching owned tickets:', err);
      setError('Gagal memuat tiket Anda. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTicket = async (ownedTicketID) => {
    try {
      setRedeemLoading(ownedTicketID);
      
      // TODO: Call API to update ticket status
      // For now, we'll simulate the update locally
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.ownedTicketID === ownedTicketID 
            ? { ...ticket, usageStatus: 'Sudah Digunakan' }
            : ticket
        )
      );
      
      alert('Tiket berhasil digunakan!');
    } catch (err) {
      console.error('Error using ticket:', err);
      alert('Gagal menggunakan tiket. Silakan coba lagi.');
    } finally {
      setRedeemLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat tiket Anda..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOwnedTickets} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Tiket Saya</h1>
          <p className="text-gray text-sm mt-1">Kelola dan lihat tiket yang Anda miliki</p>
        </div>
      </div>

      <div className="container py-6">
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ownedTicket) => (
              <div key={ownedTicket.ownedTicketID} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Ticket size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary">
                        Tiket {ownedTicket.Ticket?.Temple?.title || 'Candi'}
                      </h3>
                      <p className="text-sm text-gray">{ownedTicket.Ticket?.description || 'Deskripsi tidak tersedia'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray" />
                    <span className="text-sm text-gray">
                      Status: {ownedTicket.usageStatus || 'Aktif'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray" />
                    <span className="text-sm text-gray">
                      Kode Tiket: {ownedTicket.uniqueCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray" />
                    <span className="text-sm text-gray">
                      {ownedTicket.Ticket?.Temple?.title || 'Lokasi tidak tersedia'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {ownedTicket.Ticket?.price ? formatPrice(ownedTicket.Ticket.price) : 'Harga tidak tersedia'}
                    </div>
                    <div className="text-xs text-gray">
                      Status: {ownedTicket.usageStatus || 'Aktif'}
                    </div>
                  </div>
                </div>

                {/* Use Ticket Button */}
                {ownedTicket.usageStatus === 'Belum Digunakan' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleUseTicket(ownedTicket.ownedTicketID)}
                      disabled={redeemLoading === ownedTicket.ownedTicketID}
                      className="w-full btn btn-primary flex items-center justify-center space-x-2"
                    >
                      {redeemLoading === ownedTicket.ownedTicketID ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Gunakan Tiket</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Tiket</h3>
            <p className="text-gray mb-6">
              Anda belum memiliki tiket. Beli tiket untuk mulai menjelajahi candi-candi bersejarah.
            </p>
            <button
              onClick={() => window.location.href = '/tickets'}
              className="btn btn-primary"
            >
              Beli Tiket Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage; 