import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Grid3X3,
  Headphones,
  Heart,
  Layers3,
  LocateFixed,
  MapPin,
  Map as MapIcon,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import { useBillboards } from '../../context/BillboardContext';
import { useAuth } from '../../context/AuthContext';
import { useEntitlements } from '../../context/EntitlementContext';
import { AddBillboardModal } from '../modals/AddBillboardModal';
import { BillboardComparisonModal } from './BillboardComparisonModal';

interface MarketplaceHomeProps {
  onSelectBillboard: (billboard: MarketplaceBillboard) => void;
  onPurchaseBillboard: (billboard: MarketplaceBillboard) => void;
}

const METROS = [
  { code: 'ALL', label: 'All Cities', country: 'Network', primary: true },
  { code: 'LOS', label: 'Lagos', country: 'Nigeria', primary: true },
  { code: 'ABJ', label: 'Abuja', country: 'Nigeria', primary: true },
  { code: 'PHC', label: 'Port Harcourt', country: 'Nigeria', primary: true },
  { code: 'KAN', label: 'Kano', country: 'Nigeria', primary: true },
  { code: 'IBD', label: 'Ibadan', country: 'Nigeria', primary: true },
  { code: 'ENU', label: 'Enugu', country: 'Nigeria', primary: true },
  { code: 'BEN', label: 'Benin', country: 'Nigeria', primary: true },
  { code: 'ACC', label: 'Accra', country: 'Ghana', primary: true },
  { code: 'NBO', label: 'Nairobi', country: 'Kenya', primary: false },
  { code: 'JNB', label: 'Johannesburg', country: 'South Africa', primary: false },
  { code: 'KGL', label: 'Kigali', country: 'Rwanda', primary: false },
  { code: 'ADD', label: 'Addis Ababa', country: 'Ethiopia', primary: false },
];

const FORMAT_FILTERS = [
  { id: 'Digital Billboard (LED)', label: 'Digital Billboard (LED)', fallbackCount: 124 },
  { id: 'Static Billboard', label: 'Static Billboard', fallbackCount: 276 },
  { id: 'Megaboard', label: 'Megaboard', fallbackCount: 48 },
  { id: 'Bus Shelter', label: 'Bus Shelter', fallbackCount: 67 },
  { id: 'Transit Wrap', label: 'Transit Wrap', fallbackCount: 32 },
];

const AUDIENCE_SIZE_FILTERS = [
  { id: '1K_10K', label: '1K – 10K daily', min: 0, max: 10000, fallbackCount: 86 },
  { id: '10K_50K', label: '10K – 50K daily', min: 10000, max: 100000, fallbackCount: 142 },
  { id: '100K_PLUS', label: '100K+ daily', min: 100000, max: Infinity, fallbackCount: 54 },
];

const DWELL_TIME_FILTERS = [
  { id: 'UNDER_3', label: '< 3 seconds', min: 0, max: 2.9, fallbackCount: 65 },
  { id: '3_TO_5', label: '3 – 5 seconds', min: 3, max: 5, fallbackCount: 128 },
  { id: '5_TO_10', label: '5 – 10 seconds', min: 5.1, max: 10, fallbackCount: 132 },
  { id: 'OVER_10', label: '10+ seconds', min: 10.1, max: Infinity, fallbackCount: 53 },
];

const AVAILABILITY_FILTERS = [
  { id: 'Available Now', label: 'Available Now', fallbackCount: 207 },
  { id: 'Future Dates', label: 'Future Dates', fallbackCount: 198 },
];

const compact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString();
};

const getTwoWeekPriceNGN = (billboard: MarketplaceBillboard): number => {
  if (typeof billboard.priceTwoWeeksNGN === 'number' && billboard.priceTwoWeeksNGN > 0) {
    return billboard.priceTwoWeeksNGN;
  }
  return Math.round(billboard.priceMonthlyUSD * 780);
};

const normalizeFormatCategory = (format: string): string => {
  const lower = format.toLowerCase();
  if (lower.includes('bus shelter')) return 'Bus Shelter';
  if (lower.includes('transit') || lower.includes('wrap')) return 'Transit Wrap';
  if (lower.includes('mega') || lower.includes('gantry') || lower.includes('overhead')) return 'Megaboard';
  if (lower.includes('digital') || lower.includes('led') || lower.includes('dooh')) return 'Digital Billboard (LED)';
  if (lower.includes('static') || lower.includes('unipole') || lower.includes('wallscape')) return 'Static Billboard';
  return format;
};

export const MarketplaceHome: React.FC<MarketplaceHomeProps> = ({ onSelectBillboard, onPurchaseBillboard }) => {
  const { billboards } = useBillboards();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetro, setSelectedMetro] = useState('LOS');
  const [showAllCities, setShowAllCities] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('ALL');
  const [selectedAudienceSizes, setSelectedAudienceSizes] = useState<string[]>([]);
  const [selectedDwellTimes, setSelectedDwellTimes] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'traffic' | 'dwell'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMapPreviewId, setActiveMapPreviewId] = useState<string | null>(null);
  const [miniMapZoom, setMiniMapZoom] = useState(1);
  const [isAddBillboardOpen, setIsAddBillboardOpen] = useState(false);

  // Billboard Comparison State (Section 6)
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const { hasEntitlement, openUpgradeModal } = useEntitlements();
  const canCompare = hasEntitlement('can_compare_billboards');
  const canViewTraffic = hasEntitlement('can_view_traffic_data');

  const toggleCompare = (id: string) => {
    if (!canCompare) {
      openUpgradeModal('can_compare_billboards');
      return;
    }
    setComparisonIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length >= 4 ? prev : [...prev, id]
    );
  };

  const canPostBillboards = Boolean(
    currentUser &&
      ['Agency Admin', 'Account Manager', 'Campaign Manager', 'Operations Manager', 'Field Manager', 'Agency Staff', 'Media Owner'].includes(
        currentUser.role,
      ),
  );
  const uniqueCompanies = useMemo(
    () => Array.from(new Set(billboards.map((item) => item.mediaOwnerCompany))).sort(),
    [billboards],
  );

  const toggleSelection = (list: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const filteredBillboards = useMemo(() => {
    const filtered = billboards.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = [item.name, item.location, item.corridor, item.metroName, item.mediaOwnerCompany, item.format]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedMetro !== 'ALL' && item.metro !== selectedMetro) return false;
      if (selectedCompany !== 'ALL' && item.mediaOwnerCompany !== selectedCompany) return false;

      if (selectedFormats.length > 0) {
        const cat = normalizeFormatCategory(item.format);
        if (!selectedFormats.includes(cat) && !selectedFormats.includes(item.format)) return false;
      }

      const priceNGN = getTwoWeekPriceNGN(item);
      if (selectedPriceRange === 'UNDER_1_5M' && priceNGN >= 1_500_000) return false;
      if (selectedPriceRange === '1_5M_TO_3M' && (priceNGN < 1_500_000 || priceNGN > 3_000_000)) return false;
      if (selectedPriceRange === 'OVER_3M' && priceNGN <= 3_000_000) return false;

      if (selectedAudienceSizes.length > 0) {
        const traffic = item.dailyTrafficVehicles || 0;
        const matchesAudience = selectedAudienceSizes.some((rangeId) => {
          const range = AUDIENCE_SIZE_FILTERS.find((r) => r.id === rangeId);
          return range ? traffic >= range.min && traffic <= range.max : false;
        });
        if (!matchesAudience) return false;
      }

      if (selectedDwellTimes.length > 0) {
        const dwell = item.dwellTimeSeconds || 0;
        const matchesDwell = selectedDwellTimes.some((rangeId) => {
          const range = DWELL_TIME_FILTERS.find((r) => r.id === rangeId);
          return range ? dwell >= range.min && dwell <= range.max : false;
        });
        if (!matchesDwell) return false;
      }

      if (selectedAvailabilities.length > 0) {
        const isAvailableNow = item.availabilityStatus === 'Available Now';
        const matchesAvail = selectedAvailabilities.some((avail) =>
          avail === 'Available Now' ? isAvailableNow : !isAvailableNow,
        );
        if (!matchesAvail) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return getTwoWeekPriceNGN(a) - getTwoWeekPriceNGN(b);
      if (sortBy === 'price-desc') return getTwoWeekPriceNGN(b) - getTwoWeekPriceNGN(a);
      if (sortBy === 'traffic') return (b.dailyTrafficVehicles || 0) - (a.dailyTrafficVehicles || 0);
      if (sortBy === 'dwell') return (b.dwellTimeSeconds || 0) - (a.dwellTimeSeconds || 0);
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [
    billboards,
    searchQuery,
    selectedMetro,
    selectedCompany,
    selectedFormats,
    selectedPriceRange,
    selectedAudienceSizes,
    selectedDwellTimes,
    selectedAvailabilities,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedMetro !== 'ALL' ? 1 : 0) +
    (selectedCompany !== 'ALL' ? 1 : 0) +
    selectedFormats.length +
    (selectedPriceRange !== 'ALL' ? 1 : 0) +
    selectedAudienceSizes.length +
    selectedDwellTimes.length +
    selectedAvailabilities.length;

  const hasInventory = billboards.length > 0;
  const featured = billboards.slice(0, 3);
  const heroSites = billboards.slice(0, 3);

  const visibleMetros = showAllCities ? METROS : METROS.filter((m) => m.primary);
  const activeMapBillboard = useMemo(() => {
    if (activeMapPreviewId) {
      const found = filteredBillboards.find((b) => b.id === activeMapPreviewId);
      if (found) return found;
    }
    return filteredBillboards[0] || billboards[0] || null;
  }, [activeMapPreviewId, filteredBillboards, billboards]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMetro('ALL');
    setSelectedCompany('ALL');
    setSelectedFormats([]);
    setSelectedPriceRange('ALL');
    setSelectedAudienceSizes([]);
    setSelectedDwellTimes([]);
    setSelectedAvailabilities([]);
  };

  const scrollToInventory = () =>
    document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const selectMetro = (code: string) => {
    setSelectedMetro(code);
    scrollToInventory();
  };

  return (
    <div className="adgrid-marketplace">
      <section className="adgrid-hero-v5">
        <div className="adgrid-container adgrid-hero-layout">
          <div className="adgrid-hero-copy">
            <h1>Find a billboard.<br /><em>Book it.</em> <span>Done.</span></h1>
            <p className="adgrid-hero-lede">Explore OOH locations across African cities. Compare the place, format, audience and commercial terms before you book.</p>

            <div className="adgrid-search-card">
              <Search size={18} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') scrollToInventory(); }}
                placeholder="Search by city, corridor, location or billboard"
                aria-label="Search billboard inventory"
              />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search"><X size={16} /></button>}
              <button type="button" onClick={scrollToInventory} className="adgrid-orange-button">Search</button>
            </div>

            <div className="adgrid-hero-links">
              <span>Start with</span>
              {METROS.slice(1, 6).map((metro) => <button key={metro.code} type="button" onClick={() => selectMetro(metro.code)}>{metro.label}</button>)}
            </div>
          </div>

          <HeroMarketplacePreview sites={heroSites} onSelect={onSelectBillboard} />
        </div>
      </section>

      <section id="inventory" className="adgrid-container adgrid-section adgrid-inventory-section">
        {featured.length > 0 ? (
          <div className="adgrid-featured-grid">
            {featured.map((billboard) => <FeaturedCard key={billboard.id} billboard={billboard} onSelect={onSelectBillboard} onPurchase={onPurchaseBillboard} />)}
          </div>
        ) : (
          <InventoryEmptyState hasInventory={hasInventory} canPost={canPostBillboards} onAdd={() => setIsAddBillboardOpen(true)} onReset={resetFilters} />
        )}

        {/* Full Marketplace Explorer (Incorporated from Screenshots) */}
        <div className="adgrid-all-inventory">
          {/* City Bar & View Toggle */}
          <div className="adgrid-city-bar">
            <div className="adgrid-city-pills" role="tablist" aria-label="Filter by city">
              {visibleMetros.map((metro) => {
                const isActive = selectedMetro === metro.code;
                return (
                  <button
                    key={metro.code}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedMetro(metro.code)}
                    className={isActive ? 'adgrid-city-pill active' : 'adgrid-city-pill'}
                  >
                    <MapPin size={13} />
                    <span>{metro.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowAllCities((prev) => !prev)}
                className="adgrid-view-all-cities"
              >
                <span>{showAllCities ? 'Fewer Cities' : 'View All Cities'}</span>
                <ChevronRight size={13} className={showAllCities ? 'rotate-90 transition-transform' : 'transition-transform'} />
              </button>
            </div>

            <div className="adgrid-city-bar-actions">
              {canPostBillboards && (
                <button type="button" onClick={() => setIsAddBillboardOpen(true)} className="adgrid-outline-button">
                  <Plus size={14} /> List a billboard
                </button>
              )}
              <div className="adgrid-view-toggle-group">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'adgrid-view-toggle-btn active' : 'adgrid-view-toggle-btn'}
                >
                  <Grid3X3 size={14} />
                  <span>Grid View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'adgrid-view-toggle-btn active' : 'adgrid-view-toggle-btn'}
                >
                  <MapIcon size={14} />
                  <span>Map View</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3-Column Marketplace Workspace */}
          <div className="adgrid-explorer-layout">
            {/* Left Column: Filters Sidebar */}
            <aside className="adgrid-filters-sidebar" aria-label="Marketplace filters">
              <div className="adgrid-filters-head">
                <h3>Filters</h3>
                <button type="button" onClick={resetFilters} className="adgrid-clear-link">
                  Clear All
                </button>
              </div>

              {/* Format */}
              <div className="adgrid-filter-group">
                <h4>Format</h4>
                <div className="adgrid-checkbox-list">
                  {FORMAT_FILTERS.map((fmt) => {
                    const count = billboards.filter((b) => normalizeFormatCategory(b.format) === fmt.id).length || fmt.fallbackCount;
                    const checked = selectedFormats.includes(fmt.id);
                    return (
                      <label key={fmt.id} className="adgrid-checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(selectedFormats, fmt.id, setSelectedFormats)}
                        />
                        <span className="adgrid-checkbox-label">{fmt.label}</span>
                        <small className="adgrid-checkbox-count">({count})</small>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range (₦) */}
              <div className="adgrid-filter-group">
                <h4>Price Range (₦)</h4>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="adgrid-sidebar-select"
                  aria-label="Filter by price range in Naira"
                >
                  <option value="ALL">Any Price</option>
                  <option value="UNDER_1_5M">Under ₦1,500,000 / 2 wks</option>
                  <option value="1_5M_TO_3M">₦1,500,000 – ₦3,000,000 / 2 wks</option>
                  <option value="OVER_3M">₦3,000,000+ / 2 wks</option>
                </select>
              </div>

              {/* Audience Size */}
              <div className="adgrid-filter-group">
                <h4>Audience Size</h4>
                <div className="adgrid-checkbox-list">
                  {AUDIENCE_SIZE_FILTERS.map((aud) => {
                    const count =
                      billboards.filter((b) => (b.dailyTrafficVehicles || 0) >= aud.min && (b.dailyTrafficVehicles || 0) <= aud.max)
                        .length || aud.fallbackCount;
                    const checked = selectedAudienceSizes.includes(aud.id);
                    return (
                      <label key={aud.id} className="adgrid-checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(selectedAudienceSizes, aud.id, setSelectedAudienceSizes)}
                        />
                        <span className="adgrid-checkbox-label">{aud.label}</span>
                        <small className="adgrid-checkbox-count">({count})</small>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dwell Time */}
              <div className="adgrid-filter-group">
                <h4>Dwell Time</h4>
                <div className="adgrid-checkbox-list">
                  {DWELL_TIME_FILTERS.map((dwell) => {
                    const count =
                      billboards.filter((b) => (b.dwellTimeSeconds || 0) >= dwell.min && (b.dwellTimeSeconds || 0) <= dwell.max)
                        .length || dwell.fallbackCount;
                    const checked = selectedDwellTimes.includes(dwell.id);
                    return (
                      <label key={dwell.id} className="adgrid-checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(selectedDwellTimes, dwell.id, setSelectedDwellTimes)}
                        />
                        <span className="adgrid-checkbox-label">{dwell.label}</span>
                        <small className="adgrid-checkbox-count">({count})</small>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Media Owner */}
              <div className="adgrid-filter-group">
                <h4>Media Owner</h4>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="adgrid-sidebar-select"
                  aria-label="Filter by media owner"
                >
                  <option value="ALL">All Media Owners</option>
                  {uniqueCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div className="adgrid-filter-group">
                <h4>Availability</h4>
                <div className="adgrid-checkbox-list">
                  {AVAILABILITY_FILTERS.map((avail) => {
                    const count =
                      billboards.filter((b) =>
                        avail.id === 'Available Now'
                          ? b.availabilityStatus === 'Available Now'
                          : b.availabilityStatus !== 'Available Now',
                      ).length || avail.fallbackCount;
                    const checked = selectedAvailabilities.includes(avail.id);
                    return (
                      <label key={avail.id} className="adgrid-checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(selectedAvailabilities, avail.id, setSelectedAvailabilities)}
                        />
                        <span className="adgrid-checkbox-label">{avail.label}</span>
                        <small className="adgrid-checkbox-count">({count})</small>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Center Column: Results Header & Billboard Cards / Map */}
            <div className="adgrid-explorer-main">
              <div className="adgrid-results-header">
                <div className="adgrid-results-title-wrap">
                  <h3>
                    {filteredBillboards.length}{' '}
                    {filteredBillboards.length === 1 ? 'Billboard Location Found' : 'Billboard Locations Found'}
                  </h3>
                  {selectedMetro !== 'ALL' && (
                    <span className="adgrid-results-context">
                      in {METROS.find((m) => m.code === selectedMetro)?.label || selectedMetro}
                    </span>
                  )}
                </div>

                <div className="adgrid-results-controls">
                  <label className="adgrid-sort-control">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort billboard locations"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="traffic">Highest Traffic</option>
                      <option value="dwell">Longest Dwell Time</option>
                    </select>
                  </label>
                </div>
              </div>

              {viewMode === 'map' ? (
                <div className="adgrid-inventory-map">
                  <InteractiveMap
                    pins={filteredBillboards.map((billboard) => ({
                      id: billboard.id,
                      name: billboard.name,
                      x: 50,
                      y: 50,
                      lat: billboard.lat,
                      lng: billboard.lng,
                      status: billboard.status.toLowerCase().includes('alert') ? ('alert' as const) : ('live' as const),
                      code: billboard.id,
                      type: billboard.format,
                      client: billboard.client,
                    }))}
                    onSelectPin={(id) => {
                      const billboard = filteredBillboards.find((item) => item.id === id);
                      if (billboard) onSelectBillboard(billboard);
                    }}
                    metroName={selectedMetro !== 'ALL' ? selectedMetro : 'Africa'}
                    corridorName="ADGRID marketplace inventory"
                    heightClass="h-[580px]"
                  />
                </div>
              ) : filteredBillboards.length > 0 ? (
                <div className="adgrid-marketplace-cards-grid">
                  {filteredBillboards.map((billboard) => (
                    <MarketplaceListingCard
                      key={billboard.id}
                      billboard={billboard}
                      isSaved={savedIds.includes(billboard.id)}
                      isCompared={comparisonIds.includes(billboard.id)}
                      onToggleCompare={() => toggleCompare(billboard.id)}
                      onToggleSave={() => toggleSaved(billboard.id)}
                      onSelect={onSelectBillboard}
                      onPurchase={onPurchaseBillboard}
                      onHoverPin={() => setActiveMapPreviewId(billboard.id)}
                    />
                  ))}
                </div>
              ) : (
                <InventoryEmptyState
                  hasInventory={hasInventory}
                  canPost={canPostBillboards}
                  onAdd={() => setIsAddBillboardOpen(true)}
                  onReset={resetFilters}
                />
              )}

              {(activeFilterCount > 0 || searchQuery) && (
                <button type="button" onClick={resetFilters} className="adgrid-clear-filters">
                  Clear all filters
                </button>
              )}
            </div>

            {/* Right Column: Explore on Map, Why Advertise, Bigger Reach CTA */}
            <aside className="adgrid-explorer-aside">
              {/* Widget 1: Explore on Map */}
              <div className="adgrid-aside-card">
                <div className="adgrid-aside-card-head">
                  <h4>Explore on Map</h4>
                  <button type="button" onClick={() => setViewMode('map')} className="adgrid-aside-link">
                    <span>View Full Map</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="adgrid-mini-map-box">
                  <div
                    className="adgrid-mini-map-canvas"
                    style={{ transform: `scale(${miniMapZoom})`, transformOrigin: 'center center' }}
                  >
                    <span className="mini-map-water" />
                    <span className="mini-map-road road-a" />
                    <span className="mini-map-road road-b" />
                    <span className="mini-map-road road-c" />
                    <span className="mini-map-label label-main">
                      {METROS.find((m) => m.code === selectedMetro)?.label === 'All Cities'
                        ? 'Lagos'
                        : METROS.find((m) => m.code === selectedMetro)?.label || 'Lagos'}
                    </span>
                    <span className="mini-map-label label-sub-left">Victoria Island</span>
                    <span className="mini-map-label label-sub-right">Lekki</span>

                    {(filteredBillboards.length > 0 ? filteredBillboards.slice(0, 6) : billboards.slice(0, 6)).map(
                      (site, idx) => {
                        const positions = [
                          { left: '28%', top: '24%' },
                          { left: '54%', top: '31%' },
                          { left: '22%', top: '46%' },
                          { left: '47%', top: '57%' },
                          { left: '39%', top: '72%' },
                          { left: '68%', top: '66%' },
                        ];
                        const pos = positions[idx % positions.length];
                        const isSelected = activeMapBillboard?.id === site.id;
                        return (
                          <button
                            key={site.id}
                            type="button"
                            style={pos}
                            onClick={() => setActiveMapPreviewId(site.id)}
                            className={isSelected ? 'mini-map-pin active' : 'mini-map-pin'}
                            aria-label={`Preview ${site.name} on map`}
                          />
                        );
                      },
                    )}
                  </div>

                  {activeMapBillboard && (
                    <button
                      type="button"
                      onClick={() => onSelectBillboard(activeMapBillboard)}
                      className="adgrid-mini-map-popup"
                    >
                      <img src={activeMapBillboard.previewUrl} alt="" referrerPolicy="no-referrer" />
                      <div>
                        <strong>{activeMapBillboard.name}</strong>
                        <span>₦{getTwoWeekPriceNGN(activeMapBillboard).toLocaleString()} / 2 wks</span>
                      </div>
                    </button>
                  )}

                  <div className="adgrid-mini-map-controls">
                    <button
                      type="button"
                      onClick={() => setMiniMapZoom((z) => Math.min(z + 0.15, 1.45))}
                      aria-label="Zoom in mini map"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniMapZoom((z) => Math.max(z - 0.15, 0.85))}
                      aria-label="Zoom out mini map"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniMapZoom(1)}
                      aria-label="Reset map view"
                    >
                      <LocateFixed size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Widget 2: Why Advertise with ADGRID? */}
              <div className="adgrid-aside-card">
                <h4 className="adgrid-aside-title">Why Advertise with ADGRID?</h4>
                <div className="adgrid-why-grid">
                  <div className="adgrid-why-item">
                    <span className="adgrid-why-icon">
                      <ShieldCheck size={15} />
                    </span>
                    <div>
                      <strong>1000+</strong>
                      <span>Verified Billboards</span>
                      <small>Across Nigeria &amp; Africa</small>
                    </div>
                  </div>

                  <div className="adgrid-why-item">
                    <span className="adgrid-why-icon">
                      <Building2 size={15} />
                    </span>
                    <div>
                      <strong>Trusted</strong>
                      <span>Media Owners</span>
                      <small>Vetted &amp; licensed operators</small>
                    </div>
                  </div>

                  <div className="adgrid-why-item">
                    <span className="adgrid-why-icon">
                      <Clock size={15} />
                    </span>
                    <div>
                      <strong>Real-time</strong>
                      <span>Availability</span>
                      <small>Book instantly</small>
                    </div>
                  </div>

                  <div className="adgrid-why-item">
                    <span className="adgrid-why-icon">
                      <Headphones size={15} />
                    </span>
                    <div>
                      <strong>Dedicated</strong>
                      <span>Support Team</span>
                      <small>From booking to campaign</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3: Bigger Reach. Greater Impact. */}
              <div className="adgrid-aside-cta-card">
                <div className="adgrid-aside-cta-top">
                  <svg
                    viewBox="0 0 64 72"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="adgrid-africa-mark"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 6C15.5 6 8 12.2 6.5 20.5C5.2 27.6 10.4 33.8 16.5 35.2C20.5 36.1 23.2 39.4 24.4 43.8C26.2 50.4 28.4 61.5 33.8 65.2C37.6 67.8 42.8 64.4 45.2 59.5C47.8 54.2 49.4 47.2 53.2 42.2C56.8 37.5 60.2 33.2 57.5 27.5C55.1 22.4 49.2 21.2 45.8 16.8C42.2 12.1 34.4 6 24 6Z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <h4>
                      Bigger Reach.
                      <br />
                      Greater Impact.
                    </h4>
                    <p>Africa’s most trusted OOH marketplace.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (filteredBillboards[0]) {
                      onPurchaseBillboard(filteredBillboards[0]);
                    } else {
                      scrollToInventory();
                    }
                  }}
                  className="adgrid-orange-button adgrid-aside-cta-btn"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="adgrid-container adgrid-section adgrid-market-section">
        <div className="adgrid-market-band">
          <div>
            <p className="adgrid-overline dark"><span /> Coverage</p>
            <h2>Across Africa, one location at a time.</h2>
            <p>Start in one city or build a multi-market campaign from the same inventory layer.</p>
          </div>
          <div className="adgrid-market-list">
            {METROS.slice(1, 11).map((metro) => (
              <button type="button" key={metro.code} onClick={() => selectMetro(metro.code)}>
                <span>{metro.label}</span><small>{metro.country}</small><ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="coverage" className="adgrid-container adgrid-section">
        <div className="adgrid-coverage-head">
          <SectionHeading eyebrow="Market coverage" title="See where the network is growing." text="Select a market to inspect the locations currently available there." />
          <div className="adgrid-coverage-key"><span className="live-dot" /> Listed inventory</div>
        </div>
        <div className="adgrid-map-frame">
          <div className="adgrid-map-title"><div><strong>ADGRID marketplace coverage</strong><span>{filteredBillboards.length} locations in the current view</span></div><button type="button" onClick={scrollToInventory}>View locations <ArrowRight size={14} /></button></div>
          <div className="adgrid-map-wrap">
            <InteractiveMap
              pins={filteredBillboards.map((billboard) => ({
                id: billboard.id, name: billboard.name, x: 50, y: 50, lat: billboard.lat, lng: billboard.lng,
                status: billboard.status.toLowerCase().includes('alert') ? 'alert' as const : 'live' as const,
                code: billboard.id, type: billboard.format, client: billboard.client,
              }))}
              onSelectPin={(id) => { const billboard = filteredBillboards.find((item) => item.id === id); if (billboard) onSelectBillboard(billboard); }}
              metroName={selectedMetro !== 'ALL' ? selectedMetro : 'Africa'}
              corridorName="ADGRID marketplace inventory"
              heightClass="h-[520px]"
            />
          </div>
        </div>
      </section>

      <section id="media-owner" className="adgrid-owner-section">
        <div className="adgrid-container adgrid-owner-grid">
          <div>
            <p className="adgrid-overline dark"><span /> For media owners</p>
            <h2>Own a billboard?<br /><em>Start earning.</em></h2>
            <p>Publish your spaces, keep asset information organized and make your inventory easier for agencies and advertisers to discover.</p>
            <ul>
              <li><Check size={14} /> Publish location, format and commercial details</li>
              <li><Check size={14} /> Keep availability and asset information current</li>
              <li><Check size={14} /> Connect discovery with the operational workspace</li>
            </ul>
            <button type="button" onClick={() => { if (canPostBillboards) setIsAddBillboardOpen(true); else scrollToInventory(); }} className="adgrid-orange-button">{canPostBillboards ? 'List your space' : 'Explore inventory'} <ArrowRight size={15} /></button>
          </div>
          <OwnerDashboardPreview billboards={billboards} />
        </div>
      </section>

      <section className="adgrid-container adgrid-final-cta">
        <div>
          <p className="adgrid-overline"><span /> Ready when you are</p>
          <h2>Put the next campaign in the right places.</h2>
          <p>Explore the marketplace, compare real location details and take the next step from one workspace.</p>
          <button type="button" onClick={scrollToInventory} className="adgrid-orange-button">Browse billboards <ArrowRight size={15} /></button>
        </div>
      </section>

      {/* Floating Comparison Drawer Action (Section 6) */}
      {comparisonIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#181716] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#ef5a24]" />
            <span className="text-xs font-black">
              {comparisonIds.length} Billboard{comparisonIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!canCompare) {
                  openUpgradeModal('can_compare_billboards');
                } else {
                  setIsComparisonModalOpen(true);
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setComparisonIds([])}
              className="text-zinc-400 hover:text-white text-xs font-semibold px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Billboard Comparison Matrix Modal */}
      <BillboardComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        billboards={billboards.filter((b) => comparisonIds.includes(b.id))}
        onRemoveBillboard={(id) => setComparisonIds((prev) => prev.filter((i) => i !== id))}
        onSelectBillboard={(b) => onSelectBillboard(b)}
      />

      {canPostBillboards && (
        <AddBillboardModal isOpen={isAddBillboardOpen} onClose={() => setIsAddBillboardOpen(false)} defaultCompany={currentUser?.organization} />
      )}
    </div>
  );
};

const HeroMarketplacePreview: React.FC<{ sites: MarketplaceBillboard[]; onSelect: (billboard: MarketplaceBillboard) => void }> = ({ sites, onSelect }) => {
  const lead = sites[0];
  return (
    <div className="adgrid-hero-visual">
      <div className="adgrid-browser-window">
        <div className="adgrid-browser-bar"><span /><span /><span /><small>adgrid.com/marketplace</small></div>
        <div className="adgrid-preview-map">
          <div className="preview-route route-one" /><div className="preview-route route-two" />
          <span className="preview-pin pin-one"><MapPin size={17} /></span><span className="preview-pin pin-two"><MapPin size={17} /></span><span className="preview-pin pin-three"><MapPin size={17} /></span>
          {lead ? <button type="button" onClick={() => onSelect(lead)} className="preview-listing">
            <img src={lead.previewUrl} alt="" referrerPolicy="no-referrer" /><div><strong>{lead.name}</strong><span>{lead.location}</span><b>₦{getTwoWeekPriceNGN(lead).toLocaleString()} / 2 wks</b></div>
          </button> : <div className="preview-empty"><MapPin size={20} /><strong>Your inventory preview</strong><span>Published locations appear here.</span></div>}
          <div className="preview-side"><span>Locations</span>{sites.slice(0, 3).map((site) => <div key={site.id}><i /> <span>{site.metroName.split(',')[0]}</span><b>{site.sizeMeters || '12m'}</b></div>)}</div>
        </div>
      </div>
      <div className="adgrid-hero-caption"><span><strong>{sites.length || 0}</strong> featured locations ready to explore</span><span><i /> Live marketplace</span></div>
    </div>
  );
};

const OwnerDashboardPreview: React.FC<{ billboards: MarketplaceBillboard[] }> = ({ billboards }) => {
  const revenue = billboards.slice(0, 3).reduce((sum, item) => sum + item.priceMonthlyUSD, 0);
  return (
    <div className="adgrid-owner-preview">
      <div className="owner-window-bar"><span /><span /><span /><small>owner.adgrid.com</small></div>
      <div className="owner-window-body">
        <div className="owner-window-top"><div><small>Inventory overview</small><strong>{billboards.length} listed locations</strong></div><span>Live</span></div>
        <div className="owner-metrics"><MetricMini label="Monthly value" value={`${revenue.toLocaleString()}`} /><MetricMini label="Available" value={String(billboards.filter((b) => b.availabilityStatus === 'Available Now').length)} /><MetricMini label="Markets" value={String(new Set(billboards.map((b) => b.metro)).size)} /></div>
        <div className="owner-bars">{[32, 48, 39, 68, 57, 81, 72, 91].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
        <div className="owner-rows">{billboards.slice(0, 2).map((billboard) => <div key={billboard.id}><span>{billboard.name}</span><b>{billboard.availabilityStatus === 'Available Now' ? 'Available' : 'Scheduled'}</b></div>)}</div>
      </div>
    </div>
  );
};

const SectionHeading: React.FC<{ eyebrow: string; title: string; text?: string; centered?: boolean }> = ({ eyebrow, title, text, centered }) => (
  <div className={centered ? 'adgrid-section-heading centered' : 'adgrid-section-heading'}>
    <p className="adgrid-overline dark"><span /> {eyebrow}</p>
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>
);

const FeaturedCard: React.FC<{ billboard: MarketplaceBillboard; onSelect: (billboard: MarketplaceBillboard) => void; onPurchase: (billboard: MarketplaceBillboard) => void }> = ({ billboard, onSelect, onPurchase }) => (
  <article className="adgrid-featured-card">
    <button type="button" onClick={() => onSelect(billboard)} className="featured-image">
      <img src={billboard.previewUrl} alt={billboard.name} referrerPolicy="no-referrer" />
      <span>{billboard.format}</span>
    </button>
    <div className="featured-content">
      <p className="featured-location"><MapPin size={12} /> {billboard.location}</p>
      <button type="button" onClick={() => onSelect(billboard)} className="featured-title">{billboard.name}</button>
      <div className="featured-meta"><span>{billboard.dimensions}</span><span>{billboard.availabilityStatus}</span></div>
      <div className="featured-bottom"><div><small>Rate</small><strong>₦{getTwoWeekPriceNGN(billboard).toLocaleString()}<em> / 2 wks</em></strong></div><button type="button" onClick={() => onPurchase(billboard)}>Reserve site <ArrowRight size={13} /></button></div>
    </div>
  </article>
);

const MarketplaceListingCard: React.FC<{
  billboard: MarketplaceBillboard;
  isSaved: boolean;
  isCompared?: boolean;
  onToggleCompare?: () => void;
  onToggleSave: () => void;
  onSelect: (billboard: MarketplaceBillboard) => void;
  onPurchase: (billboard: MarketplaceBillboard) => void;
  onHoverPin: () => void;
}> = ({
  billboard,
  isSaved,
  isCompared = false,
  onToggleCompare,
  onToggleSave,
  onSelect,
  onPurchase,
  onHoverPin,
}) => {
  const sizeLabel = billboard.sizeMeters || billboard.dimensions.split(' ')[0] || '12m';
  const priceNGN = getTwoWeekPriceNGN(billboard);

  return (
    <article className="adgrid-listing-card relative" onMouseEnter={onHoverPin}>
      <div className="adgrid-listing-image-wrap relative">
        <button type="button" onClick={() => onSelect(billboard)} className="adgrid-listing-image-btn">
          <img src={billboard.previewUrl} alt={billboard.name} referrerPolicy="no-referrer" />
        </button>

        {/* Compare Button */}
        {onToggleCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            className={`absolute left-2.5 top-2.5 z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer backdrop-blur-md shadow-xs ${
              isCompared
                ? 'bg-[#ef5a24] text-white border border-[#ef5a24]'
                : 'bg-black/60 text-white/90 hover:bg-black/80 border border-white/20'
            }`}
            title="Select billboard for side-by-side comparison"
          >
            <SlidersHorizontal size={11} />
            <span>{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleSave}
          className={isSaved ? 'adgrid-heart-btn saved' : 'adgrid-heart-btn'}
          aria-label={isSaved ? `Remove ${billboard.name} from saved` : `Save ${billboard.name}`}
        >
          <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="adgrid-listing-body">
        <p className="adgrid-listing-location">
          <MapPin size={12} />
          <span>{billboard.location}</span>
        </p>

        <button type="button" onClick={() => onSelect(billboard)} className="adgrid-listing-title" title={billboard.name}>
          {billboard.name}
        </button>

        <div className="adgrid-listing-specs">
          <div>
            <small>Size</small>
            <strong>{sizeLabel}</strong>
          </div>
          <div>
            <small>Traffic</small>
            <strong>{compact(billboard.dailyTrafficVehicles)}/day</strong>
          </div>
          <div>
            <small>Dwell</small>
            <strong>{billboard.dwellTimeSeconds}s</strong>
          </div>
        </div>

        <div className="adgrid-listing-price">
          <strong>₦{priceNGN.toLocaleString()}</strong>
          <span>/ 2 wks</span>
        </div>

        <div className="adgrid-listing-actions">
          <button type="button" onClick={() => onSelect(billboard)} className="adgrid-btn-inspect">
            Inspect Site
          </button>
          <button type="button" onClick={() => onPurchase(billboard)} className="adgrid-btn-reserve">
            Reserve Site
          </button>
        </div>
      </div>
    </article>
  );
};

const MetricMini: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><small>{label}</small><strong>{value}</strong></div>;

const InventoryEmptyState: React.FC<{ hasInventory: boolean; canPost: boolean; onAdd: () => void; onReset: () => void }> = ({ hasInventory, canPost, onAdd, onReset }) => (
  <div className="adgrid-empty-state">
    <div className="adgrid-empty-icon"><Layers3 size={22} /></div>
    <h3>{hasInventory ? 'No locations match these filters.' : 'Your marketplace is ready for inventory.'}</h3>
    <p>{hasInventory ? 'Try another city or clear the current filters.' : 'Published locations will appear here for agencies and advertisers to discover.'}</p>
    <div>{hasInventory && <button type="button" onClick={onReset} className="adgrid-dark-button">Clear filters</button>}{!hasInventory && canPost && <button type="button" onClick={onAdd} className="adgrid-orange-button">Add first location</button>}</div>
  </div>
);

export default MarketplaceHome;