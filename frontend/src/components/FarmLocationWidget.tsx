import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { farmApi } from '../utils/farmApi';
import PolygonMapper from './map/PolygonMapper';
import type { LatLng } from '../utils/geoUtils';

const FarmMap = dynamic(() => import('./FarmMap').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading map...</div>
});

interface FarmField {
  id: string;
  name: string;
  area_acres: number;
  area_hectares?: number;
  polygon: Array<{lat: number; lng: number}>;
  center_latitude?: number;
  center_longitude?: number;
}

interface FarmLocation {
  id: string;
  name: string;
  total_area: number;
  location?: {
    latitude?: number;
    longitude?: number;
    state?: string;
    district?: string;
    village?: string;
    polygon?: Array<{lat: number; lng: number}>;
    fields?: FarmField[];
  };
}

const FarmLocationWidget: React.FC = () => {
  const [farms, setFarms] = useState<FarmLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoading(true);
        const farmsData = await farmApi.getFarms();
        setFarms(farmsData);
        
        if (farmsData.length > 0 && !selectedFarmId) {
          setSelectedFarmId(farmsData[0].id);
        }
      } catch (err: any) {
        console.error('Error loading farms:', err);
        setError(err.message || 'Failed to load farms');
      } finally {
        setLoading(false);
      }
    };

    loadFarms();
  }, []);

  const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFarmId(e.target.value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="flex justify-center items-center h-48">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (farms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-gray-500 mb-2">No farms found.</p>
          <p className="text-sm text-gray-400">Create a farm first to see it on the map.</p>
        </div>
      </div>
    );
  }

  const selectedFarm = farms.find(f => f.id === selectedFarmId);
  const hasLocationData = selectedFarm && (
    (selectedFarm.location?.latitude && selectedFarm.location?.longitude) ||
    (selectedFarm.location?.fields && selectedFarm.location.fields.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Farm Locations</h2>
      </div>
      
      <select
        value={selectedFarmId || ''}
        onChange={handleFarmChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
      >
        {farms.map(farm => (
          <option key={farm.id} value={farm.id}>
            {farm.name} ({farm.total_area} acres)
          </option>
        ))}
      </select>
      
      {selectedFarm?.location?.fields && selectedFarm.location.fields.length > 0 && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-700 mb-2">
            Fields ({selectedFarm.location.fields.length})
          </div>
          {selectedFarm.location.fields.map((field, idx) => (
            <div key={field.id || idx} className="text-sm text-gray-600 flex justify-between py-1">
              <span>{field.name}</span>
              <span>{field.area_acres} acres</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="h-80 rounded-lg overflow-hidden">
        {selectedFarmId ? (
          <FarmMap 
            farmId={selectedFarmId} 
            height="100%" 
            showAllFields={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a farm to view
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmLocationWidget;