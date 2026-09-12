# DisasterShield: AI-Driven Disaster Response & Hazard Management Platform

[![Competition Dossier](https://img.shields.io/badge/Competition%20Dossier-v6.5%20Master%20Document-crimson.svg)](docs/COMPETITION_MASTER_DOSSIER.md)
[![Specification Version](https://img.shields.io/badge/Spec-v6.0-blue.svg)](docs/master_engineering_spec.md)
[![Flutter](https://img.shields.io/badge/Flutter-3.35+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20FreeTier%20DB-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)

> 🏆 **Competition Master Document**: Read the complete humanitarian, life-critical architectural rationale and 25+ feature breakdown in [docs/COMPETITION_MASTER_DOSSIER.md](docs/COMPETITION_MASTER_DOSSIER.md).

**DisasterShield** is an AI-automated disaster response and urban hazard management ecosystem designed to bridge frontline citizens, field response units, and municipal command centers with sub-second situational awareness.

---

## 🏛 Ecosystem Architecture

```
                                 [Citizen Mobile App (Flutter)]
                                                │
                                                ▼
                             [Firebase Cloud Functions / AI Layer]
                                                │
                                                ▼
                                    [Hazard Aggregator AI]
                                                │
    ┌───────────────────────┬───────────────────┴───────────────────┬───────────────────────┐
    ▼                       ▼                                       ▼                       ▼
[Need More Info]        [Published]                            [Area Alert]            [Council Ticket]
    │                       │                                       │                       │
    ▼                       ▼                                       ▼                       ▼
[Control Dashboard]  [Field Crew App]                         [Relief Desk]           [Admin Web Console]
```

---

## 📁 Repository Structure Blueprint

```
DisasterShield/
├── docs/
│   └── master_engineering_spec.md       # Master Engineering Specification v6.0
├── apps/
│   ├── mobile/                          # Flutter Mobile Client (Citizen & Field Crew)
│   │   ├── lib/
│   │   │   ├── core/                    # Theme, constants, networking, errors
│   │   │   ├── features/
│   │   │   │   ├── map/                 # Screen 1: Live Hazard Map (5km radius, geo-queries)
│   │   │   │   ├── incident_reporter/   # Screen 2: Incident Reporter (Camera, EXIF, AI check)
│   │   │   │   ├── voice_sos/           # Screen 3: Voice Emergency & SOS (wake-word, speech-to-intent)
│   │   │   │   ├── case_tracker/        # Screen 4: Active Case & Alert Tracker (Firestore listeners)
│   │   │   │   └── profile/             # Screen 5: Profile, Safety Guidelines & Offline Cache
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   └── web_admin/                       # Web Admin & Command Dashboard (React / Vite)
│       ├── src/
│       │   ├── components/              # Live Map, Hazard Triage Table, Relief Desk
│       │   ├── pages/                   # Control Dashboard, Verification Hub, Ticket Manager
│       │   └── App.tsx
│       └── package.json
├── backend/
│   ├── functions/                       # Firebase Cloud Functions (TypeScript)
│   │   ├── src/
│   │   │   ├── ai/                      # Image AI, Weather Cross-Check, DBSCAN Clustering
│   │   │   ├── triggers/                # onHazardCreated, onSosTriggered, onHazardStatusUpdated
│   │   │   └── index.ts
│   │   └── package.json
│   ├── firestore.rules                  # Role-based Firestore Security Rules
│   ├── storage.rules                    # Media & verification photo rules
│   └── firebase.json
└── README.md
```

---

## 🛣️ 10-Phase Implementation Roadmap

The full project is structured into **10 modular phases** designed for sequential, production-grade delivery:

| Phase | Focus Area | Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | **Scaffolding & Tooling** | Monorepo layout, toolchains, package configs |
| **Phase 2** | **Database & Security** | Firestore schemas, RBAC rules, Storage security |
| **Phase 3** | **Cloud Functions & AI Engine** | 5-stage AI pipeline, DBSCAN clustering, risk formula |
| **Phase 4** | **Flutter Core & Architecture** | Clean Architecture, Riverpod, high-contrast UI, SQLite |
| **Phase 5** | **Mobile Screen 1: Live Map** | 5km geo-query streaming, vector maps, risk overlays |
| **Phase 6** | **Mobile Screen 2: Incident Reporter** | Camera viewfinder, EXIF extractor, offline upload queue |
| **Phase 7** | **Mobile Screens 3, 4, 5: SOS & Offline** | Crimson SOS, speech-to-intent, case tracker, offline cache |
| **Phase 8** | **Web Admin: Command Dashboard** | Geospatial command center, heatmaps, live triage panel |
| **Phase 9** | **Web Admin: Aggregator AI & Relief** | 4-channel automated routing, council tickets, relief desk |
| **Phase 10** | **Hardening, Chaos Testing & Launch** | Network resilience tests, anti-spam, production deployment |

👉 Read the full technical specifications for each phase in [docs/10_PHASE_ROADMAP.md](docs/10_PHASE_ROADMAP.md).

---

## ⚡ Core Modules & Features

1. **Mobile Application (Flutter)**
   - **Screen 1: Live Hazard Map:** Interactive vector map with 5km real-time geo-clustering, dynamic risk scoring ($Risk(u) = w_1 R_{type} + w_2 P_{risk} + w_3 Water_{trend}$), and weather tickers.
   - **Screen 2: Automated Incident Reporter:** Camera viewfinder with EXIF capture, category tagging, on-device Image & Location AI verification.
   - **Screen 3: Voice Emergency & SOS:** Crimson quick-trigger button, offline speech-to-intent recognition, and priority dispatch.
   - **Screen 4: Active Case & Ward Tracker:** Real-time lifecycle tracking (*Pending Verification* -> *Published* -> *Dispatched* -> *Resolved*).
   - **Screen 5: Profile, Guidelines & Offline Cache:** SQLite persistent storage, offline vector map tiles, and evacuation shelter capacity.

2. **Command & Admin Dashboard (Web)**
   - **Geospatial Control Room:** Live incident heatmap, clustering visualization, and ward boundary filtering.
   - **Hazard Aggregator AI Console:** Automated 4-channel routing (*Need Info*, *Published*, *Area Alert*, *Council Ticket*).
   - **Relief Desk & Crew Dispatch:** Field crew assignment, telemetry tracking, and relief shelter capacity monitors.

3. **Backend & AI Pipeline (Firebase)**
   - **Image AI & Location Matcher:** Validates photos and EXIF against claimed GPS coordinates.
   - **Weather AI & DBSCAN Clustering:** Correlates rainfall/river gauges and clusters reports within 200m / 3h.
   - **Automated Work Orders & Alerts:** Generates council tickets and triggers geofenced FCM push alerts.

---

## 📖 Complete Specification

The definitive technical specification is documented in [docs/master_engineering_spec.md](file:///e:/1.PROFESSIONAL%20APPLICATIONS/DisasterShield/docs/master_engineering_spec.md).
