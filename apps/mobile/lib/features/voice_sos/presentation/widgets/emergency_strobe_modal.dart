import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/models/hazard_model.dart';

class EmergencyStrobeModal extends StatefulWidget {
  final GeoCoordinates coordinates;

  const EmergencyStrobeModal({super.key, required this.coordinates});

  static void show(BuildContext context, GeoCoordinates coords) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => EmergencyStrobeModal(coordinates: coords),
    );
  }

  @override
  State<EmergencyStrobeModal> createState() => _EmergencyStrobeModalState();
}

class _EmergencyStrobeModalState extends State<EmergencyStrobeModal> {
  Timer? _strobeTimer;
  bool _isRed = true;

  @override
  void initState() {
    super.initState();
    // 3.5 Hz flash rate for high optical visibility
    _strobeTimer = Timer.periodic(const Duration(milliseconds: 280), (timer) {
      if (!mounted) return;
      setState(() {
        _isRed = !_isRed;
      });
    });
  }

  @override
  void dispose() {
    _strobeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = _isRed ? const Color(0xFFDC2626) : Colors.white;
    final fgColor = _isRed ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: fgColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.flash_on, color: fgColor, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'HIGH-INTENSITY RESCUE STROBE ACTIVE',
                      style: TextStyle(color: fgColor, fontWeight: FontWeight.w900, fontSize: 12),
                    ),
                  ],
                ),
              ),

              // Center Visual Distress Signal
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.sos,
                    size: 110,
                    color: fgColor,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'SOS BEACON',
                    style: TextStyle(
                      color: fgColor,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Position visible to aerial search drones & night rescue teams',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: fgColor.withValues(alpha: 0.8),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: fgColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: fgColor.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'COORDINATES LOCKED:',
                          style: TextStyle(color: fgColor.withValues(alpha: 0.7), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.coordinates.latitude.toStringAsFixed(5)}° N, ${widget.coordinates.longitude.toStringAsFixed(5)}° E',
                          style: TextStyle(color: fgColor, fontSize: 14, fontFamily: 'monospace', fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // Bottom Cancel
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: fgColor,
                    foregroundColor: bgColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    _strobeTimer?.cancel();
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'TURN OFF RESCUE STROBE',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
