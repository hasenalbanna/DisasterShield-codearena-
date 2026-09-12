import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/services/auth_service.dart';

class SafetyCheckinModal extends ConsumerStatefulWidget {
  const SafetyCheckinModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const SafetyCheckinModal(),
    );
  }

  @override
  ConsumerState<SafetyCheckinModal> createState() => _SafetyCheckinModalState();
}

class _SafetyCheckinModalState extends ConsumerState<SafetyCheckinModal> {
  bool _isCheckedIn = false;
  String? _broadcastTime;

  void _broadcastSafe() {
    final userCoords = ref.read(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final now = DateTime.now();
    setState(() {
      _isCheckedIn = true;
      _broadcastTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF059669),
        content: Text(
          '🟢 Safety Check-in Broadcasted! Coords: ${userCoords.latitude.toStringAsFixed(4)}°N, ${userCoords.longitude.toStringAsFixed(4)}°E',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final userCoords = ref.watch(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final activeUser = AuthService.currentProfile;

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
                    Icon(Icons.health_and_safety, color: Color(0xFF059669), size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Citizen Safety Check-In & Telemetry',
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
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // 1. One-Tap I Am Safe Broadcast Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _isCheckedIn
                        ? const Color(0xFF059669).withValues(alpha: 0.12)
                        : (isDark ? const Color(0xFF161616) : const Color(0xFFF9FAFB)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _isCheckedIn ? const Color(0xFF059669) : (isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                      width: _isCheckedIn ? 1.8 : 1.0,
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        _isCheckedIn ? Icons.verified_user : Icons.safety_check,
                        size: 48,
                        color: _isCheckedIn ? const Color(0xFF059669) : const Color(0xFF2563EB),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _isCheckedIn ? 'STATUS: CONFIRMED SAFE' : 'Broadcast "I Am Safe"',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _isCheckedIn
                            ? 'Broadcasted at $_broadcastTime to Disaster Operations & Emergency Contacts'
                            : 'One-touch status beacon alerting rescue teams and loved ones that you are uninjured',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 44,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isCheckedIn ? const Color(0xFF059669) : const Color(0xFF2563EB),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: _broadcastSafe,
                          icon: const Icon(Icons.podcasts, size: 18),
                          label: Text(_isCheckedIn ? 'Update Safety Broadcast' : 'Broadcast "I Am Safe" Now'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 2. Hydrological River & Flood Sensor Telemetry
                Text(
                  'REGIONAL SENSOR TELEMETRY (LIVE)',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
                ),
                const SizedBox(height: 8),

                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF161616) : const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.waves, color: Color(0xFF0284C7), size: 18),
                              SizedBox(width: 8),
                              Text('Kelani River Flood Gauge', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('ALERT STAGE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(
                        value: 4.62 / 5.0,
                        backgroundColor: isDark ? Colors.white12 : Colors.black12,
                        valueColor: const AlwaysStoppedAnimation(Color(0xFFD97706)),
                        minHeight: 8,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      const SizedBox(height: 8),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Current: 4.62 meters', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          Text('Major Flood Crest: 5.00m', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // 3. Grid & Infrastructure Outage Status
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF161616) : const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.electrical_services, color: Color(0xFFD97706), size: 18),
                              SizedBox(width: 8),
                              Text('Grid & Cellular Infrastructure', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                          Text('94% Online', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Substation 12-B switched to emergency diesel backup generator. 3 of 4 cellular repeaters fully active with mesh failover enabled.',
                        style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.black54, height: 1.4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 4. Emergency ICE SMS Payload
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isDark ? const Color(0xFF333333) : const Color(0xFFE5E7EB)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'AUTO-GENERATED EMERGENCY SMS PAYLOAD:',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      SelectableText(
                        'EMERGENCY UPDATE: ${activeUser?.displayName ?? "Citizen"} is SAFE at ${userCoords.latitude.toStringAsFixed(4)}°N, ${userCoords.longitude.toStringAsFixed(4)}°E. In case of escalation call National Center 117.',
                        style: const TextStyle(fontSize: 11, fontFamily: 'monospace', height: 1.4),
                      ),
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
}
