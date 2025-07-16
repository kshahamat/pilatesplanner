// screens/TimerScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TimerSection from '../components/TimerSection';
import { useWorkout } from '../context/WorkoutContext';

export default function TimerScreen() {
  const {
    workoutData,
    currentExerciseIndex,
    currentTime,
    totalTime,
    isRunning,
    isPaused,
    startWorkout,
    pauseWorkout,
    skipExercise,
    resetWorkout,
  } = useWorkout();

  // Check if workout is finished (no more exercises)
  const isFinished = workoutData.length > 0 && currentExerciseIndex >= workoutData.length;

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TimerSection
          workoutData={workoutData}
          currentExerciseIndex={currentExerciseIndex}
          currentTime={currentTime}
          totalTime={totalTime}
          isRunning={isRunning}
          isPaused={isPaused}
          isFinished={isFinished}
          onStart={startWorkout}
          onPause={pauseWorkout}
          onSkip={skipExercise}
          onReset={resetWorkout}
        />
        
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});