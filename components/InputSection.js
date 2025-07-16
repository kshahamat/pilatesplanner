import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const examples = {
  hiit: `3 rounds of:
- Jumping jacks 30s
- Rest 10s
- Burpees 20s
- Rest 15s
- Mountain climbers 30s
- Rest 20s`,
  
  booty: `leg lift 40 sec
leg pulse 20 sec
rainbows 40 sec
half circle/lift 40 sec
forwards twists 40 sec
backward twists 40 sec
back pulse 40 sec
kick backs 40 sec
fire hydrant 40 sec
hydrant pulse 20 sec`,
  
  abs: `heel tap/crunch (right) 30 sec 
heel tap/crunch (left) 30 sec 
3 sec break
weighted sit up 40 sec
3 sec break
knee/leg crunch (left) 30 sec 
knee/leg crunch (right) 30 sec 
3 sec break
left leg over crunch 30 sec 
right leg over crunch 30 sec 
3 sec break
single leg lifts 30 sec 
scissors 30 sec 
5 sec break
plank twists 30 sec`,
  
  yoga: `Breathing 2 minutes
Downward dog 60s
Rest 10s
Warrior pose 45s
Rest 10s
Tree pose 30s
Rest 10s
Child's pose 60s
Meditation 3 minutes`
};

export default function InputSection({ onParseWorkout }) {
  const navigation = useNavigation();
  const [workoutText, setWorkoutText] = useState('');

  const handleParseWorkout = () => {
    if (workoutText.trim()) {
      onParseWorkout(workoutText.trim());
      // Navigate to timer page after parsing
      navigation.jumpTo('Timer');
    }
  };

  const handleClear = () => {
    setWorkoutText('');
  };

  const loadExample = (type) => {
    setWorkoutText(examples[type]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Workout</Text>
      
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Push-ups 30s&#10;Rest 10s&#10;Squats 45s&#10;Rest 15s&#10;Plank 60s"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={workoutText}
        onChangeText={setWorkoutText}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleParseWorkout}>
          <Text style={styles.buttonText}>Parse Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.exampleSection}>
        <Text style={styles.exampleTitle}>Quick Examples:</Text>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('hiit')}>
          <Text style={styles.exampleText}>HIIT Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('booty')}>
          <Text style={styles.exampleText}>Booty Fillers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('abs')}>
          <Text style={styles.exampleText}>Pilates Ab Circuit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('yoga')}>
          <Text style={styles.exampleText}>Yoga Flow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    fontSize: 20,
    fontFamily: 'monospace',
    height: 300,
    textAlignVertical: 'top',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exampleSection: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
  },
  exampleTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
  },
  exampleText: {
    color: 'white',
    opacity: 0.9,
  },
});