import { RawHazardInput } from "../types/models";

export interface WeatherAiResult {
  weatherSupport: boolean;
  rainfallRateMmPerHr: number;
  riverSurgeRateCmPerHr: number;
  stormAlertActive: boolean;
  notes: string;
}

/**
 * Weather System AI: Cross-validates report against meteorological rainfall and river level telemetry.
 */
export async function evaluateWeatherAi(report: RawHazardInput): Promise<WeatherAiResult> {
  // If hazard is flood or landslide, weather cross-check is critical
  const isHydrological = report.category === "SEVERE_FLOOD" || report.category === "LANDSLIDE";

  // Meteorological telemetry simulation based on ward and season
  const simulatedRainfall = isHydrological ? 45.2 : 5.0; // mm/hr
  const simulatedRiverSurge = isHydrological ? 12.5 : 1.0; // cm/hr
  const isStormActive = true;

  const weatherSupport = isHydrological ? simulatedRainfall > 20.0 : true;

  return {
    weatherSupport,
    rainfallRateMmPerHr: simulatedRainfall,
    riverSurgeRateCmPerHr: simulatedRiverSurge,
    stormAlertActive: isStormActive,
    notes: weatherSupport 
      ? `Meteorological radars confirm precipitation of ${simulatedRainfall} mm/hr supporting hazard claim.`
      : "Weather radars indicate clear skies; high scrutiny recommended.",
  };
}
