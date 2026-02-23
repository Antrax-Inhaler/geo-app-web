import React from 'react';
import { Menu, Search, X, ChevronLeft } from 'lucide-react';
import { HistoryItem } from '../types';
import './Navigation.css';

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  isMobile: boolean;
  searchIp: string;
  setSearchIp: (ip: string) => void;
  loading: boolean;
  handleSearch: (e?: React.FormEvent) => Promise<void>;
  handleClear: () => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  filteredHistory: HistoryItem[];
  handleHistoryClick: (item: HistoryItem) => void;
  formatTime: (date: Date) => string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
}

const Navigation: React.FC<NavigationProps> = ({
  sidebarOpen,
  setSidebarOpen,
  mobileSearchOpen,
  setMobileSearchOpen,
  isMobile,
  searchIp,
  setSearchIp,
  loading,
  handleSearch,
  handleClear,
  showDropdown,
  setShowDropdown,
  filteredHistory,
  handleHistoryClick,
  formatTime,
  dropdownRef,
  searchInputRef,
  mobileInputRef
}) => {
  return (
    <>
      {/* ── HEADER ── */}
      <header className="nav-header">
        {/* Left */}
        <div className="nav-header-left">
          <button 
            className="nav-icon-btn" 
            onClick={() => setSidebarOpen(true)} 
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="nav-logo">
            GEO<span className="nav-logo-dot">.</span>IP<span className="nav-logo-dot">.</span>APP
          </div>
        </div>

        {/* Center — Desktop Search (only visible on desktop) */}
        {!isMobile && (
          <div className="nav-header-center">
            <div className="nav-desktop-search" ref={dropdownRef}>
              <form className="nav-search-form" onSubmit={handleSearch}>
                <span className="nav-search-icon-left"><Search size={16} /></span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="nav-search-input"
                  placeholder="Enter IP address (e.g. 8.8.8.8)"
                  value={searchIp}
                  onChange={e => { setSearchIp(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={loading}
                />
                <div className="nav-search-actions">
                  {searchIp && (
                    <button type="button" className="nav-clear-btn" onClick={handleClear}>
                      <X size={14} />
                    </button>
                  )}
                  <button type="submit" className="nav-search-submit" disabled={loading}>
                    {loading ? '...' : 'LOCATE'}
                  </button>
                </div>
              </form>

              {showDropdown && filteredHistory.length > 0 && (
                <div className="nav-search-dropdown">
                  <div className="nav-dropdown-label">
                    <Search size={12} /> Recent Searches
                  </div>
                  {filteredHistory.slice(0, 6).map(item => (
                    <div
                      key={item.id}
                      className="nav-dropdown-item"
                      onMouseDown={() => { 
                        handleHistoryClick(item); 
                        setShowDropdown(false); 
                      }}
                    >
                      <span className="nav-dropdown-item-icon"><Search size={13} /></span>
                      <div className="nav-dropdown-item-info">
                        <span className="nav-dropdown-item-ip">{item.ip}</span>
                        <span className="nav-dropdown-item-loc">
                          {item.data.city}, {item.data.country}
                        </span>
                      </div>
                      <span className="nav-dropdown-item-time">{formatTime(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right */}
        <div className="nav-header-right">
          {/* Mobile search trigger */}
          {isMobile && (
            <button
              className="nav-icon-btn nav-mobile-search-trigger"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
        </div>
      </header>

      {/* ── MOBILE SEARCH OVERLAY ── */}
      {mobileSearchOpen && (
        <div className="nav-mobile-search-overlay">
          <div className="nav-mobile-search-bar">
            <button className="nav-icon-btn" onClick={() => setMobileSearchOpen(false)}>
              <ChevronLeft size={20} />
            </button>
            <form
              className="nav-search-form"
              style={{ flex: 1 }}
              onSubmit={e => handleSearch(e)}
            >
              <span className="nav-search-icon-left"><Search size={16} /></span>
              <input
                ref={mobileInputRef}
                type="text"
                className="nav-search-input"
                placeholder="Enter IP address..."
                value={searchIp}
                onChange={e => setSearchIp(e.target.value)}
                disabled={loading}
              />
              {searchIp && (
                <div className="nav-search-actions">
                  <button type="button" className="nav-clear-btn" onClick={() => setSearchIp('')}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </form>
            <button
              className="nav-mobile-submit-btn"
              onClick={() => handleSearch()}
              disabled={loading}
            >
              {loading ? '...' : 'GO'}
            </button>
          </div>

          <div className="nav-mobile-history-list">
            <div className="nav-mobile-history-section-label">
              <span>Recent Searches</span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="nav-mobile-no-history">
                <Search size={32} opacity={0.3} />
                <p>No recent searches</p>
              </div>
            ) : (
              filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="nav-mobile-history-item"
                  onClick={() => {
                    handleHistoryClick(item);
                    setMobileSearchOpen(false);
                  }}
                >
                  <div className="nav-mobile-history-icon">
                    <Search size={16} />
                  </div>
                  <div className="nav-mobile-history-content">
                    <span className="nav-mobile-history-ip">{item.ip}</span>
                    <span className="nav-mobile-history-loc">
                      {item.data.city}, {item.data.region}, {item.data.country}
                    </span>
                  </div>
                  <span className="nav-mobile-history-time">{formatTime(item.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;