import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../models/hazard_model.dart';

class LocationService {
  // Default coordinate fallback (Colombo municipal center)
  static const GeoCoordinates defaultCoordinates = GeoCoordinates(
    latitude: 6.9271,
    longitude: 79.8612,
  );

  /// Requests permissions and retrieves the user's current GPS position
  static Future<GeoCoordinates> getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        debugPrint('Location services are disabled; using fallback coordinates.');
        return defaultCoordinates;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          debugPrint('Location permissions denied; using fallback.');
          return defaultCoordinates;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        debugPrint('Location permissions permanently denied.');
        return defaultCoordinates;
      }

      final Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );

      return GeoCoordinates(
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        accuracy: position.accuracy,
      );
    } catch (e) {
      debugPrint('Error getting GPS coordinates: $e');
      return defaultCoordinates;
    }
  }

  /// Calculates distance in meters between two coordinates
  static double distanceBetween(GeoCoordinates start, GeoCoordinates end) {
    return Geolocator.distanceBetween(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
    );
  }
}
