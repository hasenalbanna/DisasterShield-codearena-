import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand & Emergency Colors
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color crimsonSos = Color(0xFFDC2626);
  static const Color amberWarning = Color(0xFFD97706);
  static const Color emeraldSafe = Color(0xFF059669);
  
  // Dark Command Surface Palette
  static const Color bgDark = Color(0xFF0A0E17);
  static const Color surfaceCard = Color(0xFF131B2A);
  static const Color borderSubtle = Color(0x1AFFFFFF);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: primaryBlue,
        error: crimsonSos,
        surface: surfaceCard,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgDark,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: surfaceCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderSubtle),
        ),
      ),
    );
  }
}
