import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { UserPlus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ResidentManagement = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [newResident, setNewResident] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch residents on component mount
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/society/details', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResidents(response.data.residents || []);
    } catch (error) {
      toast.error('Failed to fetch residents');
    }
  };

  const handleInputChange = (e) => {
    setNewResident({
      ...newResident,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:3000/api/society/residents',
        newResident,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success('Resident added successfully');
      setNewResident({ name: '', email: '', phone: '', flatNumber: '' });
      fetchResidents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add resident');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveResident = async (id) => {
    if (window.confirm('Are you sure you want to remove this resident?')) {
      try {
        await axios.delete(`http://localhost:3000/api/society/residents/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Resident removed successfully');
        fetchResidents();
      } catch (error) {
        toast.error('Failed to remove resident');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <Users className="text-orange-500 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Resident Management</h2>
        </div>

        {/* Add Resident Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input
            type="text"
            name="name"
            value={newResident.name}
            onChange={handleInputChange}
            placeholder="Resident Name"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
          <input
            type="email"
            name="email"
            value={newResident.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
          <input
            type="tel"
            name="phone"
            value={newResident.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
          <input
            type="text"
            name="flatNumber"
            value={newResident.flatNumber}
            onChange={handleInputChange}
            placeholder="Flat Number"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 flex items-center justify-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <UserPlus className="mr-2" size={20} />
            {loading ? 'Adding...' : 'Add Resident'}
          </button>
        </form>

        {/* Residents List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Flat No.</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{resident.name}</td>
                  <td className="px-4 py-2">{resident.flatNumber}</td>
                  <td className="px-4 py-2">{resident.email}</td>
                  <td className="px-4 py-2">{resident.phone}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRemoveResident(resident._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {residents.length === 0 && (
            <p className="text-center text-gray-500 py-4">No residents found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentManagement;