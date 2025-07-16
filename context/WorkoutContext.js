// context/WorkoutContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { parseWorkout } from '../utils/workoutParser';
import { playBeep, initializeAudio, cleanupAudio } from '../utils/audioUtils';

const WorkoutContext = createContext();

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider = ({ children }) => {
  const [workoutData, setWorkoutData] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentWorkoutInput, setCurrentWorkoutInput] = useState('');
  const timerRef = useRef(null);

  // Initialize audio when component mounts
  useEffect(() => {
    const setupAudio = async () => {
      await initializeAudio();
      setAudioInitialized(true);
    };
    
    setupAudio();
    
    // Cleanup audio when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupAudio();
    };
  }, []);

  const handleParseWorkout = (input) => {
    const parsed = parseWorkout(input);
    setWorkoutData(parsed);
    setCurrentWorkoutInput(input);
    resetWorkout();
  };

  const handleSelectTemplate = (templateContent) => {
    handleParseWorkout(templateContent);
  };

  const startWorkout = () => {
    if (workoutData.length === 0) return;
    
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      runTimer();
    } else {
      setCurrentExerciseIndex(0);
      setIsRunning(true);
      setIsPaused(false);
      startCurrentExercise(0);
    }
  };

  const pauseWorkout = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < workoutData.length - 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      startCurrentExercise(nextIndex);
    } else {
      finishWorkout();
    }
  };

  const resetWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentExerciseIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setTotalTime(0);
  };

  const startCurrentExercise = async (index) => {
    if (audioInitialized) {
      await playBeep(600, 300);
    }
    
    const exercise = workoutData[index];
    setCurrentTime(exercise.duration);
    setTotalTime(exercise.duration);
    
    runTimer();
  };

  const runTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev < 1) {
          clearInterval(timerRef.current);
                    
          setTimeout(() => {
            setCurrentExerciseIndex((currentIndex) => {
                const nextIndex = currentIndex + 1;
                if (nextIndex < workoutData.length) {
                    startCurrentExercise(nextIndex);
                    return nextIndex;
                } else {
                    finishWorkout();
                    return workoutData.length;
                }
            });
            }, 1000);
          
          return 0;
        }
        
        if ((prev === 4 || prev === 3 || prev === 2) && audioInitialized) {
          playBeep(800, 200);
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  const finishWorkout = async () => {
  setIsRunning(false);
  setIsPaused(false);
  setCurrentExerciseIndex(workoutData.length); // Add this line
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
  
  if (audioInitialized) {
    await playBeep(800, 200);
    setTimeout(() => playBeep(1000, 200), 300);
    setTimeout(() => playBeep(1200, 400), 600);
  }
};

  const value = {
    workoutData,
    currentExerciseIndex,
    currentTime,
    totalTime,
    isRunning,
    isPaused,
    audioInitialized,
    currentWorkoutInput,
    handleParseWorkout,
    handleSelectTemplate,
    startWorkout,
    pauseWorkout,
    skipExercise,
    resetWorkout,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};