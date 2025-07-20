// screens/ManualWorkoutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputSection from '../components/InputSection';
import { useWorkout } from '../context/WorkoutContext';

export default function ManualWorkoutScreen({ navigation }) {
  const { handleParseWorkout, audioInitialized } = useWorkout();

  const navigateToTemplates = () => {
    navigation.navigate('Templates');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={[styles.navButton, styles.activeButton]}>
            <Text style={[styles.navButtonText, styles.activeButtonText]}>Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={navigateToTemplates}
          >
            <Text style={styles.navButtonText}>Templates</Text>
          </TouchableOpacity>
        </View>
        
        {!audioInitialized && (
          <Text style={styles.audioStatus}>Initializing audio...</Text>
        )}
        
        <InputSection onParseWorkout={handleParseWorkout} />
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
  navigationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeButtonText: {
    color: '#667eea',
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
  audioStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
});