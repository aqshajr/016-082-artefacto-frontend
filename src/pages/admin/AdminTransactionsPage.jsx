import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Calendar, LogOut, MapPin, Camera, Settings, Ticket } from 'lucide-react';
import { transactionAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching admin transactions...');
      const response = await transactionAPI.getAllTransactionsAdmin();
      
      console.log('Admin transactions response:', response);
      console.log('Response data:', response?.data);
      console.log('Transactions array:', response?.data?.transactions);
      
      if (response && response.data && response.data.transactions) {
        console.log('Setting transactions:', response.data.transactions);
        setTransactions(response.data.transactions);
      } else {
        console.log('No transactions found in response');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      console.error('Error details:', err.response?.data);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);
    
    return dateMatch;
  });

  // Calculate statistics
  const totalRevenue = transactions.reduce((sum, transaction) => {
    const price = parseFloat(transaction.totalPrice) || 0;
    console.log(`Transaction ${transaction.transactionID}: totalPrice="${transaction.totalPrice}", parsed=${price}`);
    return sum + price;
  }, 0);
  
  console.log('Total transactions:', transactions.length);
  console.log('Total revenue calculated:', totalRevenue);
  
  // Calculate this month's revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  console.log('This month transactions:', thisMonthTransactions.length);
  
  const thisMonthRevenue = thisMonthTransactions
    .reduce((sum, transaction) => {
      const price = parseFloat(transaction.totalPrice) || 0;
      return sum + price;
    }, 0);
  
  console.log('This month revenue calculated:', thisMonthRevenue);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data transaksi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTransactions} />;
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
                Kelola data transaksi dan pendapatan
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
        {/* Stats */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{transactions.length}</div>
              <div className="text-sm text-gray">Total Transaksi</div>
            </div>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</div>
              <div className="text-sm text-gray">Total Pendapatan</div>
            </div>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-blue-600">{formatPrice(thisMonthRevenue)}</div>
              <div className="text-sm text-gray">Pendapatan Bulan Ini</div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tanggal Mulai"
              />
              <span className="text-gray">-</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tanggal Akhir"
              />
            </div>
            
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-sm text-gray hover:text-secondary transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          {(startDate || endDate) && (
            <div className="text-sm text-gray mt-2">
              Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
            </div>
          )}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.transactionID} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">
                          Transaksi #{transaction.transactionID}
                        </h3>
                        <div className="text-sm text-gray">
                          {formatDate(transaction.transactionDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray">Pembeli:</span>
                        <div className="font-medium">
                          {transaction.User ? transaction.User.username : `User ID: ${transaction.userID}`}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray">Tiket:</span>
                        <div className="font-medium">
                          {transaction.Ticket?.Temple?.title || 'Candi'} - {transaction.ticketQuantity} tiket
                        </div>
                        <div className="text-xs text-gray">
                          {transaction.Ticket?.description || 'No description'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray">Total:</span>
                        <div className="font-bold text-green-600 text-lg">
                          {formatPrice(parseFloat(transaction.totalPrice) || 0)}
                        </div>
                        <div className="text-xs text-gray">
                          Status: {transaction.status === 'success' ? 'Berhasil' : 
                           transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {startDate || endDate ? 'Tidak Ada Transaksi yang Cocok' : 'Belum Ada Data Transaksi'}
            </h3>
            <p className="text-gray">
              {startDate || endDate
                ? 'Coba ubah filter tanggal'
                : 'Transaksi akan muncul di sini ketika pengguna mulai membeli tiket.'
              }
            </p>
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

export default AdminTransactionsPage; 