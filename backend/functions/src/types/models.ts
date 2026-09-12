export type HazardCategory = 
  | 'SEVERE_FLOOD'
  | 'FALLEN_TREE'
  | 'BLOCKED_ROAD'
  | 'POWER_HAZARD'
  | 'LANDSLIDE'
  | 'STRUCTURE_DAMAGE';

export type HazardStatus = 
  | 'PENDING_AI_CHECK'
  | 'NEED_MORE_INFO'
  | 'PUBLISHED'
  | 'AREA_ALERT'
  | 'COUNCIL_TICKET'
  | 'DISPATCHED'
  | 'RESOLVED'
  | 'REJECTED_HOAX';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface ExifMetadata {
  gpsLatitude?: number;
  gpsLongitude?: number;
  timestamp?: string;
  deviceMake?: string;
  deviceModel?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface AiAnalysisResult {
  imageConfidence: number;
  hazardDetected: string;
  isAuthentic: boolean;
  locationMatch: boolean;
  weatherSupport: boolean;
  clusterCount: number;
  urgencyScore: number;
  assignedStatus: HazardStatus;
  reasoning: string;
  processedAt?: string;
}

export interface RawHazardInput {
  hazardId: string;
  reportedBy: string;
  reporterTrustScore?: number;
  category: HazardCategory;
  coordinates: GeoCoordinates;
  geohash: string;
  ward: string;
  description?: string;
  mediaUrl: string;
  audioMemoUrl?: string;
  exif?: ExifMetadata;
  createdAt: string;
}
