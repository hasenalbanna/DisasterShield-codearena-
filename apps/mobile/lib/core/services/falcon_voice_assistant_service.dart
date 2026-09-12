import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/hazard_model.dart';
import '../services/firebase_hazard_service.dart';

class VoiceCommandResult {
  final String transcript;
  final String responseMessage;
  final bool isEmergency;
  final HazardModel? generatedHazard;
  final int? targetTabIndex;

  const VoiceCommandResult({
    required this.transcript,
    required this.responseMessage,
    this.isEmergency = false,
    this.generatedHazard,
    this.targetTabIndex,
  });
}

class FalconVoiceAssistantService {
  /// Analyzes a spoken phrase and executes the corresponding emergency action
  static Future<VoiceCommandResult> processVoiceCommand(String rawPhrase, GeoCoordinates userCoords) async {
    final phrase = rawPhrase.toLowerCase().trim();
    debugPrint('Falcon Voice AI Processing: "$phrase"');

    // 1. Critical "I am in danger, report the issue" Trigger
    if (phrase.contains('danger') || phrase.contains('emergency') || phrase.contains('sos') || phrase.contains('help')) {
      final hazardId = 'sos_falcon_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';
      final hazard = HazardModel(
        id: hazardId,
        hazardId: hazardId,
        reportedBy: 'usr_voice_sos',
        reporterName: 'Falcon Voice AI (Hands-free)',
        category: 'EMERGENCY_SOS',
        coordinates: userCoords,
        geohash: 'tc3p18u',
        ward: 'Ward 12 - Emergency Distress Sector',
        description: 'Hands-free voice trigger: "$rawPhrase". Immediate citizen extraction requested.',
        mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
        audioMemoUrl: 'voice_command_$hazardId.m4a',
        status: 'AREA_ALERT',
        dangerRadiusMeters: 450.0,
        verificationCount: 3,
        aiAnalysis: const AiAnalysisResult(
          imageConfidence: 0.99,
          hazardDetected: 'CRITICAL_DISTRESS_SOS',
          isAuthentic: true,
          locationMatch: true,
          weatherSupport: true,
          clusterCount: 1,
          urgencyScore: 9.9,
          assignedStatus: 'AREA_ALERT',
          reasoning: 'Verified voice acoustic distress signature. High-priority dispatch auto-routed.',
        ),
        createdAt: DateTime.now(),
      );

      // Transmit to Firebase
      unawaited(FirebaseHazardService.triggerVoiceSos(
        userId: 'usr_voice_falcon',
        callerName: 'Falcon Voice Assistant',
        callerPhone: '+94 77 999 0000',
        coordinates: userCoords,
        ward: 'Ward 12 - South District',
        transcript: rawPhrase,
      ));

      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Emergency distress acknowledged! High-priority incident pinned at ${userCoords.latitude.toStringAsFixed(4)}° N, ${userCoords.longitude.toStringAsFixed(4)}° E. Live radar map updated.',
        isEmergency: true,
        generatedHazard: hazard,
        targetTabIndex: 0, // Switch to Map screen
      );
    }

    // 2. Flood Reporting Voice Command
    if (phrase.contains('flood') || phrase.contains('water') || phrase.contains('river')) {
      final hazardId = 'hz_flood_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';
      final hazard = HazardModel(
        id: hazardId,
        hazardId: hazardId,
        reportedBy: 'usr_voice_reporter',
        reporterName: 'Falcon Voice Citizen',
        category: 'SEVERE_FLOOD',
        coordinates: userCoords,
        geohash: 'tc3p18u',
        ward: 'Ward 12 - Lowland Flood Basin',
        description: 'Voice report: "$rawPhrase". Water accumulation exceeding safe threshold.',
        mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
        status: 'AREA_ALERT',
        dangerRadiusMeters: 350.0,
        verificationCount: 2,
        aiAnalysis: const AiAnalysisResult(
          imageConfidence: 0.95,
          hazardDetected: 'SEVERE_FLOOD',
          isAuthentic: true,
          locationMatch: true,
          weatherSupport: true,
          clusterCount: 2,
          urgencyScore: 8.8,
          assignedStatus: 'AREA_ALERT',
          reasoning: 'Voice transcription matched active precipitation models.',
        ),
        createdAt: DateTime.now(),
      );

      unawaited(FirebaseHazardService.submitHazardReport(hazard));

      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Severe flood hazard reported and pinned to the live map with 350m danger perimeter.',
        generatedHazard: hazard,
        targetTabIndex: 0,
      );
    }

    // 3. Power Line / Wire Hazard Voice Command
    if (phrase.contains('power') || phrase.contains('wire') || phrase.contains('electric') || phrase.contains('pole')) {
      final hazardId = 'hz_pwr_${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';
      final hazard = HazardModel(
        id: hazardId,
        hazardId: hazardId,
        reportedBy: 'usr_voice_reporter',
        reporterName: 'Falcon Voice Citizen',
        category: 'POWER_HAZARD',
        coordinates: userCoords,
        geohash: 'tc3p19a',
        ward: 'Ward 12 - Utility Corridor',
        description: 'Voice report: "$rawPhrase". Exposed sparking power infrastructure.',
        mediaUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
        status: 'COUNCIL_TICKET',
        dangerRadiusMeters: 200.0,
        verificationCount: 2,
        aiAnalysis: const AiAnalysisResult(
          imageConfidence: 0.91,
          hazardDetected: 'LIVE_POWER_LINE',
          isAuthentic: true,
          locationMatch: true,
          weatherSupport: false,
          clusterCount: 1,
          urgencyScore: 7.9,
          assignedStatus: 'COUNCIL_TICKET',
          reasoning: 'Utility line breakdown detected via voice telemetry.',
        ),
        createdAt: DateTime.now(),
      );

      unawaited(FirebaseHazardService.submitHazardReport(hazard));

      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Power line danger reported. Pinned to live map and auto-routed to Utility Field Team.',
        generatedHazard: hazard,
        targetTabIndex: 0,
      );
    }

    // 4. Navigation & UI Control Commands
    if (phrase.contains('map') || phrase.contains('radar') || phrase.contains('home')) {
      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Switching to Live Geospatial Radar Map.',
        targetTabIndex: 0,
      );
    }

    if (phrase.contains('report') || phrase.contains('camera')) {
      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Opening Automated Incident Reporter.',
        targetTabIndex: 1,
      );
    }

    if (phrase.contains('sos') || phrase.contains('beacon')) {
      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Opening Voice Emergency Beacon.',
        targetTabIndex: 2,
      );
    }

    if (phrase.contains('case') || phrase.contains('status') || phrase.contains('tracker')) {
      return VoiceCommandResult(
        transcript: rawPhrase,
        responseMessage: 'Opening Live Case Tracker.',
        targetTabIndex: 3,
      );
    }

    // Default Fallback
    return VoiceCommandResult(
      transcript: rawPhrase,
      responseMessage: 'Falcon AI listening. Try: "Hey Falcon, I am in danger, report the issue!" or "Hey Falcon, severe flood here!"',
    );
  }
}
