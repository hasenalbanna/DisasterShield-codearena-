"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHazardAggregatorAi = runHazardAggregatorAi;
const imageAi_1 = require("./imageAi");
const weatherAi_1 = require("./weatherAi");
const clusterAi_1 = require("./clusterAi");
const locationAi_1 = require("./locationAi");
const riskScoring_1 = require("./riskScoring");
/**
 * Master Hazard Aggregator AI Engine:
 * Coordinates all 5 AI stages and maps the incident to one of the 4 automated routing channels.
 */
async function runHazardAggregatorAi(report, existingReportsInWard) {
    // 1. Run all sub-pipeline stages
    const [imageRes, weatherRes, clusterRes, locationRes] = await Promise.all([
        (0, imageAi_1.evaluateImageAi)(report),
        (0, weatherAi_1.evaluateWeatherAi)(report),
        (0, clusterAi_1.evaluateClusterAi)(report, existingReportsInWard),
        (0, locationAi_1.evaluateLocationAi)(report),
    ]);
    // 2. Calculate dynamic risk score
    const riskRes = (0, riskScoring_1.calculateDynamicRiskScore)(report, weatherRes, clusterRes.clusterCount);
    // 3. Aggregate composite confidence score
    const weatherScore = weatherRes.weatherSupport ? 1.0 : 0.4;
    const rawConfidence = (imageRes.imageConfidence * 0.40) +
        (locationRes.antiSpoofScore * 0.25) +
        (weatherScore * 0.20) +
        clusterRes.densityBoost;
    const totalConfidence = Math.min(0.99, Math.max(0.10, Math.round(rawConfidence * 100) / 100));
    // 4. Automated 4-Channel Routing Logic (Master Spec Section 4.2)
    let assignedStatus = "PUBLISHED";
    let reasoning = "";
    if (totalConfidence < 0.45) {
        assignedStatus = "REJECTED_HOAX";
        reasoning = "AI Confidence below 45% threshold. Flagged for manual audit or rejected.";
    }
    else if (totalConfidence >= 0.45 && totalConfidence < 0.75) {
        assignedStatus = "NEED_MORE_INFO";
        reasoning = `Confidence ${(totalConfidence * 100).toFixed(0)}% is between 45% and 75%. Verification request automatically dispatched to nearby users.`;
    }
    else {
        // Confidence is >= 75%
        if (riskRes.urgencyScore >= 8.0 || clusterRes.clusterCount >= 4) {
            assignedStatus = "AREA_ALERT";
            reasoning = `Critical urgency (${riskRes.urgencyScore}/10) or high cluster density (${clusterRes.clusterCount} reports). Area Alert broadcasted to ward.`;
        }
        else if (report.category === "POWER_HAZARD" ||
            report.category === "FALLEN_TREE" ||
            report.category === "BLOCKED_ROAD" ||
            report.category === "STRUCTURE_DAMAGE") {
            assignedStatus = "COUNCIL_TICKET";
            reasoning = `Infrastructure hazard verified with ${(totalConfidence * 100).toFixed(0)}% confidence. Electronic municipal work order generated.`;
        }
        else {
            assignedStatus = "PUBLISHED";
            reasoning = `Verified with ${(totalConfidence * 100).toFixed(0)}% confidence. Pinned to citizen live maps.`;
        }
    }
    return {
        imageConfidence: totalConfidence,
        hazardDetected: imageRes.hazardDetected,
        isAuthentic: imageRes.isAuthentic,
        locationMatch: locationRes.locationMatch,
        weatherSupport: weatherRes.weatherSupport,
        clusterCount: clusterRes.clusterCount,
        urgencyScore: riskRes.urgencyScore,
        assignedStatus,
        reasoning: `${reasoning} | ${riskRes.formulaBreakdown}`,
        processedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=hazardAggregator.js.map