import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  LocateFixed 
} from 'lucide-react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Location Picker Component
const LocationPicker = ({ coordinates, setCoordinates }) => {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      setCoordinates({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });

  return coordinates ? (
    <Marker 
      position={[coordinates.lat, coordinates.lng]} 
      icon={customMarkerIcon} 
    />
  ) : null;
};

// Map Controls Component
const MapControls = ({ setCoordinates }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const map = useMap();

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1
        }
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coordinates = { 
          lat: parseFloat(lat), 
          lng: parseFloat(lon) 
        };
        
        map.setView(coordinates, 13);
        setCoordinates(coordinates);
        toast.success('Location found!');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Error searching location');
    }
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          setCoordinates({
            lat: latitude,
            lng: longitude
          });
          toast.success('Current location found!');
        },
        (error) => {
          toast.error('Unable to retrieve location');
        }
      );
    } else {
      toast.error('Geolocation is not supported');
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex space-x-2">
      <div className="flex space-x-2 bg-white rounded-lg shadow-md p-2">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location"
          className="px-2 py-1 rounded-md border"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white px-2 rounded-md"
        >
          <Search size={20} />
        </button>
      </div>
      <button 
        onClick={handleCurrentLocation}
        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        title="Use Current Location"
      >
        <LocateFixed size={24} className="text-blue-600" />
      </button>
    </div>
  );
};

// Map Modal Component
const MapModal = ({ 
  showMapModal, 
  setShowMapModal, 
  coordinates, 
  setCoordinates 
}) => {
  return (
    <AnimatePresence>
      {showMapModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000]bg-black/50 flex items-center justify-center "
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-[90%] h-[90%] bg-white rounded-2xl overflow-hidden relative"
          >
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 left-11 z-[1001] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <X size={24} className="text-gray-700" />
            </button>
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={5}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                coordinates={coordinates}
                setCoordinates={setCoordinates}
              />
              <MapControls 
                setCoordinates={setCoordinates}
              />
            </MapContainer>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1001]">
              <button
                onClick={() => {
                  setShowMapModal(false);
                  toast.success('Location selected successfully!');
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
              >
                Confirm Location
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapModal;