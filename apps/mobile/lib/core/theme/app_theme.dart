import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Minimalist Pure Light Mode
  // white bg, black text, black button white text
  static ThemeData get lightTheme {
    const bgWhite = Color(0xFFFFFFFF);
    const textBlack = Color(0xFF000000);
    const borderGray = Color(0xFFE5E7EB);
    const cardWhite = Color(0xFFF9FAFB);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgWhite,
      colorScheme: const ColorScheme.light(
        primary: textBlack,
        onPrimary: bgWhite,
        surface: cardWhite,
        onSurface: textBlack,
        error: Color(0xFFDC2626),
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme).apply(
        bodyColor: textBlack,
        displayColor: textBlack,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgWhite,
        foregroundColor: textBlack,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: textBlack,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: IconThemeData(color: textBlack),
      ),
      cardTheme: CardThemeData(
        color: cardWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: borderGray),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: textBlack,
          foregroundColor: bgWhite,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textBlack,
          side: const BorderSide(color: borderGray),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: bgWhite,
        indicatorColor: textBlack.withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: textBlack, fontWeight: FontWeight.bold, fontSize: 11);
          }
          return const TextStyle(color: Color(0xFF6B7280), fontSize: 11);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: textBlack);
          }
          return const IconThemeData(color: Color(0xFF6B7280));
        }),
      ),
    );
  }

  // Minimalist Pure Dark Mode
  // black bg, white text, white button black text
  static ThemeData get darkTheme {
    const bgBlack = Color(0xFF000000);
    const textWhite = Color(0xFFFFFFFF);
    const borderDark = Color(0xFF262626);
    const cardDark = Color(0xFF111111);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgBlack,
      colorScheme: const ColorScheme.dark(
        primary: textWhite,
        onPrimary: bgBlack,
        surface: cardDark,
        onSurface: textWhite,
        error: Color(0xFFEF4444),
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme).apply(
        bodyColor: textWhite,
        displayColor: textWhite,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgBlack,
        foregroundColor: textWhite,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: textWhite,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: IconThemeData(color: textWhite),
      ),
      cardTheme: CardThemeData(
        color: cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: borderDark),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: textWhite,
          foregroundColor: bgBlack,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textWhite,
          side: const BorderSide(color: borderDark),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: bgBlack,
        indicatorColor: textWhite.withValues(alpha: 0.15),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 11);
          }
          return const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: textWhite);
          }
          return const IconThemeData(color: Color(0xFF9CA3AF));
        }),
      ),
    );
  }
}
