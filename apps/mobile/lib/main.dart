import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/map/presentation/screens/live_hazard_map_screen.dart';
import 'features/incident_reporter/presentation/screens/incident_reporter_screen.dart';
import 'features/voice_sos/presentation/screens/voice_sos_screen.dart';
import 'features/case_tracker/presentation/screens/case_tracker_screen.dart';
import 'features/profile/presentation/screens/profile_screen.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase initialization warning: $e');
  }
  runApp(const ProviderScope(child: DisasterShieldApp()));
}

class DisasterShieldApp extends StatelessWidget {
  const DisasterShieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DisasterShield',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    LiveHazardMapScreen(),
    IncidentReporterScreen(),
    VoiceSosScreen(),
    CaseTrackerScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Colors.white.withValues(alpha: 0.08),
              width: 1,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: const Color(0xFF0A0E17),
          indicatorColor: const Color(0xFF2563EB).withValues(alpha: 0.25),
          onDestinationSelected: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.map_outlined),
              selectedIcon: Icon(Icons.map, color: Color(0xFF60A5FA)),
              label: 'Map',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_a_photo_outlined),
              selectedIcon: Icon(Icons.add_a_photo, color: Color(0xFF60A5FA)),
              label: 'Report',
            ),
            NavigationDestination(
              icon: Icon(Icons.sos_outlined, color: Color(0xFFEF4444)),
              selectedIcon: Icon(Icons.sos, color: Color(0xFFEF4444)),
              label: 'SOS',
            ),
            NavigationDestination(
              icon: Icon(Icons.timeline_outlined),
              selectedIcon: Icon(Icons.timeline, color: Color(0xFF60A5FA)),
              label: 'Tracker',
            ),
            NavigationDestination(
              icon: Icon(Icons.shield_outlined),
              selectedIcon: Icon(Icons.shield, color: Color(0xFF60A5FA)),
              label: 'Safety',
            ),
          ],
        ),
      ),
    );
  }
}
