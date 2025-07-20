import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEMPLATES_KEY = 'workout_templates';
const SETTINGS_KEY = 'workout_settings';

// Pre-defined workout examples for quick loading
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
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal and settings states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [shouldSaveTemplate, setShouldSaveTemplate] = useState(false);
  const [shouldAddRests, setShouldAddRests] = useState(false);
  const [restDuration, setRestDuration] = useState('10');
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [settings, setSettings] = useState({
    dontAskAgain: false,
    defaultRestDuration: '30'
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load user settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setRestDuration(parsedSettings.defaultRestDuration || '30');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Validation function
  const validateWorkout = (text) => {
    if (!text.trim()) {
      return "Please enter a workout";
    }

    const lines = text.trim().split('\n').filter(line => line.trim());
    const hasTimingPattern = /(\d+)\s*(s|sec|seconds?|m|min|minutes?|hour|hours?)\b/i;
    const hasAnyTiming = lines.some(line => hasTimingPattern.test(line));
    
    if (!hasAnyTiming) {
      return "Please include timing for exercises (e.g., 30s, 2 min, 45 sec)";
    }

    const exerciseLines = lines.filter(line => 
      !line.match(/^\s*-?\s*rest/i) && 
      !line.match(/^\d+\s+(rounds?|sets?)\s+of/i) && 
      !line.match(/^\s*-?\s*break/i) && 
      line.trim().length > 2
    );

    const linesWithoutTiming = exerciseLines.filter(line => 
      !hasTimingPattern.test(line)
    );

    if (linesWithoutTiming.length > 0) {
      return `Some exercises are missing timing. Add time like "30s" or "2 min"`;
    }

    return null;
  };

  // Add rest periods between exercises
  const addRestPeriods = (workoutText, restDuration) => {
    const lines = workoutText.trim().split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      processedLines.push(line);
      
      // Add rest after exercise lines (not after rest/break lines or round indicators)
      if (line && 
          !line.match(/^\s*-?\s*rest/i) && 
          !line.match(/^\s*-?\s*break/i) && 
          !line.match(/^\d+\s+(rounds?|sets?)\s+of/i) &&
          i < lines.length - 1) { // Don't add rest after last line
        
        const nextLine = lines[i + 1]?.trim();
        // Don't add rest if next line is already a rest/break
        if (nextLine && 
            !nextLine.match(/^\s*-?\s*rest/i) && 
            !nextLine.match(/^\s*-?\s*break/i)) {
          processedLines.push(`Rest ${restDuration}s`);
        }
      }
    }
    
    return processedLines.join('\n');
  };

  // Save template to AsyncStorage
  const saveTemplate = async (name, content) => {
    try {
      const storedTemplates = await AsyncStorage.getItem(TEMPLATES_KEY);
      const templates = storedTemplates ? JSON.parse(storedTemplates) : [];
      
      const newTemplate = {
        id: Date.now().toString(),
        name: name.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedTemplates = [...templates, newTemplate];
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
      
      Alert.alert('Success', 'Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'Failed to save template');
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    let processedWorkout = workoutText.trim();
    
    // Add rest periods if requested
    if (shouldAddRests) {
      processedWorkout = addRestPeriods(processedWorkout, restDuration);
    }
    
    // Save template if requested
    if (shouldSaveTemplate && templateName.trim()) {
      await saveTemplate(templateName, processedWorkout);
    }
    
    // Update settings if "don't ask again" is selected
    if (dontAskAgain) {
      const newSettings = {
        ...settings,
        dontAskAgain: true,
        defaultRestDuration: restDuration
      };
      await saveSettings(newSettings);
    }
    
    // Close modal and proceed with workout
    setIsModalVisible(false);
    resetModalState();
    onParseWorkout(processedWorkout);
    navigation.jumpTo('Timer');
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    resetModalState();
    // Still proceed with original workout
    onParseWorkout(workoutText.trim());
    navigation.jumpTo('Timer');
  };

  // Reset modal state
  const resetModalState = () => {
    setTemplateName('');
    setShouldSaveTemplate(false);
    setShouldAddRests(false);
    setDontAskAgain(false);
    setRestDuration(settings.defaultRestDuration || '30');
  };

  // Main parse workout handler
  const handleParseWorkout = () => {
    const error = validateWorkout(workoutText);
    
    if (error) {
      setErrorMessage(error);
      return;
    }
    
    setErrorMessage('');
    
    // Check if user has "don't ask again" enabled
    if (settings.dontAskAgain) {
      onParseWorkout(workoutText.trim());
      navigation.jumpTo('Timer');
    } else {
      // Show modal for template saving and rest options
      setIsModalVisible(true);
    }
  };

  const loadExample = (type) => {
    setWorkoutText(examples[type]);
    setErrorMessage('');
  };

  const handleTextChange = (text) => {
    setWorkoutText(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Workout</Text>
      
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Push-ups 30s&#10;Rest 10s&#10;Squats 45s&#10;Rest 15s&#10;Plank 60s"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={workoutText}
        onChangeText={handleTextChange}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleParseWorkout}>
          <Text style={styles.buttonText}>Parse </Text>
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

      {/* Settings Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Workout Options</Text>
            
            {/* Template saving section */}
            <View style={styles.optionSection}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>Save as Template</Text>
                <Switch
                  value={shouldSaveTemplate}
                  onValueChange={setShouldSaveTemplate}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={shouldSaveTemplate ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              {shouldSaveTemplate && (
                <TextInput
                  style={styles.input}
                  placeholder="Template name"
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                />
              )}
            </View>

            {/* Rest periods section */}
            <View style={styles.optionSection}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>Add Rest Periods</Text>
                <Switch
                  value={shouldAddRests}
                  onValueChange={setShouldAddRests}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={shouldAddRests ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              {shouldAddRests && (
                <View style={styles.restInputContainer}>
                  <Text style={styles.restLabel}>Rest duration (seconds):</Text>
                  <TextInput
                    style={styles.restInput}
                    value={restDuration}
                    onChangeText={setRestDuration}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  />
                </View>
              )}
            </View>

            {/* Don't ask again section */}
            <View style={styles.optionSection}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>Don't ask again</Text>
                <Switch
                  value={dontAskAgain}
                  onValueChange={setDontAskAgain}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={dontAskAgain ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              {dontAskAgain && (
                <Text style={styles.dontAskText}>
                  You won't be prompted for template saving or rest options in the future.
                </Text>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleModalCancel}>
                <Text style={styles.cancelButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleModalConfirm}>
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Electrolize, sans-serif',
    marginBottom: 15,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 8,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
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
    height: 260,
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
    fontSize: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionSection: {
    marginBottom: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  restInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  restInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#333',
    width: 80,
    textAlign: 'center',
  },
  dontAskText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});