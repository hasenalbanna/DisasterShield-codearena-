import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Safety Hub & Profile',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile User Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.2),
                    child: const Icon(Icons.person, color: Color(0xFF60A5FA), size: 32),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Citizen Responder', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('Ward 12 - South District', style: TextStyle(fontSize: 12, color: Colors.white54)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Trust: 98',
                      style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Offline Cache & Resilience
          const Text('OFFLINE RESILIENCE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54)),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.download_for_offline, color: Color(0xFF60A5FA)),
                  title: const Text('Offline Vector Maps', style: TextStyle(fontSize: 14)),
                  subtitle: const Text('Sector 12 downloaded (48 MB)', style: TextStyle(fontSize: 11, color: Colors.white54)),
                  trailing: const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
                ),
                const Divider(height: 1, color: Colors.white10),
                ListTile(
                  leading: const Icon(Icons.storage, color: Color(0xFFF59E0B)),
                  title: const Text('Local SQLite Spooler', style: TextStyle(fontSize: 14)),
                  subtitle: const Text('0 queued offline reports', style: TextStyle(fontSize: 11, color: Colors.white54)),
                  trailing: const Text('Synced', style: TextStyle(color: Color(0xFF10B981), fontSize: 11)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Safety Guidelines & Emergency SOPs
          const Text('EMERGENCY GUIDELINES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54)),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.flood, color: Color(0xFF38BDF8)),
                  title: const Text('Flash Flood Response Protocol', style: TextStyle(fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
                  onTap: () {},
                ),
                const Divider(height: 1, color: Colors.white10),
                ListTile(
                  leading: const Icon(Icons.electrical_services, color: Color(0xFFEF4444)),
                  title: const Text('Downed Power Lines Safety', style: TextStyle(fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
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
