import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/hazard_model.dart';
import '../../../../core/providers/app_providers.dart';

class SafeZoneItem {
  final String name;
  final String type;
  final GeoCoordinates coordinates;
  final String address;
  final double distanceKm;
  final int capacityPercent;
  final List<String> amenities;

  const SafeZoneItem({
    required this.name,
    required this.type,
    required this.coordinates,
    required this.address,
    required this.distanceKm,
    required this.capacityPercent,
    required this.amenities,
  });
}

class SafeZonesModal extends ConsumerWidget {
  const SafeZonesModal({super.key});

  static final List<SafeZoneItem> safeZones = [
    const SafeZoneItem(
      name: 'South Municipal Community Center',
      type: 'High-Ground Concrete Shelter',
      coordinates: GeoCoordinates(latitude: 6.9320, longitude: 79.8590),
      address: 'Crossway Blvd 42, Ward 12',
      distanceKm: 1.1,
      capacityPercent: 78,
      amenities: ['Generators', 'First-Aid Unit', 'Clean Water', 'Child Care'],
    ),
    const SafeZoneItem(
      name: 'St. Jude Elevation Refuge',
      type: 'Hilltop Church & Relief Center',
      coordinates: GeoCoordinates(latitude: 6.9180, longitude: 79.8680),
      address: 'Highland Ridge Rd, Sector 4',
      distanceKm: 2.3,
      capacityPercent: 35,
      amenities: ['Cots/Blankets', 'Hot Meals', 'Satellite Phone'],
    ),
    const SafeZoneItem(
      name: 'Metropolitan Sports Complex',
      type: 'Mass Evacuation Stadium & Helipad',
      coordinates: GeoCoordinates(latitude: 6.9400, longitude: 79.8510),
      address: 'Port North Corridor',
      distanceKm: 3.6,
      capacityPercent: 22,
      amenities: ['Helicopter Landing', 'Field Hospital', 'Military Guard'],
    ),
  ];

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const SafeZonesModal(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111111) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.shield, color: Color(0xFF059669), size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Verified Safe Zones & Shelters',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: safeZones.length,
              itemBuilder: (ctx, index) {
                final item = safeZones[index];
                final capacityColor = item.capacityPercent > 80
                    ? const Color(0xFFDC2626)
                    : (item.capacityPercent > 50 ? const Color(0xFFD97706) : const Color(0xFF059669));

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF161616) : const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: capacityColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${item.capacityPercent}% Full',
                              style: TextStyle(color: capacityColor, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.type,
                        style: const TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${item.address} • ${item.distanceKm} km away',
                        style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.black54),
                      ),
                      const SizedBox(height: 10),

                      // Amenities Chips
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: item.amenities.map((a) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF222222) : const Color(0xFFEEEEEE),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              a,
                              style: TextStyle(fontSize: 10, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),

                      // Route Button
                      SizedBox(
                        width: double.infinity,
                        height: 38,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: isDark ? const Color(0xFF333333) : const Color(0xFFD1D5DB)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            Navigator.pop(ctx);
                            // Pan map to safe zone coordinate and open Map tab
                            ref.read(mapFocusCoordinateProvider.notifier).setCoordinate(item.coordinates);
                            ref.read(bottomNavIndexProvider.notifier).setIndex(0);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: const Color(0xFF059669),
                                content: Text('Camera centered on ${item.name}'),
                              ),
                            );
                          },
                          icon: const Icon(Icons.navigation_outlined, size: 16),
                          label: const Text('View on Live Radar Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
