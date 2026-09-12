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

export interface HazardDocument {
  id: string;
  hazardId: string;
  reportedBy: string;
  reporterName?: string;
  reporterTrustScore?: number;
  category: HazardCategory;
  coordinates: GeoCoordinates;
  geohash: string;
  ward: string;
  description?: string;
  mediaUrl: string;
  audioMemoUrl?: string;
  aiAnalysis: AiAnalysisResult;
  status: HazardStatus;
  assignedCrewId?: string;
  dispatchNotes?: string;
  councilTicketId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyCaseDocument {
  caseId: string;
  userId: string;
  callerName: string;
  callerPhone: string;
  coordinates: GeoCoordinates;
  ward: string;
  triggerType: 'VOICE_DISTRESS' | 'SOS_BUTTON' | 'AI_ESCALATION';
  audioClipUrl?: string;
  transcript?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'QUEUED' | 'PRIORITY_DISPATCHED' | 'CREW_EN_ROUTE' | 'RESCUED';
  assignedCrewId?: string;
  timestamp: string;
}

export interface CouncilTicketDocument {
  ticketId: string;
  hazardId: string;
  department: 'MUNICIPAL_WORKS' | 'ELECTRICITY_BOARD' | 'DRAINAGE_IRRIGATION' | 'EMERGENCY_SERVICES';
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  ward: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  slaHours: number;
  resolutionPhotoUrl?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface WardAlertDocument {
  alertId: string;
  ward: string;
  title: string;
  message: string;
  evacuationRoutes: string[];
  safeShelters: Array<{
    shelterId: string;
    name: string;
    address: string;
    capacity: number;
    occupancy: number;
  }>;
  severity: 'WARNING' | 'EMERGENCY' | 'EVACUATION_MANDATE';
  issuedAt: string;
  expiresAt: string;
}
