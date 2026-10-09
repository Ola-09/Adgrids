import * as XLSX from 'xlsx';

export interface ParsedSheetInfo {
  sheetName: string;
  rowCount: number;
  columnCount: number;
}

export interface ParseResult {
  fileName: string;
  fileSize: number;
  sheets: ParsedSheetInfo[];
  selectedSheet: string;
  headers: string[];
  headerRowIndex: number;
  rawRows: Record<string, any>[];
  totalRows: number;
}

export interface ColumnMappingConfig {
  sourceColumn: string;
  targetField: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  status: 'auto_mapped' | 'needs_confirmation' | 'unmapped';
  sampleValues: any[];
}

export const TARGET_FIELDS: {
  key: string;
  label: string;
  required: boolean;
  category: 'core' | 'location' | 'specs' | 'pricing' | 'optional';
  description: string;
  synonyms: string[];
}[] = [
  {
    key: 'id',
    label: 'Billboard ID',
    required: true,
    category: 'core',
    description: 'Unique stable asset identifier (e.g., LOS-DOOH-101, BB001)',
    synonyms: [
      'billboard id',
      'board id',
      'inventory id',
      'board reference',
      'ref',
      'reference',
      'board ref',
      'asset id',
      'site code',
      'site id',
      'code',
      'id',
      'panel id',
      'structure id',
      'bb id',
      'ooh id',
    ],
  },
  {
    key: 'name',
    label: 'Billboard Name / Title',
    required: true,
    category: 'core',
    description: 'Commercial title or descriptive name of the billboard',
    synonyms: [
      'billboard name',
      'board name',
      'name',
      'site name',
      'asset name',
      'title',
      'structure name',
      'description name',
      'billboard title',
      'display name',
    ],
  },
  {
    key: 'location',
    label: 'Site Location / Address',
    required: true,
    category: 'location',
    description: 'Street address, landmark, or specific physical area',
    synonyms: [
      'location',
      'site',
      'area',
      'address',
      'site location',
      'physical location',
      'street',
      'landmark',
      'street address',
      'vicinity',
      'neighbourhood',
      'neighborhood',
    ],
  },
  {
    key: 'corridor',
    label: 'Arterial Corridor',
    required: false,
    category: 'location',
    description: 'Main arterial expressway, highway, or transit avenue',
    synonyms: [
      'corridor',
      'arterial corridor',
      'expressway',
      'highway',
      'axis',
      'transit corridor',
      'route',
      'road',
      'major road',
    ],
  },
  {
    key: 'metro',
    label: 'Metro / City',
    required: false,
    category: 'location',
    description: 'Metro code or city (e.g. Lagos, Abuja, Port Harcourt, Accra)',
    synonyms: [
      'metro',
      'city',
      'state',
      'metro code',
      'market',
      'region',
      'town',
      'country',
      'province',
    ],
  },
  {
    key: 'format',
    label: 'Billboard Type / Format',
    required: true,
    category: 'specs',
    description: 'Structure format (e.g., Digital LED, Static Unipole, Megaboard)',
    synonyms: [
      'type',
      'billboard type',
      'media type',
      'format',
      'structure type',
      'asset type',
      'display type',
      'category',
      'board type',
    ],
  },
  {
    key: 'dimensions',
    label: 'Dimensions / Size',
    required: false,
    category: 'specs',
    description: 'Physical dimensions (e.g. 24m x 8m, 48 sq.m, 12m)',
    synonyms: [
      'size',
      'dimensions',
      'dimension',
      'board size',
      'width x height',
      'measurement',
      'area',
      'specs',
      'meter size',
      'sqm',
      'square meters',
    ],
  },
  {
    key: 'priceMonthlyUSD',
    label: 'Monthly Rate / Price',
    required: true,
    category: 'pricing',
    description: 'Monthly card rate / rental price (in USD or local currency)',
    synonyms: [
      'price',
      'rate',
      'monthly rate',
      'monthly price',
      'cost',
      'card rate',
      'monthly cost',
      'rental rate',
      'fee',
      'price monthly',
      'rate monthly',
      'usd price',
      'rate usd',
      'amount',
    ],
  },
  {
    key: 'priceDailyUSD',
    label: 'Daily Rate (Optional)',
    required: false,
    category: 'pricing',
    description: 'Daily rate for short flights',
    synonyms: ['daily rate', 'daily price', 'price daily', 'day rate', 'rate daily'],
  },
  {
    key: 'availabilityStatus',
    label: 'Availability Status',
    required: false,
    category: 'core',
    description: 'Available Now, Booked, In Maintenance, etc.',
    synonyms: [
      'status',
      'availability',
      'availability status',
      'booking status',
      'state',
      'condition',
      'live status',
    ],
  },
  {
    key: 'lat',
    label: 'Latitude (GPS)',
    required: false,
    category: 'location',
    description: 'Geographic latitude coordinate (-90 to 90)',
    synonyms: [
      'latitude',
      'lat',
      'gps lat',
      'gps latitude',
      'y coord',
      'y coordinate',
      'geo lat',
    ],
  },
  {
    key: 'lng',
    label: 'Longitude (GPS)',
    required: false,
    category: 'location',
    description: 'Geographic longitude coordinate (-180 to 180)',
    synonyms: [
      'longitude',
      'lng',
      'long',
      'gps lng',
      'gps long',
      'gps longitude',
      'x coord',
      'x coordinate',
      'geo lng',
    ],
  },
  {
    key: 'dailyTrafficVehicles',
    label: 'Daily Traffic (Vehicles/Day)',
    required: false,
    category: 'optional',
    description: 'Audited daily traffic vehicular count',
    synonyms: [
      'traffic',
      'daily traffic',
      'daily vehicles',
      'vehicles',
      'vehicles per day',
      'footfall',
      'vehicular traffic',
      'circulation',
    ],
  },
  {
    key: 'dailyReach',
    label: 'Daily Reach / Impressions',
    required: false,
    category: 'optional',
    description: 'Estimated daily audience reach or eyeballs',
    synonyms: [
      'reach',
      'daily reach',
      'impressions',
      'daily impressions',
      'eyeballs',
      'contacts',
      'ots',
    ],
  },
  {
    key: 'previewUrl',
    label: 'Photo / Image URL',
    required: false,
    category: 'optional',
    description: 'Direct web URL to asset photograph or daytime render',
    synonyms: [
      'image',
      'image url',
      'photo',
      'photo url',
      'picture',
      'preview url',
      'preview',
      'billboard photo',
      'thumbnail',
      'asset photo',
    ],
  },
  {
    key: 'mediaOwnerCompany',
    label: 'Concessionaire / Media Owner',
    required: false,
    category: 'optional',
    description: 'Company owning the structure concession',
    synonyms: [
      'media owner',
      'concessionaire',
      'company',
      'owner',
      'media owner company',
      'agency',
      'vendor',
      'supplier',
    ],
  },
  {
    key: 'lightingType',
    label: 'Illumination / Lighting',
    required: false,
    category: 'optional',
    description: 'Active LED Display, Solar Backlit, Floodlight, etc.',
    synonyms: ['lighting', 'lighting type', 'illumination', 'light type', 'backlight'],
  },
  {
    key: 'resolution',
    label: 'Resolution / Pitch',
    required: false,
    category: 'optional',
    description: 'Screen pixel resolution or pitch (e.g. 1920x1080, P6, P10)',
    synonyms: ['resolution', 'pixel pitch', 'screen resolution', 'pitch', 'screen spec'],
  },
  {
    key: 'description',
    label: 'Description / Notes',
    required: false,
    category: 'optional',
    description: 'Marketing description, visibility angles, or flight notes',
    synonyms: ['description', 'notes', 'remarks', 'details', 'summary', 'about'],
  },
];

