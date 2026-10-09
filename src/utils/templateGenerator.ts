import * as XLSX from 'xlsx';

export const TEMPLATE_COLUMNS = [
  'Billboard ID',
  'Billboard Name',
  'Location Address',
  'Arterial Corridor',
  'Metro / City',
  'Billboard Type',
  'Dimensions',
  'Monthly Rate (USD)',
  'Daily Rate (USD)',
  'Availability Status',
  'Latitude (GPS)',
  'Longitude (GPS)',
  'Daily Traffic (Vehicles/Day)',
  'Daily Reach (Impressions)',
  'Photo URL',
  'Lighting Type',
  'Resolution',
  'Media Owner Company',
  'Description',
];

export const SAMPLE_TEMPLATE_ROWS = [
  [
    'LOS-DOOH-501',
    'Lekki Toll Plaza Digital Spectacular',
    'Admiralty Way, Lekki Phase 1',
    'Lekki-Epe Expressway',
    'Lagos',
    'Digital Billboard (LED)',
    '24m x 8m (192 sq.m)',
    4500,
    150,
    'Available Now',
    6.4378,
    3.4492,
    320000,
    '500,000 Impressions',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    'Active LED Display',
    '3840 x 1080 Ultra HD',
    'AfriReach Concessions Ltd',
    'High impact overhead highway digital billboard capturing premium commuter traffic.',
  ],
  [
    'ABJ-UNI-502',
    'Wuse II Aminu Kano Unipole',
    'Aminu Kano Crescent, Wuse II',
    'Wuse Commercial Axis',
    'Abuja',
    'Static Unipole',
    '12m x 4m (48 sq.m)',
    2800,
    95,
    'Available Now',
    9.0788,
    7.4762,
    195000,
    '280,000 Impressions',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    'Solar High-Lumen Backlit',
    'Grand Format Vinyl',
    'AfriReach Concessions Ltd',
    'Prominent illuminated unipole in the primary diplomatic and banking district.',
  ],
  [
    'PHC-DOOH-503',
    'Aba Road GRA Port Harcourt Monolith',
    'Aba Expressway, GRA Phase 2',
    'Port Harcourt Central Corridor',
    'Port Harcourt',
    'Digital Billboard (LED)',
    '10m x 4m (40 sq.m)',
    2200,
    75,
    'Available Now',
    4.8242,
    7.0085,
    145000,
    '210,000 Impressions',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    'Active LED Display',
    '1920 x 1080 Full HD',
    'AfriReach Concessions Ltd',
    'Eye-level executive digital LED board facing GRA commuters.',
  ],
];

/**
 * Generates and triggers download of the official Adgrid inventory template
 */
export function downloadAdgridTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const wsData = [TEMPLATE_COLUMNS, ...SAMPLE_TEMPLATE_ROWS];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // ID
    { wch: 34 }, // Name
    { wch: 30 }, // Location
    { wch: 26 }, // Corridor
    { wch: 15 }, // Metro
    { wch: 24 }, // Type
    { wch: 22 }, // Dimensions
    { wch: 18 }, // Monthly Rate
    { wch: 16 }, // Daily Rate
    { wch: 18 }, // Availability
    { wch: 15 }, // Lat
    { wch: 15 }, // Lng
    { wch: 22 }, // Traffic
    { wch: 24 }, // Reach
    { wch: 38 }, // Photo URL
    { wch: 22 }, // Lighting
    { wch: 20 }, // Resolution
    { wch: 26 }, // Media Owner
    { wch: 45 }, // Description
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Billboard_Inventory');

  const filename = `ADGRID_Inventory_Template.${format}`;

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    XLSX.writeFile(wb, filename);
  }
}

/**
 * Generates a downloadable error and validation report for failed rows
 */
export function downloadImportErrorReport(
  errorsList: Array<{
    rowNumber: number;
    billboardId: string;
    name: string;
    errorReason: string;
    status: string;
  }>
) {
  const headers = ['Row Number', 'Billboard ID', 'Billboard Name', 'Issue Description', 'Action Required'];
  const rows = errorsList.map((e) => [
    e.rowNumber,
    e.billboardId || 'N/A',
    e.name || 'N/A',
    e.errorReason,
    e.status === 'conflict' ? 'Choose Update or Skip' : 'Correct data in spreadsheet',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import_Attention_Report');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ADGRID_Import_Attention_Report_${dateStr}.xlsx`);
}
