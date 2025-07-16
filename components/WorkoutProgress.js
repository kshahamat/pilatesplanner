import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatTime } from '../utils/timeUtils';

export default function WorkoutProgress({ workoutData, currentExerciseIndex }) {
  if (!workoutData.length) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {workoutData.map((exercise, index) => {
        const isActive = index === currentExerciseIndex;
        const isCompleted = index < currentExerciseIndex;
        
        return (
          <View
            key={index}
            style={[
              styles.exerciseItem,
              isActive && styles.activeItem,
              isCompleted && styles.completedItem,
            ]}
          >
            <View style={styles.exerciseNumber}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDuration}>
                {formatTime(exercise.duration)}
              </Text>
            </View>
            
            <View style={[
              styles.statusIndicator,
              isActive && styles.activeIndicator,
              isCompleted && styles.completedIndicator,
            ]} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
  },
  activeItem: {
    backgroundColor: 'rgba(76, 205, 196, 0.3)',
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  completedItem: {
    backgroundColor: 'rgba(76, 205, 196, 0.1)',
    opacity: 0.7,
  },
  exerciseNumber: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDuration: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#4ecdc4',
  },
  completedIndicator: {
    backgroundColor: '#45b7aa',
  },
});