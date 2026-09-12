class UserProfileModel {
  final String uid;
  final String email;
  final String displayName;
  final String role; // "Citizen Responder", "First Responder", "Emergency Dispatcher", "Civil Defense"
  final String ward;
  final int reputationScore;
  final int totalReportsSubmitted;
  final bool isVerified;
  final DateTime lastLoginAt;
  final DateTime createdAt;

  const UserProfileModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.role,
    this.ward = 'Ward 12 - South District',
    this.reputationScore = 95,
    this.totalReportsSubmitted = 3,
    this.isVerified = true,
    required this.lastLoginAt,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'uid': uid,
    'email': email,
    'displayName': displayName,
    'role': role,
    'ward': ward,
    'reputationScore': reputationScore,
    'totalReportsSubmitted': totalReportsSubmitted,
    'isVerified': isVerified,
    'lastLoginAt': lastLoginAt.toIso8601String(),
    'createdAt': createdAt.toIso8601String(),
  };

  factory UserProfileModel.fromJson(Map<String, dynamic> json, String uid) => UserProfileModel(
    uid: uid,
    email: json['email'] as String? ?? 'citizen@disastershield.org',
    displayName: json['displayName'] as String? ?? 'MRA Hasen (Citizen)',
    role: json['role'] as String? ?? 'Citizen Responder',
    ward: json['ward'] as String? ?? 'Ward 12 - South District',
    reputationScore: (json['reputationScore'] as num?)?.toInt() ?? 95,
    totalReportsSubmitted: (json['totalReportsSubmitted'] as num?)?.toInt() ?? 0,
    isVerified: json['isVerified'] as bool? ?? true,
    lastLoginAt: json['lastLoginAt'] != null
        ? DateTime.tryParse(json['lastLoginAt'] as String) ?? DateTime.now()
        : DateTime.now(),
    createdAt: json['createdAt'] != null
        ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
        : DateTime.now(),
  );

  UserProfileModel copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? role,
    String? ward,
    int? reputationScore,
    int? totalReportsSubmitted,
    bool? isVerified,
    DateTime? lastLoginAt,
    DateTime? createdAt,
  }) {
    return UserProfileModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      role: role ?? this.role,
      ward: ward ?? this.ward,
      reputationScore: reputationScore ?? this.reputationScore,
      totalReportsSubmitted: totalReportsSubmitted ?? this.totalReportsSubmitted,
      isVerified: isVerified ?? this.isVerified,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
