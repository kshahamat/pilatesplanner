import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { setBeepVolume, getBeepVolume } from '../utils/audioUtils';

export default function BeepSettings() {
  const [beepVol, setBeepVol] = useState(0.8);
  const [beepsEnabled, setBeepsEnabled] = useState(true);

  useEffect(() => {
    // Initialize with current values
    setBeepVol(getBeepVolume());
  }, []);

  const handleBeepVolumeChange = async (value) => {
    setBeepVol(value);
    await setBeepVolume(beepsEnabled ? value : 0);
  };

  const toggleBeeps = async (enabled) => {
    setBeepsEnabled(enabled);
    await setBeepVolume(enabled ? beepVol : 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Settings</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.label}>Timer Beeps</Text>
        <Switch
          value={beepsEnabled}
          onValueChange={toggleBeeps}
          trackColor={{ false: '#767577', true: '#667eea' }}
          thumbColor={beepsEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      
      {beepsEnabled && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Beep Volume</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={beepVol}
            onValueChange={handleBeepVolumeChange}
            minimumTrackTintColor="#667eea"
            maximumTrackTintColor="#d3d3d3"
            thumbStyle={styles.thumb}
          />
          <Text style={styles.volumeText}>{Math.round(beepVol * 100)}%</Text>
        </View>
      )}
      
      <Text style={styles.note}>
        💡 Play your music from Spotify, Apple Music, or any other app - the beeps will play over your music!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  sliderContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    backgroundColor: '#667eea',
  },
  volumeText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  note: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 15,
  },
});