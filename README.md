# 🌅 Aurora — AI Health Companion

Aurora is an AI-powered health companion app that combines manual habit tracking with a real conversational AI agent. Talk to Aurora naturally — "I drank 500ml of water" — and it logs the action, responds with voice, and gives personalized insights based on your data.

Built for [Hackathon Name] — Full-time Founding Engineer prize track.

---


## 📱 Download APK

[Download Aurora APK](https://expo.dev/accounts/abhishek0910/projects/aurora-health/builds/32fc2bdf-5257-4480-8c76-590e1a290908)

---

## ✨ Features

### Core
- 🎙️ **Voice AI Companion** — speech-to-text (Whisper), LLM reasoning (Llama 3.3 70B via Groq), text-to-speech responses
- 🤖 **Agentic Actions** — Aurora detects intent from natural language and automatically logs water, sleep, habits, or meals
- 🧠 **Long-term memory** — Aurora remembers past conversations (stored in Supabase) for personalized follow-ups

### Health Tracking
- 💧 **Hydration** — animated 3D water bottle with wave/bubble physics
- 🌙 **Sleep** — logging, weekly trends, sleep consistency view
- ✅ **Habits** — streaks with fire animations, edit/skip/pause/delete
- 🍱 **Nutrition** — meal logging with calorie & macro breakdown

### Engagement
- 🏅 **Achievement badges** — 8 unlockable badges based on streaks and consistency
- 📊 **Reports** — weekly/monthly charts and a consistency score (0-100)
- 🔔 **Notifications** — local reminders for hydration, sleep, and habits

### Account & Settings
- 🔐 Email + persistent social login (Google/Apple)
- ⚙️ Settings — notification preferences, units, privacy, device connection UI
- ☁️ Full cloud sync via Supabase, offline-first with AsyncStorage

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo SDK 54) |
| Navigation | React Navigation (Bottom Tabs + Native Stack) |
| Animations | React Native Animated API, Linear Gradients |
| Backend / DB | Supabase (PostgreSQL) |
| AI Reasoning | Groq API — Llama 3.3 70B Versatile |
| Speech-to-Text | Groq Whisper Large v3 |
| Text-to-Speech | expo-speech |
| Local Storage | AsyncStorage |
| Notifications | expo-notifications |
| Build & Distribution | EAS Build (Android APK) |

---

## 📸 Screenshots

| Home | Hydration | Habits |
|------|-----------|--------|
| ![Home](screenshots/home.jpg) | ![Hydration](screenshots/hydration.jpg) | ![Habits](screenshots/habits.jpg) |

| AI Companion | Reports | Settings |
|--------------|---------|----------|
| ![Companion](screenshots/companion.jpg) | ![Reports](screenshots/reports.jpg) | ![Settings](screenshots/settings.jpg) |

---

## 🚧 Challenges & Solutions

- **EAS build failures (Gradle errors)**: caused by a duplicate `expo-modules-core` dependency conflicting with the SDK 54 bundled version. Fixed by removing the direct dependency.
- **AI features worked in Expo Go but failed in production APK**: `process.env` variables aren't bundled into EAS builds without explicit configuration. Solved by embedding API keys directly into service files.
- **Native Google Sign-In requires Google Cloud OAuth + billing verification**: implemented a persistent simulated social login instead — creates and remembers one demo account per device, demonstrating the full UX flow.

---

## 🚀 Running Locally

```bash
git clone https://github.com/HMAbhishekk/aurora-health.git
cd aurora-health
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) to run on your device.

### Build APK

```bash
eas build -p android --profile preview
```

---

## 📂 Project Structure
src/

├── constants/      # Colors, theme

├── context/        # Auth & Health context providers

├── navigation/      # App navigation (auth flow, tabs, stack)

├── screens/

│   ├── auth/        # Login, Signup

│   ├── onboarding/   # Splash, onboarding, health setup

│   ├── main/         # Home, Reports, Profile, Settings

│   └── modules/       # Hydration, Sleep, Habits, Nutrition, Companion

└── services/        # Supabase client, AI service, voice service, notifications
---

## 👤 Author

H M Abhishek — [GitHub](https://github.com/HMAbhishekk)
