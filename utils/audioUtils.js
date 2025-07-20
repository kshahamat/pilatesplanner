import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

let beepSound = null;
let beepVolume = 1; // Default beep volume

export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers, // Play alongside Spotify/Apple Music
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers, // Temporarily lower other apps
      shouldDuckAndroid: true, // Lower Spotify volume when beep plays
      playThroughEarpieceAndroid: false,
    });

    // Load only the beep sound
    const { sound: beep } = await Audio.Sound.createAsync(
      require('../assets/workoutbeep.mp4'),
      { shouldPlay: false, isLooping: false, volume: beepVolume }
    );
    beepSound = beep;
  } catch (error) {
    console.log('Audio initialization failed:', error);
  }
}

// Volume control for beeps only
export async function setBeepVolume(volume) {
  try {
    beepVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (beepSound) {
      await beepSound.setVolumeAsync(beepVolume);
    }
  } catch (error) {
    console.log('Failed to set beep volume:', error);
  }
}

export function getBeepVolume() {
  return beepVolume;
}

export async function playBeep(frequency = 1000, duration = 200) {
  try {
    if (beepSound && beepVolume > 0) {
      await beepSound.setPositionAsync(0);
      await beepSound.playAsync();
    }
  } catch (error) {
    console.log('Beep playback failed:', error);
  }
}

export async function cleanupAudio() {
  if (beepSound) {
    await beepSound.unloadAsync();
    beepSound = null;
  }
}