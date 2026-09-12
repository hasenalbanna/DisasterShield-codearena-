import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/app_providers.dart';
import 'features/map/presentation/screens/live_hazard_map_screen.dart';
import 'features/incident_reporter/presentation/screens/incident_reporter_screen.dart';
import 'features/voice_sos/presentation/screens/voice_sos_screen.dart';
import 'features/voice_sos/presentation/widgets/falcon_voice_modal.dart';
import 'features/case_tracker/presentation/screens/case_tracker_screen.dart';
import 'features/profile/presentation/screens/profile_screen.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'core/services/auth_service.dart';
import 'core/models/user_profile_model.dart';

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

class DisasterShieldApp extends ConsumerWidget {
  const DisasterShieldApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp(
      title: 'DisasterShield',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends ConsumerStatefulWidget {
  const MainNavigationShell({super.key});

  @override
  ConsumerState<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends ConsumerState<MainNavigationShell> {
  final List<Widget> _screens = const [
    LiveHazardMapScreen(),
    IncidentReporterScreen(),
    VoiceSosScreen(),
    CaseTrackerScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(bottomNavIndexProvider);
    final currentThemeMode = ref.watch(themeModeProvider);
    final isDark = currentThemeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                Icons.shield,
                color: Theme.of(context).colorScheme.onPrimary,
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'DisasterShield',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
            ),
          ],
        ),
        actions: [
          InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => FalconVoiceModal.show(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFDC2626).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.4)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.mic, color: Color(0xFFDC2626), size: 15),
                  SizedBox(width: 4),
                  Text(
                    'Hey Falcon',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFDC2626),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
            tooltip: 'Toggle Theme',
            onPressed: () {
              ref.read(themeModeProvider.notifier).toggle();
            },
          ),
          ValueListenableBuilder<UserProfileModel?>(
            valueListenable: AuthService.activeProfileNotifier,
            builder: (context, profile, _) {
              final initial = (profile?.displayName.isNotEmpty == true)
                  ? profile!.displayName[0].toUpperCase()
                  : 'H';
              return Padding(
                padding: const EdgeInsets.only(right: 12, left: 4),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => LoginScreen.show(context),
                  child: CircleAvatar(
                    radius: 14,
                    backgroundColor: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                    child: Text(
                      initial,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          ref.read(bottomNavIndexProvider.notifier).setIndex(index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Map',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_a_photo_outlined),
            selectedIcon: Icon(Icons.add_a_photo),
            label: 'Report',
          ),
          NavigationDestination(
            icon: Icon(Icons.sos_outlined, color: Color(0xFFDC2626)),
            selectedIcon: Icon(Icons.sos, color: Color(0xFFDC2626)),
            label: 'SOS',
          ),
          NavigationDestination(
            icon: Icon(Icons.timeline_outlined),
            selectedIcon: Icon(Icons.timeline),
            label: 'Tracker',
          ),
          NavigationDestination(
            icon: Icon(Icons.shield_outlined),
            selectedIcon: Icon(Icons.shield),
            label: 'Safety',
          ),
        ],
      ),
    );
  }
}
