import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCurrentUserGeo, getGeoByIP, GeoInfo } from '../api/geoApi';
import historyApi, { SearchHistory } from '../api/historyApi';
import { logout } from '../utils/auth';
import Navigation from '../components/Navigation';
import { HistoryItem } from '../types';
import {
  X,
  LogOut,
  Clock,
  Trash2,
  MapPin,
  AlertCircle,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './Home.css';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center, map]);
  return null;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentGeo, setCurrentGeo] = useState<GeoInfo | null>(null);
  const [searchIp, setSearchIp] = useState('');
  const [searchResult, setSearchResult] = useState<GeoInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);

  // Initialize refs with proper types
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Responsive check
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse card on mobile
      if (mobile) {
        setIsCardCollapsed(true);
      } else {
        setIsCardCollapsed(false);
      }
    };
    window.addEventListener('resize', onResize);
    onResize(); // Initial call
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load initial data
  useEffect(() => { 
    loadCurrentUserGeo(); 
    loadHistory(); 
  }, []);

  // Update map when search result or current geo changes
  useEffect(() => {
    const geo = searchResult || currentGeo;
    if (geo?.loc) {
      const [lat, lng] = geo.loc.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) setMapCenter([lat, lng]);
    }
  }, [searchResult, currentGeo]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 80);
    }
  }, [mobileSearchOpen]);

  const loadCurrentUserGeo = async () => {
    try {
      const data = await getCurrentUserGeo();
      setCurrentGeo(data);
      setSearchResult(data);
    } catch (err) {
      setError('Failed to load your geolocation.');
    } finally {
      setInitialLoading(false);
    }
  };

