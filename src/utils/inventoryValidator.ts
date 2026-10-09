import { MarketplaceBillboard, MetroCode } from '../types';

export interface RowValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type ConflictResolution = 'update' | 'skip' | 'review';

export interface ValidatedInventoryRow {
  rowNumber: number;
  rawRow: Record<string, any>;
  parsedBillboard: Partial<MarketplaceBillboard>;
  errors: RowValidationError[];
  status: 'ready' | 'conflict' | 'attention' | 'duplicate_in_file';
  conflictResolution: ConflictResolution;
  existingBillboard?: MarketplaceBillboard;
  isProtectedBooking?: boolean;
  protectedReason?: string;
  profileCompleteness: number;
  missingOptionalFields: string[];
}

export interface ValidationSummary {
  totalRows: number;
  readyCount: number;
  attentionCount: number;
  missingOptionalCount: number;
  duplicateInFileCount: number;
  conflictExistingCount: number;
  protectedBookingsCount: number;
  rows: ValidatedInventoryRow[];
}

// Known Metro mappings
const METRO_MAPPINGS: Record<string, MetroCode> = {
  lagos: 'LOS',
  los: 'LOS',
  abuja: 'ABJ',
  fct: 'ABJ',
  abj: 'ABJ',
  'port harcourt': 'PHC',
  phc: 'PHC',
  ibadan: 'IBD',
  ibd: 'IBD',
  kano: 'KAN',
  kan: 'KAN',
  enugu: 'ENU',
  enu: 'ENU',
  'benin city': 'BEN',
  benin: 'BEN',
  ben: 'BEN',
  nairobi: 'NBO',
  nbo: 'NBO',
  johannesburg: 'JNB',
  joburg: 'JNB',
  jnb: 'JNB',
  accra: 'ACC',
  acc: 'ACC',
  kigali: 'KGL',
  kgl: 'KGL',
  'addis ababa': 'ADD',
  addis: 'ADD',
  add: 'ADD',
};

const METRO_NAMES: Record<MetroCode, string> = {
  LOS: 'Lagos, Nigeria',
  ABJ: 'Abuja (FCT), Nigeria',
  PHC: 'Port Harcourt, Nigeria',
  IBD: 'Ibadan, Nigeria',
  KAN: 'Kano, Nigeria',
  ENU: 'Enugu, Nigeria',
  BEN: 'Benin City, Nigeria',
  NBO: 'Nairobi, Kenya',
  JNB: 'Johannesburg, South Africa',
  ACC: 'Accra, Ghana',
  KGL: 'Kigali, Rwanda',
  ADD: 'Addis Ababa, Ethiopia',
};

const METRO_COORDINATES: Record<MetroCode, { lat: number; lng: number }> = {
  LOS: { lat: 6.5244, lng: 3.3792 },
  ABJ: { lat: 9.0765, lng: 7.3986 },
  PHC: { lat: 4.8156, lng: 7.0498 },
  IBD: { lat: 7.3775, lng: 3.947 },
  KAN: { lat: 12.0022, lng: 8.592 },
  ENU: { lat: 6.4584, lng: 7.5464 },
  BEN: { lat: 6.335, lng: 5.6037 },
  NBO: { lat: -1.2921, lng: 36.8219 },
  JNB: { lat: -26.2041, lng: 28.0473 },
  ACC: { lat: 5.6037, lng: -0.187 },
  KGL: { lat: -1.9706, lng: 30.1044 },
  ADD: { lat: 9.03, lng: 38.74 },
};

/**
 * Strips currency marks and parses to float safely
 */
export function parseCleanNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : null;
  }
  const cleanStr = String(val)
    .replace(/[₦$€£, ]/g, '')
    .trim();
  const num = parseFloat(cleanStr);
  return Number.isFinite(num) ? num : null;
}

/**
 * Standardizes format name
 */
