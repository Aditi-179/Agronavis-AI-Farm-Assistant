import axios from 'axios';
import { supabase } from '../lib/supabase';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
});

// Add auth token to every request
api.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Farm related API calls
export const farmApi = {
  // Get all farms for the authenticated user
  getFarms: async () => {
    const response = await api.get('/farms');
    return response.data.data;
  },
  
  // Get farms with summary data
  getFarmsSummary: async () => {
    const response = await api.get('/farms/summary');
    return response.data.data;
  },
  
  // Get farm by ID
  getFarm: async (id: string) => {
    const response = await api.get(`/farms/${id}`);
    return response.data.data;
  },
  
  // Get farm with detailed info
  getFarmDetails: async (id: string) => {
    const response = await api.get(`/farms/${id}/details`);
    return response.data.data;
  },
  
  // Create a new farm
  createFarm: async (farmData: any) => {
    const response = await api.post('/farms', farmData);
    return response.data.data;
  },
  
  // Update farm
  updateFarm: async (id: string, farmData: any) => {
    const response = await api.put(`/farms/${id}`, farmData);
    return response.data.data;
  },
  
  // Delete farm
  deleteFarm: async (id: string) => {
    const response = await api.delete(`/farms/${id}`);
    return response.data;
  },
  
  // Find farms near a location
  getFarmsNearLocation: async (latitude: number, longitude: number, radius: number = 10) => {
    const response = await api.get('/farms/location/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data.data;
  },

  // --- Field-level operations (stored as JSONB in farms.location.fields) ---

  // Get all fields for a farm
  getFarmFields: async (farmId: string) => {
    const response = await api.get(`/farms/${farmId}/fields`);
    return response.data.data;
  },

  // Add a new field to a farm
  addFarmField: async (farmId: string, fieldData: {
    name: string;
    area_acres: number;
    area_hectares?: number;
    polygon: Array<{ lat: number; lng: number }>;
    center_latitude?: number;
    center_longitude?: number;
  }) => {
    const response = await api.post(`/farms/${farmId}/fields`, fieldData);
    return response.data.data;
  },

  // Delete a field from a farm
  deleteFarmField: async (farmId: string, fieldId: string) => {
    const response = await api.delete(`/farms/${farmId}/fields/${fieldId}`);
    return response.data;
  },
};

// Export other API modules as needed
export default {
  farm: farmApi,
  // Add other API modules here
};