const loadHistory = async () => {
  try {
    const data = await historyApi.getHistory();
    // console.log('History data:', data); // Debug log
    
    if (Array.isArray(data)) {
      // Convert backend format to frontend format
      const formattedHistory: HistoryItem[] = data.map(item => ({
        id: item.id,
        ip: item.ip_address,
        data: {
          ip: item.ip_address,
          city: item.city || '',
          region: item.region || '',
          country: item.country || '',
          loc: item.loc || '',
          postal: item.postal || '',
          timezone: item.timezone || '',
          org: item.org || '',
        },
        timestamp: new Date(item.created_at),
        selected: false,
      }));
      setHistory(formattedHistory);
    } else {
      console.error('Expected array but got:', typeof data);
      setHistory([]);
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    setHistory([]); // Set empty array on error
  }
};

  const saveToHistory = async (ip: string, data: GeoInfo) => {
    try {
      await historyApi.createHistory({
        ip_address: ip,
        city: data.city,
        region: data.region,
        country: data.country,
        loc: data.loc,
        postal: data.postal,
        timezone: data.timezone,
        org: data.org,
        raw_data: data,
      });
      // Reload history to get the updated list with correct IDs
      await loadHistory();
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  const validateIP = (ip: string) =>
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip);

  const handleSearch = async (e?: React.FormEvent, ip?: string) => {
    if (e) e.preventDefault();
    const target = ip || searchIp.trim();
    if (!target) { setError('Please enter an IP address.'); return; }
    if (!validateIP(target)) { setError('Invalid IP address format.'); return; }

    setError('');
    setLoading(true);
    setShowDropdown(false);
    setMobileSearchOpen(false);

    try {
      const data = await getGeoByIP(target);
      setSearchResult(data);
      setSearchIp(target);
      
      // Save to backend history
      await saveToHistory(target, data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IP data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchIp('');
    setSearchResult(currentGeo);
    setError('');
    setShowDropdown(false);
  };

  const handleLogout = () => { 
    logout(); 
    navigate('/login', { replace: true }); 
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setSearchResult(item.data);
    setSearchIp(item.ip);
    setMobileSearchOpen(false);
    setSidebarOpen(false);
    // Expand card when new location is selected
    setIsCardCollapsed(false);
  };

  const handleHistoryDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await historyApi.deleteHistory(id);
      // Remove from local state
      setHistory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setError('Failed to delete history item.');
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(v => !v);
    if (selectMode) setHistory(prev => prev.map(i => ({ ...i, selected: false })));
  };

  const toggleSelect = (id: number) =>
    setHistory(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));

  const deleteSelected = async () => {
    const selectedIds = history.filter(i => i.selected).map(i => i.id);
    if (selectedIds.length === 0) return;

    try {
      await historyApi.deleteMultipleHistory(selectedIds);
      // Remove selected items from local state
      setHistory(prev => prev.filter(i => !i.selected));
      setSelectMode(false);
    } catch (err) {
      console.error('Failed to delete selected items:', err);
      setError('Failed to delete selected items.');
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    
    try {
      await historyApi.clearAllHistory();
      setHistory([]);
      setSelectMode(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history.');
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const formatDate = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today ' + formatTime(d);
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString();
  };

  const filteredHistory = searchIp.trim()
    ? history.filter(i =>
        i.ip.includes(searchIp) ||
        i.data.city?.toLowerCase().includes(searchIp.toLowerCase()) ||
        i.data.country?.toLowerCase().includes(searchIp.toLowerCase()))
    : history;

  const displayGeo = searchResult || currentGeo;
  const coords = displayGeo?.loc?.split(',').map(Number) || [0, 0];
  const validCoords = !isNaN(coords[0]) && !isNaN(coords[1]);
  const selectedCount = history.filter(i => i.selected).length;

  const toggleCardCollapse = () => {
    setIsCardCollapsed(!isCardCollapsed);
  };

  if (initialLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">GEO<span>.</span>IP<span>.</span>APP</div>
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Component */}
      <Navigation
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
        isMobile={isMobile}
        searchIp={searchIp}
        setSearchIp={setSearchIp}
        loading={loading}
        handleSearch={handleSearch}
        handleClear={handleClear}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        filteredHistory={filteredHistory}
        handleHistoryClick={handleHistoryClick}
        formatTime={formatTime}
        dropdownRef={dropdownRef}
        searchInputRef={searchInputRef}
        mobileInputRef={mobileInputRef}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {/* Map */}
        <div className="map-wrapper">
          {validCoords && (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCenter}>
                <Popup>
                  <div className="map-popup">
                    <strong>{displayGeo?.ip}</strong>
                    {displayGeo?.city}, {displayGeo?.country}<br />
                    {displayGeo?.loc}
                  </div>
                </Popup>
              </Marker>
              <MapUpdater center={mapCenter} />
            </MapContainer>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <div className="error-toast">
            <span className="error-toast-icon"><AlertCircle size={16} /></span>
            <span className="error-toast-text">{error}</span>
            <button className="error-toast-close" onClick={() => setError('')}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Location Card - Retractable on mobile */}
        {displayGeo && (
          <div className={`location-card ${isCardCollapsed ? 'collapsed' : ''}`}>
            <div className="card-header" onClick={toggleCardCollapse}>
              <div className="card-header-dot" />
              <span className="card-header-label">IP Intelligence</span>
              {isMobile && (
                <ChevronDown 
                  size={18} 
                  className={`card-header-icon ${isCardCollapsed ? '' : 'rotated'}`} 
                />
              )}
            </div>
            <div className={`card-body ${isCardCollapsed ? 'collapsed' : 'expanded'}`}>
              <div className="card-row">
                <span className="card-label">IP</span>
                <span className="card-value mono">{displayGeo.ip}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Location</span>
                <span className="card-value">{displayGeo.city}, {displayGeo.region}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Country</span>
                <span className="card-value">{displayGeo.country}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Coords</span>
                <span className="card-value mono">{displayGeo.loc}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Timezone</span>
                <span className="card-value">{displayGeo.timezone}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Provider</span>
                <span className="card-value">{displayGeo.org}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar">
            {/* Top */}
            <div className="sidebar-top">
              <span className="sidebar-title">Navigation</span>
              <button className="icon-btn" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Session */}
            {currentGeo && (
              <div className="session-card">
                <div className="session-label">Your Session</div>
                <div className="session-ip">{currentGeo.ip}</div>
                <div className="session-loc">{currentGeo.city}, {currentGeo.region}, {currentGeo.country}</div>
              </div>
            )}

            {/* History */}
            <div className="sidebar-history">
              <div className="history-toolbar">
                <span className="history-toolbar-label">
                  History {history.length > 0 && `(${history.length})`}
                </span>
                <div className="history-toolbar-actions">
                  {!selectMode ? (
                    history.length > 0 && (
                      <>
                        <button className="toolbar-btn" onClick={toggleSelectMode}>
                          <CheckSquare size={13} /> Select
                        </button>
                        <button className="toolbar-btn danger" onClick={clearAllHistory}>
                          <Trash2 size={13} /> Clear All
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <button className="toolbar-btn" onClick={() => setHistory(prev => prev.map(i => ({ ...i, selected: true })))}>All</button>
                      <button className="toolbar-btn" onClick={() => setHistory(prev => prev.map(i => ({ ...i, selected: false })))}>None</button>
                      {selectedCount > 0 && (
                        <button className="toolbar-btn danger" onClick={deleteSelected}>
                          <Trash2 size={13} /> Delete ({selectedCount})
                        </button>
                      )}
                      <button className="toolbar-btn" onClick={toggleSelectMode}>
                        <X size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="history-items">
                {history.length === 0 ? (
                  <div className="no-history">No search history yet.</div>
                ) : (
                  history.map(item => (
                    <div
                      key={item.id}
                      className="history-entry"
                      onClick={() => !selectMode && handleHistoryClick(item)}
                    >
                      {selectMode && (
                        <input
                          type="checkbox"
                          className="history-entry-checkbox"
                          checked={item.selected || false}
                          onChange={() => toggleSelect(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                      <div className="history-entry-body">
                        <div className="history-entry-top">
                          <span className="history-entry-ip">{item.ip}</span>
                          <span className="history-entry-date">{formatDate(item.timestamp)}</span>
                        </div>
                        <div className="history-entry-loc">{item.data.city}, {item.data.country}</div>
                      </div>
                      {!selectMode && (
                        <button
                          className="history-entry-del"
                          onClick={e => handleHistoryDelete(item.id, e)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                LOGOUT
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;