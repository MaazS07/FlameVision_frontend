import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Users,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Clock,
  MapPin,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

const AddPersonnel = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0   items-center  top-10  left-20 z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border-4 border-red-500">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add New Personnel</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Add Personnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FireStationDashboard = () => {
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [stats, setStats] = useState({
    totalEmergencies: 0,
    resolvedEmergencies: 0,
    averageResponseTime: 0,
    personnelCount: 0
  });

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [stationResponse, emergenciesResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/fire-station/details`),
        axios.get(`${API_BASE_URL}/fire-station/active-emergencies`),
        axios.get(`${API_BASE_URL}/fire-station/stats`)
      ]);

      setStation(stationResponse.data);
      setActiveEmergencies(emergenciesResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (user) {
      const pollInterval = setInterval(fetchData, 60000);
      return () => clearInterval(pollInterval);
    }
  }, [user]);

  const updateResponse = async (responseId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/fire-station/response/${responseId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Response updated successfully', { icon: '🚒' });
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update response');
    }
  };

  const handleAddPersonnel = async (personnelData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/fire-station/personnel`,
        personnelData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Personnel added successfully', { icon: '👨‍🚒' });
      
      const response = await axios.get(`${API_BASE_URL}/fire-station/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStation(response.data);
      setShowAddPersonnel(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add personnel');
    }
  };

  if (loading) return null;
  if (error) return null;
  if (!station) return null;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className='italic font-bold text-black text-6xl p-5'>FirePortal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Stats and Station Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-500" size={24} />
                <span className="text-lg font-semibold text-gray-700">Active Emergencies</span>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {activeEmergencies.length}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Users className="text-green-500" size={24} />
                <span className="text-lg font-semibold text-gray-700">Resolved</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {stats.resolvedEmergencies}
              </div>
            </div>
          </div>

          {/* Station Details */}
          <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Building className="text-orange-500" size={24} />
                <span className="text-lg font-semibold text-gray-700">Station</span>
              </div>
              <div className="text-xl font-bold text-orange-500">
                {station.stationName}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <MapPin className="text-teal-500" size={24} />
                <span className="text-lg font-semibold text-gray-700">Location</span>
              </div>
              <div className="text-xl font-bold text-teal-500">
                {station.city}
              </div>
            </div>
          </div>
        </div>

        {/* Personnel Card */}
        <div className="bg-white rounded-xl shadow-lg p-6   relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="text-orange-500" size={24} />
              <h2 className="text-xl font-bold ml-2">Personnel</h2>
            </div>
            <button
              onClick={() => setShowAddPersonnel(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add New
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {station.personnel.map((person, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg mb-2"
              >
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-gray-600">{person.role}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail size={14} className="mr-1" />
                  {person.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone size={14} className="mr-1" />
                  {person.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Emergencies Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h2 className="text-xl font-bold">Active Emergencies</h2>
          </div>
          <div className="space-y-4">
            {activeEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                className="p-4 bg-red-50 rounded-lg"
              >
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div className="mb-2 md:mb-0">
                    <h3 className="font-semibold">{emergency.society.name}</h3>
                    <p className="text-sm text-gray-600">{emergency.society.address}</p>
                    <p className="text-xs text-gray-500">
                      <Clock size={14} className="inline mr-1" />
                      {new Date(emergency.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateResponse(emergency.id, 'responding')}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      Respond
                    </button>
                    <button
                      onClick={() => updateResponse(emergency.id, 'completed')}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {activeEmergencies.length === 0 && (
              <p className="text-center text-gray-500">No active emergencies</p>
            )}
          </div>
        </div>

        {/* Map */}
        {station.coordinates && (
          <div className="bg-white rounded-xl shadow-lg p-4 h-96">
            <MapContainer
              center={[
                station.coordinates.coordinates[1],
                station.coordinates.coordinates[0]
              ]}
              zoom={13}
              className="h-full rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker 
                position={[
                  station.coordinates.coordinates[1],
                  station.coordinates.coordinates[0]
                ]}
              >
                <Popup>
                  {station.stationName}
                  <br />
                  {station.address}
                </Popup>
              </Marker>
              {activeEmergencies.map((emergency) => (
                <Marker 
                  key={emergency.id}
                  position={[
                    emergency.society.coordinates.coordinates[1],
                    emergency.society.coordinates.coordinates[0]
                  ]}
                  icon={new L.Icon({
                    iconUrl: '/emergency-marker.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                  })}
                >
                  <Popup>
                    <strong>EMERGENCY</strong>
                    <br />
                    {emergency.society.name}
                    <br />
                    {emergency.society.address}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {showAddPersonnel && (
        <AddPersonnel
          onClose={() => setShowAddPersonnel(false)}
          onAdd={handleAddPersonnel}
        />
      )}
    </div>
  );
};

export default FireStationDashboard;