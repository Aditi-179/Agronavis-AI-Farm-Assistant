import { supabase } from '../lib/supabase';

// Use the same base axios instance from farmApi (has auth interceptor)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * All soil-related API calls go through the Express backend.
 * No direct Supabase calls from the frontend.
 */
export const soilService = {
  /**
   * Estimate soil health for a farm based on its geographic location.
   * Calls the backend which uses Supabase RPC internally.
   */
  estimateSoilHealth: async (farmId: string, state: string, district: string) => {
    const { default: axios } = await import('axios');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await axios.post(
      `${API_BASE}/soil-estimation/estimate`,
      { farmId, state, district },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  },

  /**
   * Get fertilizer recommendations for a farm.
   * Returns bag counts for Urea/SSP/MOP based on soil-crop NPK gap.
   */
  getFertilizerRecommendation: async (farmId: string) => {
    const { default: axios } = await import('axios');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await axios.get(
      `${API_BASE}/soil-estimation/fertilizer/${farmId}?t=${Date.now()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  },
};
