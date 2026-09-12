import 'package:flutter/material.dart';

class EmergencyPlaybookModal extends StatelessWidget {
  const EmergencyPlaybookModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const EmergencyPlaybookModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
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
                    Icon(Icons.medical_services, color: Color(0xFFDC2626), size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Emergency Triage Playbook',
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
                _buildProtocolCard(
                  context,
                  title: 'Hands-Only CPR (Cardiac Arrest)',
                  urgency: 'CRITICAL',
                  icon: Icons.favorite,
                  color: const Color(0xFFDC2626),
                  steps: [
                    'Call 1990 / 117 ambulance service immediately.',
                    'Place hands in center of chest, lock elbows.',
                    'Push hard and fast: 100-120 compressions per minute (to the beat of "Stayin Alive").',
                    'Allow complete chest recoil between each compression.',
                    'Do not stop until paramedic crew arrives or AED is attached.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildProtocolCard(
                  context,
                  title: 'Severe Arterial Bleeding & Tourniquet',
                  urgency: 'HIGH',
                  icon: Icons.bloodtype,
                  color: const Color(0xFFDC2626),
                  steps: [
                    'Apply direct firm pressure with clean cloth or trauma dressing.',
                    'If bleeding from limb does not stop, apply tourniquet 2-3 inches above wound.',
                    'Tighten windlass until bleeding stops completely.',
                    'Note exact time of application on patient forehead (e.g., "T 15:45").',
                    'Keep patient warm to prevent traumatic shock.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildProtocolCard(
                  context,
                  title: 'Flash Flood & River Rapid Inundation',
                  urgency: 'HIGH',
                  icon: Icons.water,
                  color: const Color(0xFF0284C7),
                  steps: [
                    'Never walk or drive into moving water: 6 inches can knock down an adult.',
                    'Disconnect main electrical breaker before water reaches ground sockets.',
                    'Move to high ground or designated emergency concrete shelters.',
                    'Do not drink untreated flood water (high risk of waterborne pathogens).',
                    'Turn on DisasterShield Strobe Beacon if stranded on rooftop.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildProtocolCard(
                  context,
                  title: 'Downed High-Voltage Power Lines',
                  urgency: 'CRITICAL',
                  icon: Icons.bolt,
                  color: const Color(0xFFD97706),
                  steps: [
                    'Maintain a strict minimum 10-meter (33 feet) clearance perimeter.',
                    'Assume every fallen cable is energized and deadly.',
                    'If inside a vehicle touching a wire, remain inside until utility crews de-energize.',
                    'If forced to evacuate car due to fire: jump clear with both feet together—never touch ground and car at same time.',
                    'Shuffle or hop away keeping feet touching to prevent ground potential gradient electrocution.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildProtocolCard(
                  context,
                  title: 'Earthquake Structural Tremor',
                  urgency: 'HIGH',
                  icon: Icons.landscape,
                  color: const Color(0xFF8B5CF6),
                  steps: [
                    'DROP onto your hands and knees.',
                    'COVER your head and neck under a sturdy table or desk.',
                    'HOLD ON to your shelter until shaking completely ceases.',
                    'Stay away from glass windows, exterior walls, and falling ceiling debris.',
                    'Do not use elevators; inspect stairs for damage before egress.',
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProtocolCard(
    BuildContext context, {
    required String title,
    required String urgency,
    required IconData icon,
    required Color color,
    required List<String> steps,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161616) : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        urgency,
                        style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...steps.asMap().entries.map((entry) {
            final idx = entry.key + 1;
            final text = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 18,
                    height: 18,
                    margin: const EdgeInsets.only(top: 1),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '$idx',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      text,
                      style: TextStyle(fontSize: 12, height: 1.4, color: isDark ? Colors.white : Colors.black87),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
