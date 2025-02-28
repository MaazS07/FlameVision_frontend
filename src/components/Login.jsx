import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FireExtinguisher, 
  Lock, 
  Mail, 
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SocietyImage from '../assets/society.png';
import FireStationImage from '../assets/firestation2.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('society');
  const { login, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation with toast notifications
    if (!email) {
      toast.error('Please enter your email', {
        icon: <AlertTriangle className="text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#f9f9f9',
          color: '#333',
        },
      });
      return;
    }

    if (!password) {
      toast.error('Please enter your password', {
        icon: <AlertTriangle className="text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#f9f9f9',
          color: '#333',
        },
      });
      return;
    }

    // Successful login attempt
    login(email, password, type).then((success) => {
      if (success) {
        toast.success('Login Successful!', {
          icon: <CheckCircle className="text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#f9f9f9',
            color: '#333',
          },
        });
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster 
        position="top-right" 
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-[90%] max-w-[1600px] h-[95vh] bg-white rounded-3xl grid grid-cols-1 md:grid-cols-10 overflow-hidden shadow-6xl border-4 border-gray-200"
      >
        {/* Conditionally render image and form based on type */}
        {type === 'fire-station' ? (
          <>
            {/* Fire Station Image - 80% width */}
            <div className="md:col-span-7 relative order-first">
              <img 
                src={FireStationImage} 
                alt="Fire Station"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 bg-black bg-opacity-10"></div> */}
              <div className="absolute bottom-12 left-3 text-white">
                {/* <h2 className="text-4xl font-bold text-black mb-3">
                  Fire Station Access
                </h2>
                <p className="text-lg max-w-s text-black">
                  Emergency services management portal
                </p> */}
              </div>
            </div>

            {/* Login Form - 20% width */}
            <div className="md:col-span-3 p-12 flex flex-col justify-center order-last">
              <FormContent 
                type={type} 
                setType={setType} 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                loading={loading}
                itemVariants={itemVariants}
              />
            </div>
          </>
        ) : (
          <>
            {/* Login Form - 20% width */}
            <div className="md:col-span-3 p-12 flex flex-col justify-center order-last md:order-first">
              <FormContent 
                type={type} 
                setType={setType} 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                loading={loading}
                itemVariants={itemVariants}
              />
            </div>

            {/* Society Image - 80% width */}
            <div className="md:col-span-7 relative order-first md:order-last">
              <img 
                src={SocietyImage} 
                alt="Society"
                className="absolute inset-0 w-full h-full object-cover"
              />
            
              <div className="absolute bottom-12 left-12 text-white">
                <h2 className="text-4xl font-bold mb-3">
                  Community Portal
                </h2>
                <p className="text-lg max-w-xs">
                  Secure management for your residential community
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// Extracted Form Content for reusability
const FormContent = ({
  type, 
  setType, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleSubmit, 
  loading,
  itemVariants
}) => {
  return (
    <>
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
          Fire Control
        </h1>
        <p className="text-md text-gray-500 mt-3">
          Secure Access Portal
        </p>
      </motion.div>
    
      <motion.div 
        variants={itemVariants}
        className="flex justify-center space-x-4 mb-8"
      >
        <button
          onClick={() => setType('society')}
          className={`flex items-center px-6 py-3 rounded-lg text-lg transition-all duration-300 ${
            type === 'society'
              ? 'bg-orange-500 text-white shadow-xl'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Building2 className="mr-3" size={24} />
          Society
        </button>
        <button
          onClick={() => setType('fire-station')}
          className={`flex items-center px-6 py-3 rounded-lg text-lg transition-all duration-300 ${
            type === 'fire-station'
              ? 'bg-orange-500 text-white shadow-xl'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FireExtinguisher className="mr-3" size={24} />
          Fire Station
        </button>
      </motion.div>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        <div className="relative">
          <Mail 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={24} 
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 outline-none transition-all duration-300"
            required
          />
        </div>
        
        <div className="relative">
          <Lock 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={24} 
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 outline-none transition-all duration-300"
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 text-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center shadow-xl"
        >
          {loading ? 'Logging in...' : 'Login'}
          <ChevronRight className="ml-3" size={24} />
        </motion.button>
      </motion.form>

      <motion.div 
        variants={itemVariants}
        className="text-center mt-8"
      >
        <p className="text-gray-600 text-lg">
          Don't have an account? {' '}
          <Link 
            to="/register" 
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </>
  );
};

export default Login;