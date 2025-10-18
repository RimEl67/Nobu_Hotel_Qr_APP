import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Key, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'guest' | 'admin'>('guest');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    phone: '',
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.roomNumber.trim() || !formData.phone.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Attempting guest login with:', {
        name: formData.name,
        roomNumber: formData.roomNumber,
        phone: formData.phone
      });
      
      const response = await apiService.authenticateGuest(
        formData.name,
        formData.roomNumber,
        formData.phone
      );

      console.log('Guest login response:', response);
      login({
        id: response.id,
        name: formData.name,
        phone: formData.phone,
        roomNumber: formData.roomNumber,
        role: 'guest',
        token: response.token,
      });

      toast.success('Bienvenue au Nobu Hotel!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Guest login error:', error);
      toast.error('Échec de l\'authentification. Vérifiez vos informations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Attempting admin login with:', {
        username: formData.username
      });
      
      const response = await apiService.authenticateAdmin(
        formData.username,
        formData.password
      );

      console.log('Admin login response:', response);
      login({
        id: response.id,
        name: response.name,
        email: response.email,
        role: 'admin',
        token: response.token,
      });

      toast.success('Bienvenue dans le Panel Admin!');
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Identifiants administrateur invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">NOBU HOTEL</h1>
          <p className="text-sm text-orange-600 mb-1">MARRAKECH</p>
          <div className="flex text-orange-400 justify-center mb-4">
            {'★'.repeat(5)}
          </div>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('guest')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'guest'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Guest Login
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'admin'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Login
          </button>
        </div>

        {mode === 'guest' ? (
          <form onSubmit={handleGuestLogin} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="Room Number"
              icon={Key}
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              placeholder="205"
              required
            />
            <Input
              label="Phone Number"
              icon={Phone}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
              type="tel"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-6"
            >
              Access Your Experience
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Username"
              icon={User}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter admin username"
              required
            />
            <Input
              label="Password"
              icon={Lock}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter admin password"
              required
            />
            
            

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              loading={loading}
              className="w-full mt-6"
            >
              Access Admin Panel
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our terms of service and privacy policy.
          <br />
          <span className="text-orange-600 font-medium">Nobu Hospitality • Marrakech</span>
        </div>
      </div>
    </div>
  );
};

export default Login;