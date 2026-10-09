import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Search,
  Sparkles,
  Link,
  ChevronRight,
} from 'lucide-react';
import {
  matchUploadedImages,
  StagedImageFile,
} from '../../../../utils/imageMatcher';

interface BulkImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  billboardCandidates: Array<{ id: string; name: string; flightId?: string }>;
  onApplyImages: (matches: Record<string, string>) => void; // billboardId -> previewUrl
}

export const BulkImageUploadModal: React.FC<BulkImageUploadModalProps> = ({
  isOpen,
  onClose,
  billboardCandidates,
  onApplyImages,
}) => {
  const [stagedImages, setStagedImages] = useState<StagedImageFile[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualPickerImageId, setManualPickerImageId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const result = matchUploadedImages(fileArray, billboardCandidates);
    setStagedImages(result.stagedImages);
    setMatchedCount(result.matchedCount);
    setUnmatchedCount(result.unmatchedCount);
  };

  const handleManualAssign = (imageId: string, targetBillboardId: string) => {
    const candidate = billboardCandidates.find((b) => b.id === targetBillboardId);
    if (!candidate) return;

    setStagedImages((prev) =>
      prev.map((img) => {
        if (img.id === imageId) {
          const wasMatched = !!img.matchedBillboardId;
          if (!wasMatched) {
            setMatchedCount((c) => c + 1);
            setUnmatchedCount((c) => Math.max(0, c - 1));
          }
          return {
            ...img,
            matchedBillboardId: candidate.id,
            matchedBillboardName: candidate.name,
            matchType: 'manual',
          };
        }
        return img;
      })
    );
    setManualPickerImageId(null);
  };

  const handleApply = () => {
    const matchesMap: Record<string, string> = {};
    stagedImages.forEach((img) => {
      if (img.matchedBillboardId) {
        matchesMap[img.matchedBillboardId] = img.previewUrl;
      }
    });
    onApplyImages(matchesMap);
    onClose();
  };

  const filteredImages = stagedImages.filter((img) => {
    if (activeFilter === 'matched' && !img.matchedBillboardId) return false;
    if (activeFilter === 'unmatched' && img.matchedBillboardId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (img.matchedBillboardName || '').toLowerCase();
      const matchId = (img.matchedBillboardId || '').toLowerCase();
      const fileName = img.fileName.toLowerCase();
      return fileName.includes(q) || matchName.includes(q) || matchId.includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#eae7e1] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eae7e1] flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#181716] tracking-tight">
                Bulk Billboard Photo Matcher
              </h2>
              <p className="text-xs text-zinc-500">
                Upload billboard photos in bulk. Adgrid matches images by Billboard ID, filename, or reference number.
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

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {stagedImages.length === 0 ? (
            /* Upload State */
            <div className="border-2 border-dashed border-zinc-200 hover:border-[#ef5a24] rounded-2xl p-12 text-center bg-zinc-50/50 hover:bg-[#fff9f6] transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-xs border border-zinc-200 flex items-center justify-center text-[#ef5a24] mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-extrabold text-[#181716]">
                Drop multiple billboard photos here
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Name your photos like <span className="font-mono text-zinc-700 font-bold">LOS-DOOH-101.jpg</span> or descriptive names like <span className="font-mono text-zinc-700 font-bold">lekki_toll_gantry.png</span> for automatic high-confidence matching.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181716] text-white text-xs font-bold shadow-xs">
                <span>Browse Images</span>
              </div>
            </div>
          ) : (
            /* Matched Results & Review State */
            <div className="space-y-4">
              {/* Match Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                    Total Uploaded
                  </span>
                  <span className="text-xl font-black text-[#181716] mt-0.5 block">
                    {stagedImages.length} Images
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                      Matched
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xl font-black text-emerald-900 mt-0.5 block">
                    {matchedCount} Matched
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                      Unmatched
                    </span>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-xl font-black text-amber-900 mt-0.5 block">
                    {unmatchedCount} Unmatched
                  </span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 self-start">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-white text-[#181716] shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    All ({stagedImages.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('matched')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeFilter === 'matched'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Matched ({matchedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('unmatched')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeFilter === 'unmatched'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Unmatched ({unmatchedCount})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search file or billboard..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-[#181716] focus:outline-none focus:ring-1 focus:ring-[#ef5a24]"
                  />
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition-all ${
                      img.matchedBillboardId
                        ? 'bg-white border-zinc-200 hover:border-emerald-400'
                        : 'bg-amber-50/30 border-amber-200'
                    }`}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      <img
                        src={img.previewUrl}
                        alt={img.fileName}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          img.matchedBillboardId
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {img.matchedBillboardId ? 'MATCHED' : 'UNMATCHED'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#181716] truncate" title={img.fileName}>
                        {img.fileName}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {(img.sizeBytes / 1024).toFixed(0)} KB
                      </p>

                      {img.matchedBillboardId ? (
                        <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                            Matched to {img.matchedBillboardId}
                          </span>
                          <p className="text-[11px] font-bold text-emerald-950 truncate mt-0.5">
                            {img.matchedBillboardName}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {manualPickerImageId === img.id ? (
                            <div className="space-y-1.5">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) handleManualAssign(img.id, e.target.value);
                                }}
                                defaultValue=""
                                className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-[#181716] focus:ring-1 focus:ring-[#ef5a24]"
                              >
                                <option value="" disabled>
                                  Choose billboard...
                                </option>
                                {billboardCandidates.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.id} — {b.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setManualPickerImageId(null)}
                                className="text-[10px] font-bold text-zinc-500 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setManualPickerImageId(img.id)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Link className="w-3 h-3" />
                              <span>Assign to Billboard</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#eae7e1] flex items-center justify-between bg-[#faf9f6]">
          {stagedImages.length > 0 && (
            <button
              onClick={() => {
                setStagedImages([]);
                setMatchedCount(0);
                setUnmatchedCount(0);
              }}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer"
            >
              Reset & Upload Different Files
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
            {stagedImages.length > 0 && (
              <button
                onClick={handleApply}
                disabled={matchedCount === 0}
                className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Apply {matchedCount} Matched Photos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
