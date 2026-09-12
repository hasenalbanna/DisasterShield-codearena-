// File generated for DisasterShield Firebase configuration
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyD52aeDMpYubc4dTPbSKMUMFGrD3dmFR8Y',
    appId: '1:298522328437:web:bb407dc981ed2bae58273c',
    messagingSenderId: '298522328437',
    projectId: 'disastershield-a23cf',
    authDomain: 'disastershield-a23cf.firebaseapp.com',
    databaseURL: 'https://disastershield-a23cf-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'disastershield-a23cf.firebasestorage.app',
    measurementId: 'G-SBDQ1V96VD',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB98mXf3r_-V3sswt1MkwsqGhDG6WVSh_4',
    appId: '1:298522328437:android:e8eb3dda5f53765e58273c',
    messagingSenderId: '298522328437',
    projectId: 'disastershield-a23cf',
    databaseURL: 'https://disastershield-a23cf-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'disastershield-a23cf.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyD52aeDMpYubc4dTPbSKMUMFGrD3dmFR8Y',
    appId: '1:298522328437:ios:e8eb3dda5f53765e58273c',
    messagingSenderId: '298522328437',
    projectId: 'disastershield-a23cf',
    storageBucket: 'disastershield-a23cf.firebasestorage.app',
  );
}
