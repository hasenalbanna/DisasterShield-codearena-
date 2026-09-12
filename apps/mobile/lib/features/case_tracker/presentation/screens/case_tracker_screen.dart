import 'package:flutter/material.dart';

class CaseTrackerScreen extends StatelessWidget {
  const CaseTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'Case & Ward Tracker',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          bottom: const TabBar(
            indicatorColor: Color(0xFF2563EB),
            indicatorWeight: 3,
            labelColor: Color(0xFF60A5FA),
            unselectedLabelColor: Colors.white54,
            tabs: [
              Tab(text: 'My Reports'),
              Tab(text: 'Ward Alerts'),
              Tab(text: 'Resolved'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildMyReportsTab(),
            _buildWardAlertsTab(),
            const Center(child: Text('No resolved cases archived in this session.')),
          ],
        ),
      ),
    );
  }

  Widget _buildMyReportsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildCaseCard(
          id: 'hz_9982341af',
          title: 'Severe Flood - Ward 12',
          status: 'AI Verifying (82%)',
          statusColor: const Color(0xFF38BDF8),
          time: '12 mins ago',
        ),
        _buildCaseCard(
          id: 'hz_7719284cd',
          title: 'Blocked Road - Arterial KM 14',
          status: 'Dispatched to Crew 04',
          statusColor: const Color(0xFF10B981),
          time: '1 hour ago',
        ),
      ],
    );
  }

  Widget _buildWardAlertsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildCaseCard(
          id: 'alt_3310',
          title: 'AREA ALERT: Flash Flood Warning',
          status: 'Ward 12 & 14 Evacuation Route Active',
          statusColor: const Color(0xFFEF4444),
          time: 'Just now',
        ),
      ],
    );
  }

  Widget _buildCaseCard({
    required String id,
    required String title,
    required String status,
    required Color statusColor,
    required String time,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
                Text(
                  time,
                  style: const TextStyle(fontSize: 11, color: Colors.white54),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text(
                  status,
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.w600, fontSize: 12),
                ),
                const Spacer(),
                Text(
                  id,
                  style: const TextStyle(fontSize: 11, color: Colors.white38, fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