export function standardizeFormat(formatStr?: string): string {
  if (!formatStr) return 'Digital Billboard (LED)';
  const lower = formatStr.toLowerCase().trim();
  if (lower.includes('digital') || lower.includes('led') || lower.includes('dooh')) {
    return 'Digital Billboard (LED)';
  }
  if (lower.includes('gantry') || lower.includes('overhead')) {
    return 'Overhead Dual DOOH';
  }
  if (lower.includes('megaboard') || lower.includes('mega')) {
    return 'Megaboard';
  }
  if (lower.includes('shelter') || lower.includes('bus')) {
    return 'Bus Shelter';
  }
  if (lower.includes('wrap') || lower.includes('transit')) {
    return 'Transit Wrap';
  }
  if (lower.includes('unipole') || lower.includes('static')) {
    return 'Static Unipole';
  }
  return formatStr.trim();
}

/**
 * Standardizes availability status
 */
export function standardizeAvailability(statusStr?: string): string {
  if (!statusStr) return 'Available Now';
  const lower = statusStr.toLowerCase().trim();
  if (lower.includes('avail') || lower.includes('vacant') || lower.includes('open')) {
    return 'Available Now';
  }
  if (lower.includes('book') || lower.includes('occup') || lower.includes('active')) {
    return 'Occupied (Flight Active)';
  }
  if (lower.includes('maint') || lower.includes('repair')) {
    return 'Under Maintenance';
  }
  if (lower.includes('future') || lower.includes('next')) {
    return 'Next 14 Days';
  }
  return statusStr.trim();
}

/**
 * Calculates progressive profile completeness score (0-100%)
 */
export function calculateProfileCompleteness(b: Partial<MarketplaceBillboard>): {
  score: number;
  missing: string[];
} {
  let score = 0;
  const missing: string[] = [];

  // Core fields
  if (b.id && b.id.trim()) score += 10;
  else missing.push('Billboard ID');

  if (b.name && b.name.trim()) score += 10;
  else missing.push('Asset Name');

  if (b.location && b.location.trim()) score += 15;
  else missing.push('Location Address');

  if (b.corridor && b.corridor.trim()) score += 5;
  else missing.push('Corridor Axis');

  if (b.format && b.format.trim()) score += 10;
  else missing.push('Format');

  if (b.dimensions && b.dimensions.trim()) score += 5;
  else missing.push('Dimensions');

  if (b.priceMonthlyUSD && b.priceMonthlyUSD > 0) score += 15;
  else missing.push('Monthly Price');

  // Progressive optional fields
  const hasGps =
    b.lat !== undefined &&
    b.lng !== undefined &&
    Number.isFinite(b.lat) &&
    Number.isFinite(b.lng) &&
    (b.lat !== 0 || b.lng !== 0);

  if (hasGps) score += 10;
  else missing.push('GPS Coordinates');

  const hasPhoto =
    b.previewUrl &&
    b.previewUrl.trim() &&
    !b.previewUrl.includes('placeholder') &&
    b.previewUrl.startsWith('http');

  if (hasPhoto) score += 10;
  else missing.push('Photo / Preview');

  const hasTraffic =
    (b.dailyTrafficVehicles && b.dailyTrafficVehicles > 0) ||
    (b.dailyReach && b.dailyReach.trim());

  if (hasTraffic) score += 10;
  else missing.push('Traffic / Reach Data');

  return { score, missing };
}

/**
 * Validates a batch of rows parsed from a spreadsheet
 */
