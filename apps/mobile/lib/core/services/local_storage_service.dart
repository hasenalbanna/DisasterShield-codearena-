import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/hazard_model.dart';

class LocalStorageService {
  // In-memory persistent fallback queue for reports submitted while offline
  static final List<Map<String, dynamic>> _offlineQueue = [];
  static final List<HazardModel> _cachedHazards = [];

  /// Queues an offline incident report payload for background sync
  static Future<void> queueOfflineReport(Map<String, dynamic> reportData) async {
    reportData['queuedAt'] = DateTime.now().toIso8601String();
    _offlineQueue.add(reportData);
    debugPrint('Report queued offline. Total queued: ${_offlineQueue.length}');
  }

  /// Returns all queued offline reports
  static List<Map<String, dynamic>> getQueuedReports() {
    return List.unmodifiable(_offlineQueue);
  }

  /// Removes a synced report from the offline queue
  static void markReportSynced(String hazardId) {
    _offlineQueue.removeWhere((item) => item['hazardId'] == hazardId);
  }

  /// Returns count of pending offline reports
  static int get pendingCount => _offlineQueue.length;

  /// Cache active hazards locally for offline map display
  static void cacheHazards(List<HazardModel> hazards) {
    _cachedHazards.clear();
    _cachedHazards.addAll(hazards);
  }

  /// Retrieve cached hazards for zero-connectivity scenarios
  static List<HazardModel> getCachedHazards() {
    return List.unmodifiable(_cachedHazards);
  }

  /// Serializes offline cache to JSON
  static String exportCacheJson() {
    return jsonEncode({
      'queuedReports': _offlineQueue,
      'cachedCount': _cachedHazards.length,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
}
