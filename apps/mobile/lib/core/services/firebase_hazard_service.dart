import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../models/hazard_model.dart';
import 'local_storage_service.dart';

class FirebaseHazardService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static const String _hazardsCollection = 'hazards';
  static const String _casesCollection = 'cases';

  /// Stream active hazards from Firestore in real-time
  static Stream<List<HazardModel>> streamLiveHazards() {
    try {
      return _firestore
          .collection(_hazardsCollection)
          .orderBy('createdAt', descending: true)
          .snapshots()
          .map((snapshot) {
        final list = snapshot.docs.map((doc) {
          return HazardModel.fromJson(doc.data(), doc.id);
        }).toList();

        // Update offline cache whenever online data arrives
        LocalStorageService.cacheHazards(list);
        return list;
      });
    } catch (e) {
      debugPrint('Firestore stream error: $e');
      return Stream.value(LocalStorageService.getCachedHazards());
    }
  }

  /// Submits an incident report to Firestore with offline fallback (instant 0ms responsive)
  static Future<bool> submitHazardReport(HazardModel hazard) async {
    try {
      await _firestore
          .collection(_hazardsCollection)
          .doc(hazard.hazardId)
          .set(hazard.toJson())
          .timeout(const Duration(milliseconds: 1200));
      debugPrint('Hazard successfully submitted to Firestore: ${hazard.hazardId}');
      return true;
    } catch (e) {
      debugPrint('Online submission timed out or failed, cached offline: $e');
      await LocalStorageService.queueOfflineReport(hazard.toJson());
      return false;
    }
  }

  /// Triggers a high-priority Voice Emergency SOS file in Firestore
  static Future<bool> triggerVoiceSos({
    required String userId,
    required String callerName,
    required String callerPhone,
    required GeoCoordinates coordinates,
    required String ward,
    String? transcript,
  }) async {
    final caseId = 'sos_${DateTime.now().millisecondsSinceEpoch}';
    final caseData = {
      'caseId': caseId,
      'userId': userId,
      'callerName': callerName,
      'callerPhone': callerPhone,
      'coordinates': coordinates.toJson(),
      'ward': ward,
      'triggerType': 'VOICE_DISTRESS',
      'transcript': transcript ?? 'Help, emergency assistance requested.',
      'priority': 'CRITICAL',
      'status': 'QUEUED',
      'timestamp': FieldValue.serverTimestamp(),
    };

    try {
      await _firestore.collection(_casesCollection).doc(caseId).set(caseData);
      debugPrint('Emergency SOS beamed to Firestore: $caseId');
      return true;
    } catch (e) {
      debugPrint('Failed to beam SOS online: $e');
      await LocalStorageService.queueOfflineReport({
        ...caseData,
        'hazardId': caseId,
        'isEmergencySos': true,
      });
      return false;
    }
  }
}