/**
 * Validates file extension and mime type
 */
export function validateSpreadsheetFile(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const name = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => name.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload XLSX, XLS or CSV.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty. Please select a valid spreadsheet.',
    };
  }

  if (file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size exceeds maximum limit of 25MB.',
    };
  }

  return { valid: true };
}

/**
 * Reads a File object and converts to array buffer
 */
export async function readSpreadsheetWorkbook(file: File): Promise<XLSX.WorkBook> {
  const data = await file.arrayBuffer();
  return XLSX.read(data, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
  });
}

/**
 * Inspects all sheets in workbook
 */
export function getWorkbookSheets(workbook: XLSX.WorkBook): ParsedSheetInfo[] {
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const range = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
    const rowCount = range ? range.e.r - range.s.r + 1 : 0;
    const columnCount = range ? range.e.c - range.s.c + 1 : 0;
    return {
      sheetName,
      rowCount: Math.max(0, rowCount - 1), // exclude header row estimate
      columnCount,
    };
  });
}

/**
 * Detects header row index by scanning first 10 rows for target keywords
 */
export function detectHeaderRowIndex(rawGrid: any[][]): number {
  if (!rawGrid || rawGrid.length === 0) return 0;

  const maxScanRows = Math.min(10, rawGrid.length);
  let bestRowIndex = 0;
  let highestMatchScore = -1;

  for (let r = 0; r < maxScanRows; r++) {
    const row = rawGrid[r];
    if (!Array.isArray(row)) continue;

    let score = 0;
    let nonEmpties = 0;

    row.forEach((cell) => {
      if (cell !== null && cell !== undefined && String(cell).trim() !== '') {
        nonEmpties++;
        const cellText = String(cell).toLowerCase().trim();

        // Check if cell matches any target synonym
        for (const target of TARGET_FIELDS) {
          if (target.synonyms.some((s) => s === cellText || cellText.includes(s))) {
            score += target.required ? 3 : 1;
          }
        }
      }
    });

    if (score > highestMatchScore && nonEmpties >= 2) {
      highestMatchScore = score;
      bestRowIndex = r;
    }
  }

  return bestRowIndex;
}

