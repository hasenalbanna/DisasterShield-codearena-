import { HazardCategory, RawHazardInput } from "../types/models";
import { WeatherAiResult } from "./weatherAi";

export interface RiskCalculationResult {
  urgencyScore: number; // 1.0 to 10.0
  hazardTypeScore: number;
  populationRiskScore: number;
  waterTrendScore: number;
  formulaBreakdown: string;
}

/**
 * Stage 5: Multi-Criteria Risk Scoring Engine
 * Computes: Risk(u) = w1 * R_type + w2 * P_risk + w3 * Water_trend
 */
export function calculateDynamicRiskScore(
  report: RawHazardInput,
  weather: WeatherAiResult,
  clusterCount: number
): RiskCalculationResult {
  // 1. Hazard Type Severity R_type (1.0 to 10.0)
  const severityTable: Record<HazardCategory, number> = {
    SEVERE_FLOOD: 9.2,
    LANDSLIDE: 9.0,
    POWER_HAZARD: 8.5,
    STRUCTURE_DAMAGE: 7.8,
    BLOCKED_ROAD: 6.5,
    FALLEN_TREE: 5.2,
  };
  const R_type = severityTable[report.category] || 6.0;

  // 2. Population & Ward Vulnerability Index P_risk (1.0 to 10.0)
  // Higher if cluster density indicates high populated area
  let P_risk = 6.0;
  if (clusterCount >= 5) {
    P_risk = 9.5;
  } else if (clusterCount >= 3) {
    P_risk = 8.0;
  } else if (clusterCount === 2) {
    P_risk = 7.0;
  }

  // 3. Water Trend & Environmental Surge Water_trend (1.0 to 10.0)
  let Water_trend = 4.0;
  if (weather.riverSurgeRateCmPerHr > 10.0 || weather.rainfallRateMmPerHr > 30.0) {
    Water_trend = 9.5;
  } else if (weather.riverSurgeRateCmPerHr > 5.0 || weather.rainfallRateMmPerHr > 15.0) {
    Water_trend = 7.5;
  } else if (weather.stormAlertActive) {
    Water_trend = 6.0;
  }

  // Weights (w1 = 0.50, w2 = 0.25, w3 = 0.25)
  const w1 = 0.50;
  const w2 = 0.25;
  const w3 = 0.25;

  const rawScore = (w1 * R_type) + (w2 * P_risk) + (w3 * Water_trend);
  const urgencyScore = Math.min(10.0, Math.max(1.0, Math.round(rawScore * 10) / 10));

  return {
    urgencyScore,
    hazardTypeScore: R_type,
    populationRiskScore: P_risk,
    waterTrendScore: Water_trend,
    formulaBreakdown: `Risk(u) = (${w1} × ${R_type}) + (${w2} × ${P_risk}) + (${w3} × ${Water_trend}) = ${urgencyScore}`,
  };
}
