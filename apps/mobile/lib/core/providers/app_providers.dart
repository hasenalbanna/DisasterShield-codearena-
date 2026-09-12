import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/hazard_model.dart';
import '../services/location_service.dart';
import '../services/firebase_hazard_service.dart';
import '../services/local_storage_service.dart';

/// Riverpod 3 Notifier for ThemeMode
class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.light;

  void toggle() {
    state = (state == ThemeMode.light) ? ThemeMode.dark : ThemeMode.light;
  }

  void setMode(ThemeMode mode) {
    state = mode;
  }
}

final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>(() {
  return ThemeModeNotifier();
});

/// Navigation Shell Tab Index Notifier
class BottomNavNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setIndex(int index) {
    state = index;
  }
}

final bottomNavIndexProvider = NotifierProvider<BottomNavNotifier, int>(() {
  return BottomNavNotifier();
});

/// FutureProvider for user's current GPS coordinates
final currentLocationProvider = FutureProvider<GeoCoordinates>((ref) async {
  return await LocationService.getCurrentLocation();
});

/// Focus coordinate for map auto-panning
class MapFocusNotifier extends Notifier<GeoCoordinates?> {
  @override
  GeoCoordinates? build() => null;

  void setCoordinate(GeoCoordinates? coords) {
    state = coords;
  }
}

final mapFocusCoordinateProvider = NotifierProvider<MapFocusNotifier, GeoCoordinates?>(() {
  return MapFocusNotifier();
});

/// Default initial disaster hazard catalog
final List<HazardModel> defaultIncidentCatalog = [
  HazardModel(
    id: 'hz_9982341af',
    hazardId: 'hz_9982341af',
    reportedBy: 'usr_7726158bc',
    reporterName: 'MRA Hasen (Lead Warden)',
    category: 'SEVERE_FLOOD',
    coordinates: const GeoCoordinates(latitude: 6.9271, longitude: 79.8612),
    geohash: 'tc3p18u',
    ward: 'Ward 12 - Riverbank Zone',
    description: 'Rapidly rising water level exceeding 1.2m. Bridge access submerged.',
    mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
    status: 'AREA_ALERT',
    dangerRadiusMeters: 300.0,
    verificationCount: 8,
    aiAnalysis: const AiAnalysisResult(
      imageConfidence: 0.94,
      hazardDetected: 'SEVERE_FLOOD',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: true,
      clusterCount: 5,
      urgencyScore: 8.9,
      assignedStatus: 'AREA_ALERT',
      reasoning: 'Monsoon precipitation models correlate with 5 independent cluster reports.',
    ),
    createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
  ),
  HazardModel(
    id: 'hz_8812903bc',
    hazardId: 'hz_8812903bc',
    reportedBy: 'usr_3381921de',
    reporterName: 'Field Inspector David',
    category: 'POWER_HAZARD',
    coordinates: const GeoCoordinates(latitude: 6.9312, longitude: 79.8584),
    geohash: 'tc3p19a',
    ward: 'Crossway Blvd & 5th Ave',
    description: 'High-voltage electric transmission line snapped and sparking on wet road.',
    mediaUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
    status: 'COUNCIL_TICKET',
    dangerRadiusMeters: 180.0,
    verificationCount: 4,
    aiAnalysis: const AiAnalysisResult(
      imageConfidence: 0.88,
      hazardDetected: 'LIVE_POWER_LINE',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: false,
      clusterCount: 3,
      urgencyScore: 7.6,
      assignedStatus: 'COUNCIL_TICKET',
      reasoning: 'Exposed live power wire on pedestrian sidewalk.',
    ),
    createdAt: DateTime.now().subtract(const Duration(minutes: 25)),
  ),
  HazardModel(
    id: 'hz_7719284cd',
    hazardId: 'hz_7719284cd',
    reportedBy: 'usr_9918237fa',
    reporterName: 'Citizen Sarah',
    category: 'BLOCKED_ROAD',
    coordinates: const GeoCoordinates(latitude: 6.9205, longitude: 79.8690),
    geohash: 'tc3p20b',
    ward: 'North Arterial Bypass - KM 14',
    description: 'Fallen trees and rock debris completely blocking twin northbound lanes.',
    mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800',
    status: 'PUBLISHED',
    dangerRadiusMeters: 200.0,
    verificationCount: 6,
    aiAnalysis: const AiAnalysisResult(
      imageConfidence: 0.81,
      hazardDetected: 'DEBRIS_OBSTRUCTION',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: true,
      clusterCount: 2,
      urgencyScore: 6.4,
      assignedStatus: 'PUBLISHED',
      reasoning: 'Roadway blocked by mudflow, traffic rerouted.',
    ),
    createdAt: DateTime.now().subtract(const Duration(minutes: 45)),
  ),
];

/// Global Live Hazard State Notifier
class HazardListNotifier extends Notifier<List<HazardModel>> {
  @override
  List<HazardModel> build() {
    final cached = LocalStorageService.getCachedHazards();
    if (cached.isNotEmpty) {
      return cached;
    }
    LocalStorageService.cacheHazards(defaultIncidentCatalog);
    return defaultIncidentCatalog;
  }

  /// Instantly prepend freshly submitted hazard report
  void addHazard(HazardModel hazard) {
    state = [hazard, ...state.where((h) => h.hazardId != hazard.hazardId)];
    LocalStorageService.cacheHazards(state);
  }

  /// Crowdsourced verification upvote by citizens
  void verifyHazard(String hazardId) {
    state = state.map((h) {
      if (h.hazardId == hazardId) {
        return h.copyWith(
          verificationCount: h.verificationCount + 1,
        );
      }
      return h;
    }).toList();
    LocalStorageService.cacheHazards(state);
  }

  /// Mark hazard cleared / resolved
  void resolveHazard(String hazardId) {
    state = state.map((h) {
      if (h.hazardId == hazardId) {
        return h.copyWith(status: 'RESOLVED_SAFE');
      }
      return h;
    }).toList();
    LocalStorageService.cacheHazards(state);
  }

  /// Replace or merge incoming network hazards
  void mergeHazards(List<HazardModel> incoming) {
    final existingIds = state.map((h) => h.hazardId).toSet();
    final newItems = incoming.where((h) => !existingIds.contains(h.hazardId)).toList();
    if (newItems.isNotEmpty) {
      state = [...newItems, ...state];
      LocalStorageService.cacheHazards(state);
    }
  }
}

final hazardListProvider = NotifierProvider<HazardListNotifier, List<HazardModel>>(() {
  return HazardListNotifier();
});

/// StreamProvider for streaming live hazards from Firestore
final liveHazardsProvider = StreamProvider<List<HazardModel>>((ref) {
  return FirebaseHazardService.streamLiveHazards();
});

/// Riverpod 3 Notifier for pending offline report count
class OfflineQueueNotifier extends Notifier<int> {
  @override
  int build() => LocalStorageService.pendingCount;

  void refresh() {
    state = LocalStorageService.pendingCount;
  }
}

final offlineQueueCountProvider = NotifierProvider<OfflineQueueNotifier, int>(() {
  return OfflineQueueNotifier();
});
