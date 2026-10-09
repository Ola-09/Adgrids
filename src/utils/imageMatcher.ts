export interface StagedImageFile {
  id: string;
  file: File;
  fileName: string;
  cleanName: string;
  previewUrl: string;
  sizeBytes: number;
  matchedBillboardId?: string;
  matchedBillboardName?: string;
  matchType?: 'billboard_id' | 'name_slug' | 'manual' | 'reference';
}

export interface ImageMatchResult {
  matchedCount: number;
  unmatchedCount: number;
  totalImages: number;
  stagedImages: StagedImageFile[];
}

/**
 * Normalizes string into alphanumeric slug for fuzzy matching
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Matches a list of user-uploaded image files against billboard records
 */
export function matchUploadedImages(
  files: File[],
  billboardList: Array<{ id: string; name: string; flightId?: string }>
): ImageMatchResult {
  const stagedImages: StagedImageFile[] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  // Build lookup index
  const idMap = new Map<string, { id: string; name: string }>();
  const slugMap = new Map<string, { id: string; name: string }>();
  const refMap = new Map<string, { id: string; name: string }>();

  billboardList.forEach((b) => {
    const normId = b.id.toUpperCase().trim();
    idMap.set(normId, b);
    idMap.set(slugify(normId), b);

    if (b.name) {
      slugMap.set(slugify(b.name), b);
    }

    if (b.flightId) {
      const cleanRef = b.flightId.replace('#', '').toUpperCase().trim();
      refMap.set(cleanRef, b);
      refMap.set(slugify(cleanRef), b);
    }
  });

  files.forEach((file) => {
    // Basic image mime check
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const fileSlug = slugify(fileNameWithoutExt);
    const upperName = fileNameWithoutExt.toUpperCase().trim();

    let matched: { id: string; name: string } | undefined = undefined;
    let matchType: 'billboard_id' | 'name_slug' | 'manual' | 'reference' | undefined = undefined;

    // 1. Check exact Billboard ID
    if (idMap.has(upperName)) {
      matched = idMap.get(upperName);
      matchType = 'billboard_id';
    } else if (idMap.has(fileSlug)) {
      matched = idMap.get(fileSlug);
      matchType = 'billboard_id';
    }

    // 2. Check substring of ID
    if (!matched) {
      for (const [idKey, b] of idMap.entries()) {
        if (idKey.length >= 4 && (fileSlug.includes(idKey) || idKey.includes(fileSlug))) {
          matched = b;
          matchType = 'billboard_id';
          break;
        }
      }
    }

    // 3. Check name slug
    if (!matched) {
      if (slugMap.has(fileSlug)) {
        matched = slugMap.get(fileSlug);
        matchType = 'name_slug';
      } else {
        for (const [nameKey, b] of slugMap.entries()) {
          if (nameKey.length >= 6 && (fileSlug.includes(nameKey) || nameKey.includes(fileSlug))) {
            matched = b;
            matchType = 'name_slug';
            break;
          }
        }
      }
    }

    // 4. Check reference number
    if (!matched && refMap.has(upperName)) {
      matched = refMap.get(upperName);
      matchType = 'reference';
    }

    if (matched) {
      matchedCount++;
    } else {
      unmatchedCount++;
    }

    stagedImages.push({
      id: `img-${Math.random().toString(36).substring(2, 9)}`,
      file,
      fileName: file.name,
      cleanName: fileNameWithoutExt,
      previewUrl,
      sizeBytes: file.size,
      matchedBillboardId: matched?.id,
      matchedBillboardName: matched?.name,
      matchType,
    });
  });

  return {
    matchedCount,
    unmatchedCount,
    totalImages: stagedImages.length,
    stagedImages,
  };
}
