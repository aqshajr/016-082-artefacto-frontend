import axios from 'axios';
import Cookies from 'js-cookie';

// Konfigurasi base URL dari environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://artefacto-backend-749281711221.us-central1.run.app/api';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'https://artefacto-749281711221.asia-southeast2.run.app';

// Membuat instance axios untuk API backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable credentials for CORS
});

// Membuat instance axios untuk ML API
const mlApiClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 30000,
});

// Interceptor untuk menambahkan token ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani response dan error
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika ada response dari server
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired atau tidak valid, hapus token dan redirect ke login
        Cookies.remove('authToken');
        Cookies.remove('userRole');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response (server tidak tersedia)
      console.log('Server tidak tersedia:', error.request);
    } else {
      // Error lain dalam setup request
      console.log('Error:', error.message);
    }
    return Promise.reject(error);
  }
);


// Utility functions untuk authentication
export const authAPI = {
  // Login user
  login: async (email, password) => {
    console.log('API Login request:', { email, password });
    
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('API Login response:', response);
    console.log('Login response data:', response.data);
    
    // Simpan token dan role ke cookies jika login berhasil
    if (response.data.data && response.data.data.token) {
      // New structure: response.data.data.token
      Cookies.set('authToken', response.data.data.token, { expires: 7 });
      if (response.data.data.user && response.data.data.user.role !== undefined) {
        Cookies.set('userRole', response.data.data.user.role, { expires: 7 });
      }
    } else if (response.data.token) {
      // Old structure: response.data.token
      Cookies.set('authToken', response.data.token, { expires: 7 });
      if (response.data.user && response.data.user.role !== undefined) {
        Cookies.set('userRole', response.data.user.role, { expires: 7 });
      }
    }
    
    return response.data;
  },

  // Register user baru
  register: async (username, email, password, passwordConfirmation) => {
    const requestData = {
      username,
      email,
      password,
      passwordConfirmation: passwordConfirmation, // Server expects camelCase
    };
    
    console.log('API Register request:', requestData);
    
    const response = await apiClient.post('/auth/register', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Raw API response:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Simpan token dan role ke cookies jika register berhasil
    if (response.data.data && response.data.data.token) {
      Cookies.set('authToken', response.data.data.token, { expires: 7 });
      // Role akan disimpan di AuthContext karena mungkin tidak ada di response
    }
    
    return response.data;
  },

  // Update profile user
  updateProfile: async (formData) => {
    const response = await apiClient.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete account user
  deleteAccount: async () => {
    const response = await apiClient.delete('/auth/profile');
    
    // Hapus token dan role dari cookies setelah delete account
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    
    return response.data;
  },

  // Logout user
  logout: () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    window.location.href = '/login';
  },

  // Cek apakah user sudah login
  isAuthenticated: () => {
    return !!Cookies.get('authToken');
  },

  // Dapatkan role user
  getUserRole: () => {
    return Cookies.get('userRole') || '0';
  },

  // Cek apakah user adalah admin
  isAdmin: () => {
    return Cookies.get('userRole') === '1';
  },
};

// API functions untuk tiket
export const ticketAPI = {
  // Dapatkan semua tiket
  getAllTickets: async () => {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  // Dapatkan detail tiket berdasarkan ID
  getTicketById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // Buat tiket baru (Admin only)
  createTicket: async (ticketData) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  // Update tiket (Admin only)
  updateTicket: async (id, ticketData) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Hapus tiket (Admin only)
  deleteTicket: async (id) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },
};

// API functions untuk tiket yang dimiliki user
export const ownedTicketAPI = {
  // Dapatkan semua tiket yang dimiliki user
  getOwnedTickets: async () => {
    const response = await apiClient.get('/owned-tickets');
    return response.data;
  },

  // Dapatkan detail tiket yang dimiliki berdasarkan ID
  getOwnedTicketById: async (id) => {
    const response = await apiClient.get(`/owned-tickets/${id}`);
    return response.data;
  },
};

// API functions untuk transaksi
export const transactionAPI = {
  // Dapatkan semua transaksi
  getAllTransactions: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },

  // Dapatkan detail transaksi berdasarkan ID
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Buat transaksi baru (pembelian tiket)
  createTransaction: async (transactionData) => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  },
};

// API functions untuk candi/temple
export const templeAPI = {
  // Dapatkan semua candi
  getAllTemples: async () => {
    const response = await apiClient.get('/temples');
    return response.data;
  },

  // Dapatkan detail candi berdasarkan ID
  getTempleById: async (id) => {
    const response = await apiClient.get(`/temples/${id}`);
    return response.data;
  },

  // Buat candi baru (Admin only)
  createTemple: async (formData) => {
    const response = await apiClient.post('/temples', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update candi (Admin only)
  updateTemple: async (id, formData) => {
    const response = await apiClient.put(`/temples/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Hapus candi (Admin only)
  deleteTemple: async (id) => {
    const response = await apiClient.delete(`/temples/${id}`);
    return response.data;
  },
};

// API functions untuk artefak
export const artifactAPI = {
  // Dapatkan semua artefak
  getAllArtifacts: async () => {
    const response = await apiClient.get('/artifacts');
    return response.data;
  },

  // Dapatkan detail artefak berdasarkan ID
  getArtifactById: async (id) => {
    const response = await apiClient.get(`/artifacts/${id}`);
    return response.data;
  },

  // Buat artefak baru (Admin only)
  createArtifact: async (formData) => {
    const response = await apiClient.post('/artifacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update artefak (Admin only)
  updateArtifact: async (id, formData) => {
    const response = await apiClient.put(`/artifacts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Hapus artefak (Admin only)
  deleteArtifact: async (id) => {
    const response = await apiClient.delete(`/artifacts/${id}`);
    return response.data;
  },

  // Bookmark artefak
  bookmarkArtifact: async (id) => {
    const response = await apiClient.post(`/artifacts/${id}/bookmark`);
    return response.data;
  },

  // Mark artefak sebagai sudah dibaca
  markAsRead: async (id) => {
    const response = await apiClient.post(`/artifacts/${id}/read`);
    return response.data;
  },
};

// API functions untuk Machine Learning (prediksi artefak)
export const mlAPI = {
  // Prediksi artefak dari gambar
  predictArtifact: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await mlApiClient.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export default untuk kemudahan import
export default {
  auth: authAPI,
  tickets: ticketAPI,
  ownedTickets: ownedTicketAPI,
  transactions: transactionAPI,
  temples: templeAPI,
  artifacts: artifactAPI,
  ml: mlAPI,
}; 