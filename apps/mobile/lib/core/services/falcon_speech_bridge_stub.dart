// Fallback stub for non-web platforms

class FalconSpeechBridge {
  static bool get isSupported => false;

  static void speak(String text) {
    // No-op on non-web
  }

  static bool listen({
    required Function(String transcript) onResult,
    required Function(String error) onError,
  }) {
    // No-op on non-web
    return false;
  }
}
