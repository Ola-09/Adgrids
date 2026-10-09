export type VerificationState =
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'REQUIRES_REVIEW'
  | 'REVERIFICATION_REQUESTED'
  | 'VERIFICATION_EXPIRED';

export type LocationVerificationStatus =
  | 'LOCATION_VERIFIED'
  | 'OUTSIDE_RADIUS'
  | 'LOCATION_UNAVAILABLE';

export interface EvidenceRequirement {
  type: 'photo' | 'multiple_photos' | 'wide_angle' | 'video' | 'video_360';
  label: string;
  required: boolean;
  description: string;
}

export interface VerificationAuditEvent {
  action:
    | 'ASSIGNMENT_CREATED'
    | 'AGENT_ASSIGNED'
    | 'EVIDENCE_SUBMITTED'
    | 'VERIFICATION_CALCULATED'
    | 'VERIFICATION_APPROVED'
    | 'VERIFICATION_REJECTED'
    | 'REVERIFICATION_REQUESTED'
    | 'VERIFICATION_EXPIRED';
  timestamp: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface VerificationSubmissionInput {
  taskId: string;
  agentId: string;
  agentName: string;
  capturedLat: number | null;
  capturedLng: number | null;
  capturedAccuracyMeters: number | null;
  locationPermissionDenied: boolean;
  photos: string[];
  videoUrl?: string;
  wideAngleUrl?: string;
  video360Url?: string;
  luxScore?: number;
  notes?: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
}

/**
 * Calculates Great-Circle geodesic distance between two points using the Haversine formula (in metres).
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates physical verification parameters against registered billboard location and acceptable radius.
 * Never uses IP address as primary proof of physical presence.
 */
export function evaluateVerificationSubmission(params: {
  registeredLat: number;
  registeredLng: number;
  acceptableRadiusMeters: number;
  capturedLat: number | null;
  capturedLng: number | null;
  capturedAccuracyMeters: number | null;
  locationPermissionDenied: boolean;
  requiredEvidenceTypes: string[];
  submittedPhotos: string[];
  submittedVideoUrl?: string;
  submittedWideAngleUrl?: string;
  submitted360Url?: string;
}): {
  verificationState: VerificationState;
  locationStatus: LocationVerificationStatus;
  calculatedDistanceMeters: number | null;
  verificationResult: string;
  failureReason: string | null;
} {
  const {
    registeredLat,
    registeredLng,
    acceptableRadiusMeters = 50,
    capturedLat,
    capturedLng,
    capturedAccuracyMeters,
    locationPermissionDenied,
    requiredEvidenceTypes = ['photo'],
    submittedPhotos,
    submittedVideoUrl,
    submittedWideAngleUrl,
    submitted360Url,
  } = params;

  // 1. Check if location permission was denied or coordinates are unavailable
  if (
    locationPermissionDenied ||
    capturedLat === null ||
    capturedLng === null ||
    !Number.isFinite(capturedLat) ||
    !Number.isFinite(capturedLng)
  ) {
    return {
      verificationState: 'REQUIRES_REVIEW',
      locationStatus: 'LOCATION_UNAVAILABLE',
      calculatedDistanceMeters: null,
      verificationResult: 'Location Unavailable: Physical GPS coordinates were not provided or permission was denied.',
      failureReason: 'Location permission denied by agent. Routed to compliance review (manual audit required).',
    };
  }

  // 2. Calculate precise geodesic distance
  const distanceMeters = calculateHaversineDistanceMeters(
    registeredLat,
    registeredLng,
    capturedLat,
    capturedLng
  );

  // 3. Check radius boundary
  const isWithinRadius = distanceMeters <= acceptableRadiusMeters;

  if (!isWithinRadius) {
    return {
      verificationState: 'FAILED',
      locationStatus: 'OUTSIDE_RADIUS',
      calculatedDistanceMeters: distanceMeters,
      verificationResult: `Failed: Agent location is outside acceptable radius (${distanceMeters}m away; acceptable radius: ${acceptableRadiusMeters}m).`,
      failureReason: `Agent position (${capturedLat.toFixed(5)}, ${capturedLng.toFixed(5)}) exceeds maximum permitted radius of ${acceptableRadiusMeters}m from registered billboard.`,
    };
  }

  // 4. Validate evidence completeness
  const missingEvidence: string[] = [];
  if (requiredEvidenceTypes.includes('photo') && (!submittedPhotos || submittedPhotos.length === 0)) {
    missingEvidence.push('Primary Billboard Photo');
  }
  if (requiredEvidenceTypes.includes('wide_angle') && !submittedWideAngleUrl) {
    missingEvidence.push('Wide-Angle Corridor Context Photo');
  }
  if (requiredEvidenceTypes.includes('video') && !submittedVideoUrl) {
    missingEvidence.push('Short Proof Video');
  }
  if (requiredEvidenceTypes.includes('video_360') && !submitted360Url) {
    missingEvidence.push('360° Environment Video');
  }

  if (missingEvidence.length > 0) {
    return {
      verificationState: 'REQUIRES_REVIEW',
      locationStatus: 'LOCATION_VERIFIED',
      calculatedDistanceMeters: distanceMeters,
      verificationResult: `Location verified (${distanceMeters}m, accuracy ±${capturedAccuracyMeters || 10}m), but missing required evidence.`,
      failureReason: `Missing required evidence: ${missingEvidence.join(', ')}.`,
    };
  }

  // 5. Success! Verified physical presence
  return {
    verificationState: 'VERIFIED',
    locationStatus: 'LOCATION_VERIFIED',
    calculatedDistanceMeters: distanceMeters,
    verificationResult: `Location Verified: Agent verified at site (${distanceMeters}m from registered billboard, ±${capturedAccuracyMeters || 8}m GPS accuracy). All required evidence captured.`,
    failureReason: null,
  };
}
