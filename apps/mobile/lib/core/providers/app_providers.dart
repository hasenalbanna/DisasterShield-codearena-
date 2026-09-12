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

/// FutureProvider for user's current GPS coordinates
final currentLocationProvider = FutureProvider<GeoCoordinates>((ref) async {
  return await LocationService.getCurrentLocation();
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
