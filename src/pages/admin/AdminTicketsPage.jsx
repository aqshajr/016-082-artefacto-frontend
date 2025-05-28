import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, DollarSign, Search } from 'lucide-react';
import { ticketAPI, templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tickets and temples simultaneously
      const [ticketsResponse, templesResponse] = await Promise.all([
        ticketAPI.getAllTickets(),
        templeAPI.getAllTemples()
      ]);
      
      if (ticketsResponse && ticketsResponse.data && ticketsResponse.data.tickets) {
        setTickets(ticketsResponse.data.tickets);
      } else {
        setTickets([]);
      }

      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        setTemples(templesResponse.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId, ticketDescription) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tiket "${ticketDescription}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(ticketId);
      await ticketAPI.deleteTicket(ticketId);
      
      // Refresh data setelah delete
      await fetchData();
      
      alert('Tiket berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Gagal menghapus tiket. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateTicket = () => {
    navigate('/admin/tickets/create');
  };

  const handleEditTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}/edit`);
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getTempleName = (templeId) => {
    const temple = temples.find(t => t.templeID === templeId);
    return temple ? temple.title : 'Unknown Temple';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Filter tickets by selected temple and search query
  const filteredTickets = tickets.filter(ticket => {
    const templeMatch = !selectedTemple || ticket.templeID === parseInt(selectedTemple);
    const searchMatch = !searchQuery || 
      (ticket.title && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTempleName(ticket.templeID).toLowerCase().includes(searchQuery.toLowerCase());
    
    return templeMatch && searchMatch;
  });

  // Calculate statistics
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
  const averagePrice = tickets.length > 0 ? totalRevenue / tickets.length : 0;

  if (isLoading) {
    return <LoadingSpinner text="Memuat data tiket..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-secondary">
              Selamat datang, {user?.username || 'Admin'}!
            </h1>
            <p className="text-gray text-sm">Kelola data tiket dan harga</p>
          </div>
          
          {/* Stats and Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 rounded-xl px-4 py-2">
                <div className="text-lg font-bold text-primary">{tickets.length}</div>
                <div className="text-xs text-gray">Total Jenis Tiket</div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-2">
                <div className="text-lg font-bold text-green-600">{formatPrice(totalRevenue)}</div>
                <div className="text-xs text-gray">Total Harga</div>
              </div>
              <div className="bg-blue-50 rounded-xl px-4 py-2">
                <div className="text-lg font-bold text-blue-600">{formatPrice(averagePrice)}</div>
                <div className="text-xs text-gray">Rata-rata Harga</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Semua Candi</option>
                {temples.map((temple) => (
                  <option key={temple.templeID} value={temple.templeID}>
                    {temple.title}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
                <input
                  type="text"
                  placeholder="Cari tiket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleCreateTicket}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Tambah Tiket</span>
              </button>
            </div>
          </div>
          
          {(selectedTemple || searchQuery) && (
            <div className="text-sm text-gray">
              Menampilkan {filteredTickets.length} dari {tickets.length} tiket
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.ticketID} 
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewTicket(ticket.ticketID)}
              >
                <div className="relative h-48">
                  <img 
                    src={ticket.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={ticket.title || ticket.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTicket(ticket.ticketID);
                      }}
                      className="p-2 bg-white/90 rounded-full text-primary hover:text-primary-yellow transition-colors"
                      title="Edit Tiket"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTicket(ticket.ticketID, ticket.description);
                      }}
                      disabled={deleteLoading === ticket.ticketID}
                      className="p-2 bg-white/90 rounded-full text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus Tiket"
                    >
                      {deleteLoading === ticket.ticketID ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-secondary text-lg mb-1">
                    {ticket.title || ticket.description}
                  </h3>
                  <div className="text-sm text-primary mb-2">
                    {getTempleName(ticket.templeID)}
                  </div>
                  <div className="text-xl font-bold text-green-600 mb-2">
                    {formatPrice(ticket.price)}
                  </div>
                  <p className="text-sm text-gray line-clamp-2">
                    {ticket.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {selectedTemple || searchQuery ? 'Tidak Ada Tiket yang Cocok' : 'Belum Ada Data Tiket'}
            </h3>
            <p className="text-gray mb-6">
              {selectedTemple || searchQuery
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan menambahkan tiket pertama untuk sistem Artefacto.'
              }
            </p>
            {!selectedTemple && !searchQuery && (
              <button
                onClick={handleCreateTicket}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Tambah Tiket Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTicketsPage; 