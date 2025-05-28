import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, DollarSign, Calendar, TrendingUp, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await transactionAPI.getAllTransactions();
      
      if (response && response.data && response.data.transactions) {
        setTransactions(response.data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransaction = (transactionId) => {
    navigate(`/admin/transactions/${transactionId}`);
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

  // Filter transactions by date range and search query
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);
    const searchMatch = !searchQuery || 
      transaction.transactionID.toString().includes(searchQuery) ||
      (transaction.user && transaction.user.username && transaction.user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.user && transaction.user.email && transaction.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return dateMatch && searchMatch;
  });

  // Calculate statistics
  const totalRevenue = transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);
  
  // Calculate this month's revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthRevenue = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);

  if (isLoading) {
    return <LoadingSpinner text="Memuat data transaksi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTransactions} />;
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
            <p className="text-gray text-sm">Kelola data transaksi dan pendapatan</p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-primary/10 rounded-xl px-4 py-2">
              <div className="text-lg font-bold text-primary">{transactions.length}</div>
              <div className="text-xs text-gray">Total Transaksi</div>
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-2">
              <div className="text-lg font-bold text-green-600">{formatPrice(totalRevenue)}</div>
              <div className="text-xs text-gray">Total Pendapatan</div>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-2">
              <div className="text-lg font-bold text-blue-600">{formatPrice(thisMonthRevenue)}</div>
              <div className="text-xs text-gray">Pendapatan Bulan Ini</div>
            </div>
          </div>
          
          {/* Filters */}
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
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tanggal Akhir"
              />
            </div>
            
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {(startDate || endDate || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-gray hover:text-secondary transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          {(startDate || endDate || searchQuery) && (
            <div className="text-sm text-gray mt-2">
              Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
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
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray">Pembeli:</span>
                        <div className="font-medium">
                          {transaction.user ? transaction.user.username : 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray">
                          {transaction.user ? transaction.user.email : 'No email'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray">Total:</span>
                        <div className="font-bold text-green-600 text-lg">
                          {formatPrice(transaction.totalAmount)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray">Status:</span>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Selesai' : 
                           transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewTransaction(transaction.transactionID)}
                    className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye size={20} />
                  </button>
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
              {startDate || endDate || searchQuery ? 'Tidak Ada Transaksi yang Cocok' : 'Belum Ada Data Transaksi'}
            </h3>
            <p className="text-gray">
              {startDate || endDate || searchQuery
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Transaksi akan muncul di sini ketika pengguna mulai membeli tiket.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionsPage; 