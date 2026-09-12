import 'dart:js_interop';

@JS('falconSpeech')
external FalconSpeechJS? get _falconSpeech;

extension type FalconSpeechJS(JSObject _) implements JSObject {
  external void speak(JSString text);
  external JSBoolean listen();
}

@JS('onFalconVoiceRecognized')
external set _onFalconVoiceRecognized(JSFunction? fn);

@JS('onFalconVoiceError')
external set _onFalconVoiceError(JSFunction? fn);

class FalconSpeechBridge {
  static bool get isSupported => true;

  static void speak(String text) {
    try {
      _falconSpeech?.speak(text.toJS);
    } catch (_) {}
  }

  static bool listen({
    required Function(String transcript) onResult,
    required Function(String error) onError,
  }) {
    try {
      _onFalconVoiceRecognized = ((JSString transcript) {
        onResult(transcript.toDart);
      }).toJS;

      _onFalconVoiceError = ((JSString err) {
        onError(err.toDart);
      }).toJS;

      final success = _falconSpeech?.listen();
      return success?.toDart ?? false;
    } catch (_) {
      return false;
    }
  }
}
