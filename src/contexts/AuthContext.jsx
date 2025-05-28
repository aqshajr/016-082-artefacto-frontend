import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../utils/api';

// Membuat AuthContext
const AuthContext = createContext();

// Custom hook untuk menggunakan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Cek authentication status saat component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = authAPI.isAuthenticated();
      const role = authAPI.getUserRole();
      
      setIsAuthenticated(authenticated);
      setUserRole(role);
      
      // Jika authenticated, ambil data user dari localStorage atau set default
      if (authenticated) {
        // Coba ambil data user dari localStorage
        const savedUser = localStorage.getItem('userData');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
            // Set default user data jika parsing gagal
            setUser({
              username: 'User',
              email: 'user@example.com',
              role: parseInt(role) || 0
            });
          }
        } else {
          // Set default user data jika tidak ada di localStorage
          setUser({
            username: 'User',
            email: 'user@example.com',
            role: parseInt(role) || 0
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function untuk login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      console.log('Login attempt:', { email, password });
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);
      
      // Validasi response structure - check both possible structures
      if (response && response.data && response.data.user) {
        // New structure: response.data.user
        const userData = response.data.user;
        const token = response.data.token;
        const userRole = userData.role !== undefined ? userData.role : 0;
        
        setIsAuthenticated(true);
        setUserRole(userRole.toString());
        setUser(userData);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return { success: true, data: response };
      } else if (response && response.user && response.user.role !== undefined) {
        // Old structure: response.user
        setIsAuthenticated(true);
        setUserRole(response.user.role.toString());
        setUser(response.user);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        return { success: true, data: response };
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Reset auth state on error
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK_CHANGED') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.';
      } else if (error.message === 'Invalid response structure from server') {
        errorMessage = 'Server tidak merespons dengan benar. Silakan coba lagi nanti.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function untuk register
  const register = async (username, email, password, passwordConfirmation) => {
    try {
      setIsLoading(true);
      
      // Log data yang akan dikirim
      console.log('Register data:', { username, email, password, passwordConfirmation });
      
      const response = await authAPI.register(username, email, password, passwordConfirmation);
      
      console.log('Register response:', response);
      console.log('Response data:', response?.data);
      console.log('Response user:', response?.user);
      
      // Validasi response structure - server returns data.user, not user directly
      if (response && response.data && response.data.user) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Set default role to 0 (user) if not provided
        const userRole = userData.role !== undefined ? userData.role : 0;
        
        setIsAuthenticated(true);
        setUserRole(userRole.toString());
        setUser(userData);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Save token if provided
        if (token) {
          // Token sudah disimpan di api.js, tapi pastikan role juga disimpan
          Cookies.set('userRole', userRole.toString(), { expires: 7 });
        }
        
        return { success: true, data: response };
      } else {
        console.log('Response structure validation failed');
        console.log('Expected: response.data.user, got:', response);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Log each validation error in detail
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err, index) => {
          console.error(`Validation error ${index + 1}:`, err);
        });
      }
      
      // Reset auth state on error
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Jika ada error validasi detail, tampilkan
        if (error.response.data.errors) {
          if (Array.isArray(error.response.data.errors)) {
            // Jika errors adalah array of objects
            const validationErrors = error.response.data.errors
              .map(err => {
                if (typeof err === 'object' && err.message) {
                  return err.message;
                } else if (typeof err === 'string') {
                  return err;
                } else {
                  return JSON.stringify(err);
                }
              })
              .join(', ');
            errorMessage += `: ${validationErrors}`;
          } else if (typeof error.response.data.errors === 'object') {
            // Jika errors adalah object dengan field names
            const validationErrors = Object.values(error.response.data.errors)
              .flat()
              .join(', ');
            errorMessage += `: ${validationErrors}`;
          }
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK_CHANGED') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.';
      } else if (error.message === 'Invalid response structure from server') {
        errorMessage = 'Server tidak merespons dengan benar. Silakan coba lagi nanti.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function untuk logout
  const logout = () => {
    try {
      authAPI.logout();
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      // Hapus user data dari localStorage
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function untuk update profile
  const updateProfile = async (formData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(formData);
      
      // Update user data jika berhasil
      if (response.user) {
        setUser(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Update profil gagal. Silakan coba lagi.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function untuk delete account
  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.deleteAccount();
      
      // Reset auth state setelah delete account
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Delete account error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Hapus akun gagal. Silakan coba lagi.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Cek apakah user adalah admin
  const isAdmin = () => {
    return userRole === '1';
  };

  // Cek apakah user adalah user biasa
  const isUser = () => {
    return userRole === '0';
  };

  // Value yang akan disediakan oleh context
  const value = {
    // State
    isAuthenticated,
    userRole,
    isLoading,
    user,
    
    // Functions
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    checkAuthStatus,
    
    // Helper functions
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;