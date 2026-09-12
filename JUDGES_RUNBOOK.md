# 🏆 DisasterShield — Official Judges' Runbook & Evaluation Guide

> **DisasterShield**: Autonomous AI & Crowdsourced Crisis Telemetry System  
> Designed for rapid response, trauma-aware hands-free voice dispatch, and offline disaster resilience.

---

## ⚡ 60-Second Quick Start (Run Anywhere)

Judges can run and evaluate DisasterShield immediately on **any operating system** (macOS, Windows, Linux) with **zero external account setup or API keys required**.

### Option A: Web Browser (Chrome / Edge) — *Recommended for Instant Evaluation*
No mobile device or emulator required. Runs with full interactive UI, audio speech synthesis, and map rendering:

```bash
# 1. Navigate to the mobile app
cd apps/mobile

# 2. Fetch dependencies
flutter pub get

# 3. Launch in Chrome
flutter run -d chrome
```

---

### Option B: Native Android (Device or Emulator)
Test the native Android experience, camera upload, and device-level hardware features:

```bash
# 1. Connect Android phone or start emulator
cd apps/mobile
flutter pub get

# 2. Run on Android
flutter run
```
*Note: A pre-built native APK is also provided in the repository under [`dist_apk/DisasterShield.apk`](dist_apk/DisasterShield.apk) for instant sideloading.*

---

### Option C: Native Windows Desktop
```bash
cd apps/mobile
flutter pub get
flutter run -d windows
```

---

### Option D: Emergency Operations Web Admin Console
Run the real-time Incident Command Center dashboard:

```bash
cd apps/web_admin
npm install
npm run dev
# Dashboard opens at http://localhost:5173
```

---

## 🔑 Confidential Information & API Keys Disclosure

> [!NOTE]
> **Zero-Friction Offline / Demo Mode**:
> DisasterShield was deliberately architected with an **autonomous fallback engine**. If no external cloud API keys or Firebase credentials are provided, the application gracefully operates in **Self-Contained Evaluation Mode**:
> - Built-in live hazard telemetry simulations (severe floods, power hazards, blocked roads).
> - Client-side speech-to-text and speech synthesis (TTS).
> - Free OpenStreetMap (OSM) tile rendering without API tokens.
> - Client-side Base64 camera photo encoding without cloud bucket costs.
> **Every single feature, button, and navigation flow is 100% interactive out of the box.**

### Optional: Supplying Your Own API Keys
If you wish to test with live cloud endpoints, copy the template files:
* Mobile: [`apps/mobile/.env.example`](apps/mobile/.env.example) &rarr; `apps/mobile/.env`
  - `GEMINI_API_KEY`: For live Google Gemini multimodal reasoning.
  - `OPENWEATHER_API_KEY`: For real-time global weather sync.
* Web Admin: [`apps/web_admin/.env.example`](apps/web_admin/.env.example) &rarr; `apps/web_admin/.env`
  - `VITE_FIREBASE_*`: For connecting a personal Firebase project.

---

## 📋 Evaluation Checklist & Feature Walkthrough

| Feature | Where to Find in App | What to Test |
| :--- | :--- | :--- |
| **🎙️ Falcon Hands-Free Voice AI** | Top header **"Hey Falcon"** button or SOS Tab | Tap "Hey Falcon" (or say *"Hey Falcon"*, *"Emergency"*, *"Report flood"*). Notice how it generates an emergency report and speaks back with audible voice synthesis. Addresses the life-saving **"hands-stuck in debris/floodwaters"** dilemma. |
| **🗺️ Dual-Mode Live Hazard Map** | Home Screen ("Radar" tab) | 1. **Card View**: Compact 270px card with live pins under weather card.<br>2. **Tap for Fullscreen**: Tap either the map or "Full View" button to expand to a full interactive tactical radar. Tap "Exit Full View" to restore. |
| **🚨 Autonomous SOS & Strobe** | Bottom Navigation &rarr; Red **SOS** button | 1-tap emergency dispatch with automated high-frequency strobe beacon and sirens. |
| **📸 Zero-Cost Incident Reporter** | Bottom Navigation &rarr; **Report** tab | Select incident category, tap the interactive map to position the custom danger pin, set radius slider, take/upload a photo (Base64 zero-cloud-cost storage), and hit **Broadcast Alert**. |
| **📡 Perimeter Threat Telemetry** | Home Screen (under map card) | Scroll through real-time incident cards. Tap **"Focus"** on any card to automatically zoom and center the map on that hazard. |
| **📋 Case & Incident Tracker** | Bottom Navigation &rarr; **Tracker** tab | Track emergency tickets, filter by active/resolved, view verification count and responder statuses. |
| **🛡️ Offline Safety Hub & Guides** | Bottom Navigation &rarr; **Safety** tab | Offline-accessible emergency playbooks: Flood Survival, Earthquake Protocols, Electrical Hazard Protocols, and Emergency Contacts. |
| **🌙 Dynamic Adaptive Dark Mode** | Top App Bar sun/moon icon | Instant transition between sleek tactical Dark Mode and crisp high-contrast Light Mode. |

---

## 🏗️ Architecture & Competition Master Dossier

For the complete technical breakdown, humanitarian problem statement, mathematical model, and system architecture, see:
* 📄 **[Competition Master Dossier](docs/COMPETITION_MASTER_DOSSIER.md)**
* 📁 **[Documentation Visual Assets](docs/images/)**

---

### Verification Summary
* **Flutter SDK**: 3.35.x compatible
* **Kotlin**: 2.2.0 (Android Gradle Plugin 8.9.1)
* **Dart**: 3.9.x
* **Vite / React**: Node 18+ compatible
