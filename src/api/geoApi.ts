import axios from 'axios';

const GEO_API = process.env.REACT_APP_GEO_API;

export interface GeoInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // latitude,longitude
  org: string;
  postal: string;
  timezone: string;
}

export const getCurrentUserGeo = async (): Promise<GeoInfo> => {
  try {
    const response = await axios.get(`${GEO_API}/geo`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch geolocation data');
  }
};

export const getGeoByIP = async (ip: string): Promise<GeoInfo> => {
  try {
    const response = await axios.get(`${GEO_API}/${ip}/geo`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch geolocation data for this IP');
  }
};