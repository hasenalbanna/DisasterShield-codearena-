import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/services/firebase_hazard_service.dart';

class VoiceSosScreen extends ConsumerStatefulWidget {
  const VoiceSosScreen({super.key});

  @override
  ConsumerState<VoiceSosScreen> createState() => _VoiceSosScreenState();
}

class _VoiceSosScreenState extends ConsumerState<VoiceSosScreen>
    with SingleTickerProviderStateMixin {
  Timer? _holdTimer;
  double _holdProgress = 0.0;
  bool _isSosTriggered = false;
  String? _activeCaseId;
  bool _isListeningVoice = true;

  void _startHolding() {
    setState(() {
      _holdProgress = 0.0;
    });
    _holdTimer = Timer.periodic(const Duration(milliseconds: 30), (timer) {
      setState(() {
        _holdProgress += 0.01;
        if (_holdProgress >= 1.0) {
          _holdTimer?.cancel();
          _triggerEmergencySos('SOS_BUTTON_HOLD');
        }
      });
    });
  }

  void _cancelHolding() {
    if (_holdProgress < 1.0) {
      _holdTimer?.cancel();
      setState(() {
        _holdProgress = 0.0;
      });
    }
  }

  Future<void> _triggerEmergencySos(String triggerSource) async {
    final userCoords = ref.read(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final caseId = 'sos_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';

    setState(() {
      _isSosTriggered = true;
      _activeCaseId = caseId;
    });

    await FirebaseHazardService.triggerVoiceSos(
      userId: 'usr_citizen_sos',
      callerName: 'Disaster Responder',
      callerPhone: '+94 77 123 4567',
      coordinates: userCoords,
      ward: 'Ward 12 - South District',
      transcript: triggerSource == 'VOICE_TRIGGER' 
          ? 'Help, severe flood rising rapidly near my location!' 
          : 'Emergency SOS button held for 3 seconds.',
    );

    if (mounted) {
      _showSosActiveDialog(caseId);
    }
  }

  void _showSosActiveDialog(String caseId) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFDC2626), width: 2),
        ),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 28),
            SizedBox(width: 10),
            Text(
              'EMERGENCY SOS ACTIVE',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFFDC2626)),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'High-priority distress coordinates beamed to the Municipal Command Center. Senior dispatcher alerted.',
              style: TextStyle(fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
              ),
              child: Text(
                'Case: $caseId\nStatus: PRIORITY_DISPATCHED\nNearest Unit: Crew North 04 (4 min away)',
                style: const TextStyle(fontSize: 11, fontFamily: 'monospace', height: 1.4),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _holdProgress = 0.0;
                _isSosTriggered = false;
              });
            },
            child: const Text('Cancel Distress Beacon'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _holdTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationAsync = ref.watch(currentLocationProvider);
    final userCoords = locationAsync.value ?? LocationService.defaultCoordinates;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Emergency SOS & Voice',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          children: [
            if (_isSosTriggered && _activeCaseId != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFDC2626).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFDC2626), width: 1.5),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.emergency, color: Color(0xFFDC2626), size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'BEACON BROADCASTING',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFFDC2626)),
                          ),
                          Text(
                            'Active Case: $_activeCaseId',
                            style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: Color(0xFFDC2626)),
                      onPressed: () {
                        setState(() {
                          _isSosTriggered = false;
                          _activeCaseId = null;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ],
            // Voice Wake-Word Telemetry Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isListeningVoice ? Icons.mic : Icons.mic_off,
                    size: 20,
                    color: _isListeningVoice ? const Color(0xFFDC2626) : Colors.grey,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isListeningVoice ? 'Voice Distress Active' : 'Voice Distress Inactive',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Say "Help, severe emergency" for hands-free call',
                          style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: _isListeningVoice,
                    activeTrackColor: const Color(0xFFDC2626),
                    onChanged: (val) {
                      setState(() {
                        _isListeningVoice = val;
                      });
                    },
                  ),
                ],
              ),
            ),
            const Spacer(),

            // Big Crimson SOS Hold Button
            GestureDetector(
              onTapDown: (_) => _startHolding(),
              onTapUp: (_) => _cancelHolding(),
              onTapCancel: () => _cancelHolding(),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Progress Ring
                  SizedBox(
                    width: 220,
                    height: 220,
                    child: CircularProgressIndicator(
                      value: _holdProgress,
                      strokeWidth: 6,
                      color: const Color(0xFFDC2626),
                      backgroundColor: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    ),
                  ),

                  // Button Core
                  Container(
                    width: 196,
                    height: 196,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFDC2626),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFDC2626).withValues(alpha: 0.4),
                          blurRadius: 30,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.warning_amber_rounded, size: 48, color: Colors.white),
                        const SizedBox(height: 6),
                        const Text(
                          'HOLD SOS',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          _holdProgress > 0 ? '${((1.0 - _holdProgress) * 3).toStringAsFixed(1)}s remaining' : 'Hold 3s to Trigger',
                          style: const TextStyle(fontSize: 11, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Mock Voice Trigger Demo Button
            OutlinedButton.icon(
              icon: const Icon(Icons.record_voice_over, size: 16),
              label: const Text('Simulate Voice Distress Trigger'),
              onPressed: () => _triggerEmergencySos('VOICE_TRIGGER'),
            ),

            const Spacer(),

            // Location Bar
            Text(
              'Broadcasting GPS: ${userCoords.latitude.toStringAsFixed(4)}° N, ${userCoords.longitude.toStringAsFixed(4)}° E',
              style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54, fontFamily: 'monospace'),
            ),
            const SizedBox(height: 12),

            // Emergency Contacts Quick Cards
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _EmergencyAction(icon: Icons.local_police, label: 'Police 119'),
                  _EmergencyAction(icon: Icons.local_hospital, label: 'Ambulance 1990'),
                  _EmergencyAction(icon: Icons.fire_truck, label: 'Fire 110'),
                  _EmergencyAction(icon: Icons.support_agent, label: 'DMC 117'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmergencyAction extends StatelessWidget {
  final IconData icon;
  final String label;

  const _EmergencyAction({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1F1F1F) : const Color(0xFFE5E7EB),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 18),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
