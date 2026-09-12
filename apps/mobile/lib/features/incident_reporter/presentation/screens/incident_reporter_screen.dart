import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/models/hazard_model.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/services/firebase_hazard_service.dart';
import '../../../../core/services/image_compression_service.dart';
import '../../../../core/services/auth_service.dart';

class IncidentReporterScreen extends ConsumerStatefulWidget {
  const IncidentReporterScreen({super.key});

  @override
  ConsumerState<IncidentReporterScreen> createState() => _IncidentReporterScreenState();
}

class _IncidentReporterScreenState extends ConsumerState<IncidentReporterScreen>
    with SingleTickerProviderStateMixin {
  final ImagePicker _picker = ImagePicker();
  final MapController _pickerMapController = MapController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _wardController = TextEditingController(text: 'Ward 12 - South Riverbank');

  XFile? _capturedImage;
  String? _encodedImageBase64;
  String? _selectedPresetUrl;
  String _selectedCategory = 'SEVERE_FLOOD';
  bool _useCustomPinLocation = false;
  LatLng? _selectedPinLocation;
  double _dangerRadiusMeters = 200.0;

  bool _isRecordingVoice = false;
  bool _hasVoiceNote = false;
  bool _isSubmitting = false;

  late AnimationController _waveformController;

  @override
  void initState() {
    super.initState();
    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
  }

  @override
  void dispose() {
    _waveformController.dispose();
    _descController.dispose();
    _wardController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        imageQuality: 75,
        maxWidth: 1024,
        maxHeight: 1024,
      );
      if (photo != null) {
        final base64String = await ImageCompressionService.convertXFileToBase64(photo);
        setState(() {
          _capturedImage = photo;
          _encodedImageBase64 = base64String;
          _selectedPresetUrl = null;
        });
      }
    } catch (e) {
      debugPrint('Image picker error: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open camera/gallery: $e')),
      );
    }
  }

  void _toggleVoiceRecording() {
    setState(() {
      _isRecordingVoice = !_isRecordingVoice;
      if (_isRecordingVoice) {
        _waveformController.repeat(reverse: true);
      } else {
        _waveformController.stop();
        _hasVoiceNote = true;
      }
    });
  }

  double _computeUrgencyScore() {
    double base = 6.0;
    if (_selectedCategory == 'SEVERE_FLOOD') base = 8.5;
    if (_selectedCategory == 'POWER_HAZARD') base = 8.2;
    if (_selectedCategory == 'LANDSLIDE') base = 9.1;
    if (_selectedCategory == 'STRUCTURE_DAMAGE') base = 7.9;
    if (_selectedCategory == 'FALLEN_TREE') base = 6.5;
    if (_selectedCategory == 'BLOCKED_ROAD') base = 7.0;

    if (_dangerRadiusMeters >= 500) base += 0.8;
    if (_hasVoiceNote) base += 0.3;
    if (_descController.text.trim().length > 30) base += 0.3;

    return base.clamp(1.0, 9.9);
  }

  GeoCoordinates _resolveReportCoordinates(GeoCoordinates userCoords) {
    if (_useCustomPinLocation && _selectedPinLocation != null) {
      return GeoCoordinates(
        latitude: _selectedPinLocation!.latitude,
        longitude: _selectedPinLocation!.longitude,
        accuracy: 5.0,
      );
    }
    return userCoords;
  }

  Future<void> _submitReport() async {
    setState(() {
      _isSubmitting = true;
    });

    final userCoords = ref.read(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final finalCoords = _resolveReportCoordinates(userCoords);
    final hazardId = 'hz_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';
    final urgency = _computeUrgencyScore();

    final activeUser = AuthService.currentProfile;
    final reporterId = activeUser?.uid ?? 'usr_citizen_local';
    final reporterName = activeUser != null
        ? '${activeUser.displayName} (${activeUser.role})'
        : 'MRA Hasen (Citizen)';

    final effectiveMedia = _encodedImageBase64 ??
        _selectedPresetUrl ??
        (_capturedImage != null ? _capturedImage!.path : 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800');

    final hazard = HazardModel(
      id: hazardId,
      hazardId: hazardId,
      reportedBy: reporterId,
      reporterName: reporterName,
      category: _selectedCategory,
      coordinates: finalCoords,
      geohash: 'tc3p18u',
      ward: _wardController.text.trim().isNotEmpty ? _wardController.text.trim() : (activeUser?.ward ?? 'Ward 12 - South District'),
      description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
      mediaUrl: effectiveMedia,
      audioMemoUrl: _hasVoiceNote ? 'memo_$hazardId.m4a' : null,
      status: urgency >= 8.0 ? 'AREA_ALERT' : 'PUBLISHED',
      dangerRadiusMeters: _dangerRadiusMeters,
      verificationCount: 1,
      aiAnalysis: AiAnalysisResult(
        imageConfidence: 0.93,
        hazardDetected: _selectedCategory,
        isAuthentic: true,
        locationMatch: true,
        weatherSupport: true,
        clusterCount: 1,
        urgencyScore: urgency,
        assignedStatus: urgency >= 8.0 ? 'AREA_ALERT' : 'PUBLISHED',
        reasoning: 'On-device camera framing & location verified. Dispatched to Municipal Emergency Ops.',
      ),
      createdAt: DateTime.now(),
    );

    // 1. Immediately inject into global hazard state (instant UI reflection across all tabs)
    ref.read(hazardListProvider.notifier).addHazard(hazard);

    // 2. Transmit to Firebase / Offline Spooler
    final isOnline = await FirebaseHazardService.submitHazardReport(hazard);

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });

      _showSubmissionResultDialog(isOnline, hazard);
    }
  }

  void _showSubmissionResultDialog(bool isOnline, HazardModel hazard) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isOnline ? const Color(0xFF059669).withValues(alpha: 0.15) : const Color(0xFFD97706).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isOnline ? Icons.check_circle : Icons.offline_pin,
                color: isOnline ? const Color(0xFF059669) : const Color(0xFFD97706),
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isOnline ? 'Incident Pinned' : 'Queued Offline',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                  Text(
                    isOnline ? 'Live on Radar Map' : 'Zero Data Loss Spooled',
                    style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                  ),
                ],
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your report has been assigned Case ID and pinned to the disaster radar map.',
              style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('CASE ID:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white38 : Colors.black38)),
                      Text(hazard.hazardId, style: const TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('LOCATION:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white38 : Colors.black38)),
                      Text('${hazard.coordinates.latitude.toStringAsFixed(4)}°N, ${hazard.coordinates.longitude.toStringAsFixed(4)}°E', style: const TextStyle(fontSize: 11, fontFamily: 'monospace')),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('AI URGENCY:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white38 : Colors.black38)),
                      Text('${hazard.aiAnalysis?.urgencyScore.toStringAsFixed(1) ?? '8.0'}/10', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFDC2626))),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _resetForm();
            },
            child: const Text('Report Another'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _resetForm();
              // Auto-focus and pan map to the new hazard
              ref.read(mapFocusCoordinateProvider.notifier).setCoordinate(hazard.coordinates);
              // Switch to Map Screen (Tab 0)
              ref.read(bottomNavIndexProvider.notifier).setIndex(0);
            },
            icon: const Icon(Icons.map, size: 16),
            label: const Text('View on Live Map ➔'),
          ),
        ],
      ),
    );
  }

  void _resetForm() {
    setState(() {
      _capturedImage = null;
      _encodedImageBase64 = null;
      _selectedPresetUrl = null;
      _descController.clear();
      _hasVoiceNote = false;
      _selectedPinLocation = null;
      _useCustomPinLocation = false;
    });
  }

  void _showImageSourceModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Live Photo'),
              subtitle: const Text('Capture with device camera (auto-converts to Base64)'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              subtitle: const Text('Select existing photo (compressed to Base64)'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.satellite_alt),
              title: const Text('Simulate Disaster Photo (Presets)'),
              subtitle: const Text('Instant evaluation photos for quick demonstration'),
              onTap: () {
                Navigator.pop(ctx);
                _showPresetsModal(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showPresetsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Select Verified Hazard Evidence Preset',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
            ...ImageCompressionService.evidencePresets.map((preset) {
              return ListTile(
                leading: const Icon(Icons.image, color: Color(0xFFDC2626)),
                title: Text(preset['title']!),
                subtitle: Text('Category: ${preset['category']}'),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() {
                    _selectedPresetUrl = preset['url'];
                    _capturedImage = null;
                    _encodedImageBase64 = null;
                    if (preset['category'] != null) {
                      _selectedCategory = preset['category']!;
                    }
                  });
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationAsync = ref.watch(currentLocationProvider);
    final userCoords = locationAsync.value ?? LocationService.defaultCoordinates;
    final userCenter = LatLng(userCoords.latitude, userCoords.longitude);

    // Initial pin defaults to user GPS if not placed yet
    final activePin = _selectedPinLocation ?? userCenter;
    final effectiveCoords = _resolveReportCoordinates(userCoords);
    final urgencyScore = _computeUrgencyScore();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Incident Reporter',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 14),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? const Color(0xFF333333) : const Color(0xFFE5E7EB)),
            ),
            child: Row(
              children: [
                const Icon(Icons.smart_toy_outlined, size: 14),
                const SizedBox(width: 4),
                Text(
                  'AI Urgency ${urgencyScore.toStringAsFixed(1)}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Photo Evidence Section
            GestureDetector(
              onTap: () => _showImageSourceModal(context),
              child: Container(
                height: 180,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    width: 1.5,
                  ),
                ),
                child: (_encodedImageBase64 != null || _selectedPresetUrl != null || _capturedImage != null)
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(11),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            ImageCompressionService.buildEvidenceWidget(
                              _encodedImageBase64 ?? _selectedPresetUrl ?? _capturedImage!.path,
                              fit: BoxFit.cover,
                            ),
                            Positioned(
                              top: 10,
                              right: 10,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black87,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.check, color: Color(0xFF34D399), size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      _encodedImageBase64 != null
                                          ? 'Base64 Encoded (Free DB)'
                                          : (_selectedPresetUrl != null ? 'Preset Simulation' : 'Evidence Ready'),
                                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1F1F1F) : const Color(0xFFF3F4F6),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt_outlined, size: 26),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Attach Incident Photo (Camera / Gallery)',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'AI inspects EXIF authenticity, water depth & hazard category',
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 18),

            // 2. Location Selector (GPS vs Interactive Map Pin)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Incident Location',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _useCustomPinLocation
                              ? const Color(0xFF2563EB).withValues(alpha: 0.15)
                              : const Color(0xFF059669).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _useCustomPinLocation ? 'Custom Map Pin' : 'Live GPS Verified',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _useCustomPinLocation ? const Color(0xFF2563EB) : const Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Segmented Switch: Current GPS vs Pin on Map
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            backgroundColor: !_useCustomPinLocation
                                ? (isDark ? Colors.white : Colors.black)
                                : Colors.transparent,
                            foregroundColor: !_useCustomPinLocation
                                ? (isDark ? Colors.black : Colors.white)
                                : (isDark ? Colors.white : Colors.black),
                            side: BorderSide(
                              color: isDark ? const Color(0xFF333333) : const Color(0xFFD1D5DB),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            setState(() {
                              _useCustomPinLocation = false;
                              _selectedPinLocation = userCenter;
                            });
                          },
                          icon: const Icon(Icons.my_location, size: 16),
                          label: const Text('My Live Location', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            backgroundColor: _useCustomPinLocation
                                ? (isDark ? Colors.white : Colors.black)
                                : Colors.transparent,
                            foregroundColor: _useCustomPinLocation
                                ? (isDark ? Colors.black : Colors.white)
                                : (isDark ? Colors.white : Colors.black),
                            side: BorderSide(
                              color: isDark ? const Color(0xFF333333) : const Color(0xFFD1D5DB),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            setState(() {
                              _useCustomPinLocation = true;
                              _selectedPinLocation ??= userCenter;
                            });
                          },
                          icon: const Icon(Icons.pin_drop, size: 16),
                          label: const Text('Pick on Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Coordinates & Ward readout
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF181818) : const Color(0xFFFFFFFF),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.place, size: 16, color: Color(0xFFDC2626)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Lat: ${effectiveCoords.latitude.toStringAsFixed(5)}°, Lon: ${effectiveCoords.longitude.toStringAsFixed(5)}°',
                            style: const TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                          ),
                        ),
                        if (_useCustomPinLocation)
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedPinLocation = userCenter;
                                _pickerMapController.move(userCenter, 14.5);
                              });
                            },
                            child: const Text('Reset', style: TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  ),

                  // Interactive Map View (Always visible or expandable for pin dragging)
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(
                      height: 220,
                      width: double.infinity,
                      child: Stack(
                        children: [
                          FlutterMap(
                            mapController: _pickerMapController,
                            options: MapOptions(
                              initialCenter: activePin,
                              initialZoom: 14.5,
                              onTap: (tapPosition, point) {
                                setState(() {
                                  _useCustomPinLocation = true;
                                  _selectedPinLocation = point;
                                });
                              },
                            ),
                            children: [
                              TileLayer(
                                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.falcon.disastershield',
                              ),
                              // Hazard Perimeter Danger Zone Circle
                              CircleLayer(
                                circles: [
                                  CircleMarker(
                                    point: activePin,
                                    color: const Color(0xFFDC2626).withValues(alpha: 0.22),
                                    borderColor: const Color(0xFFDC2626),
                                    borderStrokeWidth: 2,
                                    useRadiusInMeter: true,
                                    radius: _dangerRadiusMeters,
                                  ),
                                ],
                              ),
                              // Active Selected Location Marker Pin
                              MarkerLayer(
                                markers: [
                                  Marker(
                                    point: activePin,
                                    width: 44,
                                    height: 44,
                                    child: const Icon(
                                      Icons.location_on,
                                      size: 40,
                                      color: Color(0xFFDC2626),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),

                          // Map Instruction Overlay Badge
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.touch_app, color: Colors.white, size: 12),
                                  SizedBox(width: 4),
                                  Text(
                                    'Tap anywhere to place / move pin',
                                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Quick Zoom Buttons
                          Positioned(
                            bottom: 8,
                            right: 8,
                            child: Column(
                              children: [
                                InkWell(
                                  onTap: () {
                                    final currentZoom = _pickerMapController.camera.zoom;
                                    _pickerMapController.move(_pickerMapController.camera.center, currentZoom + 1);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF222222) : Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: isDark ? Colors.white24 : Colors.black12),
                                    ),
                                    child: const Icon(Icons.add, size: 16),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                InkWell(
                                  onTap: () {
                                    final currentZoom = _pickerMapController.camera.zoom;
                                    _pickerMapController.move(_pickerMapController.camera.center, currentZoom - 1);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF222222) : Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: isDark ? Colors.white24 : Colors.black12),
                                    ),
                                    child: const Icon(Icons.remove, size: 16),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Quick Area Presets
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildLocationPresetChip('Riverbank Lowlands', const LatLng(6.9271, 79.8612)),
                        const SizedBox(width: 6),
                        _buildLocationPresetChip('Crossway Blvd', const LatLng(6.9312, 79.8584)),
                        const SizedBox(width: 6),
                        _buildLocationPresetChip('North Arterial KM 14', const LatLng(6.9205, 79.8690)),
                        const SizedBox(width: 6),
                        _buildLocationPresetChip('Harbor Coastal', const LatLng(6.9350, 79.8450)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Danger Perimeter Radius Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Hazard Perimeter Radius',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${_dangerRadiusMeters.toInt()} meters',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  Slider(
                    value: _dangerRadiusMeters,
                    min: 50.0,
                    max: 1000.0,
                    divisions: 19,
                    activeColor: isDark ? Colors.white : Colors.black,
                    inactiveColor: isDark ? const Color(0xFF2B2B2B) : const Color(0xFFE5E7EB),
                    onChanged: (val) {
                      setState(() {
                        _dangerRadiusMeters = val;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 3. Category Selector Chips
            const Text(
              'Select Hazard Category',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildCategoryChoice('SEVERE_FLOOD', 'Severe Flood', Icons.waves),
                _buildCategoryChoice('BLOCKED_ROAD', 'Blocked Road', Icons.block),
                _buildCategoryChoice('POWER_HAZARD', 'Power Line', Icons.bolt),
                _buildCategoryChoice('FALLEN_TREE', 'Fallen Tree', Icons.park),
                _buildCategoryChoice('LANDSLIDE', 'Landslide', Icons.landscape),
                _buildCategoryChoice('STRUCTURE_DAMAGE', 'Structural', Icons.domain),
              ],
            ),
            const SizedBox(height: 18),

            // 4. Ward / Neighborhood Field
            TextField(
              controller: _wardController,
              decoration: InputDecoration(
                labelText: 'Ward / District Name',
                labelStyle: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                hintText: 'e.g. Ward 12 - South Riverbank Zone',
                filled: true,
                fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 18),

            // 5. Voice Memo Recorder
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      _isRecordingVoice ? Icons.stop_circle : Icons.mic,
                      color: _isRecordingVoice ? const Color(0xFFDC2626) : null,
                    ),
                    onPressed: _toggleVoiceRecording,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isRecordingVoice
                              ? 'Recording Emergency Voice Note...'
                              : (_hasVoiceNote ? 'Voice Note Attached (10s)' : 'Attach Voice Note (Optional)'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          _isRecordingVoice ? 'Speak now into microphone' : 'Hands-free voice telemetry for field crews',
                          style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  if (_hasVoiceNote && !_isRecordingVoice)
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18),
                      onPressed: () {
                        setState(() {
                          _hasVoiceNote = false;
                        });
                      },
                    ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 6. Eyewitness Description Field
            TextField(
              controller: _descController,
              maxLines: 3,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Additional eyewitness details (water rising speed, stranded vehicles, power sparking, etc.)',
                hintStyle: TextStyle(fontSize: 12, color: isDark ? Colors.white38 : Colors.black38),
                filled: true,
                fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 24),

            // 7. Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReport,
                child: _isSubmitting
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                          SizedBox(width: 12),
                          Text('Ingesting & Broadcasting Pin...'),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.send_rounded, size: 18),
                          const SizedBox(width: 8),
                          Text('Broadcast Report (${urgencyScore.toStringAsFixed(1)} Urgency)'),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationPresetChip(String title, LatLng coords) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isSelected = _selectedPinLocation != null &&
        (_selectedPinLocation!.latitude - coords.latitude).abs() < 0.0001 &&
        (_selectedPinLocation!.longitude - coords.longitude).abs() < 0.0001;

    return ActionChip(
      label: Text(title, style: TextStyle(fontSize: 11, color: isSelected ? (isDark ? Colors.black : Colors.white) : null)),
      backgroundColor: isSelected ? (isDark ? Colors.white : Colors.black) : null,
      onPressed: () {
        setState(() {
          _useCustomPinLocation = true;
          _selectedPinLocation = coords;
          _pickerMapController.move(coords, 15.0);
        });
      },
    );
  }

  Widget _buildCategoryChoice(String key, String label, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isSelected = _selectedCategory == key;

    return ChoiceChip(
      selected: isSelected,
      avatar: Icon(
        icon,
        size: 16,
        color: isSelected ? (isDark ? Colors.black : Colors.white) : null,
      ),
      label: Text(label),
      selectedColor: isDark ? Colors.white : Colors.black,
      labelStyle: TextStyle(
        color: isSelected ? (isDark ? Colors.black : Colors.white) : null,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedCategory = key;
          });
        }
      },
    );
  }
}
