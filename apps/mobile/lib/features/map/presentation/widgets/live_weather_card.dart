import 'package:flutter/material.dart';

class LiveWeatherCard extends StatefulWidget {
  final bool fullWidth;

  const LiveWeatherCard({
    super.key,
    this.fullWidth = true,
  });

  @override
  State<LiveWeatherCard> createState() => _LiveWeatherCardState();
}

class _LiveWeatherCardState extends State<LiveWeatherCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => _isExpanded = !_isExpanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        width: widget.fullWidth ? double.infinity : (_isExpanded ? 320 : 260),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F0F12).withValues(alpha: 0.88) : Colors.white.withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.08),
            width: 0.75,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.1),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Live Radar Privilege Badge & Temperature
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF059669),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Color(0xFF059669), blurRadius: 6, spreadRadius: 1),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'METEOROLOGICAL PRIVILEGE',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.6,
                        color: isDark ? Colors.white70 : Colors.black54,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'WATCH LVL 3',
                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFFDC2626)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Middle: Weather Icon + Temperature + Condition
            Row(
              children: [
                const Icon(Icons.thunderstorm, color: Color(0xFF0284C7), size: 22),
                const SizedBox(width: 8),
                const Text(
                  '28°C',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Heavy Monsoon Rain',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  size: 16,
                  color: isDark ? Colors.white38 : Colors.black38,
                ),
              ],
            ),

            // Live Weather Telemetry Metrics Row
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildWeatherMiniStat('Rain', '82 mm/h', const Color(0xFF0284C7)),
                _buildWeatherMiniStat('Wind', '44 km/h SW', const Color(0xFFD97706)),
                _buildWeatherMiniStat('Pressure', '994 hPa', const Color(0xFF8B5CF6)),
                _buildWeatherMiniStat('Flood Threat', 'CRITICAL', const Color(0xFFDC2626)),
              ],
            ),

            // Expanded Privilege Forecast Panel
            if (_isExpanded) ...[
              const SizedBox(height: 10),
              Divider(height: 1, color: isDark ? Colors.white12 : Colors.black12),
              const SizedBox(height: 8),
              const Text(
                'DOPPLER SATELLITE RADAR STREAM',
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey),
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildForecastHour('18:00', '⛈️ 88%', isDark),
                  _buildForecastHour('19:00', '🌧️ 95%', isDark),
                  _buildForecastHour('20:00', '⛈️ 92%', isDark),
                  _buildForecastHour('21:00', '🌧️ 70%', isDark),
                  _buildForecastHour('22:00', '🌦️ 45%', isDark),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Live hydrological correlation active: catchment soil saturation at 94%. Move assets to high ground.',
                style: TextStyle(fontSize: 10, color: isDark ? Colors.white60 : Colors.black54, height: 1.3),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherMiniStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.w600)),
        Text(
          value,
          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color),
        ),
      ],
    );
  }

  Widget _buildForecastHour(String hour, String stat, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1B1B20) : const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        children: [
          Text(hour, style: const TextStyle(fontSize: 8, color: Colors.grey)),
          const SizedBox(height: 2),
          Text(stat, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
