import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/local_storage_service.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/services/location_service.dart';
import '../../../auth/presentation/screens/login_screen.dart';
import '../widgets/emergency_playbook_modal.dart';
import '../widgets/safe_zones_modal.dart';
import '../widgets/safety_checkin_modal.dart';
import '../../../voice_sos/presentation/widgets/emergency_strobe_modal.dart';

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
    final userCoords = ref.watch(currentLocationProvider).value ?? LocationService.defaultCoordinates;
    final activeUser = AuthService.currentProfile;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Safety Operations & Profile Hub',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            tooltip: 'User Directory & Login',
            onPressed: () => LoginScreen.show(context),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Citizen / Responder Profile Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
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
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activeUser?.displayName ?? 'MRA Hasen Al Banna',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${activeUser?.role ?? "Citizen Responder"} • ${activeUser?.ward ?? "Ward 12"}',
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                            Text(
                              activeUser?.email ?? 'hasen.banna@disastershield.org',
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
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
                        child: Text(
                          'Trust: ${activeUser?.reputationScore ?? 98}',
                          style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.cloud_done, size: 14, color: Color(0xFF059669)),
                          const SizedBox(width: 4),
                          Text(
                            'Synced to Firestore "users"',
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.black54),
                          ),
                        ],
                      ),
                      TextButton.icon(
                        onPressed: () => LoginScreen.show(context),
                        icon: const Icon(Icons.swap_horiz, size: 14),
                        label: const Text('Switch / Sign In', style: TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),

          // 2. Interactive Tactical Disaster Tools
          Text(
            'TACTICAL DISASTER DEFENSE TOOLS',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  title: 'Safe Zones',
                  subtitle: 'High-ground shelters',
                  icon: Icons.shield,
                  color: const Color(0xFF059669),
                  onTap: () => SafeZonesModal.show(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  title: 'Rescue Strobe',
                  subtitle: 'Night optical beacon',
                  icon: Icons.flash_on,
                  color: const Color(0xFFDC2626),
                  onTap: () => EmergencyStrobeModal.show(context, userCoords),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  title: 'Safety Check-In',
                  subtitle: 'River & status radar',
                  icon: Icons.safety_check,
                  color: const Color(0xFF2563EB),
                  onTap: () => SafetyCheckinModal.show(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  title: 'First-Aid Guide',
                  subtitle: 'CPR & trauma triage',
                  icon: Icons.medical_services,
                  color: const Color(0xFFD97706),
                  onTap: () => EmergencyPlaybookModal.show(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 3. Offline Resilience Manager
          Text(
            'OFFLINE RESILIENCE & ZERO-COST CLOUD STORAGE',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.data_object),
                  title: const Text('Zero-Cost Base64 DB Storage', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: const Text(
                    'Photos compressed & stored directly in Firestore database (Free tier active)',
                    style: TextStyle(fontSize: 11),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('ACTIVE', style: TextStyle(color: Color(0xFF059669), fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
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

          // 4. Emergency Contacts & Dispatch
          Text(
            '24/7 NATIONAL EMERGENCY HOTLINES',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white54 : Colors.black54),
          ),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.phone_in_talk_outlined, color: Color(0xFFDC2626)),
                  title: Text('Disaster Management Center', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text('Hotline: 117 (24/7 National Dispatch)', style: TextStyle(fontSize: 11)),
                ),
                Divider(height: 1, color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
                const ListTile(
                  leading: Icon(Icons.local_hospital_outlined, color: Color(0xFF059669)),
                  title: Text('National Ambulance Service', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text('Hotline: 1990 (Suwa Seriya Rapid Response)', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF161616) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            Text(
              subtitle,
              style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
