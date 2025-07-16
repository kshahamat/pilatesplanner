import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatTime } from '../utils/timeUtils';

export default function TimerCircle({ 
  currentTime, 
  totalTime, 
  isRest, 
  isFinished, 
  isRunning,
  onPause,
  onResume // Add this prop
}) {
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? (totalTime - currentTime) / totalTime : 0;
  const strokeDashoffset = circumference - (circumference * progress);
  
  const strokeColor = isRest ? '#ff9500' : '#4ecdc4';
  const pauseColor = isRunning ? '#e5a212ff' : '#00b661ff';
  const displayTime = isFinished ? 'Done!' : formatTime(currentTime);

  return (
    <View style={styles.container}>
      <Svg width={400} height={400} style={styles.svg}>
        <Circle
          cx={200}
          cy={200}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={30}
          fill="none"
        />
        <Circle
          cx={200}
          cy={200}
          r={radius}
          stroke={strokeColor}
          strokeWidth={20}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 200 200)`}
        />
      </Svg>
      
      <View style={styles.buttonContainer}>
        {isRunning && !isFinished ? (
          // Show pause button when running
          <TouchableOpacity 
            style={[styles.centerButton, { backgroundColor: pauseColor }]}
            onPress={onPause}
            activeOpacity={0.2}
          >
          </TouchableOpacity>
        ) : !isFinished ? (
          // Show start/resume button when not running and not finished
          <TouchableOpacity 
            style={[styles.centerButton, { backgroundColor: pauseColor }]}
            onPress={onResume}
          >
          </TouchableOpacity>
        ) : (
          // Show nothing when finished (just the overlay text)
          <View style={styles.centerButton} />
        )}
        
        {/* Timer text positioned absolutely on top */}
        <View style={styles.timerOverlay}>
          <Text style={styles.timeDisplay}>{displayTime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  buttonContainer: {
    position: 'relative',
  },
  centerButton: {
    width: 250,
    height: 250,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  timerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});