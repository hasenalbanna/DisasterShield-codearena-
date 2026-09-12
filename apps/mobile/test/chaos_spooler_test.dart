import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/services/local_storage_service.dart';
import 'package:mobile/core/models/hazard_model.dart';

void main() {
  group('Chaos Engineering & Resilience Tests', () {
    setUp(() {
      // Clear outbox queue before each test
      final queued = LocalStorageService.getQueuedReports();
      for (final report in List<Map<String, dynamic>>.from(queued)) {
        LocalStorageService.markReportSynced(report['hazardId'] as String);
      }
    });

    test('Simulated Cellular Blackout: Queues reports locally without data loss', () async {
      expect(LocalStorageService.pendingCount, 0);

      // Simulate 3 reports submitted during hurricane network sever
      final report1 = {
        'hazardId': 'hz_chaos_01',
        'category': 'SEVERE_FLOOD',
        'ward': 'Ward 12 - South District',
        'latitude': 6.9271,
        'longitude': 79.8612,
      };
      final report2 = {
        'hazardId': 'hz_chaos_02',
        'category': 'POWER_HAZARD',
        'ward': 'Crossway Blvd',
        'latitude': 6.9312,
        'longitude': 79.8584,
      };

      await LocalStorageService.queueOfflineReport(report1);
      await LocalStorageService.queueOfflineReport(report2);

      expect(LocalStorageService.pendingCount, 2);

      final queued = LocalStorageService.getQueuedReports();
      expect(queued.length, 2);
      expect(queued[0]['hazardId'], 'hz_chaos_01');
      expect(queued[1]['hazardId'], 'hz_chaos_02');
      expect(queued[0]['queuedAt'], isNotNull);
    });

    test('Network Restoration: Flushes outbox and marks reports synced idempotently', () async {
      await LocalStorageService.queueOfflineReport({
        'hazardId': 'hz_chaos_03',
        'category': 'FALLEN_TREE',
      });

      expect(LocalStorageService.pendingCount, 1);

      // Simulate connection restored -> synced to cloud
      LocalStorageService.markReportSynced('hz_chaos_03');

      expect(LocalStorageService.pendingCount, 0);
      expect(LocalStorageService.getQueuedReports().isEmpty, isTrue);
    });

    test('Offline Hazard Cache: Preserves active hazards for offline map pan/zoom', () {
      final sampleHazards = [
        HazardModel(
          id: 'hz_cache_01',
          hazardId: 'hz_cache_01',
          reportedBy: 'usr_test',
          category: 'SEVERE_FLOOD',
          coordinates: const GeoCoordinates(latitude: 6.9271, longitude: 79.8612),
          geohash: 'tc3p18u',
          ward: 'Ward 12',
          mediaUrl: 'https://example.com/photo.jpg',
          status: 'PUBLISHED',
          createdAt: DateTime.now(),
        ),
      ];

      LocalStorageService.cacheHazards(sampleHazards);
      final retrieved = LocalStorageService.getCachedHazards();

      expect(retrieved.length, 1);
      expect(retrieved.first.hazardId, 'hz_cache_01');
      expect(retrieved.first.ward, 'Ward 12');
    });
  });
}
