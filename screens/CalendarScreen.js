// screens/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentDayData, setCurrentDayData] = useState({
    workoutName: '',
    youtubeLink: '',
    notes: '',
    completed: false
  });

  // Load saved workout data
  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      const saved = await AsyncStorage.getItem('workoutCalendarData');
      if (saved) {
        setWorkoutData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  const saveWorkoutData = async (data) => {
    try {
      await AsyncStorage.setItem('workoutCalendarData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const openDayModal = (date) => {
    if (!date) return;
    
    const dateKey = formatDateKey(date);
    const existingData = workoutData[dateKey] || {
      workoutName: '',
      youtubeLink: '',
      notes: '',
      completed: false
    };
    
    setCurrentDayData(existingData);
    setSelectedDate(date);
    setShowModal(true);
  };

  const saveDayData = () => {
    const dateKey = formatDateKey(selectedDate);
    const updatedData = {
      ...workoutData,
      [dateKey]: currentDayData
    };
    
    setWorkoutData(updatedData);
    saveWorkoutData(updatedData);
    setShowModal(false);
  };

  const deleteDayData = () => {
    const dateKey = formatDateKey(selectedDate);
    const updatedData = { ...workoutData };
    delete updatedData[dateKey];
    
    setWorkoutData(updatedData);
    saveWorkoutData(updatedData);
    setShowModal(false);
  };

  const openYouTubeLink = () => {
    if (currentDayData.youtubeLink) {
      Linking.openURL(currentDayData.youtubeLink);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const renderDay = (date, index) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dateKey = formatDateKey(date);
    const dayData = workoutData[dateKey];
    const hasWorkout = dayData && (dayData.workoutName || dayData.youtubeLink);
    const isCompleted = dayData && dayData.completed;
    const isToday = formatDateKey(new Date()) === dateKey;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          hasWorkout && styles.workoutDay,
          isCompleted && styles.completedDay
        ]}
        onPress={() => openDayModal(date)}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          hasWorkout && styles.workoutDayText
        ]}>
          {date.getDate()}
        </Text>
        {hasWorkout && (
          <View style={styles.workoutIndicator}>
            <Text style={styles.indicatorText}>
              {isCompleted ? '✓' : '•'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth(-1)}
        >
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth(1)}
        >
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.dayName}>{day}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {getDaysInMonth(selectedDate).map((date, index) => 
          renderDay(date, index)
        )}
      </View>

      {/* Modal for editing day */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDate.toDateString()}
            </Text>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.inputLabel}>Workout Name</Text>
              <TextInput
                style={styles.textInput}
                value={currentDayData.workoutName}
                onChangeText={(text) => setCurrentDayData({
                  ...currentDayData,
                  workoutName: text
                })}
                placeholder="e.g., Upper Body, Cardio, Legs"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />

              <Text style={styles.inputLabel}>YouTube Link</Text>
              <TextInput
                style={styles.textInput}
                value={currentDayData.youtubeLink}
                onChangeText={(text) => setCurrentDayData({
                  ...currentDayData,
                  youtubeLink: text
                })}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={currentDayData.notes}
                onChangeText={(text) => setCurrentDayData({
                  ...currentDayData,
                  notes: text
                })}
                placeholder="Add any notes about your workout..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[
                  styles.completedButton,
                  currentDayData.completed && styles.completedButtonActive
                ]}
                onPress={() => setCurrentDayData({
                  ...currentDayData,
                  completed: !currentDayData.completed
                })}
              >
                <Text style={[
                  styles.completedButtonText,
                  currentDayData.completed && styles.completedButtonTextActive
                ]}>
                  {currentDayData.completed ? '✓ Completed' : 'Mark as Completed'}
                </Text>
              </TouchableOpacity>

              {currentDayData.youtubeLink && (
                <TouchableOpacity
                  style={styles.youtubeButton}
                  onPress={openYouTubeLink}
                >
                  <Text style={styles.youtubeButtonText}>
                    📺 Open YouTube Video
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteDayData}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveDayData}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  todayCell: {
    backgroundColor: 'rgba(76, 205, 196, 0.2)',
    borderColor: '#4ecdc4',
  },
  workoutDay: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  completedDay: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  dayNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  todayText: {
    color: '#4ecdc4',
    fontWeight: 'bold',
  },
  workoutDayText: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  indicatorText: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  completedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  completedButtonActive: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
    borderColor: '#28a745',
  },
  completedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedButtonTextActive: {
    color: '#28a745',
  },
  youtubeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  youtubeButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButton: {
    backgroundColor: 'rgba(108, 117, 125, 0.2)',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: 'rgba(76, 205, 196, 0.2)',
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#4ecdc4',
    fontWeight: '600',
  },
});

export default CalendarScreen;