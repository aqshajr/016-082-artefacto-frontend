import React, { useState, useRef } from 'react';
import { User, Camera, Edit3, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Form state untuk edit profil
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    profilePicture: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Buat preview gambar
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Buat FormData untuk multipart/form-data
      const formDataToSend = new FormData();
      let hasChanges = false;
      
      // Hanya kirim field yang berubah
      if (formData.username !== user.username && formData.username.trim()) {
        formDataToSend.append('username', formData.username.trim());
        hasChanges = true;
      }
      
      if (formData.email !== user.email && formData.email.trim()) {
        formDataToSend.append('email', formData.email.trim());
        hasChanges = true;
      }
      
      // Untuk password, hanya kirim jika ada currentPassword
      if (formData.currentPassword && formData.currentPassword.trim()) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        hasChanges = true;
        
        // Jika ada newPassword, kirim juga
        if (formData.newPassword && formData.newPassword.trim()) {
          formDataToSend.append('newPassword', formData.newPassword);
        }
      }
      
      // Profile picture
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
        hasChanges = true;
      }

      // Cek apakah ada perubahan
      if (!hasChanges) {
        setError('Tidak ada perubahan yang perlu disimpan.');
        return;
      }

      // Validasi client-side
      if (formData.newPassword && formData.newPassword.length < 6) {
        setError('Password baru minimal 6 karakter.');
        return;
      }

      // Password saat ini hanya wajib jika mengubah email atau password baru
      const requiresPassword = formData.email !== user.email || formData.newPassword;
      
      if (requiresPassword && !formData.currentPassword) {
        setError('Password saat ini diperlukan untuk mengubah email atau password.');
        return;
      }

      console.log('Updating profile...');
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', typeof value === 'object' ? 'File' : value);
      }
      
      const response = await authAPI.updateProfile(formDataToSend);
      console.log('Profile update response:', response);

      // Update user data di localStorage jika ada response user
      if (response && response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      } else if (response && response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        profilePicture: null
      }));
      setPreviewImage(null);
      
      // Refresh halaman untuk mendapatkan data terbaru
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Gagal memperbarui profil. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Deleting account...');
      await authAPI.deleteAccount();
      
      // Logout dan redirect ke halaman login
      logout();
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Gagal menghapus akun. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      profilePicture: null
    });
    setPreviewImage(null);
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return <LoadingSpinner text="Memproses..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <h1 className="text-xl font-bold text-secondary">Profil</h1>
          <p className="text-gray text-sm mt-1">Kelola informasi akun Anda</p>
        </div>
      </div>

      <div className="container py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary">Informasi Profil</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-yellow transition-colors"
              >
                <Edit3 size={16} />
                <span>Edit Profil</span>
              </button>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {user?.profilePicture ? (
                    <img 
                      src={`${user.profilePicture}?t=${Date.now()}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-primary" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray">Username</label>
                  <p className="text-secondary font-medium mt-1">{user?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray">Email</label>
                  <p className="text-secondary font-medium mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray">Role</label>
                  <p className="text-secondary font-medium mt-1">
                    {isAdmin() ? 'Administrator' : 'User'}
                  </p>
                </div>

              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleEditProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : user?.profilePicture ? (
                    <img 
                      src={`${user.profilePicture}?t=${Date.now()}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-primary" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary-light text-secondary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    <Camera size={16} />
                    <span>Ganti Foto</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input pr-12"
                      placeholder="Diperlukan untuk ubah email/password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-primary"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray mt-1">Hanya diperlukan jika mengubah email atau password</p>
                </div>
                <div>
                  <label className="form-label">Password Baru (Opsional)</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="form-input pr-12"
                      placeholder="Kosongkan jika tidak ingin ganti password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-primary"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray mt-1">Minimal 6 karakter jika ingin mengganti password</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-yellow transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X size={16} />
                  <span>Batal</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone - Only for regular users */}
        {!isAdmin() && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Hapus Akun</h3>
            <p className="text-gray mb-4">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete Account</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  <p className="font-medium">Apakah Anda yakin ingin menghapus akun?</p>
                  <p className="text-sm mt-1">Tindakan ini tidak dapat dibatalkan dan semua data Anda akan hilang.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Ya, Hapus Akun
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 