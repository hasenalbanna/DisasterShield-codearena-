"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAntiSpamTests = runAntiSpamTests;
const antiSpamEngine_1 = require("../ai/antiSpamEngine");
function createMockReport(overrides = {}) {
    return {
        hazardId: "hz_test_01",
        reportedBy: "usr_citizen_01",
        category: "SEVERE_FLOOD",
        coordinates: { latitude: 6.9271, longitude: 79.8612 },
        geohash: "tc3p18u",
        ward: "Ward 12",
        mediaUrl: "https://storage.googleapis.com/test/photo.jpg",
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}
function runAntiSpamTests() {
    let passed = true;
    (0, antiSpamEngine_1.clearAntiSpamCache)();
    // Test 1: Legitimate first report passes
    const rep1 = createMockReport({ hazardId: "hz_1" });
    const res1 = (0, antiSpamEngine_1.evaluateAntiSpam)(rep1, 85);
    if (res1.isSpam) {
        console.error("Test 1 Failed: Legitimate report was flagged as spam");
        passed = false;
    }
    // Test 2: Spatial duplicate (<50m, <10m)
    const repDuplicate = createMockReport({
        hazardId: "hz_dup",
        coordinates: { latitude: 6.92712, longitude: 79.86122 } // ~3 meters away
    });
    const res2 = (0, antiSpamEngine_1.evaluateAntiSpam)(repDuplicate, 85);
    if (!res2.isSpam || !res2.isDuplicate) {
        console.error("Test 2 Failed: Spatial duplicate within 10 minutes was not detected");
        passed = false;
    }
    // Test 3: Future timestamp anomaly
    (0, antiSpamEngine_1.clearAntiSpamCache)();
    const futureTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const repFuture = createMockReport({ hazardId: "hz_future", createdAt: futureTime });
    const res3 = (0, antiSpamEngine_1.evaluateAntiSpam)(repFuture, 85);
    if (!res3.isSpam || !res3.spamReason?.includes("Temporal anomaly")) {
        console.error("Test 3 Failed: Future timestamp anomaly was not detected");
        passed = false;
    }
    // Test 4: Low reputation penalty
    (0, antiSpamEngine_1.clearAntiSpamCache)();
    const repLowTrust = createMockReport({ hazardId: "hz_low" });
    const res4 = (0, antiSpamEngine_1.evaluateAntiSpam)(repLowTrust, 25); // Reputation 25/100
    if (res4.confidencePenalty <= 0) {
        console.error("Test 4 Failed: Low trust user did not receive confidence penalty");
        passed = false;
    }
    // Test 5: Rate limiting (>3 submissions in 15 mins)
    (0, antiSpamEngine_1.clearAntiSpamCache)();
    const now = Date.now();
    (0, antiSpamEngine_1.evaluateAntiSpam)(createMockReport({ hazardId: "hz_sub_1" }), 80, now);
    (0, antiSpamEngine_1.evaluateAntiSpam)(createMockReport({ hazardId: "hz_sub_2", coordinates: { latitude: 6.95, longitude: 79.88 } }), 80, now + 1000);
    (0, antiSpamEngine_1.evaluateAntiSpam)(createMockReport({ hazardId: "hz_sub_3", coordinates: { latitude: 6.96, longitude: 79.89 } }), 80, now + 2000);
    const resRateLimit = (0, antiSpamEngine_1.evaluateAntiSpam)(createMockReport({ hazardId: "hz_sub_4", coordinates: { latitude: 6.97, longitude: 79.90 } }), 80, now + 3000);
    if (!resRateLimit.isSpam || !resRateLimit.isRateLimited) {
        console.error("Test 5 Failed: Burst rate limit was not enforced");
        passed = false;
    }
    if (passed) {
        console.log("✅ All Anti-Spam Unit Tests Passed Successfully!");
    }
    return passed;
}
// Run tests if executed directly
if (require.main === module) {
    const success = runAntiSpamTests();
    process.exit(success ? 0 : 1);
}
//# sourceMappingURL=antiSpam_test.js.map