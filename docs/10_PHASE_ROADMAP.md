# DisasterShield: 10-Phase Master Engineering Roadmap

**Document Version:** 1.0  
**Associated Specification:** [Master Engineering Specification v6.0](master_engineering_spec.md)  
**Author / Architect:** MRA Hasen Al Banna  
**Status:** Approved for Phased Execution  

---

## Roadmap Overview

```
[Phase 1: Scaffolding & Setup]
            │
            ▼
[Phase 2: Database & Backend Rules]
            │
            ▼
[Phase 3: Cloud Functions & AI Engine]
            │
            ▼
[Phase 4: Flutter Core & Clean Architecture]
            │
            ▼
[Phase 5: Screen 1 - Live Hazard Map & Geo-Queries]
            │
            ▼
[Phase 6: Screen 2 - Incident Reporter & AI Validation]
            │
            ▼
[Phase 7: Screens 3, 4, 5 - Voice SOS, Tracker & Offline Hub]
            │
            ▼
[Phase 8: Admin Web - Command Dashboard & Heatmap]
            │
            ▼
[Phase 9: Admin Web - Hazard Aggregator AI & Relief Desk]
            │
            ▼
[Phase 10: Hardening, Chaos Testing, Anti-Spam & Deployment]
```

---

## 🎯 Phase 1: Project Scaffolding, Monorepo Architecture & Tooling

### Objectives
Establish the complete development workspace, directory hierarchy, Git configurations, environment variables, and shared toolchains across Mobile, Web, and Backend.

### Key Deliverables
1. **Monorepo Directory Structure:**
   - `apps/mobile/`: Flutter application skeleton.
   - `apps/web_admin/`: React + TypeScript + Vite dashboard skeleton.
   - `backend/`: Firebase configurations, Functions, rules, and scripts.
   - `docs/`: Master specifications, API schemas, and architecture guides.
2. **Environment & Tooling Configuration:**
   - Git repository hooks and `.gitignore` configurations for Flutter, Node, and Python.
   - Workspace configuration scripts for unified multi-app running and debugging.
   - Shared TypeScript types / Dart models generation strategy.

### Acceptance Criteria
- [ ] Clean directory tree created without dependency conflicts.
- [ ] Both mobile and web projects build and run standard sanity checks.
- [ ] Monorepo documentation and dev runbooks established.

---

## 🗄️ Phase 2: Database Schemas, Firebase Security Rules & Data Models

### Objectives
Define the complete Google Cloud Firestore NoSQL schema, index definitions, and granular role-based security rules (RBAC).

### Key Deliverables
1. **Firestore Collections Architecture:**
   - `/users/{userId}`: Profiles, FCM tokens, roles (`citizen`, `crew`, `admin`), trust scores.
   - `/hazards/{hazardId}`: Geohashes, coordinates, AI confidence scores, statuses, media references.
   - `/cases/{caseId}`: Emergency SOS incident files, caller coordinates, priority queues.
   - `/tickets/{ticketId}`: Municipal council work orders with SLA tracking.
   - `/alerts/{alertId}`: Ward-level broadcast alerts and evacuation routes.
2. **Security & Storage Rules:**
   - Firestore Security Rules implementing strict RBAC for Citizen, Field Crew, and Admin.
   - Firebase Storage Security Rules for encrypted photo and audio memo uploads.
3. **Geospatial Indexing Plan:**
   - Composite Firestore indexes for geohash + timestamp queries.

### Acceptance Criteria
- [ ] `firestore.rules` and `storage.rules` written and validated against test suites.
- [ ] Firebase emulator configured for rapid local testing without cloud billing.

---

## 🧠 Phase 3: Cloud Functions & Multi-Layered AI Pipeline

### Objectives
Implement serverless backend logic and the 6-stage AI automation pipeline to ingest, validate, and score hazard submissions before human review.

### Key Deliverables
1. **Firebase Cloud Functions (TypeScript):**
   - `onHazardCreated`: Triggers image validation, EXIF matching, and weather cross-referencing.
   - `onSosTriggered`: High-priority case escalation, SMS/VoIP signaling, and dispatcher notification.
   - `onHazardStatusUpdated`: Pushes FCM alerts to affected wards and dispatches nearest field crew.
2. **AI Pipeline Modules:**
   - **Image AI:** MobileNetV2/CNN classifier confirming hazard authenticity (flood, fire, debris, wire) and rejecting blur/stock images.
   - **Location AI:** Matches photo EXIF latitude/longitude and timestamp against device GPS telemetry.
   - **DBSCAN Spatial Clustering:** Automatically groups reports within 200m submitted within 3 hours.
   - **Weather AI Cross-Check:** Fetches open meteorological rainfall/river gauge data to corroborate flood claims.
   - **Dynamic Risk Scoring Engine:** Implements $Risk(u) = w_1 R_{type} + w_2 P_{risk} + w_3 Water_{trend}$.

