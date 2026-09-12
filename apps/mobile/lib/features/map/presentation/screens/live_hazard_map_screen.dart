import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/models/hazard_model.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/location_service.dart';

class LiveHazardMapScreen extends ConsumerStatefulWidget {
  const LiveHazardMapScreen({super.key});

  @override
  ConsumerState<LiveHazardMapScreen> createState() => _LiveHazardMapScreenState();
}

class _LiveHazardMapScreenState extends ConsumerState<LiveHazardMapScreen> {
  final MapController _mapController = MapController();
  String _selectedCategory = 'ALL';
  double _selectedRadiusKm = 5.0;
  bool _isTickerVisible = true;

  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(currentLocationProvider);
    final allHazards = ref.watch(hazardListProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final userCoords = locationAsync.value ?? LocationService.defaultCoordinates;
    final userCenter = LatLng(userCoords.latitude, userCoords.longitude);

    // Auto-focus map if a coordinate was signaled by Incident Reporter
    ref.listen<GeoCoordinates?>(mapFocusCoordinateProvider, (prev, next) {
      if (next != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _mapController.move(LatLng(next.latitude, next.longitude), 15.2);
          ref.read(mapFocusCoordinateProvider.notifier).setCoordinate(null);
        });
      }
    });

    // Filter by Category and Radius
    final filteredHazards = allHazards.where((h) {
      if (_selectedCategory != 'ALL' && h.category != _selectedCategory) {
        return false;
      }
      final distanceMeters = LocationService.distanceBetween(
        userCoords,
        h.coordinates,
      );
      return (distanceMeters / 1000) <= _selectedRadiusKm;
    }).toList();

    // Find closest critical threat for the top alert ticker
    HazardModel? closestHazard;
    double closestDistanceMeters = double.infinity;
    for (final h in allHazards) {
      if (h.status != 'RESOLVED_SAFE') {
        final dist = LocationService.distanceBetween(userCoords, h.coordinates);
        if (dist < closestDistanceMeters) {
          closestDistanceMeters = dist;
          closestHazard = h;
        }
      }
    }

    return Scaffold(
      body: Stack(
        children: [
          // 1. Fullscreen Interactive Vector Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: userCenter,
              initialZoom: 14.2,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.falcon.disastershield',
              ),

              // Danger Perimeter Radius Circles for each active hazard
              CircleLayer(
                circles: [
                  // User 5km Geofence Radar Circle
                  CircleMarker(
                    point: userCenter,
                    color: const Color(0xFF2563EB).withValues(alpha: 0.05),
                    borderColor: const Color(0xFF2563EB).withValues(alpha: 0.3),
                    borderStrokeWidth: 1.5,
                    useRadiusInMeter: true,
                    radius: _selectedRadiusKm * 1000,
                  ),

                  // Individual Hazard Danger Zones
                  ...filteredHazards.map((h) {
                    final isResolved = h.status == 'RESOLVED_SAFE';
                    final baseColor = isResolved
                        ? const Color(0xFF059669)
                        : (h.category == 'SEVERE_FLOOD'
                            ? const Color(0xFF0284C7)
                            : (h.category == 'POWER_HAZARD' ? const Color(0xFFD97706) : const Color(0xFFDC2626)));

                    return CircleMarker(
                      point: LatLng(h.coordinates.latitude, h.coordinates.longitude),
                      color: baseColor.withValues(alpha: 0.18),
                      borderColor: baseColor.withValues(alpha: 0.8),
                      borderStrokeWidth: 1.8,
                      useRadiusInMeter: true,
                      radius: h.dangerRadiusMeters,
                    );
                  }),
                ],
              ),

              // Hazard & User Markers Layer
              MarkerLayer(
                markers: [
                  // User Location Pin
                  Marker(
                    point: userCenter,
                    width: 34,
                    height: 34,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Theme.of(context).colorScheme.onPrimary,
                          width: 2.5,
                        ),
                        boxShadow: const [
                          BoxShadow(color: Colors.black38, blurRadius: 6),
                        ],
                      ),
                      child: Icon(
                        Icons.my_location,
                        color: Theme.of(context).colorScheme.onPrimary,
                        size: 18,
                      ),
                    ),
                  ),

                  // Active Hazard Markers
                  ...filteredHazards.map((h) {
                    final pos = LatLng(h.coordinates.latitude, h.coordinates.longitude);
                    return Marker(
                      point: pos,
                      width: 48,
                      height: 48,
                      child: GestureDetector(
                        onTap: () => _showHazardBottomSheet(context, h, userCoords),
                        child: _buildHazardMarkerPin(h),
                      ),
                    );
                  }),
                ],
              ),
            ],
          ),

          // 2. Proximity Threat Alert Ticker (Top Banner)
          if (_isTickerVisible && closestHazard != null)
            Positioned(
              top: 14,
              left: 14,
              right: 14,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111111) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: closestDistanceMeters < 1000
                        ? const Color(0xFFDC2626)
                        : (isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                    width: closestDistanceMeters < 1000 ? 1.8 : 1.0,
                  ),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 3)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDC2626).withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                closestHazard.category.replaceAll('_', ' '),
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDC2626).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  '${(closestDistanceMeters).toInt()}m away',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFDC2626)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            closestHazard.ward,
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.black54),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.near_me_outlined, size: 18),
                      tooltip: 'Focus on Hazard',
                      onPressed: () {
                        _mapController.move(
                          LatLng(closestHazard!.coordinates.latitude, closestHazard.coordinates.longitude),
                          15.5,
                        );
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 16),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () {
                        setState(() {
                          _isTickerVisible = false;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),

          // 3. Category & Radius Selector Floating Controller
          Positioned(
            bottom: 20,
            left: 14,
            right: 14,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Radar Pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          if (_selectedRadiusKm == 1.0) {
                            _selectedRadiusKm = 3.0;
                          } else if (_selectedRadiusKm == 3.0) {
                            _selectedRadiusKm = 5.0;
                          } else if (_selectedRadiusKm == 5.0) {
                            _selectedRadiusKm = 10.0;
                          } else {
                            _selectedRadiusKm = 1.0;
                          }
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF111111) : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.radar, size: 14),
                            const SizedBox(width: 6),
                            Text(
                              'Radius: ${_selectedRadiusKm.toInt()} km (${filteredHazards.length} pins)',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Quick Recenter on User GPS
                    FloatingActionButton.small(
                      backgroundColor: isDark ? Colors.white : Colors.black,
                      foregroundColor: isDark ? Colors.black : Colors.white,
                      elevation: 2,
                      onPressed: () {
                        _mapController.move(userCenter, 14.5);
                      },
                      child: const Icon(Icons.my_location, size: 18),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Category Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All (${allHazards.length})'),
                      _buildFilterChip('SEVERE_FLOOD', 'Floods'),
                      _buildFilterChip('POWER_HAZARD', 'Power Lines'),
                      _buildFilterChip('BLOCKED_ROAD', 'Roads'),
                      _buildFilterChip('FALLEN_TREE', 'Trees'),
                      _buildFilterChip('LANDSLIDE', 'Landslides'),
                      _buildFilterChip('STRUCTURE_DAMAGE', 'Structural'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHazardMarkerPin(HazardModel h) {
    Color markerColor = const Color(0xFF2563EB);
    IconData iconData = Icons.warning_rounded;

    if (h.status == 'RESOLVED_SAFE') {
      markerColor = const Color(0xFF059669);
      iconData = Icons.check;
    } else if (h.category == 'SEVERE_FLOOD') {
      markerColor = const Color(0xFF0284C7);
      iconData = Icons.waves;
    } else if (h.category == 'POWER_HAZARD') {
      markerColor = const Color(0xFFD97706);
      iconData = Icons.bolt;
    } else if (h.category == 'BLOCKED_ROAD') {
      markerColor = const Color(0xFFDC2626);
      iconData = Icons.block;
    } else if (h.category == 'FALLEN_TREE') {
      markerColor = const Color(0xFF059669);
      iconData = Icons.park;
    } else if (h.category == 'LANDSLIDE') {
      markerColor = const Color(0xFFB45309);
      iconData = Icons.landscape;
    } else if (h.category == 'STRUCTURE_DAMAGE') {
      markerColor = const Color(0xFF7C3AED);
      iconData = Icons.domain;
    }

    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: markerColor,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.2),
            boxShadow: [
              BoxShadow(
                color: markerColor.withValues(alpha: 0.45),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(iconData, color: Colors.white, size: 20),
        ),
        if (h.verificationCount > 1)
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.black,
                shape: BoxShape.circle,
              ),
              child: Text(
                '${h.verificationCount}',
                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildFilterChip(String categoryKey, String label) {
    final isSelected = _selectedCategory == categoryKey;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        selected: isSelected,
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected
              ? (isDark ? Colors.black : Colors.white)
              : (isDark ? Colors.white : Colors.black),
        ),
        selectedColor: isDark ? Colors.white : Colors.black,
        backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
        side: BorderSide(
          color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
        ),
        onSelected: (selected) {
          if (selected) {
            setState(() {
              _selectedCategory = categoryKey;
            });
          }
        },
      ),
    );
  }

  void _showHazardBottomSheet(
    BuildContext context,
    HazardModel hazard,
    GeoCoordinates userCoords,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final distanceMeters = LocationService.distanceBetween(
      userCoords,
      hazard.coordinates,
    );
    final distanceKm = (distanceMeters / 1000).toStringAsFixed(2);
    final urgency = hazard.aiAnalysis?.urgencyScore ?? 7.5;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final currentHazard = ref.watch(hazardListProvider).firstWhere(
                  (h) => h.hazardId == hazard.hazardId,
                  orElse: () => hazard,
                );

            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white24 : Colors.black12,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Header with Category & Status
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              currentHazard.category.replaceAll('_', ' '),
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                            ),
                            Text(
                              currentHazard.ward,
                              style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: currentHazard.status == 'RESOLVED_SAFE'
                              ? const Color(0xFF059669).withValues(alpha: 0.15)
                              : const Color(0xFFDC2626).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          currentHazard.status.replaceAll('_', ' '),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: currentHazard.status == 'RESOLVED_SAFE' ? const Color(0xFF059669) : const Color(0xFFDC2626),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Metrics Cards
                  Row(
                    children: [
                      _buildMetricTile(
                        label: 'AI URGENCY',
                        value: '${urgency.toStringAsFixed(1)} / 10',
                        color: urgency > 7.5 ? const Color(0xFFDC2626) : const Color(0xFFD97706),
                      ),
                      const SizedBox(width: 8),
                      _buildMetricTile(
                        label: 'DISTANCE',
                        value: '$distanceKm km',
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      _buildMetricTile(
                        label: 'VERIFICATIONS',
                        value: '${currentHazard.verificationCount} citizens',
                        color: const Color(0xFF059669),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Description / AI Reasoning
                  if (currentHazard.description != null && currentHazard.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        '"${currentHazard.description}"',
                        style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic),
                      ),
                    ),

                  // AI Analysis Note Box
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.auto_awesome, size: 16, color: Color(0xFF2563EB)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            currentHazard.aiAnalysis?.reasoning ?? 'Satellite telemetry & on-device optical verification active.',
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.black87),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Action Buttons: Confirm Hazard vs Safe Route
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ref.read(hazardListProvider.notifier).verifyHazard(currentHazard.hazardId);
                            setSheetState(() {});
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Verification registered! Thank you for crowdsourcing accuracy.')),
                            );
                          },
                          icon: const Icon(Icons.thumb_up_alt_outlined, size: 16),
                          label: Text('Confirm (${currentHazard.verificationCount})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ref.read(hazardListProvider.notifier).resolveHazard(currentHazard.hazardId);
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Hazard marked as cleared / safe.')),
                            );
                          },
                          icon: const Icon(Icons.check_circle_outline, size: 16),
                          label: const Text('Mark Safe', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3)),
          color: color.withValues(alpha: 0.08),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
