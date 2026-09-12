import 'package:flutter/material.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/models/user_profile_model.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;

  const LoginScreen({super.key, this.onLoginSuccess});

  static Future<void> show(BuildContext context) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (ctx) => const LoginScreen()),
    );
  }

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController(text: 'hasen.banna@disastershield.org');
  final TextEditingController _passwordController = TextEditingController(text: 'Emergency#2026');
  final TextEditingController _nameController = TextEditingController(text: 'MRA Hasen Al Banna');
  final TextEditingController _wardController = TextEditingController(text: 'Ward 12 - South Riverbank');

  bool _isRegistering = false;
  bool _isLoading = false;
  String _selectedRole = 'Citizen Responder';

  final List<String> _roles = [
    'Citizen Responder',
    'First Responder',
    'Emergency Dispatcher',
    'Civil Defense Scout',
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _wardController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter valid email and password')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      UserProfileModel profile;
      if (_isRegistering) {
        profile = await AuthService.registerWithEmail(
          email: email,
          password: password,
          displayName: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Citizen Responder',
          role: _selectedRole,
          ward: _wardController.text.trim(),
        );
      } else {
        profile = await AuthService.signInWithEmail(email, password);
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF059669),
          content: Text('Welcome, ${profile.displayName} (${profile.role}) • Synced to Cloud DB'),
        ),
      );

      if (widget.onLoginSuccess != null) {
        widget.onLoginSuccess!();
      } else {
        Navigator.pop(context);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Auth error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _demoLogin(String role, String name) async {
    setState(() {
      _isLoading = true;
    });

    final profile = await AuthService.quickDemoSignIn(
      role: role,
      name: name,
      ward: 'Ward 12 - South District',
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF059669),
        content: Text('Authenticated as ${profile.displayName} • Synced to Firestore users'),
      ),
    );

    if (widget.onLoginSuccess != null) {
      widget.onLoginSuccess!();
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _isRegistering ? 'Register Responder' : 'Sign In',
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Branding Banner
            Center(
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white : Colors.black,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10)],
                    ),
                    child: Icon(
                      Icons.shield,
                      color: isDark ? Colors.black : Colors.white,
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'DisasterShield Identity',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Decentralized Emergency Dispatch & Cloud Roster',
                    style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Tab Toggle
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isDark ? const Color(0xFF333333) : const Color(0xFFE5E7EB)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isRegistering = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isRegistering ? (isDark ? Colors.white : Colors.black) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            'Sign In',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: !_isRegistering ? (isDark ? Colors.black : Colors.white) : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isRegistering = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isRegistering ? (isDark ? Colors.white : Colors.black) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            'Create Account',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: _isRegistering ? (isDark ? Colors.black : Colors.white) : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (_isRegistering) ...[
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  prefixIcon: const Icon(Icons.person_outline, size: 18),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                initialValue: _selectedRole,
                items: _roles
                    .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13))))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedRole = val);
                },
                decoration: InputDecoration(
                  labelText: 'Operational Role',
                  prefixIcon: const Icon(Icons.badge_outlined, size: 18),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _wardController,
                decoration: InputDecoration(
                  labelText: 'Assigned Ward / District',
                  prefixIcon: const Icon(Icons.location_city_outlined, size: 18),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 14),
            ],

            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email Address',
                prefixIcon: const Icon(Icons.email_outlined, size: 18),
                filled: true,
                fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 14),

            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline, size: 18),
                filled: true,
                fillColor: isDark ? const Color(0xFF111111) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        _isRegistering ? 'Register into Cloud Database' : 'Sign In to DisasterShield',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // One-Tap Demo Access for Evaluators / Testers
            Row(
              children: [
                Expanded(child: Divider(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text(
                    'OR QUICK-ACCESS DEMO',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white38 : Colors.black38),
                  ),
                ),
                Expanded(child: Divider(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB))),
              ],
            ),
            const SizedBox(height: 14),

            _buildDemoLoginTile(
              role: 'Citizen Responder',
              name: 'MRA Hasen Al Banna',
              icon: Icons.person_pin,
              color: const Color(0xFF059669),
            ),
            const SizedBox(height: 8),
            _buildDemoLoginTile(
              role: 'First Responder',
              name: 'Captain K. Perera (Rescue)',
              icon: Icons.local_fire_department,
              color: const Color(0xFFDC2626),
            ),
            const SizedBox(height: 8),
            _buildDemoLoginTile(
              role: 'Emergency Dispatcher',
              name: 'Director H. Samarasinghe (HQ)',
              icon: Icons.headset_mic,
              color: const Color(0xFF2563EB),
            ),
            const SizedBox(height: 20),

            // Cloud DB Notice
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.25)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.cloud_done, color: Color(0xFF059669), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'All authenticated profiles automatically register in the Firestore "users" collection with operational roles & reputation metrics.',
                      style: TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDemoLoginTile({
    required String role,
    required String name,
    required IconData icon,
    required Color color,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () => _demoLogin(role, name),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141414) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(role, style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
