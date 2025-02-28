import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FireExtinguisher, 
  MapPin, 
  Lock,
  Mail,
  Phone,
  MapPinned,
  User,
  Home
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import MapModal from './MapModal';

const Register = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('society');
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ 
    lat: 20.5937, 
    lng: 78.9629 
  });
  const [showMapModal, setShowMapModal] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    area: '',
    city: '',
    phone: '',
    name: '',
    secretaryName: '',
    secretaryEmail: '',
    secretaryPhone: '',
    stationName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        style: {
          background: '#FF6B6B',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#FF6B6B',
        },
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const endpoint = `http://localhost:3000/api/${type}/register`;
      
      const payload = type === 'society' 
      ? {
          name: formData.name,
          address: formData.address,
          area: formData.area,
          city: formData.city,
          secretaryName: formData.secretaryName,
          secretaryEmail: formData.email,
          secretaryPhone: formData.phone,
          password: formData.password,
          coordinates: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          }
        }
      : {
          stationName: formData.stationName,
          address: formData.address,
          area: formData.area,
          city: formData.city,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          coordinates: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          }
        };

      await axios.post(endpoint, payload);
      toast.success('Registration successful!', {
        style: {
          background: '#48BB78',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#48BB78',
        },
      });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', {
        style: {
          background: '#FF6B6B',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#FF6B6B',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const InputWithIcon = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" size={20} />
      </div>
      <input
        {...props}
        className="w-full pl-10 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 outline-none"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 p-4">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-4xl mx-4 border border-gray-100 hover:shadow-3xl transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Register
          </h1>
          <p className="text-gray-500">
            {type === 'society' ? 'Create a Society Account' : 'Register Fire Station'}
          </p>
        </div>

        {/* Type Selection */}
        <div className="flex justify-center space-x-4 mb-8">
          {['society', 'fire-station'].map((registerType) => (
            <button
              key={registerType}
              onClick={() => setType(registerType)}
              className={`
                flex items-center px-6 py-3 rounded-xl 
                transition-all duration-300 ease-in-out
                ${type === registerType 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {registerType === 'society' 
                ? <><Building2 className="mr-2" size={20} /> Society</> 
                : <><FireExtinguisher className="mr-2" size={20} /> Fire Station</>}
            </button>
          ))}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'society' ? 'Society Name' : 'Station Name'}
              </label>
              <InputWithIcon 
                icon={type === 'society' ? Home : Building2}
                type="text"
                name={type === 'society' ? 'name' : 'stationName'}
                onChange={handleChange}
                required
                placeholder={type === 'society' ? 'Enter Society Name' : 'Enter Station Name'}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <InputWithIcon 
                icon={Mail}
                type="email"
                name="email"
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            {/* Secretary Name (Society Only) */}
            {type === 'society' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secretary Name
                </label>
                <InputWithIcon 
                  icon={User}
                  type="text"
                  name="secretaryName"
                  onChange={handleChange}
                  required
                  placeholder="Enter Secretary Name"
                />
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <InputWithIcon 
                icon={Phone}
                type="tel"
                name="phone"
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            {/* Address Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <InputWithIcon 
                icon={MapPinned}
                type="text"
                name="address"
                onChange={handleChange}
                required
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <InputWithIcon 
                icon={MapPin}
                type="text"
                name="area"
                onChange={handleChange}
                required
                placeholder="Enter area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <InputWithIcon 
                icon={MapPin}
                type="text"
                name="city"
                onChange={handleChange}
                required
                placeholder="Enter city name"
              />
            </div>

            {/* Password Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <InputWithIcon 
                icon={Lock}
                type="password"
                name="password"
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <InputWithIcon 
                icon={Lock}
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                required
                placeholder="Confirm password"
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="mr-2" size={20} />
              Select Location
            </label>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-all duration-300 ease-in-out"
            >
              <MapPin className="mr-2" size={20} />
              Open Map
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 mt-6
              bg-gradient-to-r from-orange-500 to-orange-600 
              text-white rounded-xl 
              hover:from-orange-600 hover:to-orange-700 
              transform hover:scale-105 
              transition-all duration-300 
              ease-in-out
              shadow-lg hover:shadow-xl
              disabled:opacity-50
            "
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-8 text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>

      <MapModal 
        showMapModal={showMapModal} 
        setShowMapModal={setShowMapModal}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
    </div>
  );
};

export default Register;