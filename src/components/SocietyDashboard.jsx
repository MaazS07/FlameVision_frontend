
import React, { useState, useEffect } from 'react';
import '@tensorflow/tfjs'
import axios from 'axios';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup 
} from 'react-leaflet';
import { 
  Users, 
  AlertTriangle, 
  Phone, 
  Mail,
  Building,
  Plus,
  Trash2,
  ChartBar,
  Home,
  UserPlus,
  MapPin,
  FireExtinguisher
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Fire from './Fire'; // Import the Fire component



const SocietyDashboard = () => {
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [derivedStats, setDerivedStats] = useState(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [showFireDetection, setShowFireDetection] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: ''
  });

  useEffect(() => {
    fetchSocietyDetails();
  }, []);

  const fetchSocietyDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:3000/api/society/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSociety(response.data);
        calculateDerivedStats(response.data);
      } else {
        throw new Error('No society data received');
      }
    } catch (error) {
      console.error('Error fetching society details:', error);
      toast.error('Failed to fetch society details');
      setError(error.response?.data?.message || 'Failed to fetch society details');
    } finally {
      setLoading(false);
    }
  };

  const calculateDerivedStats = (societyData) => {
    if (!societyData) return;

    const residents = societyData.residents || [];
    
    const stats = {
      totalResidents: residents.length,
      flatOccupancy: Object.entries(residents.reduce((acc, resident) => {
        acc[resident.flatNumber] = (acc[resident.flatNumber] || 0) + 1;
        return acc;
      }, {})).map(([flatNumber, count]) => ({ flatNumber, count })),
      residentsByEmail: residents.filter(r => r.email.endsWith('@gmail.com')).length,
      emergencyPreparedness: societyData.fireStatus?.isActive ? 'Active' : 'Inactive'
    };

    setDerivedStats(stats);
  };

  const triggerEmergency = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/society/trigger-fire',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message, {
        style: {
          background: '#FF6B6B',
          color: 'white',
        },
        icon: '🚨',
      });
      fetchSocietyDetails();
    } catch (error) {
      console.error('Error triggering emergency:', error);
      toast.error(error.response?.data?.message || 'Failed to trigger emergency', {
        style: {
          background: '#FF4500',
          color: 'white',
        }
      });
    }
  };

  const handleFireDetection = async (isDetected) => {
    // Only proceed if:
    // 1. Fire is detected
    // 2. There's no active emergency already
    // 3. No request is currently in progress
    if (isDetected && 
        (!society?.fireStatus || !society.fireStatus.isActive) && 
        !isRequestInProgress) {
      
      try {
        // Set flag to prevent multiple requests
        setIsRequestInProgress(true);
        
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:3000/api/society/trigger-fire',
          { autoDetected: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Automatic fire detection triggered emergency alert!', {
          style: {
            background: '#FF6B6B',
            color: 'white',
          },
          icon: '🔥',
          duration: 5000,
        });
        
        // Update society details to reflect the new emergency status
        await fetchSocietyDetails();
        
        // Set a timeout before allowing another request - longer timeout
        setTimeout(() => {
          setIsRequestInProgress(false);
        }, 30000); // 30 second cooldown to prevent multiple triggers
        
      } catch (error) {
        console.error('Error during automatic fire detection:', error);
        // toast.error('Failed to trigger automatic emergency alert', {
        //   style: {
        //     background: '#FF4500',
        //     color: 'white',
        //   }
        // });
        
        // Reset the flag after error
        setTimeout(() => {
          setIsRequestInProgress(false);
        }, 5000); // Still have a short cooldown after error
      }
    }
  };

  const controlEmergency = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/society/control-fire',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message || 'Emergency has been controlled', {
        style: {
          background: '#4ECB71',
          color: 'white',
        },
        icon: '✅',
      });
      fetchSocietyDetails();
    } catch (error) {
      console.error('Error controlling emergency:', error);
      toast.error(error.response?.data?.message || 'Failed to control emergency', {
        style: {
          background: '#FF4500',
          color: 'white',
        }
      });
    }
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/society/residents', 
        newResident,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Resident added successfully', {
        style: {
          background: '#4ECB71',
          color: 'white',
        }
      });
      
      fetchSocietyDetails();
      setShowAddResidentModal(false);
      setNewResident({
        name: '',
        email: '',
        phone: '',
        flatNumber: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add resident', {
        style: {
          background: '#FF4500',
          color: 'white',
        }
      });
    }
  };

  const handleRemoveResident = async (residentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/society/residents/${residentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Resident removed successfully', {
        style: {
          background: '#4ECB71',
          color: 'white',
        }
      });
      
      fetchSocietyDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove resident', {
        style: {
          background: '#FF4500',
          color: 'white',
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Building className="mx-auto text-blue-500" size={64} />
          </div>
          <h2 className="text-xl text-gray-600 font-semibold">Loading Society Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchSocietyDetails}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />
      <h2 className='italic font-bold text-black text-6xl p-5'>Society Dashboard</h2>
      {/* Add Resident Modal */}
      {showAddResidentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <UserPlus className="mr-3 text-blue-500" size={28} />
              Add New Resident
            </h2>
            <form onSubmit={handleAddResident} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newResident.name}
                onChange={(e) => setNewResident({...newResident, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newResident.email}
                onChange={(e) => setNewResident({...newResident, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newResident.phone}
                onChange={(e) => setNewResident({...newResident, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                required
              />
              <input
                type="text"
                placeholder="Flat Number"
                value={newResident.flatNumber}
                onChange={(e) => setNewResident({...newResident, flatNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                required
              />
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddResidentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Society Overview Card */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <Building className="text-blue-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">{society.name}</h1>
            </div>
            <button
              onClick={() => setShowAddResidentModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add
            </button>
          </div>
          
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center">
              <MapPin className="mr-2 text-blue-500" size={20} />
              {society.address}
            </p>
            <p className="flex items-center">
              <Home className="mr-2 text-blue-500" size={20} />
              {society.area}, {society.city}
            </p>
          </div>
        </div>

        {/* Emergency Status Card */}
        <div className={`bg-white rounded-xl shadow-md p-6 col-span-1 ${
          society.fireStatus?.isActive ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle 
                className={society.fireStatus?.isActive ? 'text-red-500' : 'text-green-500'} 
                size={32} 
              />
              <h2 className="text-2xl font-bold text-gray-800">Emergency Status</h2>
            </div>
            { (
              <button
                onClick={triggerEmergency}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Trigger Emergency
              </button>
            )}
          </div>
          
          <p className={`text-xl font-semibold ${
            society.fireStatus?.isActive ? 'text-red-500' : 'text-green-500'
          }`}>
            {society.fireStatus?.isActive ? 'Emergency Active' : 'No Active Emergency'}
          </p>
          
          <div className="mt-4">
            <button
              onClick={() => setShowFireDetection(!showFireDetection)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showFireDetection ? 'Hide Fire Detection' : 'Show Fire Detection System'}
            </button>
          </div>
        </div>

        {/* Society Insights Card */}
        {derivedStats && (
          <div className="bg-white rounded-xl shadow-md p-6 col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ChartBar className="text-blue-500" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Society Insights</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">Total Residents</p>
                <p className="text-2xl font-bold text-blue-600">{derivedStats.totalResidents}</p>
                <p className="text-gray-600">Gmail Users</p>
                <p className="text-xl font-bold text-blue-600">{derivedStats.residentsByEmail}</p>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derivedStats.flatOccupancy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="flatNumber" stroke="#4299E1" />
                    <YAxis stroke="#4299E1" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4299E1" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fire Detection System */}
      {showFireDetection && (
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 ">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fire Detection System</h2>
            <p className="text-gray-600 mb-4">
              The system will automatically detect fires using your camera and notify authorities.
            </p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Fire onFireDetected={handleFireDetection} />
            </div>
          </div>
        </div>
      )}

      {/* Residents Section */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-500" size={32} />
            <h2 className="text-2xl font-bold text-gray-800">Residents</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {society.residents?.map((resident) => (
            <div
              key={resident._id}
              className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow relative border border-gray-200"
            >
              <button
                onClick={() => handleRemoveResident(resident._id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-600"
              >
                
                <Trash2 size={20} />
              </button>
              <div className="flex flex-col space-y-2">
                <p className="font-semibold text-lg text-gray-800">{resident.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Home className="mr-2 text-blue-500" size={16} />
                  Flat: {resident.flatNumber}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 text-blue-500" size={16} />
                  {resident.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 text-blue-500" size={16} />
                  {resident.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Map */}
      {society.coordinates && (
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <MapPin className="text-blue-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Society Location</h2>
            </div>
          </div>
          <div className="h-96 w-full">
            <MapContainer
              center={[
                society.coordinates.coordinates[1],
                society.coordinates.coordinates[0]
              ]}
              zoom={15}
              className="h-full w-full z-10"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker 
                position={[
                  society.coordinates.coordinates[1], 
                  society.coordinates.coordinates[0]
                ]}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-800">{society.name}</h3>
                    <p className="text-gray-600">{society.address}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyDashboard;