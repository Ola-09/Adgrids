import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketplaceBillboard, MetroCode } from '../types';

const imgLekkiExpressway = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80';
const imgViOffice = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80';
const imgIkejaStatic = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80';
const imgYabaBusShelter = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80';
const imgViIconic = 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80';
const imgLekkiTollGantry = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80';

interface AddBillboardInput {
  name: string;
  metro: MetroCode;
  metroName?: string;
  location: string;
  corridor: string;
  format: string;
  status?: string;
  dimensions: string;
  resolution?: string;
  priceMonthlyUSD: number;
  priceDailyUSD?: number;
  dailyTrafficVehicles?: number;
  dailyReach?: string;
  dwellTimeSeconds?: number;
  availabilityStatus?: string;
  audienceType?: string;
  campaignObjective?: string;
  lightingType?: string;
  description?: string;
  previewUrl?: string;
  nightUrl?: string;
  mediaOwnerCompany?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  licenseNumber?: string;
  specsList?: string[];
  lat?: number;
  lng?: number;
}

interface BillboardContextType {
  billboards: MarketplaceBillboard[];
  addBillboard: (input: AddBillboardInput) => MarketplaceBillboard;
  updateBillboard: (id: string, updates: Partial<MarketplaceBillboard>) => void;
  deleteBillboard: (id: string) => void;
  exportBillboardsCSV: (filterCompany?: string, filterMetro?: string) => void;
  getCompanyBillboards: (companyName?: string) => MarketplaceBillboard[];
  importBillboardsBatch: (batch: {
    toAdd: MarketplaceBillboard[];
    toUpdate: { id: string; data: Partial<MarketplaceBillboard> }[];
  }) => { importedCount: number; updatedCount: number };
}

const BillboardContext = createContext<BillboardContextType | undefined>(undefined);

