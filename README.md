
---

## Problem-Solving Approach

| Problem | Solution | Result |
|----------|-----------|--------|
| **Audio Conflicts** | Implemented audio pooling with 5 concurrent instances | Smooth, uninterrupted beeps |
| **Swipe Gesture Conflicts** | Added 60px threshold and directional detection | Reliable swipe actions |
| **Exercise Deletion Edge Cases** | Smart index adjustment tracking relative position | Seamless deletion |
| **Animation Performance** | Used native driver & batched updates | Consistent 60fps animations |

---

## Features ✨

### Core Functionality

- **Custom Workout Creation:** Parse and create workout routines  
- **Interval Timer:** Automated countdowns for each exercise  
- **Audio Feedback:**  
  - Countdown beeps at 4, 3, 2 seconds  
  - Transition and completion beeps  
  - Works alongside Spotify/Apple Music  

### Visual Progress Tracking

- Circular progress indicator  
- Color-coded states (teal = work, orange = rest)  
- Scrollable workout list with live indicators  

### Interactive Controls

- **Play/Pause:** Start, pause, resume  
- **Skip Forward:** Jump to next exercise  
- **Skip Backward:**  
  - Single tap: Restart current exercise  
  - Double tap: Go to previous exercise  
- **Reset Workout:** Restart session anytime  

### Workout Management

- **Swipe Actions:**  
  - Right: Edit name/duration  
  - Left: Delete exercise  
- **Live Editing:** Modify workouts without pausing  
- **Auto-scroll:** Keeps current exercise visible  

### Visual Effects

- Smooth exercise name transitions  
- Confetti celebration on completion  
- Animated progress circle  
- Modern UI: Gradients, glassmorphism, custom fonts  

---

## Tech Stack 🛠️

- **Framework:** React Native with Expo  
- **State Management:** React Context API  
- **Audio:** Expo AV  
- **Animations:** React Native Animated API  
- **Graphics:** React Native SVG  
- **UI:** Custom components  

---

## Installation 📦

### Prerequisites

- Node.js (v14 or higher)  
- npm or yarn  
- Expo CLI  
- iOS Simulator / Android Emulator / Expo Go app  

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd workout-timer-app

# Install dependencies
npm install
# or
yarn install

# Start the development server
expo start