export function validateInventoryBatch(
  rawRows: Record<string, any>[],
  columnMappings: { sourceColumn: string; targetField: string }[],
  existingBillboards: MarketplaceBillboard[],
  defaultConflictResolution: ConflictResolution = 'update',
  defaultCompany: string = 'Optimum Exposures Ltd'
): ValidationSummary {
  const mappingMap = new Map<string, string>();
  columnMappings.forEach((m) => {
    if (m.targetField) mappingMap.set(m.targetField, m.sourceColumn);
  });

  const existingMap = new Map<string, MarketplaceBillboard>();
  existingBillboards.forEach((b) => existingMap.set(b.id.toUpperCase().trim(), b));

  const seenIdsInFile = new Map<string, number>();
  const validatedRows: ValidatedInventoryRow[] = [];

  let readyCount = 0;
  let attentionCount = 0;
  let missingOptionalCount = 0;
  let duplicateInFileCount = 0;
  let conflictExistingCount = 0;
  let protectedBookingsCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNumber = row.__rowIndex || idx + 2;
    const errors: RowValidationError[] = [];

    // Extract values based on mapping
    const getVal = (targetField: string) => {
      const sourceCol = mappingMap.get(targetField);
      if (!sourceCol) return undefined;
      const val = row[sourceCol];
      return val !== null && val !== undefined ? String(val).trim() : '';
    };

    const rawId = getVal('id');
    const rawName = getVal('name');
    const rawLocation = getVal('location');
    const rawCorridor = getVal('corridor');
    const rawMetro = getVal('metro');
    const rawFormat = getVal('format');
    const rawDimensions = getVal('dimensions');
    const rawPrice = getVal('priceMonthlyUSD');
    const rawDailyPrice = getVal('priceDailyUSD');
    const rawAvailability = getVal('availabilityStatus');
    const rawLat = getVal('lat');
    const rawLng = getVal('lng');
    const rawTraffic = getVal('dailyTrafficVehicles');
    const rawReach = getVal('dailyReach');
    const rawPreviewUrl = getVal('previewUrl');
    const rawCompany = getVal('mediaOwnerCompany');
    const rawLighting = getVal('lightingType');
    const rawResolution = getVal('resolution');
    const rawDescription = getVal('description');

    // 1. Validate Billboard ID
    let billboardId = rawId || '';
    if (!billboardId) {
      errors.push({
        field: 'id',
        message: 'Billboard ID is required.',
        severity: 'error',
      });
    }

    const normalizedId = billboardId.toUpperCase().trim();

    // Check duplicate in file
    let isDuplicateInFile = false;
    if (normalizedId) {
      if (seenIdsInFile.has(normalizedId)) {
        isDuplicateInFile = true;
        const previousRow = seenIdsInFile.get(normalizedId);
        errors.push({
          field: 'id',
          message: `Duplicate Billboard ID in spreadsheet (first seen on row ${previousRow}).`,
          severity: 'error',
        });
      } else {
        seenIdsInFile.set(normalizedId, rowNumber);
      }
    }

    // 2. Validate Name & Location
    let billboardName = rawName || '';
    let location = rawLocation || '';

    if (!billboardName && !location) {
      errors.push({
        field: 'name',
        message: 'Either Asset Name or Location must be provided.',
        severity: 'error',
      });
    } else if (!billboardName) {
      billboardName = location;
    } else if (!location) {
      location = billboardName;
    }

    const corridor = rawCorridor || `${location} Arterial Axis`;

    // 3. Validate Metro
    let metro: MetroCode = 'LOS';
    if (rawMetro) {
      const match = METRO_MAPPINGS[rawMetro.toLowerCase().trim()];
      if (match) {
        metro = match;
      }
    } else {
      // Guess metro from ID or location text
      const idUpper = normalizedId;
      for (const [code] of Object.entries(METRO_NAMES)) {
        if (idUpper.startsWith(code)) {
          metro = code as MetroCode;
          break;
        }
      }
    }

    const metroName = METRO_NAMES[metro] || 'Lagos, Nigeria';

    // 4. Validate Price
    const numericPrice = parseCleanNumber(rawPrice);
    if (numericPrice === null || numericPrice <= 0) {
      errors.push({
        field: 'priceMonthlyUSD',
        message: `Monthly price must be a valid positive number. Found: "${rawPrice || 'empty'}"`,
        severity: 'error',
      });
    }

    const priceMonthlyUSD = numericPrice && numericPrice > 0 ? numericPrice : 0;
    const priceDailyUSD =
      parseCleanNumber(rawDailyPrice) || Math.round(priceMonthlyUSD / 30);

    // 5. Format & Dimensions
    const format = standardizeFormat(rawFormat);
    const dimensions = rawDimensions || '12m x 4m (48 sq.m)';

    // 6. Coordinates (Progressive)
    const parsedLat = parseCleanNumber(rawLat);
    const parsedLng = parseCleanNumber(rawLng);
    const defaultCoords = METRO_COORDINATES[metro] || METRO_COORDINATES.LOS;
    const lat =
      parsedLat !== null && parsedLat >= -90 && parsedLat <= 90
        ? parsedLat
        : defaultCoords.lat;
    const lng =
      parsedLng !== null && parsedLng >= -180 && parsedLng <= 180
        ? parsedLng
        : defaultCoords.lng;

    // 7. Traffic & Reach
    const dailyTrafficVehicles = parseCleanNumber(rawTraffic) || 180000;
    const dailyReach =
      rawReach || `${(dailyTrafficVehicles * 1.5).toLocaleString()} Impressions`;

    // 8. Image & Company
    const previewUrl =
      rawPreviewUrl && rawPreviewUrl.startsWith('http')
        ? rawPreviewUrl.trim()
        : 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80';

    const mediaOwnerCompany = rawCompany || defaultCompany;

    const parsedBillboard: Partial<MarketplaceBillboard> = {
      id: billboardId,
      name: billboardName,
      metro,
      metroName,
      location,
      corridor,
      format,
      dimensions,
      priceMonthlyUSD,
      priceDailyUSD,
      availabilityStatus: standardizeAvailability(rawAvailability),
      status: 'Live & Verified',
      lat,
      lng,
      dailyTrafficVehicles,
      dailyReach,
      previewUrl,
      mediaOwnerCompany,
      lightingType: rawLighting || 'Active LED Display',
      resolution: rawResolution || '1920 x 1080 Full HD',
      description:
        rawDescription ||
        `Prime ${format} billboard asset situated along ${corridor} in ${metroName}. High dwell-time executive visibility.`,
      specsList: [
        'Audited Steel Structure',
        'Weatherproof IP65 Shield',
        'Real-Time Telemetry Node',
      ],
      client: 'Direct Concession Listing',
      brand: 'Open for Booking',
      flightId: `#${metro}-${Math.floor(1000 + Math.random() * 9000)}`,
      flightName: 'Open Commercial Flight',
      screenHealth: '100% Calibrated & Active',
      matchScore: 99.2,
      lux: 85000,
    };

    // Calculate Progressive Completeness
    const { score: profileCompleteness, missing: missingOptionalFields } =
      calculateProfileCompleteness(parsedBillboard);

    // Check existing match
    const existingBillboard = normalizedId ? existingMap.get(normalizedId) : undefined;
    let status: 'ready' | 'conflict' | 'attention' | 'duplicate_in_file' = 'ready';
    let conflictResolution: ConflictResolution = defaultConflictResolution;
    let isProtectedBooking = false;
    let protectedReason: string | undefined = undefined;

    // Safety checks against overwriting confirmed bookings
    if (existingBillboard) {
      status = 'conflict';
      conflictExistingCount++;

      // Check if existing billboard has active/confirmed commercial flights
      if (
        existingBillboard.availabilityStatus?.includes('Occupied') ||
        existingBillboard.availabilityStatus?.includes('Booked') ||
        (existingBillboard.brand && existingBillboard.brand !== 'Open for Booking')
      ) {
        isProtectedBooking = true;
        protectedBookingsCount++;
        protectedReason = `Protected Booking: Active campaign flight "${existingBillboard.flightName || existingBillboard.brand}" is currently active on this billboard. Sensitive commercial parameters are locked.`;
        errors.push({
          field: 'availabilityStatus',
          message: protectedReason,
          severity: 'warning',
        });
      }
    }

    if (isDuplicateInFile) {
      status = 'duplicate_in_file';
      duplicateInFileCount++;
    } else if (errors.some((e) => e.severity === 'error')) {
      status = 'attention';
      attentionCount++;
    } else if (status === 'ready') {
      readyCount++;
      if (missingOptionalFields.length > 0) {
        missingOptionalCount++;
      }
    }

    validatedRows.push({
      rowNumber,
      rawRow: row,
      parsedBillboard,
      errors,
      status,
      conflictResolution,
      existingBillboard,
      isProtectedBooking,
      protectedReason,
      profileCompleteness,
      missingOptionalFields,
    });
  });

  return {
    totalRows: rawRows.length,
    readyCount,
    attentionCount,
    missingOptionalCount,
    duplicateInFileCount,
    conflictExistingCount,
    protectedBookingsCount,
    rows: validatedRows,
  };
}
