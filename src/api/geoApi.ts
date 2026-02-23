import axios from 'axios';
import { getToken } from '../utils/auth';

export interface GeoInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  postal: string;
  timezone: string;
  org: string;
}

const GEO_API_URL = process.env.REACT_APP_GEO_API || 'https://ipinfo.io';
const IPINFO_TOKEN = process.env.REACT_APP_IPINFO_TOKEN;

export const getCurrentUserGeo = async (): Promise<GeoInfo> => {
  try {
    const token = getToken();
    const url = IPINFO_TOKEN 
      ? `${GEO_API_URL}/json?token=${IPINFO_TOKEN}`
      : `${GEO_API_URL}/json`;
    
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current user geo:', error);
    throw new Error('Failed to fetch geolocation data. Please check your API token.');
  }
};

export const getGeoByIP = async (ip: string): Promise<GeoInfo> => {
  try {
    const token = getToken();
    const url = IPINFO_TOKEN 
      ? `${GEO_API_URL}/${ip}/json?token=${IPINFO_TOKEN}`
      : `${GEO_API_URL}/${ip}/json`;
    
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching geo for IP ${ip}:`, error);
    throw new Error(`Failed to fetch geolocation data for IP: ${ip}`);
  }
};