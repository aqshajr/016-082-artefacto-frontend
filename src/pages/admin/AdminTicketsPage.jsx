import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, DollarSign, Search, LogOut, MapPin, Camera, Settings } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTempleName(ticket.templeID).toLowerCase().includes(searchQuery.toLowerCase());
    
    return templeMatch && searchMatch;
  });

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data tiket..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
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
                Kelola data tiket dan harga
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

      <div className="container py-6">
        {/* Stats and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{tickets.length}</div>
              <div className="text-sm text-gray">Total Jenis Tiket</div>
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
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray" />
              <input
                type="text"
                placeholder="Cari tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
            
            <button
              onClick={handleCreateTicket}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span>Tambah Tiket</span>
            </button>
          </div>
        </div>

        {(selectedTemple || searchQuery) && (
          <div className="text-sm text-gray mb-6">
            Menampilkan {filteredTickets.length} dari {tickets.length} tiket
          </div>
        )}

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.ticketID} 
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="relative h-48">
                  <img 
                    src={ticket.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={ticket.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-secondary text-lg mb-1">
                    Tiket {getTempleName(ticket.templeID)}
                  </h3>
                  <div className="text-xl font-bold text-green-600 mb-2">
                    {formatPrice(ticket.price)}
                  </div>
                  <p className="text-sm text-gray line-clamp-2 mb-4">
                    {ticket.description}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditTicket(ticket.ticketID)}
                      className="p-2 text-primary hover:text-primary-yellow hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Tiket"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.ticketID, ticket.description)}
                      disabled={deleteLoading === ticket.ticketID}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Admin Bottom Navigation - Clean Design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50" style={{ width: '100vw' }}>
        <div className="flex h-20" style={{ width: '100%' }}>
          <div
            onClick={() => navigate('/admin/temples')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/temples'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <MapPin size={22} />
            <span className="text-xs font-medium">Candi</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/artifacts')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/artifacts'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Camera size={22} />
            <span className="text-xs font-medium">Artefak</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/tickets')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/tickets'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Ticket size={22} />
            <span className="text-xs font-medium">Tiket</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/transactions')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/transactions'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Settings size={22} />
            <span className="text-xs font-medium">Transaksi</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminTicketsPage; 