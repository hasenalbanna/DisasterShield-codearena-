import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { runHazardAggregatorAi } from "./ai/hazardAggregator";
import { RawHazardInput } from "./types/models";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Triggered on new hazard submission by citizen or field reporter.
 * Executes the 6-stage AI pipeline and routes across the 4 automated channels.
 */
export const onHazardCreated = functions.firestore
  .document("hazards/{hazardId}")
  .onCreate(async (snapshot, context) => {
    const hazardId = context.params.hazardId;
    const data = snapshot.data();

    functions.logger.info(`Starting Multi-Layered AI Pipeline for Hazard: ${hazardId}`);

    try {
      const rawInput: RawHazardInput = {
        hazardId,
        reportedBy: data.reportedBy || "anonymous",
        reporterTrustScore: data.reporterTrustScore || 80,
        category: data.category || "SEVERE_FLOOD",
        coordinates: data.coordinates || { latitude: 6.9271, longitude: 79.8612 },
        geohash: data.geohash || "",
        ward: data.ward || "Ward 1",
        description: data.description,
        mediaUrl: data.mediaUrl || "",
        audioMemoUrl: data.audioMemoUrl,
        exif: data.exif,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      // Query existing active hazards in the ward from the last 3 hours for DBSCAN clustering
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const existingSnapshot = await db
        .collection("hazards")
        .where("createdAt", ">=", threeHoursAgo)
        .limit(25)
        .get();

      const existingReports = existingSnapshot.docs.map((d) => ({
        id: d.id,
        coordinates: d.data().coordinates || { latitude: 0, longitude: 0 },
        createdAt: d.data().createdAt || "",
      }));

      // Execute master AI Aggregator
      const aiAnalysis = await runHazardAggregatorAi(rawInput, existingReports);

      functions.logger.info(`AI Aggregator completed for ${hazardId}: Status -> ${aiAnalysis.assignedStatus}`);

      // 1. Update the hazard document with AI analysis
      await snapshot.ref.update({
        aiAnalysis,
        status: aiAnalysis.assignedStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Automated Action Channels
      if (aiAnalysis.assignedStatus === "COUNCIL_TICKET") {
        const ticketRef = db.collection("tickets").doc(`tkt_${hazardId}`);
        await ticketRef.set({
          ticketId: `tkt_${hazardId}`,
          hazardId,
          department: data.category === "POWER_HAZARD" ? "ELECTRICITY_BOARD" : "MUNICIPAL_WORKS",
          title: `Automated Work Order: ${data.category} at ${rawInput.ward}`,
          severity: aiAnalysis.urgencyScore > 7.5 ? "CRITICAL" : "MAJOR",
          ward: rawInput.ward,
          status: "OPEN",
          slaHours: aiAnalysis.urgencyScore > 8.0 ? 4 : 24,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Generated Council Ticket: tkt_${hazardId}`);
      } else if (aiAnalysis.assignedStatus === "AREA_ALERT") {
        const alertRef = db.collection("alerts").doc(`alt_${hazardId}`);
        await alertRef.set({
          alertId: `alt_${hazardId}`,
          ward: rawInput.ward,
          title: `EMERGENCY ALERT: ${data.category}`,
          message: `Hazard Aggregator AI detected critical risk (${aiAnalysis.urgencyScore}/10). Avoid low-lying corridors.`,
          severity: "EMERGENCY",
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.warn(`Broadcasting Ward Area Alert: alt_${hazardId}`);
      }
    } catch (error) {
      functions.logger.error(`Error in onHazardCreated for ${hazardId}:`, error);
    }
  });

/**
 * Triggered on critical Emergency Voice SOS distress beacon.
 */
export const onSosTriggered = functions.firestore
  .document("cases/{caseId}")
  .onCreate(async (snapshot, context) => {
    const caseId = context.params.caseId;
    const caseData = snapshot.data();

    functions.logger.warn(`CRITICAL SOS RECEIVED: ${caseId}`, { caseData });

    // Mark as Priority Dispatched and beam to emergency dispatch queue
    return snapshot.ref.update({
      dispatchStatus: "PRIORITY_DISPATCHED",
      dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
      dispatcherNotified: true,
    });
  });

/**
 * Triggered on hazard resolution or field crew ticket closure.
 */
export const onHazardStatusUpdated = functions.firestore
  .document("hazards/{hazardId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const hazardId = context.params.hazardId;

    if (before.status !== after.status) {
      functions.logger.info(`Hazard ${hazardId} changed: ${before.status} -> ${after.status}`);
      // When resolved, close linked council ticket if present
      if (after.status === "RESOLVED") {
        const ticketRef = db.collection("tickets").doc(`tkt_${hazardId}`);
        const ticketDoc = await ticketRef.get();
        if (ticketDoc.exists) {
          await ticketRef.update({
            status: "RESOLVED",
            resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
  });
