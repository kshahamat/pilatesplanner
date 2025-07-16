import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import TimerCircle from './TimerCircle';
import WorkoutProgress from './WorkoutProgress';
import { formatTime } from '../utils/timeUtils';

export default function TimerSection({
  workoutData,
  currentExerciseIndex,
  currentTime,
  totalTime,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onSkip,
  onReset,
}) {
  const currentExercise = workoutData[currentExerciseIndex];
  const nextExercise = workoutData[currentExerciseIndex+1];
  const isFinished = currentExerciseIndex >= workoutData.length && workoutData.length > 0;
  let nextExerciseText;
  if (isFinished) {
    nextExerciseText = 'YOU ARE DONE WOOT WOOT!';
  } else if (currentExerciseIndex === workoutData.length - 1) {
    // This is the last exercise
    nextExerciseText = 'THIS IS YOUR LAST ONE! FINISH STRONG';
  } else if (currentExerciseIndex === workoutData.length - 2) {
    // This is the second-to-last exercise
    nextExerciseText = 'Push! You are almost done!';
  } else if (nextExercise) {
    nextExerciseText = `${nextExercise.name}`;
  } else {
    nextExerciseText = '';
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Workout Timer</Text> */}
      
      <View style={styles.timerDisplay }>
        <Text style={styles.nextExercise}>
          {nextExerciseText}
        </Text>
        <Text style={styles.currentExercise}>
          {isFinished ? '🎉 Workout Complete! 🎉' : 
           currentExercise ? currentExercise.name : 'Parse your workout to begin'}
        </Text>
        
        <TimerCircle
          currentTime={currentTime}
          totalTime={totalTime}
          isRest={currentExercise?.type === 'rest'}
          isFinished={isFinished}
          isRunning={isRunning && !isPaused}
          onPause={onPause}
          onResume={onStart}
          hasWorkout={workoutData.length > 0}
        />
      </View>
      
      <View style={styles.controls}>
        
        <TouchableOpacity
          style={[styles.button, !isRunning && styles.buttonDisabled]}
          onPress={onSkip}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, !workoutData.length && styles.buttonDisabled]}
          onPress={onReset}
          disabled={!workoutData.length}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      <WorkoutProgress
        workoutData={workoutData}
        currentExerciseIndex={currentExerciseIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  timerDisplay: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 90,
  },
  nextExercise: {
    fontSize: 20,
    // fontWeight: 'bold',
    fontFamily: 'Electrolize, sans-serif',
    letterSpacing: 2,
    color: 'white',
    textAlign: 'left',
    minHeight: 60,
    marginTop: 20,
    marginBottom: 15,
  },
  currentExercise: {
    fontSize: 40,
    // fontWeight: 'bold',
    fontFamily: 'Electrolize, sans-serif',
    letterSpacing: 2,
    color: 'white',
    textAlign: 'center',
    minHeight: 60,
    marginTop: 5,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 25,
    borderRadius: 30,
    flex: 1,
    minWidth: '48%',
  },
  buttonPause: {
    backgroundColor: 'rgba(220, 128, 29, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    minWidth: '45%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
});