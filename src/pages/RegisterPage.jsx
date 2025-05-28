import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error saat user mulai mengetik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi password confirmation
    if (formData.password !== formData.passwordConfirmation) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    // Validasi password length
    if (formData.password.length < 8) {
      setError('Password harus minimal 8 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.passwordConfirmation
      );
      
      if (result.success) {
        // Setelah register berhasil, redirect ke home (karena sudah auto login)
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Sedang mendaftar..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light relative overflow-hidden">


      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=800&fit=crop&crop=center"
          alt="Prambanan Temple Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-6">
        {/* Register Form Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-xl max-w-sm mx-auto w-full max-h-[85vh] overflow-y-auto">
          {/* Logo dan Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <img 
                src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                alt="Artefacto Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">ARTEFACTO</h1>
            <p className="text-gray text-sm">Art & Culture Exploration</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="form-input"
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password (min 8 characters)"
                  className="form-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-secondary transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Confirmation Field */}
            <div className="form-group">
              <label htmlFor="passwordConfirmation" className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="form-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-secondary transition-colors p-1"
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-gray text-sm">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-primary font-medium text-sm hover:text-primary-yellow transition-colors"
              >
                Login
              </Link>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full btn-lg flex items-center justify-between"
            >
              <span>Register</span>
              <ChevronRight size={20} />
            </button>
          </form>
        </div>

        {/* Location Info */}
        <div className="flex items-center justify-center text-white">
          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
          <span className="text-sm opacity-90">Prambanan Temple, Indonesia</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 