### Acceptance Criteria
- [ ] Automated hazard reports pass through the 5-check AI filter and produce an aggregated urgency score.
- [ ] Low-confidence reports (45%-75%) route automatically to the "Need More Info" channel.

---

## 📱 Phase 4: Flutter Mobile Client – Foundation & Clean Architecture

### Objectives
Initialize the cross-platform Flutter application using strict Clean Architecture (Presentation, Domain, Data) and Riverpod state management.

### Key Deliverables
1. **Architecture Blueprint:**
   - **Data Layer:** Firebase SDK integrations, SQLite/Hive local storage cache, HTTP clients.
   - **Domain Layer:** Pure Dart entities, use cases (`SubmitHazardUseCase`, `TriggerSosUseCase`), repository interfaces.
   - **Presentation Layer:** Riverpod state notifiers, responsive UI design system, high-contrast dark theme.
2. **Design System & Theme:**
   - High-visibility palette tailored for disaster environments (crimson `#D32F2F`, amber `#FFA000`, slate `#1E293B`).
   - Accessible typography, large touch targets, and tactile haptic feedback.
3. **Core Services:**
   - Location service (Geolocator + geocoding).
   - Connectivity service (Network status listener for auto-switching to offline mode).
   - Local storage service (SQLite DB for queueing offline actions).

### Acceptance Criteria
- [ ] Clean Architecture directory structure set up with zero domain-to-framework leakage.
- [ ] Global error handling, theme provider, and network connectivity state working smoothly.

---

## 🗺️ Phase 5: Mobile App – Screen 1: Live Hazard Map & Geo-Queries

### Objectives
Build the primary frontline screen providing citizens and field workers with situational awareness within a 5 km radius.

### Key Deliverables
1. **Interactive Vector Map Integration:**
   - Fullscreen map with dynamic pins categorized by hazard type (Flood, Tree Fall, Road Block, Power Hazard).
   - Heatmap layer toggle visualizing high-risk flood zones.
2. **Real-Time Geo-Queries:**
   - Geohash-based Firestore streaming of active hazards within 5 km.
   - Collapsible Weather Alert & River Level ticker.
3. **Interactive Bottom Sheet:**
   - Hazard card displaying severity score, timestamp, verified photos, and AI status badge.
   - "Avoid Route" and "Request Info" action triggers.

### Acceptance Criteria
- [ ] Map renders smoothly at 60fps with active markers updating in real time.
- [ ] Clicking any marker reveals verified AI urgency breakdown and distance from user.

---

## 📸 Phase 6: Mobile App – Screen 2: Automated Incident Reporter

### Objectives
Empower citizens and field teams to submit authenticated hazard reports in seconds with automated on-device and cloud validation.

### Key Deliverables
1. **Camera Viewfinder & Capture Interface:**
   - Custom camera screen with real-time framing guides and orientation indicators.
   - Rapid-fire category chips: *Severe Flood*, *Blocked Road*, *Fallen Tree*, *Live Power Line*.
2. **Metadata & Voice Note Capture:**
   - Automatic extraction of EXIF metadata (GPS coords, altitude, heading, timestamp).
   - 30-second quick voice memo recording with live waveform display.
3. **Offline Queueing & Resilient Upload:**
   - In offline mode: Report is encrypted and saved to SQLite with a background sync worker.
   - In online mode: Directly streams photo to Firebase Storage and document to Firestore.

### Acceptance Criteria
- [ ] Incident report submission takes under 15 seconds end-to-end.
- [ ] Unconnected reports queue locally and auto-upload immediately once network connectivity returns.

---

## 🚨 Phase 7: Mobile App – Screens 3, 4 & 5 (Voice SOS, Case Tracker & Profile)

### Objectives
Deliver the remaining core mobile screens: the critical Voice Emergency SOS trigger, live lifecycle tracker, and offline safety toolkit.

### Key Deliverables
1. **Screen 3: Voice Emergency & SOS Screen:**
   - Crimson SOS button with 3-second hold/cancellation timer.
   - Voice trigger engine listening for distress wake-phrases.
   - Automated SOS dispatch: Geolocation beam, SMS beacon to emergency contacts, and case generation.
2. **Screen 4: Active Case & Alert Tracker Screen:**
   - Segmented views: *My Reports*, *Ward Alerts*, *Resolved History*.
   - Live timeline status tracker: *Pending AI Check* -> *Published* -> *Dispatched* -> *Resolved*.
3. **Screen 5: Profile & Safety Guidelines Hub:**
   - Offline safety manual, emergency numbers, and family contact manager.
   - Offline vector map tile downloader for zero-connectivity situations.
   - Live shelter capacity and nearest evacuation route finder.

