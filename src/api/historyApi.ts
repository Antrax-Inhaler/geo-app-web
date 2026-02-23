import api from './api';
import { GeoInfo } from './geoApi';

export interface SearchHistory {
  id: number;
  user_id: number;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  loc: string | null;
  postal: string | null;
  timezone: string | null;
  org: string | null;
  raw_data: any | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHistoryItem {
  ip_address: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  loc?: string | null;
  postal?: string | null;
  timezone?: string | null;
  org?: string | null;
  raw_data?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const historyApi = {
  // Get user's search history
  getHistory: async (): Promise<SearchHistory[]> => {
    try {
      const response = await api.get('/search-history');
      // Handle both direct array response and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.data) {
        return [response.data.data];
      }
      return [];
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Create new history entry
  createHistory: async (data: CreateHistoryItem): Promise<SearchHistory> => {
    const response = await api.post('/search-history', data);
    // Handle both direct response and wrapped response
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Delete single history entry
  deleteHistory: async (id: number): Promise<void> => {
    await api.delete(`/search-history/${id}`);
  },

  // Delete multiple history entries
  deleteMultipleHistory: async (ids: number[]): Promise<void> => {
    await api.post('/search-history/bulk-delete', { ids });
  },

  // Clear all history for current user
  clearAllHistory: async (): Promise<void> => {
    await api.delete('/search-history/clear-all');
  },
};

export default historyApi;