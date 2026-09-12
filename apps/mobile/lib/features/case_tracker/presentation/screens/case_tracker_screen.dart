import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/hazard_model.dart';
import '../../../../core/providers/app_providers.dart';

class CaseTrackerScreen extends ConsumerWidget {
  const CaseTrackerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hazardsAsync = ref.watch(liveHazardsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final allHazards = hazardsAsync.value ?? [];

    final myReports = allHazards.where((h) => h.status != 'RESOLVED').toList();
    final wardAlerts = allHazards.where((h) => h.status == 'AREA_ALERT').toList();
    final resolvedCases = allHazards.where((h) => h.status == 'RESOLVED').toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'Active Case & Alert Tracker',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          bottom: TabBar(
            indicatorColor: isDark ? Colors.white : Colors.black,
            indicatorWeight: 2.5,
            labelColor: isDark ? Colors.white : Colors.black,
            unselectedLabelColor: isDark ? Colors.white54 : Colors.black45,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            tabs: [
              Tab(text: 'My Reports (${myReports.length})'),
              Tab(text: 'Ward Alerts (${wardAlerts.length})'),
              Tab(text: 'Resolved (${resolvedCases.length})'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildReportsList(context, myReports, isDark, emptyMsg: 'No pending incident reports active.'),
            _buildAlertsList(context, wardAlerts, isDark),
            _buildResolvedList(context, resolvedCases, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildReportsList(BuildContext context, List<HazardModel> reports, bool isDark, {required String emptyMsg}) {
    if (reports.isEmpty) {
      return Center(
        child: Text(
          emptyMsg,
          style: TextStyle(fontSize: 13, color: isDark ? Colors.white54 : Colors.black54),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: reports.length,
      itemBuilder: (ctx, index) {
        final item = reports[index];
        return _buildCaseTrackerCard(context, item, isDark);
      },
    );
  }

  Widget _buildAlertsList(BuildContext context, List<HazardModel> alerts, bool isDark) {
    if (alerts.isEmpty) {
      return Center(
        child: Text(
          'No active emergency alerts in your ward.',
          style: TextStyle(fontSize: 13, color: isDark ? Colors.white54 : Colors.black54),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: alerts.length,
      itemBuilder: (ctx, index) {
        final item = alerts[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDC2626).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.4)),
                      ),
                      child: const Text(
                        'AREA ALERT',
                        style: TextStyle(color: Color(0xFFDC2626), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.ward,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item.aiAnalysis?.reasoning ?? 'Emergency advisory active. Evacuate low-lying riverbanks immediately.',
                  style: const TextStyle(fontSize: 12, height: 1.4),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Icon(Icons.shield_outlined, size: 14, color: Color(0xFF059669)),
                    const SizedBox(width: 4),
                    const Text('Shelter: South Community Hall (84% capacity)', style: TextStyle(fontSize: 11)),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View Safe Route', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildResolvedList(BuildContext context, List<HazardModel> resolved, bool isDark) {
    if (resolved.isEmpty) {
      return Center(
        child: Text(
          'No resolved archives in current session.',
          style: TextStyle(fontSize: 13, color: isDark ? Colors.white54 : Colors.black54),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: resolved.length,
      itemBuilder: (ctx, index) {
        final item = resolved[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.check_circle, color: Color(0xFF059669)),
            title: Text(item.ward, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Resolved by municipal crew • Case ${item.hazardId}', style: const TextStyle(fontSize: 11)),
          ),
        );
      },
    );
  }

  Widget _buildCaseTrackerCard(BuildContext context, HazardModel item, bool isDark) {
    final statusColor = _getStatusColor(item.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    item.ward,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    item.status.replaceAll('_', ' '),
                    style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Timeline Steps
            Row(
              children: [
                _buildTimelineStep('Submitted', true),
                _buildTimelineDivider(true),
                _buildTimelineStep('AI Checked', item.status != 'PENDING_AI_CHECK'),
                _buildTimelineDivider(item.status == 'DISPATCHED' || item.status == 'COUNCIL_TICKET'),
                _buildTimelineStep('Dispatched', item.status == 'DISPATCHED'),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Text(
                  'Urgency: ${item.aiAnalysis?.urgencyScore ?? 7.0}/10',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 12),
                Text(
                  'Cluster: ${item.aiAnalysis?.clusterCount ?? 1} report(s)',
                  style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                ),
                const Spacer(),
                Text(
                  item.hazardId,
                  style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: isDark ? Colors.white38 : Colors.black38),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineStep(String label, bool isDone) {
    return Column(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone ? const Color(0xFF059669) : Colors.grey.withValues(alpha: 0.3),
          ),
          child: isDone ? const Icon(Icons.check, size: 9, color: Colors.white) : null,
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 9)),
      ],
    );
  }

  Widget _buildTimelineDivider(bool isDone) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 14),
        color: isDone ? const Color(0xFF059669) : Colors.grey.withValues(alpha: 0.3),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'AREA_ALERT':
        return const Color(0xFFDC2626);
      case 'COUNCIL_TICKET':
        return const Color(0xFFD97706);
      case 'PUBLISHED':
        return const Color(0xFF059669);
      case 'DISPATCHED':
        return const Color(0xFF2563EB);
      default:
        return const Color(0xFF6B7280);
    }
  }
}