/**
 * Parses selected sheet into headers and structured row objects
 */
export function parseSheetData(
  workbook: XLSX.WorkBook,
  sheetName: string,
  customHeaderRowIndex?: number
): {
  headers: string[];
  headerRowIndex: number;
  rawRows: Record<string, any>[];
  rawGrid: any[][];
} {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.`);
  }

  // Convert to 2D array first to detect header row
  const rawGrid = XLSX.utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawGrid.length === 0) {
    return { headers: [], headerRowIndex: 0, rawRows: [], rawGrid: [] };
  }

  const headerRowIndex =
    customHeaderRowIndex !== undefined
      ? customHeaderRowIndex
      : detectHeaderRowIndex(rawGrid);

  const rawHeaderRow = rawGrid[headerRowIndex] || [];
  const headers: string[] = [];

  // Clean and deduplicate header labels
  const seenHeaderCounts: Record<string, number> = {};
  rawHeaderRow.forEach((h: any, colIdx: number) => {
    let cleanHeader = h ? String(h).trim() : `Column_${colIdx + 1}`;
    if (!cleanHeader) cleanHeader = `Column_${colIdx + 1}`;

    if (seenHeaderCounts[cleanHeader]) {
      seenHeaderCounts[cleanHeader]++;
      cleanHeader = `${cleanHeader}_${seenHeaderCounts[cleanHeader]}`;
    } else {
      seenHeaderCounts[cleanHeader] = 1;
    }
    headers.push(cleanHeader);
  });

  // Extract subsequent data rows
  const rawRows: Record<string, any>[] = [];
  for (let r = headerRowIndex + 1; r < rawGrid.length; r++) {
    const rowValues = rawGrid[r];
    if (!Array.isArray(rowValues)) continue;

    // Check if row has any non-empty data
    const hasData = rowValues.some(
      (v) => v !== null && v !== undefined && String(v).trim() !== ''
    );
    if (!hasData) continue;

    const rowObj: Record<string, any> = { __rowIndex: r + 1 };
    headers.forEach((hdr, colIdx) => {
      rowObj[hdr] = rowValues[colIdx] !== undefined ? rowValues[colIdx] : '';
    });
    rawRows.push(rowObj);
  }

  return {
    headers,
    headerRowIndex,
    rawRows,
    rawGrid,
  };
}

/**
 * Automatically creates semantic mapping for detected headers
 */
export function generateAutoColumnMapping(
  headers: string[],
  rawRows: Record<string, any>[]
): ColumnMappingConfig[] {
  const mappings: ColumnMappingConfig[] = [];
  const assignedTargets = new Set<string>();

  headers.forEach((sourceCol) => {
    const cleanSource = sourceCol.toLowerCase().trim();
    let bestTarget: string = '';
    let bestConfidence: 'high' | 'medium' | 'low' | 'none' = 'none';

    // Find best match among TARGET_FIELDS
    for (const target of TARGET_FIELDS) {
      if (assignedTargets.has(target.key)) continue;

      const exactMatch = target.synonyms.some((s) => s === cleanSource);
      if (exactMatch) {
        bestTarget = target.key;
        bestConfidence = 'high';
        break;
      }

      const partialMatch = target.synonyms.some(
        (s) => cleanSource.includes(s) || s.includes(cleanSource)
      );
      if (partialMatch && bestConfidence === 'none') {
        bestTarget = target.key;
        bestConfidence = 'medium';
      }
    }

    if (bestTarget && (bestConfidence === 'high' || bestConfidence === 'medium')) {
      assignedTargets.add(bestTarget);
      mappings.push({
        sourceColumn: sourceCol,
        targetField: bestTarget,
        confidence: bestConfidence,
        status: bestConfidence === 'high' ? 'auto_mapped' : 'needs_confirmation',
        sampleValues: rawRows.slice(0, 3).map((r) => r[sourceCol]),
      });
    } else {
      mappings.push({
        sourceColumn: sourceCol,
        targetField: '',
        confidence: 'none',
        status: 'unmapped',
        sampleValues: rawRows.slice(0, 3).map((r) => r[sourceCol]),
      });
    }
  });

  return mappings;
}
