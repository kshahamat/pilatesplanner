import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatTime } from '../utils/timeUtils';

export default function TimerCircle({ currentTime, totalTime, isRest, isFinished }) {
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? (totalTime - currentTime) / totalTime : 0;
  const strokeDashoffset = circumference - (circumference * progress);
  
  const strokeColor = isRest ? '#ff9500' : '#4ecdc4';
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
          cx={0}
          cy={200}
          r={radius}
          stroke={strokeColor}
          strokeWidth={20}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 100 100)`}
        />
      </Svg>
      <Text style={styles.timeDisplay}>{displayTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});