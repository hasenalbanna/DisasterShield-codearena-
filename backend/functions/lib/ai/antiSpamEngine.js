"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAntiSpam = evaluateAntiSpam;
exports.clearAntiSpamCache = clearAntiSpamCache;
// In-memory telemetry cache for active sliding window detection
const recentSubmissionsCache = [];
/**
 * Calculates distance in meters between two coordinates using Haversine formula
 */
function getDistanceMeters(c1, c2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(c2.latitude - c1.latitude);
    const dLon = toRad(c2.longitude - c1.longitude);
    const lat1 = toRad(c1.latitude);
    const lat2 = toRad(c2.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Evaluates a hazard submission against multi-tier anti-spam and false-report mitigation rules
 * per Master Engineering Specification Section 7.2.
 */
function evaluateAntiSpam(report, userReputationScore = 85, currentTimeMs = Date.now()) {
    const userSubmissions = recentSubmissionsCache.filter((s) => s.reportedBy === report.reportedBy && currentTimeMs - s.timestamp < 15 * 60 * 1000 // 15 mins window
    );
    // 1. Device / User Rate Limiting Check (> 3 reports in 15 mins)
    if (userSubmissions.length >= 3) {
        return {
            isSpam: true,
            spamReason: "Rate limit exceeded: More than 3 submissions within 15 minutes.",
            confidencePenalty: 0.60,
            reputationModifier: -10,
            isRateLimited: true,
            isDuplicate: false,
        };
    }
    // 2. Spatial & Temporal Deduplication (< 50m within 10 minutes)
    const isDuplicate = userSubmissions.some((s) => {
        const dist = getDistanceMeters(s.coordinates, report.coordinates);
        const timeDiff = currentTimeMs - s.timestamp;
        return dist < 50 && timeDiff < 10 * 60 * 1000;
    });
    if (isDuplicate) {
        return {
            isSpam: true,
            spamReason: "Duplicate incident: Identical location submitted within 10 minutes.",
            confidencePenalty: 0.50,
            reputationModifier: -5,
            isRateLimited: false,
            isDuplicate: true,
        };
    }
    // 3. EXIF Timestamp Sanity Check
    const rawTimeStr = report.exif?.timestamp || report.createdAt;
    const reportTime = new Date(rawTimeStr).getTime();
    if (reportTime > currentTimeMs + 5 * 60 * 1000) {
        // Timestamp is more than 5 minutes in the future
        return {
            isSpam: true,
            spamReason: "Temporal anomaly: Image timestamp indicates future creation date.",
            confidencePenalty: 0.70,
            reputationModifier: -15,
            isRateLimited: false,
            isDuplicate: false,
        };
    }
    if (currentTimeMs - reportTime > 48 * 60 * 60 * 1000) {
        // Timestamp is older than 48 hours
        return {
            isSpam: true,
            spamReason: "Stale media: Photo EXIF indicates image was captured over 48 hours ago.",
            confidencePenalty: 0.40,
            reputationModifier: -5,
            isRateLimited: false,
            isDuplicate: false,
        };
    }
    // 4. Reputation Score Gating
    let confidencePenalty = 0.0;
    let reputationModifier = 0;
    if (userReputationScore < 40) {
        // Low trust user: heavily penalize so it won't auto-publish without multiple neighbor corroborations
        confidencePenalty = 0.35;
        reputationModifier = 0;
    }
    else if (userReputationScore >= 90) {
        // High credibility citizen: slight trust boost
        confidencePenalty = -0.05;
        reputationModifier = +1;
    }
    // Record valid submission into active sliding window
    recentSubmissionsCache.push({
        reportedBy: report.reportedBy,
        coordinates: report.coordinates,
        timestamp: currentTimeMs,
    });
    // Keep cache prune to last 200 items
    if (recentSubmissionsCache.length > 200) {
        recentSubmissionsCache.splice(0, recentSubmissionsCache.length - 200);
    }
    return {
        isSpam: false,
        confidencePenalty,
        reputationModifier,
        isRateLimited: false,
        isDuplicate: false,
    };
}
/**
 * Helper to reset cache (used in testing environments)
 */
function clearAntiSpamCache() {
    recentSubmissionsCache.length = 0;
}
//# sourceMappingURL=antiSpamEngine.js.map