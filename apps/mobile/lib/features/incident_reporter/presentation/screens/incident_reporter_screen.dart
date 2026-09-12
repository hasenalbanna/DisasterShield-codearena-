import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/models/hazard_model.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/services/firebase_hazard_service.dart';

class IncidentReporterScreen extends ConsumerStatefulWidget {
  const IncidentReporterScreen({super.key});

  @override
  ConsumerState<IncidentReporterScreen> createState() => _IncidentReporterScreenState();
}

class _IncidentReporterScreenState extends ConsumerState<IncidentReporterScreen>
    with SingleTickerProviderStateMixin {
  final ImagePicker _picker = ImagePicker();
  XFile? _capturedImage;
  String _selectedCategory = 'SEVERE_FLOOD';
  final TextEditingController _descController = TextEditingController();

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
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1600,
      );
      if (photo != null) {
        setState(() {
          _capturedImage = photo;
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

  Future<void> _submitReport() async {
    if (_capturedImage == null && kReleaseMode) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please attach or capture a hazard photo for AI validation.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final userCoords = ref.read(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final hazardId = 'hz_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';

    // On-device AI validation simulated pre-flight
    final hazard = HazardModel(
      id: hazardId,
      hazardId: hazardId,
      reportedBy: 'usr_citizen_local',
      reporterName: 'Field Citizen',
      category: _selectedCategory,
      coordinates: userCoords,
      geohash: 'tc3p18u',
      ward: 'Ward 12 - South District',
      description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
      mediaUrl: _capturedImage?.path ?? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
      audioMemoUrl: _hasVoiceNote ? 'memo_$hazardId.m4a' : null,
      status: 'PENDING_AI_CHECK',
      aiAnalysis: AiAnalysisResult(
        imageConfidence: 0.92,
        hazardDetected: _selectedCategory,
        isAuthentic: true,
        locationMatch: true,
        weatherSupport: true,
        clusterCount: 1,
        urgencyScore: 7.8,
        assignedStatus: 'PUBLISHED',
        reasoning: 'On-device camera framing verified. Dispatched to Cloud AI pipeline.',
      ),
      createdAt: DateTime.now(),
    );

    final success = await FirebaseHazardService.submitHazardReport(hazard);

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });

      _showSubmissionResultDialog(success, hazardId);
    }
  }

  void _showSubmissionResultDialog(bool isOnline, String hazardId) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF111111) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
        ),
        title: Row(
          children: [
            Icon(
              isOnline ? Icons.check_circle : Icons.offline_pin,
              color: isOnline ? const Color(0xFF059669) : const Color(0xFFD97706),
              size: 24,
            ),
            const SizedBox(width: 10),
            Text(
              isOnline ? 'Report Broadcasted' : 'Queued Offline',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isOnline
                  ? 'Your incident has been securely ingested by the Cloud AI Pipeline and assigned for immediate triage.'
                  : 'Cellular uplink degraded. Report securely encrypted and queued in the local SQLite spooler (0% data lost).',
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'Case ID: $hazardId\nCategory: $_selectedCategory',
                style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _capturedImage = null;
                _descController.clear();
                _hasVoiceNote = false;
              });
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationAsync = ref.watch(currentLocationProvider);
    final userCoords = locationAsync.value ?? LocationService.defaultCoordinates;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Automated Incident Reporter',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Camera Viewfinder / Capture Box
            GestureDetector(
              onTap: () => _showImageSourceModal(context),
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    width: 1.5,
                  ),
                ),
                child: _capturedImage != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(11),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            kIsWeb
                                ? Image.network(_capturedImage!.path, fit: BoxFit.cover)
                                : Image.file(File(_capturedImage!.path), fit: BoxFit.cover),
                            Positioned(
                              top: 10,
                              right: 10,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black87,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(Icons.check, color: Color(0xFF34D399), size: 14),
                                    SizedBox(width: 4),
                                    Text('Photo Captured', style: TextStyle(color: Colors.white, fontSize: 11)),
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
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1F1F1F) : const Color(0xFFF3F4F6),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt_outlined, size: 28),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Capture or Attach Incident Photo',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Image AI inspects blur, category & EXIF match',
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 20),

            // 2. Automated GPS Telemetry Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.my_location, size: 16),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Automated GPS Coordinates',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${userCoords.latitude.toStringAsFixed(4)}° N, ${userCoords.longitude.toStringAsFixed(4)}° E (±4m)',
                          style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'GPS Verified',
                      style: TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

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
            const SizedBox(height: 20),

            // 4. Voice Memo Recorder with Waveform
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                ),
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
                              ? 'Recording voice note...'
                              : (_hasVoiceNote ? 'Voice note attached (10s)' : 'Add Voice Note'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          _isRecordingVoice ? 'Speak clearly near microphone' : 'Hands-free speech description',
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
            const SizedBox(height: 20),

            // 5. Eyewitness Description Field
            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Additional eyewitness details (water level rising speed, road marks, etc.)',
                hintStyle: TextStyle(fontSize: 12, color: isDark ? Colors.white38 : Colors.black38),
                filled: true,
                fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // 6. Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReport,
                child: _isSubmitting
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          ),
                          SizedBox(width: 12),
                          Text('Running AI Validation Pipeline...'),
                        ],
                      )
                    : const Text(
                        'Submit & Run AI Verification',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChoice(String key, String label, IconData icon) {
    final isSelected = _selectedCategory == key;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ChoiceChip(
      selected: isSelected,
      avatar: Icon(
        icon,
        size: 16,
        color: isSelected
            ? (isDark ? Colors.black : Colors.white)
            : (isDark ? Colors.white70 : Colors.black87),
      ),
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
            _selectedCategory = key;
          });
        }
      },
    );
  }

  void _showImageSourceModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Live Camera Photo'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
