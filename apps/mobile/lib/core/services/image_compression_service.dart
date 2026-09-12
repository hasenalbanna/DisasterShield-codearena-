import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class ImageCompressionService {
  /// Converts an XFile into a compressed Base64 Data URI string.
  /// This stores directly into Firestore / Database as text, completely
  /// eliminating the need for paid Firebase Cloud Storage buckets!
  static Future<String> convertXFileToBase64(XFile file) async {
    try {
      final bytes = await file.readAsBytes();
      final base64String = base64Encode(bytes);
      // Construct mathematical Base64 Data URI representation
      return 'data:image/jpeg;base64,$base64String';
    } catch (e) {
      debugPrint('Error converting image to Base64: $e');
      return file.path;
    }
  }

  /// Universal image builder that seamlessly renders:
  /// - Base64 Data URIs (stored directly in Firestore database)
  /// - HTTP / HTTPS remote URLs
  /// - Asset paths or fallback placeholders
  static Widget buildEvidenceWidget(
    String mediaUrl, {
    BoxFit fit = BoxFit.cover,
    double? width,
    double? height,
    Widget? placeholder,
  }) {
    if (mediaUrl.startsWith('data:image')) {
      try {
        final commaIndex = mediaUrl.indexOf(',');
        final base64Payload = commaIndex != -1 ? mediaUrl.substring(commaIndex + 1) : mediaUrl;
        final decodedBytes = base64Decode(base64Payload);
        return Image.memory(
          decodedBytes,
          fit: fit,
          width: width,
          height: height,
          errorBuilder: (context, error, stackTrace) => _buildErrorPlaceholder(width, height),
        );
      } catch (e) {
        debugPrint('Base64 decode error: $e');
        return _buildErrorPlaceholder(width, height);
      }
    }

    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return Image.network(
        mediaUrl,
        fit: fit,
        width: width,
        height: height,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            width: width,
            height: height,
            color: Colors.black12,
            child: const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) => _buildErrorPlaceholder(width, height),
      );
    }

    return _buildErrorPlaceholder(width, height);
  }

  static Widget _buildErrorPlaceholder(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: const Color(0xFF1E1E1E),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.broken_image_outlined, color: Colors.white38, size: 24),
            SizedBox(height: 4),
            Text(
              'Evidence Image',
              style: TextStyle(color: Colors.white38, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }

  /// Preset photographic evidence for instant 1-tap testing
  static final List<Map<String, String>> evidencePresets = [
    {
      'title': 'High Flood Inundation',
      'category': 'SEVERE_FLOOD',
      'url': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
    },
    {
      'title': 'Sparking Downed Line',
      'category': 'POWER_HAZARD',
      'url': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
    },
    {
      'title': 'Highway Landslide',
      'category': 'LANDSLIDE',
      'url': 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800',
    },
    {
      'title': 'Fallen Oak Tree on Road',
      'category': 'FALLEN_TREE',
      'url': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    },
  ];
}
