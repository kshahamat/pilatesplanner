// screens/TemplatesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WorkoutTemplates from '../components/WorkoutTemplates';
import { useWorkout } from '../context/WorkoutContext';

export default function TemplatesScreen() {
  const { handleSelectTemplate, currentWorkoutInput } = useWorkout();

  const HeaderComponent = () => (
    <Text style={styles.title}>Templates</Text>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <WorkoutTemplates
        onSelectTemplate={handleSelectTemplate}
        currentWorkoutInput={currentWorkoutInput}
        HeaderComponent={HeaderComponent}
        contentContainerStyle={styles.scrollContent}
      />
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});