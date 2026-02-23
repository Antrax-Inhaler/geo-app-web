import { GeoInfo } from '../api/geoApi';

export interface HistoryItem {
  id: number;
  ip: string;
  data: GeoInfo;
  timestamp: Date;
  selected?: boolean;
}