import { GeoCoordinates, RawHazardInput } from "../types/models";

export interface ClusterResult {
  clusterCount: number;
  nearbyHazardIds: string[];
  densityBoost: number;
  notes: string;
}

/**
 * Calculates distance in meters between two geographic coordinates via Haversine formula
 */
export function calculateHaversineDistanceMeters(coord1: GeoCoordinates, coord2: GeoCoordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * DBSCAN Spatial Cluster Engine:
 * Identifies spatial clusters within epsilon = 200m and time window = 3 hours (180 mins).
 */
export async function evaluateClusterAi(
  currentReport: RawHazardInput,
  existingReports: Array<{ id: string; coordinates: GeoCoordinates; createdAt: string }>
): Promise<ClusterResult> {
  const EPSILON_METERS = 200; // 200m spatial proximity
  const TIME_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours

  const currentReportTime = new Date(currentReport.createdAt).getTime();
  const nearbyHazardIds: string[] = [];

  for (const existing of existingReports) {
    if (existing.id === currentReport.hazardId) continue;

    const existingTime = new Date(existing.createdAt).getTime();
    const timeDelta = Math.abs(currentReportTime - existingTime);

    if (timeDelta <= TIME_WINDOW_MS) {
      const distance = calculateHaversineDistanceMeters(currentReport.coordinates, existing.coordinates);
      if (distance <= EPSILON_METERS) {
        nearbyHazardIds.push(existing.id);
      }
    }
  }

  // Cluster count includes current report + all nearby verified reports
  const clusterCount = nearbyHazardIds.length + 1;

  // Multiplier boost for high-density clusters
  let densityBoost = 0.0;
  if (clusterCount >= 5) {
    densityBoost = 0.20;
  } else if (clusterCount >= 3) {
    densityBoost = 0.12;
  } else if (clusterCount === 2) {
    densityBoost = 0.05;
  }

  return {
    clusterCount,
    nearbyHazardIds,
    densityBoost,
    notes: clusterCount > 1 
      ? `DBSCAN spatial cluster detected: ${clusterCount} correlated reports within 200m radius.`
      : "Isolated report: no nearby reports detected within 200m window.",
  };
}
