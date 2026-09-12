import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered whenever a citizen submits a new hazard report.
 * Ingests image, validates EXIF against device GPS, checks DBSCAN clusters,
 * queries weather API, and computes composite risk score.
 */
export const onHazardCreated = functions.firestore
  .document("hazards/{hazardId}")
  .onCreate(async (snapshot, context) => {
    const hazardData = snapshot.data();
    const hazardId = context.params.hazardId;

    functions.logger.info(`Processing AI pipeline for Hazard ID: ${hazardId}`, { hazardData });

    // AI Pipeline execution placeholder (Phase 3 implementation)
    const mockAiAnalysis = {
      imageConfidence: 0.92,
      locationMatch: true,
      weatherSupport: true,
      clusterCount: 1,
      urgencyScore: 7.8,
      assignedStatus: "PUBLISHED",
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    return snapshot.ref.update({
      aiAnalysis: mockAiAnalysis,
      status: "PUBLISHED",
    });
  });

/**
 * Triggered on critical Emergency Voice SOS beacon.
 * Escalates immediately to dispatcher queue and triggers geofenced notifications.
 */
export const onSosTriggered = functions.firestore
  .document("cases/{caseId}")
  .onCreate(async (snapshot, context) => {
    const caseData = snapshot.data();
    const caseId = context.params.caseId;

    functions.logger.warn(`EMERGENCY SOS TRIGGERED: Case ${caseId}`, { caseData });

    // Immediate dispatcher alert & SMS dispatching placeholder
    return snapshot.ref.update({
      dispatchStatus: "PRIORITY_DISPATCHED",
      dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

/**
 * Triggered on hazard lifecycle change (e.g. Field Crew resolving a case).
 */
export const onHazardStatusUpdated = functions.firestore
  .document("hazards/{hazardId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const hazardId = context.params.hazardId;

    if (before.status !== after.status) {
      functions.logger.info(`Hazard ${hazardId} transitioned: ${before.status} -> ${after.status}`);
      // Push notification broadcast placeholder
    }
  });