const METRO_DEFAULTS: Record<MetroCode, { name: string; lat: number; lng: number }> = {
  LOS: { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792 },
  ABJ: { name: 'Abuja (FCT), Nigeria', lat: 9.0765, lng: 7.3986 },
  PHC: { name: 'Port Harcourt, Nigeria', lat: 4.8156, lng: 7.0498 },
  IBD: { name: 'Ibadan, Nigeria', lat: 7.3775, lng: 3.9470 },
  KAN: { name: 'Kano, Nigeria', lat: 12.0022, lng: 8.5920 },
  ENU: { name: 'Enugu, Nigeria', lat: 6.4584, lng: 7.5464 },
  BEN: { name: 'Benin City, Nigeria', lat: 6.3350, lng: 5.6037 },
  NBO: { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
  JNB: { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473 },
  ACC: { name: 'Accra, Ghana', lat: 5.6037, lng: -0.1870 },
  KGL: { name: 'Kigali, Rwanda', lat: -1.9706, lng: 30.1044 },
  ADD: { name: 'Addis Ababa, Ethiopia', lat: 9.0300, lng: 38.7400 },
};

const STORAGE_KEY = 'adgrid_billboard_inventory_v3';
const FALLBACK_BILLBOARD_IMAGE = imgLekkiExpressway;

const DEFAULT_BILLBOARDS: MarketplaceBillboard[] = [
  {
    id: 'LOS-DOOH-101',
    name: 'Lekki Expressway Digital Billboard',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Lekki Expressway, Lagos',
    corridor: 'Lekki–Epe Expressway Corridor',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4101',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 3200,
    priceDailyUSD: 110,
    priceTwoWeeksNGN: 2500000,
    sizeMeters: '12m',
    dimensions: '12m x 4m (48 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 250000,
    dwellTimeSeconds: 8,
    mediaOwnerCompany: 'Optimum Exposures Ltd',
    companyContact: {
      companyName: 'Optimum Exposures Ltd',
      tradingName: 'Optimum Exposures Nigeria',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-101',
      headquartersAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
      contactPerson: 'Tunde Bakare',
      contactRole: 'Head of Commercial Inventory',
      phoneDirect: '+234 1 295 8820',
      phoneOperations: '+234 803 555 0192',
      emailDirect: 'inventory@optimumexposures.ng',
      emailBookings: 'bookings@optimumexposures.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT (24/7 NOC Monitoring)',
      emergencySLA: '2-Hour Technical Intervention SLA',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 48,
    },
    description: 'High-impact full-motion LED digital billboard positioned along the primary Lekki–Epe Expressway commuter corridor with unobstructed line of sight.',
    lightingType: 'Active LED Display',
    specsList: ['Daylight Optical Sensor', '4K Pitch P6 Outdoor Matrix', 'Real-Time Proof-of-Play Telemetry'],
    lat: 6.4474,
    lng: 3.4723,
    previewUrl: imgLekkiExpressway,
    dailyReach: '400,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.6,
    lux: 85000,
  },
  {
    id: 'LOS-DOOH-102',
    name: 'VI Office Digital Billboard',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Victoria Island, Lagos',
    corridor: 'Adeola Odeku & Akin Adesola Financial District',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4102',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 2600,
    priceDailyUSD: 90,
    priceTwoWeeksNGN: 2000000,
    sizeMeters: '10m',
    dimensions: '10m x 4m (40 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'Tech & Fintech Pros',
    campaignObjective: 'Product Launch',
    dailyTrafficVehicles: 180000,
    dwellTimeSeconds: 6,
    mediaOwnerCompany: 'New Crystal Communications',
    companyContact: {
      companyName: 'New Crystal Communications',
      tradingName: 'New Crystal OOH',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-102',
      headquartersAddress: '22 Adeola Odeku St, Victoria Island, Lagos',
      contactPerson: 'Chidinma Nwosu',
      contactRole: 'Director of Corporate Sales',
      phoneDirect: '+234 1 453 2190',
      phoneOperations: '+234 809 321 7740',
      emailDirect: 'sales@newcrystal.ng',
      emailBookings: 'bookings@newcrystal.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT',
      emergencySLA: '2-Hour Technical Intervention SLA',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 36,
    },
    description: 'Executive digital LED portrait and landscape display in the heart of Victoria Island corporate banking and fintech headquarters.',
    lightingType: 'Active LED Display',
    specsList: ['Anti-Glare High Contrast', 'Dual Power Redundancy', 'Automated PoP Logging'],
    lat: 6.4281,
    lng: 3.4219,
    previewUrl: imgViOffice,
    dailyReach: '290,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.1,
    lux: 82000,
  },
  {
    id: 'LOS-UNI-103',
    name: 'Ikeja Town Static Billboard',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Ikeja, Lagos',
    corridor: 'Obafemi Awolowo Way & Allen Avenue Roundabout',
    format: 'Static Billboard',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4103',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1600,
    priceDailyUSD: 55,
    priceTwoWeeksNGN: 1200000,
    sizeMeters: '8m',
    dimensions: '8m x 3m (24 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'FMCG Shoppers',
    campaignObjective: 'Tactical Sales',
    dailyTrafficVehicles: 120000,
    dwellTimeSeconds: 6,
    mediaOwnerCompany: 'ProMedia Outdoors',
    companyContact: {
      companyName: 'ProMedia Outdoors',
      tradingName: 'ProMedia Outdoor Advertising',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-103',
      headquartersAddress: '8 Allen Avenue, Ikeja, Lagos',
      contactPerson: 'Seyi Oladipo',
      contactRole: 'Mainland Inventory Manager',
      phoneDirect: '+234 1 882 3401',
      phoneOperations: '+234 802 998 4412',
      emailDirect: 'ikeja@promedia.ng',
      emailBookings: 'bookings@promedia.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT',
      emergencySLA: '4-Hour Field Crew Dispatch',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 52,
    },
    description: 'High-visibility illuminated static unipole billboard dominating the Ikeja commercial retail and aviation approach corridor.',
    lightingType: 'Solar High-Lumen Backlit',
    specsList: ['Solar Floodlight Array', 'Heavy-Gauge Weatherproof Flex', 'Bi-Weekly Drone Inspection'],
    lat: 6.6018,
    lng: 3.3515,
    previewUrl: imgIkejaStatic,
    dailyReach: '195,000 Impressions',
    resolution: 'Grand Format Print',
    screenHealth: '100% Calibrated & Active',
    matchScore: 98.4,
    lux: 64000,
  },
  {
    id: 'LOS-BUS-104',
    name: 'Yaba Bus Shelter',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Yaba, Lagos',
    corridor: 'Herbert Macaulay Way Tech & University Corridor',
    format: 'Bus Shelter',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4104',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 800,
    priceDailyUSD: 30,
    priceTwoWeeksNGN: 600000,
    sizeMeters: '3m',
    dimensions: '3m x 1.5m (4.5 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'Youth & University',
    campaignObjective: 'Tactical Sales',
    dailyTrafficVehicles: 80000,
    dwellTimeSeconds: 4,
    mediaOwnerCompany: 'Lagos Transit Media',
    companyContact: {
      companyName: 'Lagos Transit Media',
      tradingName: 'LTM Street Furniture',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-104',
      headquartersAddress: '310 Herbert Macaulay Way, Yaba, Lagos',
      contactPerson: 'Kemi Adeyemi',
      contactRole: 'Transit & Street Furniture Lead',
      phoneDirect: '+234 1 620 1140',
      phoneOperations: '+234 805 612 9088',
      emailDirect: 'transit@lagostransitmedia.ng',
      emailBookings: 'bookings@lagostransitmedia.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT',
      emergencySLA: '4-Hour Maintenance Response',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 110,
    },
    description: 'Eye-level illuminated commuter bus shelter and transit hub showcase in Yaba, reaching university students, tech startups, and daily BRT riders.',
    lightingType: 'Solar High-Lumen Backlit',
    specsList: ['Tempered Safety Glass Lightbox', 'Dusk-to-Dawn LED Backlight', 'High Footfall Pedestrian Zone'],
    lat: 6.5095,
    lng: 3.3711,
    previewUrl: imgYabaBusShelter,
    dailyReach: '128,000 Impressions',
    resolution: 'Backlit Duratrans',
    screenHealth: '100% Calibrated & Active',
    matchScore: 97.9,
    lux: 55000,
  },
  {
    id: 'LOS-DOOH-105',
    name: 'Victoria Island Iconic Digital LED',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Ozumba Mbadiwe Ave, Victoria Island, Lagos',
    corridor: 'Ozumba Mbadiwe Civic & Waterfront Approach',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4105',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 4800,
    priceDailyUSD: 160,
    priceTwoWeeksNGN: 3840000,
    sizeMeters: '24m',
    dimensions: '24m x 8m (192 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Market Dominance',
    dailyTrafficVehicles: 340000,
    dwellTimeSeconds: 65,
    mediaOwnerCompany: 'Continental Outdoor Nigeria Ltd',
    companyContact: {
      companyName: 'Continental Outdoor Nigeria Ltd',
      tradingName: 'Continental Outdoor & Alliance Media',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-105',
      headquartersAddress: '10 Ozumba Mbadiwe Ave, Victoria Island, Lagos',
      contactPerson: 'Folashade Adeleke',
      contactRole: 'Managing Director & Concessionaire',
      phoneDirect: '+234 1 271 9040',
      phoneOperations: '+234 803 400 9100',
      emailDirect: 'fadeleke@continentaloutdoor.ng',
      emailBookings: 'bookings@continentaloutdoor.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT (24/7 NOC Monitoring)',
      emergencySLA: '1-Hour Priority SLA',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 84,
    },
    description: 'Flagship architectural digital LED spectacular on Ozumba Mbadiwe Avenue with extended peak-hour traffic dwell times and 3D anamorphic capability.',
    lightingType: 'Active LED Display',
    specsList: ['3D Anamorphic Ready', '9000 Nits Daylight Luminance', 'AI Proof-of-Play Camera Feed'],
    lat: 6.4352,
    lng: 3.4348,
    previewUrl: imgViIconic,
    dailyReach: '540,000 Impressions',
    resolution: '3840 x 1440 Ultra HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.8,
    lux: 92000,
  },
  {
    id: 'LOS-MEGA-106',
    name: 'Lekki Toll Gate Mega Overhead Gantry',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Lekki Phase 1 Toll Plaza, Admiralty Way, Lagos',
    corridor: 'Lekki Phase 1 Toll Gate & Ikoyi Link Bridge Approach',
    format: 'Megaboard',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4106',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 5800,
    priceDailyUSD: 195,
    priceTwoWeeksNGN: 4640000,
    sizeMeters: '28m',
    dimensions: '28m x 6m (168 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Market Dominance',
    dailyTrafficVehicles: 480000,
    dwellTimeSeconds: 110,
    mediaOwnerCompany: 'Loatsad Promomedia Ltd',
    companyContact: {
      companyName: 'Loatsad Promomedia Ltd',
      tradingName: 'Loatsad Promomedia',
      licenseNumber: 'LASAA/OOH/VOL.4/2024-106',
      headquartersAddress: '1 Admiralty Road, Lekki Phase 1, Lagos',
      contactPerson: 'Oluwaseyi Tinubu',
      contactRole: 'Executive Concession Director',
      phoneDirect: '+234 1 291 5500',
      phoneOperations: '+234 809 800 1122',
      emailDirect: 'commercial@loatsad.ng',
      emailBookings: 'bookings@loatsad.ng',
      website: 'https://www.adgrid.cloud',
      operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT (24/7 NOC Monitoring)',
      emergencySLA: '1-Hour Priority SLA',
      verifiedStatus: 'Verified Nigerian Concessionaire',
      activeSitesCount: 64,
    },
    description: 'Spanning all lanes of the Lekki Phase 1 Toll Plaza, this dual-facing overhead megaboard captures 100% of island-bound and mainland-bound traffic.',
    lightingType: 'Active LED Display',
    specsList: ['Full-Span Highway Gantry', 'Dual-Sided Synchronized LED', 'Automated Telemetry & Lux Sensor'],
    lat: 6.4378,
    lng: 3.4492,
    previewUrl: imgLekkiTollGantry,
    dailyReach: '760,000 Impressions',
    resolution: '4096 x 1152 Ultra Wide',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.9,
    lux: 95000,
  },
  {
    id: 'LOS-WRAP-107',
    name: 'Third Mainland BRT Fleet Transit Wrap',
    metro: 'LOS',
    metroName: 'Lagos, Nigeria',
    location: 'Ikorodu Rd & Marina Corridor, Lagos',
    corridor: 'TBS Marina to Ikeja & Ikorodu Express BRT Route',
    format: 'Transit Wrap',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#LOS-4107',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1400,
    priceDailyUSD: 48,
    priceTwoWeeksNGN: 1100000,
    sizeMeters: '14m',
    dimensions: '14m Full Coach Exterior Wrap',
    availabilityStatus: 'Future Dates',
    audienceType: 'Transit & Airport',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 95000,
    dwellTimeSeconds: 5,
    mediaOwnerCompany: 'Lagos Transit Media',
    description: 'Full exterior vinyl wrap across high-frequency commuter coaches operating along Ikorodu Road, Third Mainland Bridge, and Marina.',
    lightingType: 'Reflective 3M Commercial Vinyl',
    specsList: ['GPS Route Tracking', 'UV-Protected 3M Cast Vinyl', 'Daily Depot Wash & QA'],
    lat: 6.5483,
    lng: 3.3684,
    previewUrl: imgYabaBusShelter,
    dailyReach: '160,000 Impressions',
    resolution: '3M Ultra-HD Print',
    screenHealth: '100% Calibrated & Active',
    matchScore: 97.4,
    lux: 60000,
  },
  {
    id: 'ABJ-DOOH-201',
    name: 'Wuse II Aminu Kano Digital Monolith',
    metro: 'ABJ',
    metroName: 'Abuja (FCT), Nigeria',
    location: 'Aminu Kano Crescent, Wuse II, Abuja',
    corridor: 'Wuse II Commercial & Diplomatic Corridor',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#ABJ-5201',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 3000,
    priceDailyUSD: 100,
    priceTwoWeeksNGN: 2400000,
    sizeMeters: '12m',
    dimensions: '12m x 4m (48 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 190000,
    dwellTimeSeconds: 9,
    mediaOwnerCompany: 'Optimum Exposures Ltd',
    description: 'Premier digital LED display at the busiest retail and diplomatic intersection on Aminu Kano Crescent, Wuse II, Abuja.',
    lightingType: 'Active LED Display',
    specsList: ['High-Luminance Outdoor LED', '24/7 Power Backup', 'Live Verification Camera'],
    lat: 9.0788,
    lng: 7.4762,
    previewUrl: imgLekkiExpressway,
    dailyReach: '310,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.2,
    lux: 86000,
  },
  {
    id: 'ABJ-MEGA-202',
    name: 'Abuja Airport Road Overhead Gantry',
    metro: 'ABJ',
    metroName: 'Abuja (FCT), Nigeria',
    location: 'Umaru Musa Yar’Adua Expressway, Abuja',
    corridor: 'Nnamdi Azikiwe International Airport Approach',
    format: 'Megaboard',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#ABJ-5202',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 4500,
    priceDailyUSD: 150,
    priceTwoWeeksNGN: 3600000,
    sizeMeters: '24m',
    dimensions: '24m x 6m (144 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'Transit & Airport',
    campaignObjective: 'Market Dominance',
    dailyTrafficVehicles: 260000,
    dwellTimeSeconds: 12,
    mediaOwnerCompany: 'Continental Outdoor Nigeria Ltd',
    description: 'Commanding overhead highway gantry welcoming all domestic and international arrivals into Abuja City Gate.',
    lightingType: 'Active LED Display',
    specsList: ['Full Highway Span', 'Aviation-Compliant Luminance', 'Real-Time PoP Telemetry'],
    lat: 9.0068,
    lng: 7.3621,
    previewUrl: imgLekkiTollGantry,
    dailyReach: '415,000 Impressions',
    resolution: '3840 x 1080 Ultra Wide',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.5,
    lux: 88000,
  },
  {
    id: 'PHC-DOOH-301',
    name: 'Aba Road GRA Junction Digital LED',
    metro: 'PHC',
    metroName: 'Port Harcourt, Nigeria',
    location: 'Aba Expressway, GRA Phase 2, Port Harcourt',
    corridor: 'Port Harcourt Aba Road Arterial',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#PHC-6301',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 2200,
    priceDailyUSD: 75,
    priceTwoWeeksNGN: 1750000,
    sizeMeters: '10m',
    dimensions: '10m x 4m (40 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 145000,
    dwellTimeSeconds: 8,
    mediaOwnerCompany: 'New Crystal Communications',
    description: 'High-brightness digital LED screen at the GRA Phase 2 intersection on Aba Expressway, Port Harcourt.',
    lightingType: 'Active LED Display',
    specsList: ['Tropical Weatherproof IP67', 'Auto-Brightness Sensor', 'Remote Diagnostics'],
    lat: 4.8242,
    lng: 7.0085,
    previewUrl: imgViOffice,
    dailyReach: '230,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 98.7,
    lux: 83000,
  },
  {
    id: 'KAN-UNI-401',
    name: 'Murtala Mohammed Way Commercial Unipole',
    metro: 'KAN',
    metroName: 'Kano, Nigeria',
    location: 'Murtala Mohammed Way, Nassarawa, Kano',
    corridor: 'Central Kano Trade & Banking Belt',
    format: 'Static Billboard',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#KAN-7401',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1400,
    priceDailyUSD: 48,
    priceTwoWeeksNGN: 1100000,
    sizeMeters: '12m',
    dimensions: '12m x 4m (48 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'FMCG Shoppers',
    campaignObjective: 'Tactical Sales',
    dailyTrafficVehicles: 135000,
    dwellTimeSeconds: 7,
    mediaOwnerCompany: 'ProMedia Outdoors',
    description: 'Dominant static unipole serving Northern Nigeria’s busiest commercial and wholesale trading avenue.',
    lightingType: 'Solar High-Lumen Backlit',
    specsList: ['Solar Off-Grid Floodlighting', 'Dust-Resistant Coating', 'Verified GPS Audit'],
    lat: 12.0045,
    lng: 8.5361,
    previewUrl: imgIkejaStatic,
    dailyReach: '215,000 Impressions',
    resolution: 'Grand Format Vinyl',
    screenHealth: '100% Calibrated & Active',
    matchScore: 98.1,
    lux: 78000,
  },
  {
    id: 'IBD-DOOH-501',
    name: 'Ring Road Challenge Digital Billboard',
    metro: 'IBD',
    metroName: 'Ibadan, Nigeria',
    location: 'MKO Abiola Way (Ring Road), Ibadan',
    corridor: 'Ring Road Commercial & Retail Hub',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#IBD-8501',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1700,
    priceDailyUSD: 58,
    priceTwoWeeksNGN: 1350000,
    sizeMeters: '10m',
    dimensions: '10m x 4m (40 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'FMCG Shoppers',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 115000,
    dwellTimeSeconds: 6,
    mediaOwnerCompany: 'ProMedia Outdoors',
    description: 'Prime digital LED billboard on Ibadan’s vibrant Ring Road retail and hospitality boulevard.',
    lightingType: 'Active LED Display',
    specsList: ['Full HD Outdoor LED', 'Hybrid Solar/Grid Power', 'PoP Camera Verification'],
    lat: 7.3629,
    lng: 3.8639,
    previewUrl: imgViIconic,
    dailyReach: '184,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 98.3,
    lux: 80000,
  },
  {
    id: 'ENU-UNI-601',
    name: 'Okpara Avenue Independence Layout Billboard',
    metro: 'ENU',
    metroName: 'Enugu, Nigeria',
    location: 'Okpara Avenue, Enugu',
    corridor: 'Central Business District & Government House Link',
    format: 'Static Billboard',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#ENU-9601',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1300,
    priceDailyUSD: 45,
    priceTwoWeeksNGN: 1050000,
    sizeMeters: '8m',
    dimensions: '8m x 3m (24 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'High-Income Commuters',
    campaignObjective: 'Brand Awareness',
    dailyTrafficVehicles: 92000,
    dwellTimeSeconds: 6,
    mediaOwnerCompany: 'New Crystal Communications',
    description: 'Strategic static unipole along Okpara Avenue in Enugu’s primary banking and civic district.',
    lightingType: 'Solar High-Lumen Backlit',
    specsList: ['Solar LED Floodlights', 'All-Weather Steel Frame', 'Monthly Field Audit'],
    lat: 6.4492,
    lng: 7.4981,
    previewUrl: imgIkejaStatic,
    dailyReach: '148,000 Impressions',
    resolution: 'Grand Format Print',
    screenHealth: '100% Calibrated & Active',
    matchScore: 97.8,
    lux: 74000,
  },
  {
    id: 'BEN-DOOH-701',
    name: 'Sapele Road Ring Road Digital Screen',
    metro: 'BEN',
    metroName: 'Benin City, Nigeria',
    location: 'Ring Road / Sapele Road Junction, Benin City',
    corridor: 'King’s Square & Sapele Road Commercial Axis',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#BEN-9701',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 1650,
    priceDailyUSD: 55,
    priceTwoWeeksNGN: 1300000,
    sizeMeters: '10m',
    dimensions: '10m x 4m (40 sq.m)',
    availabilityStatus: 'Future Dates',
    audienceType: 'FMCG Shoppers',
    campaignObjective: 'Tactical Sales',
    dailyTrafficVehicles: 110000,
    dwellTimeSeconds: 7,
    mediaOwnerCompany: 'Optimum Exposures Ltd',
    description: 'High-traffic digital LED display facing King’s Square and Sapele Road commuters in central Benin City.',
    lightingType: 'Active LED Display',
    specsList: ['High-Contrast P6 LED', 'Automated Uptime Telemetry', 'Backup Generator'],
    lat: 6.3321,
    lng: 5.6225,
    previewUrl: imgLekkiExpressway,
    dailyReach: '176,000 Impressions',
    resolution: '1920 x 1080 Full HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 98.2,
    lux: 81000,
  },
  {
    id: 'ACC-DOOH-801',
    name: 'Spintex Road Airport City Digital LED',
    metro: 'ACC',
    metroName: 'Accra, Ghana',
    location: 'Liberation Road, Airport City, Accra',
    corridor: 'Kotoka International Airport & Tetteh Quarshie Interchange',
    format: 'Digital Billboard (LED)',
    status: 'Live & Verified',
    client: 'Direct Concession Listing',
    brand: 'Open for Booking',
    flightId: '#ACC-9801',
    flightName: 'Open Commercial Flight',
    priceMonthlyUSD: 3400,
    priceDailyUSD: 115,
    priceTwoWeeksNGN: 2720000,
    sizeMeters: '16m',
    dimensions: '16m x 5m (80 sq.m)',
    availabilityStatus: 'Available Now',
    audienceType: 'Transit & Airport',
    campaignObjective: 'Market Dominance',
    dailyTrafficVehicles: 220000,
    dwellTimeSeconds: 14,
    mediaOwnerCompany: 'Continental Outdoor Nigeria Ltd',
    description: 'Landmark digital LED display at Accra Airport City serving international travelers and corporate headquarters.',
    lightingType: 'Active LED Display',
    specsList: ['Daylight Calibration', 'Pan-African Telemetry Node', '24/7 NOC Uptime'],
    lat: 5.6052,
    lng: -0.1769,
    previewUrl: imgViOffice,
    dailyReach: '352,000 Impressions',
    resolution: '2560 x 1080 Wide HD',
    screenHealth: '100% Calibrated & Active',
    matchScore: 99.4,
    lux: 89000,
  },
];

function normalizeStoredBillboards(items: MarketplaceBillboard[]) {
  return items.map((billboard) => billboard.previewUrl.includes('1508873696983')
    ? { ...billboard, previewUrl: FALLBACK_BILLBOARD_IMAGE }
    : billboard);
}

export const BillboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [billboards, setBillboards] = useState<MarketplaceBillboard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeStoredBillboards(parsed);
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_BILLBOARDS;
  });

  // Persist to localStorage whenever billboards state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(billboards));
    } catch {
      // ignore
    }
  }, [billboards]);

  // Add billboard
  const addBillboard = useCallback((input: AddBillboardInput): MarketplaceBillboard => {
    const metro = input.metro || 'LOS';
    const metroMeta = METRO_DEFAULTS[metro] || METRO_DEFAULTS.LOS;
    if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
      throw new Error('Exact billboard latitude and longitude are required.');
    }
    
    // Generate clean ID: e.g. LOS-DOOH-721
    const formatSlug = input.format.includes('Digital') || input.format.includes('LED') ? 'DOOH' : 'UNI';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `${metro}-${formatSlug}-${randomSuffix}`;

    const monthly = Number(input.priceMonthlyUSD) || 3500;
    const daily = input.priceDailyUSD ? Number(input.priceDailyUSD) : Math.round(monthly / 30);
    const traffic = input.dailyTrafficVehicles ? Number(input.dailyTrafficVehicles) : 280000;
    const reach = input.dailyReach || `${(traffic * 1.6).toLocaleString()} Impressions`;

    const defaultImages = [
      imgLekkiExpressway,
      imgViOffice,
      imgIkejaStatic,
      imgYabaBusShelter,
      imgViIconic,
      imgLekkiTollGantry,
    ];
    const previewUrl = input.previewUrl?.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const companyName = input.mediaOwnerCompany?.trim() || 'Continental Outdoor Nigeria Ltd';

    const newBillboard: MarketplaceBillboard = {
      id: newId,
      name: input.name.trim(),
      metro,
      metroName: input.metroName || metroMeta.name,
      location: input.location.trim(),
      corridor: input.corridor.trim(),
      format: input.format,
      status: input.status || 'Live & Verified',
      client: 'Direct Concession Listing',
      brand: 'Open for Booking',
      flightId: `#${metro}-${Math.floor(1000 + Math.random() * 9000)}`,
      flightName: 'Open Commercial Flight',
      priceMonthlyUSD: monthly,
      priceDailyUSD: daily,
      dimensions: input.dimensions || '20m x 8m (160 sq.m)',
      availabilityStatus: input.availabilityStatus || 'Available Now',
      audienceType: input.audienceType || 'High-Income Commuters',
      campaignObjective: input.campaignObjective || 'Brand Awareness',
      dailyTrafficVehicles: traffic,
      dwellTimeSeconds: input.dwellTimeSeconds || 60,
      mediaOwnerCompany: companyName,
      companyContact: {
        companyName,
        tradingName: companyName,
        licenseNumber: input.licenseNumber || 'LASAA/OOH/VOL.4/2024-REG',
        headquartersAddress: `${input.location}, ${metroMeta.name}`,
        contactPerson: input.contactPerson || 'Concession Operations Lead',
        contactRole: 'Head of Inventory & Commercial Leasing',
        phoneDirect: input.contactPhone || '+234 1 295 8820',
        phoneOperations: '+234 803 555 0192',
        emailDirect: input.contactEmail || 'inventory@concession-network.ng',
        emailBookings: input.contactEmail || 'bookings@concession-network.ng',
        website: 'https://www.adgrid.cloud',
        operatingHours: 'Mon–Fri: 08:00 – 18:00 WAT (24/7 NOC Monitoring)',
        emergencySLA: '2-Hour Technical Intervention SLA',
        verifiedStatus: 'Verified Nigerian Concessionaire',
        activeSitesCount: 1,
      },
      description: input.description?.trim() || `Prime ${input.format} billboard asset situated on the busy ${input.corridor} in ${metroMeta.name}. Outstanding visibility with high dwell-time executive commuter exposure.`,
      lightingType: input.lightingType || 'Active LED Display',
      specsList: input.specsList && input.specsList.length > 0 ? input.specsList : ['Daylight Optical Sensor', 'Anti-Glare High Brightness', 'Real-Time Telemetry Relay'],
      lat: input.lat as number,
      lng: input.lng as number,
      previewUrl,
      dailyReach: reach,
      resolution: input.resolution || '1920 x 1080 Full HD',
      screenHealth: '100% Calibrated & Active',
      matchScore: 99.5,
      lux: 85000,
    };

    setBillboards((prev) => [newBillboard, ...prev]);
    return newBillboard;
  }, []);

  // Update billboard
  const updateBillboard = useCallback((id: string, updates: Partial<MarketplaceBillboard>) => {
    setBillboards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  // Delete billboard
  const deleteBillboard = useCallback((id: string) => {
    setBillboards((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Filter helper for company billboards
  const getCompanyBillboards = useCallback(
    (companyName?: string): MarketplaceBillboard[] => {
      if (!companyName || companyName === 'ALL') {
        return billboards;
      }
      const norm = companyName.toLowerCase();
      return billboards.filter((b) =>
        b.mediaOwnerCompany.toLowerCase().includes(norm) ||
        b.companyContact?.companyName.toLowerCase().includes(norm)
      );
    },
    [billboards]
  );

  // CSV Export Function
  const exportBillboardsCSV = useCallback((filterCompany?: string, filterMetro?: string) => {
    let items = billboards;

    if (filterCompany && filterCompany !== 'ALL') {
      const norm = filterCompany.toLowerCase();
      items = items.filter((b) =>
        b.mediaOwnerCompany.toLowerCase().includes(norm) ||
        b.companyContact?.companyName.toLowerCase().includes(norm)
      );
    }

    if (filterMetro && filterMetro !== 'ALL') {
      items = items.filter((b) => b.metro === filterMetro);
    }

    // CSV Headers
    const headers = [
      'Billboard ID',
      'Asset Name',
      'Metro Code',
      'Metro & State',
      'Location Address',
      'Arterial Corridor',
      'Format',
      'Status',
      'Availability',
      'Monthly Rate (USD)',
      'Daily Rate (USD)',
      'Dimensions',
      'Resolution',
      'Daily Reach (Impressions)',
      'Daily Traffic (Vehicles/Day)',
      'Dwell Time (Seconds)',
      'Audience Type',
      'Campaign Objective',
      'Lighting Type',
      'Screen Health',
      'Concessionaire Company',
      'Regulatory License',
      'Contact Person',
      'Contact Phone',
      'Contact Email',
      'Latitude',
      'Longitude',
    ];

    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = items.map((b) => [
      escapeCSV(b.id),
      escapeCSV(b.name),
      escapeCSV(b.metro),
      escapeCSV(b.metroName),
      escapeCSV(b.location),
      escapeCSV(b.corridor),
      escapeCSV(b.format),
      escapeCSV(b.status),
      escapeCSV(b.availabilityStatus),
      escapeCSV(b.priceMonthlyUSD),
      escapeCSV(b.priceDailyUSD),
      escapeCSV(b.dimensions),
      escapeCSV(b.resolution || 'Standard'),
      escapeCSV(b.dailyReach || ''),
      escapeCSV(b.dailyTrafficVehicles || 0),
      escapeCSV(b.dwellTimeSeconds || 60),
      escapeCSV(b.audienceType || ''),
      escapeCSV(b.campaignObjective || ''),
      escapeCSV(b.lightingType || ''),
      escapeCSV(b.screenHealth || 'Operational'),
      escapeCSV(b.mediaOwnerCompany || ''),
      escapeCSV(b.companyContact?.licenseNumber || 'Verified'),
      escapeCSV(b.companyContact?.contactPerson || 'Operations Lead'),
      escapeCSV(b.companyContact?.phoneDirect || ''),
      escapeCSV(b.companyContact?.emailDirect || ''),
      escapeCSV(b.lat),
      escapeCSV(b.lng),
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');

    // Create download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const safeCompany = filterCompany && filterCompany !== 'ALL'
      ? filterCompany.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      : 'all_network';
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `ADGRID_Billboards_${safeCompany}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [billboards]);

  // Batch Import Billboards (Supports new additions and safe updates with ID stability)
  const importBillboardsBatch = useCallback(
    (batch: {
      toAdd: MarketplaceBillboard[];
      toUpdate: { id: string; data: Partial<MarketplaceBillboard> }[];
    }) => {
      let importedCount = 0;
      let updatedCount = 0;

      setBillboards((prev) => {
        const updateMap = new Map<string, Partial<MarketplaceBillboard>>();
        batch.toUpdate.forEach((u) => updateMap.set(u.id.toUpperCase().trim(), u.data));

        // 1. Process existing records: apply updates while protecting confirmed bookings
        const updatedList = prev.map((existing) => {
          const normId = existing.id.toUpperCase().trim();
          if (updateMap.has(normId)) {
            const incomingUpdates = updateMap.get(normId)!;
            updatedCount++;

            // Section L SAFETY CHECK: Protect confirmed flights and verification history
            const isConfirmedFlight =
              existing.availabilityStatus?.includes('Occupied') ||
              existing.availabilityStatus?.includes('Booked') ||
              (existing.brand && existing.brand !== 'Open for Booking');

            const safeUpdates = { ...incomingUpdates };

            if (isConfirmedFlight) {
              // Preserve critical booking & telemetry fields
              delete safeUpdates.flightId;
              delete safeUpdates.flightName;
              delete safeUpdates.brand;
              delete safeUpdates.client;
              delete safeUpdates.screenHealth;
              delete safeUpdates.matchScore;
              delete safeUpdates.lux;
            }

            return {
              ...existing,
              ...safeUpdates,
              lastImportedAt: new Date().toISOString(),
              importSource: 'Spreadsheet Batch Import',
            };
          }
          return existing;
        });

        // 2. Add brand-new records that don't exist yet
        const existingIds = new Set(prev.map((b) => b.id.toUpperCase().trim()));
        const newToAdd: MarketplaceBillboard[] = [];

        batch.toAdd.forEach((item) => {
          const normId = item.id.toUpperCase().trim();
          if (!existingIds.has(normId)) {
            existingIds.add(normId);
            newToAdd.push({
              ...item,
              lastImportedAt: new Date().toISOString(),
              importSource: 'Spreadsheet Batch Import',
            });
            importedCount++;
          }
        });

        return [...newToAdd, ...updatedList];
      });

      return { importedCount, updatedCount };
    },
    []
  );

  return (
    <BillboardContext.Provider
      value={{
        billboards,
        addBillboard,
        updateBillboard,
        deleteBillboard,
        exportBillboardsCSV,
        getCompanyBillboards,
        importBillboardsBatch,
      }}
    >
      {children}
    </BillboardContext.Provider>
  );
};

export const useBillboards = (): BillboardContextType => {
  const context = useContext(BillboardContext);
  if (!context) {
    throw new Error('useBillboards must be used within a BillboardProvider');
  }
  return context;
};
