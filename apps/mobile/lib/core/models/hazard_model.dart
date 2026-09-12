class GeoCoordinates {
  final double latitude;
  final double longitude;
  final double? altitude;
  final double? accuracy;

  const GeoCoordinates({
    required this.latitude,
    required this.longitude,
    this.altitude,
    this.accuracy,
  });

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    'altitude': altitude,
    'accuracy': accuracy,
  };

  factory GeoCoordinates.fromJson(Map<String, dynamic> json) => GeoCoordinates(
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    altitude: (json['altitude'] as num?)?.toDouble(),
    accuracy: (json['accuracy'] as num?)?.toDouble(),
  );
}

class AiAnalysisResult {
  final double imageConfidence;
  final String hazardDetected;
  final bool isAuthentic;
  final bool locationMatch;
  final bool weatherSupport;
  final int clusterCount;
  final double urgencyScore;
  final String assignedStatus;
  final String reasoning;

  const AiAnalysisResult({
    required this.imageConfidence,
    required this.hazardDetected,
    required this.isAuthentic,
    required this.locationMatch,
    required this.weatherSupport,
    required this.clusterCount,
    required this.urgencyScore,
    required this.assignedStatus,
    required this.reasoning,
  });

  Map<String, dynamic> toJson() => {
    'imageConfidence': imageConfidence,
    'hazardDetected': hazardDetected,
    'isAuthentic': isAuthentic,
    'locationMatch': locationMatch,
    'weatherSupport': weatherSupport,
    'clusterCount': clusterCount,
    'urgencyScore': urgencyScore,
    'assignedStatus': assignedStatus,
    'reasoning': reasoning,
  };

  factory AiAnalysisResult.fromJson(Map<String, dynamic> json) => AiAnalysisResult(
    imageConfidence: (json['imageConfidence'] as num?)?.toDouble() ?? 0.0,
    hazardDetected: json['hazardDetected'] as String? ?? 'UNKNOWN',
    isAuthentic: json['isAuthentic'] as bool? ?? false,
    locationMatch: json['locationMatch'] as bool? ?? false,
    weatherSupport: json['weatherSupport'] as bool? ?? false,
    clusterCount: (json['clusterCount'] as num?)?.toInt() ?? 1,
    urgencyScore: (json['urgencyScore'] as num?)?.toDouble() ?? 0.0,
    assignedStatus: json['assignedStatus'] as String? ?? 'PENDING_AI_CHECK',
    reasoning: json['reasoning'] as String? ?? '',
  );
}

class HazardModel {
  final String id;
  final String hazardId;
  final String reportedBy;
  final String? reporterName;
  final String category;
  final GeoCoordinates coordinates;
  final String geohash;
  final String ward;
  final String? description;
  final String mediaUrl;
  final String? audioMemoUrl;
  final AiAnalysisResult? aiAnalysis;
  final String status;
  final String? assignedCrewId;
  final double dangerRadiusMeters;
  final int verificationCount;
  final DateTime createdAt;

  const HazardModel({
    required this.id,
    required this.hazardId,
    required this.reportedBy,
    this.reporterName,
    required this.category,
    required this.coordinates,
    required this.geohash,
    required this.ward,
    this.description,
    required this.mediaUrl,
    this.audioMemoUrl,
    this.aiAnalysis,
    required this.status,
    this.assignedCrewId,
    this.dangerRadiusMeters = 150.0,
    this.verificationCount = 1,
    required this.createdAt,
  });

  HazardModel copyWith({
    String? id,
    String? hazardId,
    String? reportedBy,
    String? reporterName,
    String? category,
    GeoCoordinates? coordinates,
    String? geohash,
    String? ward,
    String? description,
    String? mediaUrl,
    String? audioMemoUrl,
    AiAnalysisResult? aiAnalysis,
    String? status,
    String? assignedCrewId,
    double? dangerRadiusMeters,
    int? verificationCount,
    DateTime? createdAt,
  }) {
    return HazardModel(
      id: id ?? this.id,
      hazardId: hazardId ?? this.hazardId,
      reportedBy: reportedBy ?? this.reportedBy,
      reporterName: reporterName ?? this.reporterName,
      category: category ?? this.category,
      coordinates: coordinates ?? this.coordinates,
      geohash: geohash ?? this.geohash,
      ward: ward ?? this.ward,
      description: description ?? this.description,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      audioMemoUrl: audioMemoUrl ?? this.audioMemoUrl,
      aiAnalysis: aiAnalysis ?? this.aiAnalysis,
      status: status ?? this.status,
      assignedCrewId: assignedCrewId ?? this.assignedCrewId,
      dangerRadiusMeters: dangerRadiusMeters ?? this.dangerRadiusMeters,
      verificationCount: verificationCount ?? this.verificationCount,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'hazardId': hazardId,
    'reportedBy': reportedBy,
    'reporterName': reporterName,
    'category': category,
    'coordinates': coordinates.toJson(),
    'geohash': geohash,
    'ward': ward,
    'description': description,
    'mediaUrl': mediaUrl,
    'audioMemoUrl': audioMemoUrl,
    'aiAnalysis': aiAnalysis?.toJson(),
    'status': status,
    'assignedCrewId': assignedCrewId,
    'dangerRadiusMeters': dangerRadiusMeters,
    'verificationCount': verificationCount,
    'createdAt': createdAt.toIso8601String(),
  };

  factory HazardModel.fromJson(Map<String, dynamic> json, String documentId) => HazardModel(
    id: documentId,
    hazardId: json['hazardId'] as String? ?? documentId,
    reportedBy: json['reportedBy'] as String? ?? '',
    reporterName: json['reporterName'] as String?,
    category: json['category'] as String? ?? 'SEVERE_FLOOD',
    coordinates: GeoCoordinates.fromJson(json['coordinates'] as Map<String, dynamic>),
    geohash: json['geohash'] as String? ?? '',
    ward: json['ward'] as String? ?? 'Ward 1',
    description: json['description'] as String?,
    mediaUrl: json['mediaUrl'] as String? ?? '',
    audioMemoUrl: json['audioMemoUrl'] as String?,
    aiAnalysis: json['aiAnalysis'] != null
        ? AiAnalysisResult.fromJson(json['aiAnalysis'] as Map<String, dynamic>)
        : null,
    status: json['status'] as String? ?? 'PENDING_AI_CHECK',
    assignedCrewId: json['assignedCrewId'] as String?,
    dangerRadiusMeters: (json['dangerRadiusMeters'] as num?)?.toDouble() ?? 150.0,
    verificationCount: (json['verificationCount'] as num?)?.toInt() ?? 1,
    createdAt: json['createdAt'] != null
        ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
        : DateTime.now(),
  );
}
