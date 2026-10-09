import React, { useState, useId, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Camera,
  FileDown,
  Edit2,
  Lock,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../../../types';
import { useBillboards } from '../../../../context/BillboardContext';
import {
  validateSpreadsheetFile,
  readSpreadsheetWorkbook,
  getWorkbookSheets,
  parseSheetData,
  generateAutoColumnMapping,
  TARGET_FIELDS,
  ColumnMappingConfig,
  ParsedSheetInfo,
} from '../../../../utils/spreadsheetParser';
import {
  validateInventoryBatch,
  ValidationSummary,
  ValidatedInventoryRow,
  ConflictResolution,
} from '../../../../utils/inventoryValidator';
import {
  downloadAdgridTemplate,
  downloadImportErrorReport,
} from '../../../../utils/templateGenerator';
import { BulkImageUploadModal } from './BulkImageUploadModal';

export type WizardStep = 'upload' | 'map' | 'preview_validate' | 'result';

interface ImportInventoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenManualAdd: () => void;
  defaultCompany?: string;
  onImportComplete?: () => void;
}

export const ImportInventoryWizard: React.FC<ImportInventoryWizardProps> = ({
  isOpen,
  onClose,
  onOpenManualAdd,
  defaultCompany = 'Optimum Exposures Ltd',
  onImportComplete,
}) => {
  const { billboards, importBillboardsBatch } = useBillboards();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');

  // File & Workbook State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<any | null>(null);
  const [sheetsList, setSheetsList] = useState<ParsedSheetInfo[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [detectedHeaderRowIndex, setDetectedHeaderRowIndex] = useState<number>(0);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Column Mapping State
  const [mappings, setMappings] = useState<ColumnMappingConfig[]>([]);

  // Validation & Review State
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [globalConflictResolution, setGlobalConflictResolution] = useState<ConflictResolution>('update');
  const [activePreviewTab, setActivePreviewTab] = useState<
    'all' | 'ready' | 'attention' | 'conflicts' | 'missing_optional'
  >('all');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Bulk Image Upload State
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
  const [attachedImageMatches, setAttachedImageMatches] = useState<Record<string, string>>({});

  // Result State
  const [importResultStats, setImportResultStats] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    attention: number;
  } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Step 1: File Upload & Sheet Detection
  // -------------------------------------------------------------
  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setFileError(null);

    const validation = validateSpreadsheetFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Unsupported file format. Please upload XLSX, XLS or CSV.');
      return;
    }

    try {
      setSelectedFile(file);
      const wb = await readSpreadsheetWorkbook(file);
      setWorkbook(wb);

      const sheets = getWorkbookSheets(wb);
      setSheetsList(sheets);

      const firstSheet = sheets[0]?.sheetName || '';
      setSelectedSheetName(firstSheet);

      // Parse first sheet
      const parsed = parseSheetData(wb, firstSheet);
      setRawHeaders(parsed.headers);
      setDetectedHeaderRowIndex(parsed.headerRowIndex);
      setRawRows(parsed.rawRows);

      // Generate Auto Column Mapping
      const autoMappings = generateAutoColumnMapping(parsed.headers, parsed.rawRows);
      setMappings(autoMappings);
    } catch (err: any) {
      setFileError(`Error parsing spreadsheet: ${err.message || 'Corrupt or unreadable file'}`);
    }
  };

  const handleSheetChange = (newSheetName: string) => {
    if (!workbook) return;
    setSelectedSheetName(newSheetName);
    try {
      const parsed = parseSheetData(workbook, newSheetName);
      setRawHeaders(parsed.headers);
      setDetectedHeaderRowIndex(parsed.headerRowIndex);
      setRawRows(parsed.rawRows);

      const autoMappings = generateAutoColumnMapping(parsed.headers, parsed.rawRows);
      setMappings(autoMappings);
    } catch (err: any) {
      setFileError(`Failed reading sheet: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Column Mapping Management
  // -------------------------------------------------------------
  const handleTargetFieldChange = (sourceCol: string, targetKey: string) => {
    setMappings((prev) =>
      prev.map((m) => {
        if (m.sourceColumn === sourceCol) {
          return {
            ...m,
            targetField: targetKey,
            confidence: targetKey ? 'high' : 'none',
            status: targetKey ? 'auto_mapped' : 'unmapped',
          };
        }
        return m;
      })
    );
  };

  const handleProceedToReview = () => {
    // Check if required fields are mapped (id, priceMonthlyUSD, and either name or location)
    const mappedTargets = new Set(mappings.map((m) => m.targetField).filter(Boolean));
    const missingRequired: string[] = [];

    if (!mappedTargets.has('id')) missingRequired.push('Billboard ID');
    if (!mappedTargets.has('name') && !mappedTargets.has('location')) {
      missingRequired.push('Billboard Name or Location');
    }
    if (!mappedTargets.has('priceMonthlyUSD')) missingRequired.push('Monthly Price / Rate');

    if (missingRequired.length > 0) {
      alert(
        `Please map the following required fields before proceeding:\n• ${missingRequired.join(
          '\n• '
        )}`
      );
      return;
    }

    // Run batch validation against existing inventory
    const summary = validateInventoryBatch(
      rawRows,
      mappings,
      billboards,
      globalConflictResolution,
      defaultCompany
    );

    setValidationSummary(summary);
    setCurrentStep('preview_validate');
  };

  // -------------------------------------------------------------
  // Step 3: Conflict Resolution & In-table Row Editing
  // -------------------------------------------------------------
  const handleGlobalConflictChange = (res: ConflictResolution) => {
    setGlobalConflictResolution(res);
    if (!validationSummary) return;

    // Update all existing conflict rows with the global resolution
    setValidationSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((row) => {
          if (row.existingBillboard) {
            return { ...row, conflictResolution: res };
          }
          return row;
        }),
      };
    });
  };

  const handleRowConflictChange = (rowNumber: number, res: ConflictResolution) => {
    setValidationSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.rowNumber === rowNumber ? { ...row, conflictResolution: res } : row
        ),
      };
    });
  };

  const handleInlineRowUpdate = (
    rowNumber: number,
    field: keyof MarketplaceBillboard,
    val: any
  ) => {
    setValidationSummary((prev) => {
      if (!prev) return prev;
      const updatedRows = prev.rows.map((r) => {
        if (r.rowNumber === rowNumber) {
          const updatedParsed = { ...r.parsedBillboard, [field]: val };
          // Revalidate row errors
          const updatedErrors = r.errors.filter((e) => e.field !== (field as string));
          return {
            ...r,
            parsedBillboard: updatedParsed,
            errors: updatedErrors,
            status: updatedErrors.some((e) => e.severity === 'error') ? r.status : 'ready',
          };
        }
        return r;
      });

      return {
        ...prev,
        rows: updatedRows,
      };
    });
  };

  // -------------------------------------------------------------
  // Step 4: Execute Batch Import
  // -------------------------------------------------------------
  const handleExecuteImport = async () => {
    if (!validationSummary) return;
    setIsProcessingImport(true);

    try {
      const toAdd: MarketplaceBillboard[] = [];
      const toUpdate: { id: string; data: Partial<MarketplaceBillboard> }[] = [];
      let skippedCount = 0;
      let attentionCount = 0;

      validationSummary.rows.forEach((r) => {
        // If row has critical error, skip it
        if (r.errors.some((e) => e.severity === 'error')) {
          attentionCount++;
          return;
        }

        const candidateData = { ...r.parsedBillboard } as MarketplaceBillboard;

        // Attach matched image if available
        if (attachedImageMatches[candidateData.id]) {
          candidateData.previewUrl = attachedImageMatches[candidateData.id];
        }

        if (r.existingBillboard) {
          if (r.conflictResolution === 'skip') {
            skippedCount++;
          } else {
            // Update existing record
            toUpdate.push({
              id: candidateData.id,
              data: candidateData,
            });
          }
        } else {
          // Brand new billboard
          toAdd.push(candidateData);
        }
      });

      const { importedCount, updatedCount } = importBillboardsBatch({
        toAdd,
        toUpdate,
      });

      setImportResultStats({
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        attention: attentionCount,
      });

      // Send audit record to backend API if available
      try {
        await fetch('/api/inventory/import/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
          },
          body: JSON.stringify({
            importedCount,
            updatedCount,
            skippedCount,
            attentionCount,
            fileName: selectedFile?.name,
          }),
        });
      } catch {
        // Safe fallback
      }

      setCurrentStep('result');
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsProcessingImport(false);
    }
  };

  // Filtered rows for preview table
  const previewRows = (validationSummary?.rows || []).filter((r) => {
    if (activePreviewTab === 'ready') return r.status === 'ready';
    if (activePreviewTab === 'attention') return r.errors.some((e) => e.severity === 'error');
    if (activePreviewTab === 'conflicts') return !!r.existingBillboard;
    if (activePreviewTab === 'missing_optional') return r.missingOptionalFields.length > 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#eae7e1] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-[#eae7e1] flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ef5a24] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[#181716] tracking-tight">
                  Import Existing Inventory
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#ef5a24]">
                  Excel & CSV Importer
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Bring your existing billboard fleet into Adgrid without rebuilding it manually.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-2.5 bg-zinc-50 border-b border-[#eae7e1] flex items-center justify-between text-xs font-bold text-zinc-500 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span
              className={`flex items-center gap-1.5 ${
                currentStep === 'upload' ? 'text-[#ef5a24]' : 'text-zinc-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 'upload'
                    ? 'bg-[#ef5a24] text-white'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                1
              </span>
              <span>Upload Spreadsheet</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />

            <span
              className={`flex items-center gap-1.5 ${
                currentStep === 'map' ? 'text-[#ef5a24]' : 'text-zinc-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 'map'
                    ? 'bg-[#ef5a24] text-white'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                2
              </span>
              <span>Map Columns</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />

            <span
              className={`flex items-center gap-1.5 ${
                currentStep === 'preview_validate' ? 'text-[#ef5a24]' : 'text-zinc-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 'preview_validate'
                    ? 'bg-[#ef5a24] text-white'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                3
              </span>
              <span>Review & Validate</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />

            <span
              className={`flex items-center gap-1.5 ${
                currentStep === 'result' ? 'text-emerald-600' : 'text-zinc-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 'result'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                4
              </span>
              <span>Imported</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Stable identifier:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[10px] font-mono font-bold">
              Billboard ID
            </span>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* ======================================================== */}
          {/* STEP 1: UPLOAD                                           */}
          {/* ======================================================== */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Three Entry Options Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Upload Excel/CSV (Prominent) */}
                <div className="md:col-span-2 border-2 border-dashed border-[#ef5a24]/30 hover:border-[#ef5a24] bg-[#fffaf8] hover:bg-[#fff6f2] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative transition-all group cursor-pointer shadow-xs">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-[#ef5a24]/20 text-[#ef5a24] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#181716] tracking-tight">
                    Upload Your Existing Excel or CSV File
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md">
                    Drag and drop your spreadsheet here or click to browse. Supports{' '}
                    <span className="font-bold text-zinc-800">.xlsx</span>,{' '}
                    <span className="font-bold text-zinc-800">.xls</span>, and{' '}
                    <span className="font-bold text-zinc-800">.csv</span> files.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef5a24] text-white text-xs font-bold shadow-md group-hover:bg-[#d94e1d] transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Select Spreadsheet File</span>
                  </div>
                </div>

                {/* Right Column: Other Options */}
                <div className="flex flex-col gap-4">
                  {/* Option 2: Download Adgrid Template */}
                  <div className="p-5 rounded-3xl border border-[#eae7e1] bg-white flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                        <Download className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-[#181716]">
                        Need a template?
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Download our pre-formatted spreadsheet template with sample African corridors and column headers.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => downloadAdgridTemplate('xlsx')}
                        className="flex-1 py-2 px-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Excel (.xlsx)
                      </button>
                      <button
                        onClick={() => downloadAdgridTemplate('csv')}
                        className="flex-1 py-2 px-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        CSV (.csv)
                      </button>
                    </div>
                  </div>

                  {/* Option 3: Manual Add Billboard */}
                  <div className="p-5 rounded-3xl border border-[#eae7e1] bg-white flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center mb-3">
                        <Plus className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-[#181716]">
                        Manual Single Entry
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Only have one or two billboards to add right now? Add them manually through our step-by-step form.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenManualAdd();
                      }}
                      className="mt-4 w-full py-2 px-3 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Manual Add Billboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {fileError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-semibold">{fileError}</span>
                </div>
              )}

              {/* Parsed File Preview & Sheet Selection */}
              {selectedFile && rawRows.length > 0 && (
                <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-950">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          Detected {rawRows.length} rows and {rawHeaders.length} columns in header row #{detectedHeaderRowIndex + 1}
                        </p>
                      </div>
                    </div>

                    {/* Sheet Selection if multiple */}
                    {sheetsList.length > 1 && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-zinc-700">Worksheet:</label>
                        <select
                          value={selectedSheetName}
                          onChange={(e) => handleSheetChange(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-[#181716] focus:ring-1 focus:ring-[#ef5a24]"
                        >
                          {sheetsList.map((s) => (
                            <option key={s.sheetName} value={s.sheetName}>
                              {s.sheetName} ({s.rowCount} rows)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCurrentStep('map')}
                      className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Continue to Column Mapping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: COLUMN MAPPING                                   */}
          {/* ======================================================== */}
          {currentStep === 'map' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-[#181716]">
                    Map Spreadsheet Columns to Adgrid Fields
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    We automatically detected matches based on common industry headers. Review or adjust mappings below.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Auto-Mapped
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Needs Confirmation
                  </span>
                </div>
              </div>

              {/* Mappings Table */}
              <div className="border border-[#eae7e1] rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                      <th className="py-3 px-4 w-1/3">Spreadsheet Column</th>
                      <th className="py-3 px-3 w-1/3">Mapped Adgrid Field</th>
                      <th className="py-3 px-4 w-1/3">Sample Values from File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eae7e1]">
                    {mappings.map((m) => {
                      const matchedTarget = TARGET_FIELDS.find(
                        (t) => t.key === m.targetField
                      );

                      return (
                        <tr key={m.sourceColumn} className="hover:bg-zinc-50/70">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-[#181716]">
                              {m.sourceColumn}
                            </div>
                            <span
                              className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                m.status === 'auto_mapped'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'needs_confirmation'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}
                            >
                              {m.status === 'auto_mapped'
                                ? 'Auto-Mapped ✓'
                                : m.status === 'needs_confirmation'
                                ? 'Needs confirmation'
                                : 'Unmapped (Optional)'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={m.targetField}
                              onChange={(e) =>
                                handleTargetFieldChange(m.sourceColumn, e.target.value)
                              }
                              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                                matchedTarget?.required
                                  ? 'border-[#ef5a24] bg-white text-[#181716] shadow-2xs'
                                  : m.targetField
                                  ? 'border-emerald-300 bg-white text-emerald-950'
                                  : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                              }`}
                            >
                              <option value="">-- Do Not Import / Skip --</option>
                              <optgroup label="Required Core Fields">
                                {TARGET_FIELDS.filter((t) => t.required).map((t) => (
                                  <option key={t.key} value={t.key}>
                                    ★ {t.label} (Required)
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Optional Specifications & Telemetry">
                                {TARGET_FIELDS.filter((t) => !t.required).map((t) => (
                                  <option key={t.key} value={t.key}>
                                    {t.label}
                                  </option>
                                ))}
                              </optgroup>
                            </select>

                            {matchedTarget && (
                              <p className="text-[10px] text-zinc-400 mt-1">
                                {matchedTarget.description}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {m.sampleValues.map((v, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-mono text-[10px] truncate max-w-[150px]"
                                  title={String(v)}
                                >
                                  {v !== undefined && v !== null && String(v).trim() !== ''
                                    ? String(v)
                                    : '—'}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to File</span>
                </button>

                <button
                  onClick={handleProceedToReview}
                  className="px-5 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Validate & Preview Records</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: PREVIEW & VALIDATE                               */}
          {/* ======================================================== */}
          {currentStep === 'preview_validate' && validationSummary && (
            <div className="space-y-6">
              {/* Section E Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                    Total Records
                  </span>
                  <span className="text-xl font-black text-[#181716] mt-0.5 block">
                    {validationSummary.totalRows}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">Found in file</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                    Ready to Import
                  </span>
                  <span className="text-xl font-black text-emerald-900 mt-0.5 block">
                    {validationSummary.readyCount}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">100% Validated</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                    Require Attention
                  </span>
                  <span className="text-xl font-black text-amber-900 mt-0.5 block">
                    {validationSummary.attentionCount}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Missing required info</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                    Missing Optional
                  </span>
                  <span className="text-xl font-black text-blue-900 mt-0.5 block">
                    {validationSummary.missingOptionalCount}
                  </span>
                  <span className="text-[10px] text-blue-700 font-medium">GPS / Photo / Traffic</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                    Existing Matches
                  </span>
                  <span className="text-xl font-black text-purple-900 mt-0.5 block">
                    {validationSummary.conflictExistingCount}
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">Existing in database</span>
                </div>
              </div>

              {/* Section G: Existing Billboard Matching Controls */}
              {validationSummary.conflictExistingCount > 0 && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                      <RefreshCw className="w-4 h-4 text-purple-700" />
                      <span>Existing Billboard IDs Found ({validationSummary.conflictExistingCount})</span>
                    </div>
                    <p className="text-[11px] text-purple-800 mt-0.5">
                      Adgrid uses the Billboard ID as a stable identifier. Choose how you want to handle existing records:
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGlobalConflictChange('update')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        globalConflictResolution === 'update'
                          ? 'bg-purple-700 text-white shadow-2xs'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Update Existing Records
                    </button>
                    <button
                      onClick={() => handleGlobalConflictChange('skip')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        globalConflictResolution === 'skip'
                          ? 'bg-purple-700 text-white shadow-2xs'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Skip Existing Records
                    </button>
                  </div>
                </div>
              )}

              {/* Section L: Protected Booking Alert */}
              {validationSummary.protectedBookingsCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-extrabold">{validationSummary.protectedBookingsCount} billboards</strong> have confirmed active flights or advertiser bookings. Safety protection is active: commercial contracts and PoP history will not be blindly overwritten.
                    </span>
                  </div>
                </div>
              )}

              {/* Table Tabs & Bulk Image Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 self-start">
                  <button
                    onClick={() => setActivePreviewTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePreviewTab === 'all'
                        ? 'bg-white text-[#181716] shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    All ({validationSummary.totalRows})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('ready')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePreviewTab === 'ready'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Ready ({validationSummary.readyCount})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('attention')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePreviewTab === 'attention'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Attention ({validationSummary.attentionCount})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('conflicts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePreviewTab === 'conflicts'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Existing Matches ({validationSummary.conflictExistingCount})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('missing_optional')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePreviewTab === 'missing_optional'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Missing Optional ({validationSummary.missingOptionalCount})
                  </button>
                </div>

                {/* Bulk Image Upload Action */}
                <button
                  onClick={() => setIsBulkImageModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#ef5a24]" />
                  <span>
                    Bulk Photo Matcher (
                    {Object.keys(attachedImageMatches).length} attached)
                  </span>
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-[#eae7e1] rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#faf9f6] z-10 border-b border-[#eae7e1] text-zinc-500 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12">#</th>
                        <th className="py-2.5 px-3">Billboard ID</th>
                        <th className="py-2.5 px-3">Asset Title & Location</th>
                        <th className="py-2.5 px-3">Type & Size</th>
                        <th className="py-2.5 px-3">Monthly Rate</th>
                        <th className="py-2.5 px-3">Completeness</th>
                        <th className="py-2.5 px-3">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eae7e1]">
                      {previewRows.map((r) => {
                        const hasError = r.errors.some((e) => e.severity === 'error');
                        const isExisting = !!r.existingBillboard;

                        return (
                          <tr
                            key={r.rowNumber}
                            className={`hover:bg-zinc-50/80 transition-colors ${
                              hasError ? 'bg-amber-50/30' : isExisting ? 'bg-purple-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-mono text-[10px] text-zinc-400">
                              {r.rowNumber}
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-xs text-[#181716] block">
                                {r.parsedBillboard.id || 'MISSING ID'}
                              </span>
                              {isExisting && (
                                <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                                  Existing Match
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 max-w-xs">
                              <p className="font-extrabold text-[#181716] truncate">
                                {r.parsedBillboard.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                {r.parsedBillboard.location} • {r.parsedBillboard.corridor}
                              </p>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-bold text-zinc-800 block truncate">
                                {r.parsedBillboard.format}
                              </span>
                              <span className="text-[10px] text-zinc-400 block">
                                {r.parsedBillboard.dimensions}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {editingRowIndex === r.rowNumber ? (
                                <input
                                  type="number"
                                  defaultValue={r.parsedBillboard.priceMonthlyUSD}
                                  onBlur={(e) => {
                                    handleInlineRowUpdate(
                                      r.rowNumber,
                                      'priceMonthlyUSD',
                                      parseFloat(e.target.value) || 0
                                    );
                                    setEditingRowIndex(null);
                                  }}
                                  className="w-24 px-2 py-1 rounded border border-[#ef5a24] text-xs font-bold"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingRowIndex(r.rowNumber)}
                                  className="cursor-pointer group flex items-center gap-1.5"
                                  title="Click to edit price"
                                >
                                  <span className="font-extrabold text-[#181716]">
                                    ${(r.parsedBillboard.priceMonthlyUSD || 0).toLocaleString()}
                                  </span>
                                  <Edit2 className="w-2.5 h-2.5 text-zinc-300 group-hover:text-zinc-600" />
                                </div>
                              )}
                              <span className="text-[10px] text-zinc-400">/month</span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      r.profileCompleteness >= 80
                                        ? 'bg-emerald-500'
                                        : r.profileCompleteness >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${r.profileCompleteness}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-zinc-600">
                                  {r.profileCompleteness}%
                                </span>
                              </div>
                              {r.missingOptionalFields.length > 0 && (
                                <span className="text-[9px] text-zinc-400 block truncate max-w-[120px]">
                                  No {r.missingOptionalFields[0]}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {hasError ? (
                                <div className="space-y-0.5">
                                  {r.errors.map((err, i) => (
                                    <span
                                      key={i}
                                      className="block text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded"
                                    >
                                      {err.message}
                                    </span>
                                  ))}
                                </div>
                              ) : isExisting ? (
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={r.conflictResolution}
                                    onChange={(e) =>
                                      handleRowConflictChange(
                                        r.rowNumber,
                                        e.target.value as ConflictResolution
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg border border-purple-200 bg-white text-[11px] font-bold text-purple-900"
                                  >
                                    <option value="update">Update Record</option>
                                    <option value="skip">Skip Record</option>
                                  </select>
                                  {r.isProtectedBooking && (
                                    <span title="Active Booking Protected">
                                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Ready</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation & Action Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep('map')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Mapping</span>
                </button>

                <div className="flex items-center gap-3">
                  {validationSummary.attentionCount > 0 && (
                    <button
                      onClick={() =>
                        downloadImportErrorReport(
                          validationSummary.rows
                            .filter((r) => r.errors.length > 0)
                            .map((r) => ({
                              rowNumber: r.rowNumber,
                              billboardId: r.parsedBillboard.id || '',
                              name: r.parsedBillboard.name || '',
                              errorReason: r.errors.map((e) => e.message).join('; '),
                              status: r.status,
                            }))
                        )
                      }
                      className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Issue Report</span>
                    </button>
                  )}

                  <button
                    onClick={handleExecuteImport}
                    disabled={isProcessingImport || validationSummary.readyCount === 0 && validationSummary.conflictExistingCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isProcessingImport ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Importing Records...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Import Inventory</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: IMPORT RESULT                                    */}
          {/* ======================================================== */}
          {currentStep === 'result' && importResultStats && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#181716] tracking-tight">
                  Inventory Successfully Imported!
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                  Your billboard assets are now live in your Adgrid Agency Workspace and ready for campaign allocation and live proof-of-play tracking.
                </p>
              </div>

              {/* Section J Results Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                    Successfully Imported
                  </span>
                  <span className="text-2xl font-black text-emerald-950 mt-1 block">
                    {importResultStats.imported}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">New Billboards</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                    Updated
                  </span>
                  <span className="text-2xl font-black text-purple-950 mt-1 block">
                    {importResultStats.updated}
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">Existing Records</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
                    Skipped
                  </span>
                  <span className="text-2xl font-black text-zinc-700 mt-1 block">
                    {importResultStats.skipped}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">By User Choice</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                    Requires Attention
                  </span>
                  <span className="text-2xl font-black text-amber-900 mt-1 block">
                    {importResultStats.attention}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Incomplete rows</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  View in Fleet Inventory
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setRawRows([]);
                    setMappings([]);
                    setValidationSummary(null);
                    setCurrentStep('upload');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Import Another Spreadsheet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Image Matcher Sub-Modal */}
      <BulkImageUploadModal
        isOpen={isBulkImageModalOpen}
        onClose={() => setIsBulkImageModalOpen(false)}
        billboardCandidates={
          validationSummary
            ? validationSummary.rows.map((r) => ({
                id: r.parsedBillboard.id || '',
                name: r.parsedBillboard.name || '',
              }))
            : billboards.map((b) => ({ id: b.id, name: b.name }))
        }
        onApplyImages={(matches) => {
          setAttachedImageMatches((prev) => ({ ...prev, ...matches }));
        }}
      />
    </div>
  );
};