### Acceptance Criteria
- [ ] Triggering SOS bypasses normal screens and confirms case creation in under 2 seconds.
- [ ] Status updates reflected in real time via Firestore snapshot listeners.

---

## 🖥️ Phase 8: Admin Web – Command Dashboard, Heatmaps & Ward Triage

### Objectives
Construct the high-performance Web Command Center for municipal dispatchers and disaster response directors.

### Key Deliverables
1. **Real-Time Geospatial Command Map:**
   - High-density map view showing all active ward boundaries, sensor stations, and crew positions.
   - Heatmap visualizations and DBSCAN cluster overlays.
2. **Incident Triage & Filtering Panel:**
   - Live incoming report feed with filters for urgency score, hazard category, ward, and elapsed time.
   - Detailed modal inspector showing photo, EXIF match confirmation, and AI reasoning log.
3. **Operator Intervention Controls:**
   - One-click approval to publish to public maps.
   - One-click reject / mark as hoax with user reputation penalty.

### Acceptance Criteria
- [ ] Web dashboard handles hundreds of concurrent hazard markers with smooth filtering.
- [ ] Dispatcher can approve or escalate an incident in a single click.

---

## ⚡ Phase 9: Admin Web – Hazard Aggregator AI Engine & Relief Desk

### Objectives
Implement the automated 4-channel dispatch engine, municipal council work order generation, and relief center allocation.

### Key Deliverables
1. **Automated 4-Channel Routing Console:**
   - **Channel 1 (Need More Info):** Auto-sends verification prompts to users within 500m of unconfirmed reports.
   - **Channel 2 (Published):** Pins verified hazards to citizen maps and marks roads as blocked.
   - **Channel 3 (Area Alert):** Pushes ward-wide emergency notifications and evacuation guidelines.
   - **Channel 4 (Council Ticket):** Auto-generates electronic work orders with priority and SLA timers.
2. **Field Crew Dispatch & Live Telemetry:**
   - Dispatch queue assigning nearest units to critical hazards.
   - Resolution verification: Crew must upload post-resolution photos to close tickets.
3. **Relief Desk & Shelter Management:**
   - Real-time tracker for municipal shelters, capacity limits, and emergency medical supply reserves.

### Acceptance Criteria
- [ ] Hazard Aggregator automatically categorizes and routes 100% of incoming reports.
- [ ] Council tickets are auto-generated with unique ticket IDs and ward routing.

---

## 🛡️ Phase 10: System Hardening, Anti-Spam, Chaos Testing & Deployment

### Objectives
Harden the entire platform against network collapse, malicious hoax floods, and deploy production builds for mobile and web.

### Key Deliverables
1. **Anti-Spam & Fraud Prevention:**
   - Device fingerprinting and dynamic user reputation scoring.
   - Rate limiting and duplicate report suppression.
2. **Chaos Engineering & Network Resilience:**
   - Simulating 80% packet loss and total cellular blackout to test SQLite spooling and Bluetooth LE beacon fallbacks.
   - Cloud Function stress testing under simulated monsoon traffic spikes.
3. **Production Deployment & Release:**
   - Web Admin deployment to Firebase Hosting with custom SSL.
   - Flutter Android APK / App Bundle generation and iOS release builds.
   - Automated CI/CD pipeline via GitHub Actions.

### Acceptance Criteria
- [ ] Zero data loss during simulated abrupt network drops.
- [ ] All security tests, lint checks, and automated unit/widget tests pass.
- [ ] Production build ready for municipal deployment.

---

## 📊 Phase Schedule & Dependencies Matrix

| Phase | Description | Prerequisites | Target Output |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Scaffolding & Monorepo Setup | None | Working monorepo skeleton & dev scripts |
| **Phase 2** | Database & Security Rules | Phase 1 | Firestore & Storage rules, schema definitions |
| **Phase 3** | Cloud Functions & AI Engine | Phase 2 | Serverless AI pipeline & scoring functions |
| **Phase 4** | Flutter Core & Clean Architecture | Phase 1, 2 | Flutter foundation, themes, providers, SQLite |
| **Phase 5** | Mobile Screen 1: Live Map | Phase 4 | Interactive map, 5km radius geo-queries |
| **Phase 6** | Mobile Screen 2: Incident Reporter | Phase 4, 3 | Camera, EXIF capture, offline queue |
| **Phase 7** | Mobile Screens 3, 4, 5: SOS & Offline | Phase 5, 6 | Voice SOS, case tracker, offline cache |
| **Phase 8** | Web Admin: Command Dashboard | Phase 2, 3 | Web command center, heatmaps, live triage |
| **Phase 9** | Web Admin: Aggregator AI & Relief | Phase 8 | 4-channel routing, council tickets, relief desk |
| **Phase 10**| Hardening, Chaos Testing & Release | All Phases | Production builds, security audit, deployment |
