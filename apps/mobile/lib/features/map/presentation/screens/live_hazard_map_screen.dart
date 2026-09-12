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

  // Mock initial hazards for immediate visual radar display
  static final List<HazardModel> _defaultHazards = [
    HazardModel(
      id: 'hz_9982341af',
      hazardId: 'hz_9982341af',
      reportedBy: 'usr_7726158bc',
      reporterName: 'MRA Hasen',
      category: 'SEVERE_FLOOD',
      coordinates: const GeoCoordinates(latitude: 6.9271, longitude: 79.8612),
      geohash: 'tc3p18u',
      ward: 'Ward 12 - Riverbank',
      mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
      status: 'AREA_ALERT',
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
      reporterName: 'Inspector David',
      category: 'POWER_HAZARD',
      coordinates: const GeoCoordinates(latitude: 6.9312, longitude: 79.8584),
      geohash: 'tc3p19a',
      ward: 'Crossway Blvd & 5th Ave',
      mediaUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
      status: 'COUNCIL_TICKET',
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
      ward: 'North Arterial Bypass',
      mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800',
      status: 'PUBLISHED',
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

  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(currentLocationProvider);
    final hazardsAsync = ref.watch(liveHazardsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final userCoords = locationAsync.value ?? LocationService.defaultCoordinates;
    final userCenter = LatLng(userCoords.latitude, userCoords.longitude);

    // Combine stream with default hazards if Firestore is fresh
    final activeHazards = (hazardsAsync.value != null && hazardsAsync.value!.isNotEmpty)
        ? hazardsAsync.value!
        : _defaultHazards;

    // Filter by Category and Radius
    final filteredHazards = activeHazards.where((h) {
      if (_selectedCategory != 'ALL' && h.category != _selectedCategory) {
        return false;
      }
      final distanceMeters = LocationService.distanceBetween(
        userCoords,
        h.coordinates,
      );
      return (distanceMeters / 1000) <= _selectedRadiusKm;
    }).toList();

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

              // User 5km Geofence Radar Circle
              CircleLayer(
                circles: [
                  CircleMarker(
                    point: userCenter,
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.08),
                    borderColor: const Color(0xFF3B82F6).withValues(alpha: 0.35),
                    borderStrokeWidth: 1.5,
                    useRadiusInMeter: true,
                    radius: _selectedRadiusKm * 1000,
                  ),
                ],
              ),

              // Hazard Markers Layer
              MarkerLayer(
                markers: [
                  // User Location Pin
                  Marker(
                    point: userCenter,
                    width: 32,
                    height: 32,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Theme.of(context).colorScheme.onPrimary,
                          width: 2.5,
                        ),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 6),
                        ],
                      ),
                      child: Icon(
                        Icons.my_location,
                        color: Theme.of(context).colorScheme.onPrimary,
                        size: 16,
                      ),
                    ),
                  ),

                  // Active Hazard Markers
                  ...filteredHazards.map((h) {
                    final pos = LatLng(h.coordinates.latitude, h.coordinates.longitude);
                    return Marker(
                      point: pos,
                      width: 44,
                      height: 44,
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

          // 2. Weather Alert & River Level Ticker (Collapsible)
          if (_isTickerVisible)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111111) : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                  ),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 2)),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.water_drop, color: Color(0xFF0284C7), size: 16),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Hydrological Alert: River surge +12.5 cm/hr in Ward 12',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
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

          // 3. Category & Radius Selector Chips
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Radius Indicator Pill (Tap to cycle radar radius)
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF111111) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.radar, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          'Radar Radius: ${_selectedRadiusKm.toInt()} KM (${filteredHazards.length} hazards)',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Category Chips Scrollable Row
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All Hazards'),
                      _buildFilterChip('SEVERE_FLOOD', 'Floods'),
                      _buildFilterChip('POWER_HAZARD', 'Power'),
                      _buildFilterChip('BLOCKED_ROAD', 'Roads'),
                      _buildFilterChip('FALLEN_TREE', 'Trees'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 4. Center-on-Me FAB
          Positioned(
            right: 16,
            bottom: 90,
            child: FloatingActionButton.small(
              backgroundColor: isDark ? Colors.white : Colors.black,
              foregroundColor: isDark ? Colors.black : Colors.white,
              elevation: 2,
              onPressed: () {
                _mapController.move(userCenter, 14.5);
              },
              child: const Icon(Icons.gps_fixed, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHazardMarkerPin(HazardModel h) {
    Color markerColor = const Color(0xFF2563EB);
    IconData iconData = Icons.warning;

    if (h.category == 'SEVERE_FLOOD') {
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
    }

    return Container(
      decoration: BoxDecoration(
        color: markerColor,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(
            color: markerColor.withValues(alpha: 0.5),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Icon(iconData, color: Colors.white, size: 20),
      ),
    );
  }

  Widget _buildFilterChip(String categoryKey, String label) {
    final isSelected = _selectedCategory == categoryKey;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        selected: isSelected,
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 12,
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
    final distanceKm = (distanceMeters / 1000).toStringAsFixed(1);
    final urgency = hazard.aiAnalysis?.urgencyScore ?? 7.0;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Drag Handle
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
              const SizedBox(height: 16),

              // Title & Category Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      hazard.ward,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF262626) : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      hazard.category.replaceAll('_', ' '),
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // AI Risk & Distance Metrics
              Row(
                children: [
                  _buildMetricTile(
                    label: 'URGENCY',
                    value: '$urgency / 10',
                    color: urgency > 7.5 ? const Color(0xFFDC2626) : const Color(0xFFD97706),
                  ),
                  const SizedBox(width: 12),
                  _buildMetricTile(
                    label: 'DISTANCE',
                    value: '$distanceKm KM away',
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  _buildMetricTile(
                    label: 'CLUSTER',
                    value: '${hazard.aiAnalysis?.clusterCount ?? 1} reports',
                    color: const Color(0xFF059669),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // AI Reasoning Note
              if (hazard.aiAnalysis != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    ),
                  ),
                  child: Text(
                    hazard.aiAnalysis!.reasoning,
                    style: const TextStyle(fontSize: 12, height: 1.4),
                  ),
                ),
              const SizedBox(height: 20),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Reroute Navigation'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Field Verification Prompt Sent')),
                        );
                      },
                      child: const Text('Verify Hazard'),
                    ),
                  ),
                ],
              ),
            ],
          ),
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
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
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
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
