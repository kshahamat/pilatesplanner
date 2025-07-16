import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
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
  
  // Animation values for current exercise
  const nextExerciseY = useRef(new Animated.Value(0)).current;
  const currentExerciseY = useRef(new Animated.Value(0)).current;
  const nextExerciseOpacity = useRef(new Animated.Value(0)).current;
  const currentExerciseOpacity = useRef(new Animated.Value(1)).current;
  
  // Animation values for next exercise text
  const nextTextY = useRef(new Animated.Value(0)).current;
  const currentNextTextY = useRef(new Animated.Value(0)).current;
  const nextTextOpacity = useRef(new Animated.Value(0)).current;
  const currentNextTextOpacity = useRef(new Animated.Value(1)).current;
  
  // Keep track of previous exercise index to trigger animation
  const prevExerciseIndex = useRef(currentExerciseIndex);
  const isAnimating = useRef(false);
  
  useEffect(() => {
    // Only trigger animation when moving to next exercise (not reset or initial load)
    if (prevExerciseIndex.current < currentExerciseIndex && workoutData.length > 0 && !isAnimating.current) {
      animateExerciseTransition();
    }
    prevExerciseIndex.current = currentExerciseIndex;
  }, [currentExerciseIndex]);
  
  const animateExerciseTransition = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Set initial positions for current exercise animation
    nextExerciseY.setValue(-60); // Start above
    nextExerciseOpacity.setValue(1);
    currentExerciseY.setValue(0);
    currentExerciseOpacity.setValue(1);
    
    // Set initial positions for next exercise text animation
    nextTextY.setValue(-30); // Start above
    nextTextOpacity.setValue(1);
    currentNextTextY.setValue(0);
    currentNextTextOpacity.setValue(1);
    
    // Animate transition
    Animated.parallel([
      // Current exercise animation
      Animated.timing(currentExerciseY, {
        toValue: 60,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(currentExerciseOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(nextExerciseY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Next exercise text animation
      Animated.timing(currentNextTextY, {
        toValue: 30,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(currentNextTextOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(nextTextY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset after animation completes
      currentExerciseY.setValue(0);
      currentExerciseOpacity.setValue(1);
      nextExerciseY.setValue(0);
      nextExerciseOpacity.setValue(0);
      currentNextTextY.setValue(0);
      currentNextTextOpacity.setValue(1);
      nextTextY.setValue(0);
      nextTextOpacity.setValue(0);
      isAnimating.current = false;
    });
  };
  
  let nextExerciseText;
  let animatingNextExerciseText;
  
  if (isFinished) {
    nextExerciseText = 'YOU ARE DONE WOOT WOOT!';
    animatingNextExerciseText = 'YOU ARE DONE WOOT WOOT!';
  } else if (currentExerciseIndex === workoutData.length - 1) {
    nextExerciseText = 'THIS IS YOUR LAST ONE! FINISH STRONG';
    animatingNextExerciseText = 'YOU ARE DONE WOOT WOOT!';
  } else if (currentExerciseIndex === workoutData.length - 2) {
    nextExerciseText = 'Push! You are almost done!';
    animatingNextExerciseText = 'THIS IS YOUR LAST ONE! FINISH STRONG';
  } else if (nextExercise) {
    nextExerciseText = `${nextExercise.name}`;
    // Get the exercise after next for animation
    const exerciseAfterNext = workoutData[currentExerciseIndex + 2];
    if (exerciseAfterNext) {
      animatingNextExerciseText = `${exerciseAfterNext.name}`;
    } else if (currentExerciseIndex + 2 === workoutData.length - 1) {
      animatingNextExerciseText = 'THIS IS YOUR LAST ONE! FINISH STRONG';
    } else {
      animatingNextExerciseText = 'Push! You are almost done!';
    }
  } else {
    nextExerciseText = '';
    animatingNextExerciseText = '';
  }

  const getCurrentExerciseText = () => {
    if (isFinished) return '🎉 Workout Complete! 🎉';
    if (currentExercise) return currentExercise.name;
    return 'Parse your workout to begin';
  };

  const getPreviousExerciseText = () => {
    if (prevExerciseIndex.current >= 0 && workoutData[prevExerciseIndex.current]) {
      return workoutData[prevExerciseIndex.current].name;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <View style={styles.nextExerciseContainer}>
          {/* Current next exercise text */}
          <Animated.View
            style={[
              styles.nextExerciseTextContainer,
              {
                transform: [{ translateY: currentNextTextY }],
                opacity: currentNextTextOpacity,
              },
            ]}
          >
            <Text style={styles.nextExercise}>
              {nextExerciseText}
            </Text>
          </Animated.View>
          
          {/* Animating next exercise text */}
          <Animated.View
            style={[
              styles.nextExerciseTextContainer,
              {
                transform: [{ translateY: nextTextY }],
                opacity: nextTextOpacity,
              },
            ]}
          >
            <Text style={styles.nextExercise}>
              {animatingNextExerciseText}
            </Text>
          </Animated.View>
        </View>
        
        <View style={styles.exerciseContainer}>
          {/* Current exercise */}
          <Animated.View
            style={[
              styles.currentExerciseContainer,
              {
                transform: [{ translateY: currentExerciseY }],
                opacity: currentExerciseOpacity,
              },
            ]}
          >
            <Text style={styles.currentExercise}>
              {getCurrentExerciseText()}
            </Text>
          </Animated.View>
          
          {/* Next exercise that animates in during transition */}
          <Animated.View
            style={[
              styles.nextExerciseContainer,
              {
                transform: [{ translateY: nextExerciseY }],
                opacity: nextExerciseOpacity,
              },
            ]}
          >
            <Text style={styles.currentExercise}>
              {getCurrentExerciseText()}
            </Text>
          </Animated.View>
        </View>
        
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
    marginTop: 10, // Reduced from 20
    marginBottom: 20, // Reduced from 30
  },
  nextExerciseContainer: {
    position: 'relative',
    height: 60, // Fixed height for next exercise text
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  nextExerciseTextContainer: {
    position: 'absolute',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextExercise: {
    fontSize: 15,
    fontFamily: 'Electrolize, sans-serif',
    letterSpacing: 2,
    marginTop: 40,
    color: 'white',
    textAlign: 'center', // Changed from 'left' to 'center'
  },
  exerciseContainer: {
    position: 'relative',
    height: 120, // Fixed height to contain both exercises
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Reduced from 20
    overflow: 'hidden', // Prevent text from showing outside bounds
  },
  currentExerciseContainer: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextExerciseContainer: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentExercise: {
    fontSize: 30,
    marginTop: 50,
    fontFamily: 'Electrolize, sans-serif',
    letterSpacing: 2,
    color: 'white',
    textAlign: 'center',
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