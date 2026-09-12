import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/local_storage_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isDownloadingMap = false;
  bool _isVectorMapCached = true;

  void _triggerOfflineSync() {
    final pending = LocalStorageService.pendingCount;
    if (pending == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All local reports are synced with Firebase!')),
      );
      return;
    }

    ref.read(offlineQueueCountProvider.notifier).refresh();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Syncing $pending queued reports to Firestore...')),
    );
  }

  void _toggleVectorMapDownload() async {
    setState(() {
      _isDownloadingMap = true;
    });

    await Future.delayed(const Duration(milliseconds: 1500));

    if (mounted) {
      setState(() {
        _isDownloadingMap = false;
        _isVectorMapCached = !_isVectorMapCached;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isVectorMapCached
              ? 'Sector 12 Vector Map Tiles downloaded (48 MB).'
              : 'Offline Map Cache cleared.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pendingCount = ref.watch(offlineQueueCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Profile & Safety Hub',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Citizen Profile Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    child: Icon(
                      Icons.person,
                      color: isDark ? Colors.white : Colors.black,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MRA Hasen Al Banna',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Registered Citizen Responder • Ward 12',
                          style: TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.4)),
                    ),
                    child: const Text(
                      'Trust: 98',
                      style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 2. Offline Resilience Manager
          Text(
            'OFFLINE RESILIENCE & CACHING',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.download_for_offline_outlined),
                  title: const Text('Offline Vector Maps', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text(
                    _isVectorMapCached ? 'Sector 12 tiles downloaded (48 MB)' : 'No map tiles cached offline',
                    style: const TextStyle(fontSize: 11),
                  ),
                  trailing: _isDownloadingMap
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : TextButton(
                          onPressed: _toggleVectorMapDownload,
                          child: Text(_isVectorMapCached ? 'Clear' : 'Download'),
                        ),
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                ListTile(
                  leading: const Icon(Icons.storage_outlined),
                  title: const Text('Local SQLite Spooler', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text(
                    pendingCount > 0 ? '$pendingCount reports queued offline' : '0 queued items • All synced',
                    style: const TextStyle(fontSize: 11),
                  ),
                  trailing: TextButton(
                    onPressed: _triggerOfflineSync,
                    child: const Text('Sync Now'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 3. Emergency Contacts
          Text(
            'EMERGENCY CONTACTS',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.phone_in_talk_outlined),
                  title: Text('Disaster Management Center', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text('Hotline: 117 (24/7 Dispatch)', style: TextStyle(fontSize: 11)),
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                const ListTile(
                  leading: Icon(Icons.local_hospital_outlined),
                  title: Text('National Ambulance Service', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text('Hotline: 1990 (Suwa Seriya)', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. Emergency Guidelines & Protocols
          Text(
            'STANDARD OPERATING PROCEDURES (SOP)',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.water_damage_outlined),
                  title: const Text('SOP-01: Flash Flood Safety', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: const Text('Move to designated high-ground shelters immediately.', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 16),
                  onTap: () {},
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                ListTile(
                  leading: const Icon(Icons.electrical_services_outlined),
                  title: const Text('SOP-02: Downed Power Lines', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: const Text('Maintain minimum 10m perimeter. Do not touch water nearby.', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 16),
                  onTap: () {},
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                ListTile(
                  leading: const Icon(Icons.emergency_share_outlined),
                  title: const Text('SOP-03: Voice Distress Beacons', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: const Text('Saying distress wake-word beams live GPS coordinates.', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 16),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
