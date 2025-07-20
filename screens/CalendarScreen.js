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
  Linking,
  FlatList
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_WORKOUT_TAGS = [
  { id: 'legs', name: 'Leg Day', color: '#FF6B6B' },
  { id: 'upper', name: 'Upper Body', color: '#4ECDC4' },
  { id: 'pull', name: 'Pull Day', color: '#45B7D1' },
  { id: 'push', name: 'Push Day', color: '#96CEB4' },
  { id: 'fullbody', name: 'Full Body', color: '#FFEAA7' },
  { id: 'cardio', name: 'Cardio', color: '#FD79A8' },
  { id: 'rest', name: 'Rest Day', color: '#A29BFE' }
];

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#FD79A8', '#A29BFE', '#FF7675', '#00B894', '#0984E3',
  '#6C5CE7', '#FDCB6E', '#E17055', '#00CEC9', '#74B9FF'
];

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState({});
  const [workoutTags, setWorkoutTags] = useState(DEFAULT_WORKOUT_TAGS);
  const [showLegend, setShowLegend] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentDayData, setCurrentDayData] = useState({
    selectedTemplates: [], 
    customWorkouts: [],
    youtubeLink: '',
    notes: '',
    completed: false,
    tagId: null
  });
  const [workoutTemplatesList, setWorkoutTemplatesList] = useState([
    { id: 'pushups', name: 'Push-ups' },
    { id: 'squats', name: 'Squats' },
    { id: 'deadlifts', name: 'Deadlifts' },
    { id: 'bench', name: 'Bench Press' },
    { id: 'pullups', name: 'Pull-ups' },
    { id: 'planks', name: 'Planks' },
    { id: 'lunges', name: 'Lunges' },
    { id: 'burpees', name: 'Burpees' },
    { id: 'mountain', name: 'Mountain Climbers' },
    { id: 'bicep', name: 'Bicep Curls' }
  ]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showCustomWorkoutModal, setShowCustomWorkoutModal] = useState(false);
  const [newWorkoutTemplate, setNewWorkoutTemplate] = useState('');
  const [newTag, setNewTag] = useState({
    name: '',
    color: PREDEFINED_COLORS[0]
  });
  const [customWorkoutInput, setCustomWorkoutInput] = useState('');
  const [selectedDateForEdit, setSelectedDateForEdit] = useState(null);
  
  // Use workoutTemplates from context if available, otherwise fall back to local state
  const { workoutTemplates, getTemplateById } = useWorkout();
  const templatesForRendering = workoutTemplates || workoutTemplatesList;

  // Load saved data
  useEffect(() => {
    loadWorkoutData();
    loadWorkoutTags();
    loadWorkoutTemplates();
  }, []);

  // Update current day data when a new date is selected
  useEffect(() => {
    if (selectedDateForEdit) {
      const dateKey = formatDateKey(selectedDateForEdit);
      const existingData = workoutData[dateKey] || {
        selectedTemplates: [], 
        customWorkouts: [],
        youtubeLink: '',
        notes: '',
        completed: false,
        tagId: null
      };
      setCurrentDayData(existingData);
    }
  }, [selectedDateForEdit, workoutData]);

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

  const loadWorkoutTags = async () => {
    try {
      const saved = await AsyncStorage.getItem('workoutTags');
      if (saved) {
        const customTags = JSON.parse(saved);
        setWorkoutTags([...DEFAULT_WORKOUT_TAGS, ...customTags]);
      }
    } catch (error) {
      console.error('Error loading workout tags:', error);
    }
  };

  const saveWorkoutData = async (data) => {
    try {
      await AsyncStorage.setItem('workoutCalendarData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };

  const saveCustomTags = async (customTags) => {
    try {
      await AsyncStorage.setItem('workoutTags', JSON.stringify(customTags));
    } catch (error) {
      console.error('Error saving custom tags:', error);
    }
  };

  const loadWorkoutTemplates = async () => {
    try {
      const saved = await AsyncStorage.getItem('workoutTemplates');
      if (saved) {
        setWorkoutTemplatesList(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading workout templates:', error);
    }
  };

  const saveWorkoutTemplates = async (templates) => {
    try {
      await AsyncStorage.setItem('workoutTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving workout templates:', error);
    }
  };

  const addWorkoutTemplate = () => {
    if (!newWorkoutTemplate.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const newTemplate = {
      id: `custom_${Date.now()}`,
      name: newWorkoutTemplate.trim()
    };

    const updatedTemplates = [...workoutTemplatesList, newTemplate];
    setWorkoutTemplatesList(updatedTemplates);
    saveWorkoutTemplates(updatedTemplates);
    
    setNewWorkoutTemplate('');
    setShowWorkoutModal(false);
  };

  const addCustomTag = () => {
    if (!newTag.name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    const customTag = {
      id: `custom_${Date.now()}`,
      name: newTag.name.trim(),
      color: newTag.color
    };

    const updatedTags = [...workoutTags, customTag];
    setWorkoutTags(updatedTags);
    
    const customTags = updatedTags.filter(tag => tag.id.startsWith('custom_'));
    saveCustomTags(customTags);
    
    setNewTag({ name: '', color: PREDEFINED_COLORS[0] });
    setShowTagModal(false);
  };

  const deleteCustomTag = (tagId) => {
    if (!tagId.startsWith('custom_')) return;
    
    Alert.alert(
      'Delete Tag',
      'Are you sure you want to delete this tag? It will be removed from all workouts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTags = workoutTags.filter(tag => tag.id !== tagId);
            setWorkoutTags(updatedTags);
            
            // Remove tag from all workouts
            const updatedWorkoutData = { ...workoutData };
            Object.keys(updatedWorkoutData).forEach(dateKey => {
              if (updatedWorkoutData[dateKey].tagId === tagId) {
                updatedWorkoutData[dateKey].tagId = null;
              }
            });
            
            setWorkoutData(updatedWorkoutData);
            saveWorkoutData(updatedWorkoutData);
            
            const customTags = updatedTags.filter(tag => tag.id.startsWith('custom_'));
            saveCustomTags(customTags);
          }
        }
      ]
    );
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const selectDate = (date) => {
    if (!date) return;
    setSelectedDateForEdit(date);
  };

  const saveDayData = () => {
    if (!selectedDateForEdit) return;
    
    const dateKey = formatDateKey(selectedDateForEdit);
    const updatedData = {
      ...workoutData,
      [dateKey]: currentDayData
    };
    
    setWorkoutData(updatedData);
    saveWorkoutData(updatedData);
  };

  const deleteDayData = () => {
    if (!selectedDateForEdit) return;
    
    const dateKey = formatDateKey(selectedDateForEdit);
    const updatedData = { ...workoutData };
    delete updatedData[dateKey];
    
    setWorkoutData(updatedData);
    saveWorkoutData(updatedData);
    
    // Reset current day data
    setCurrentDayData({
      selectedTemplates: [], 
      customWorkouts: [],
      youtubeLink: '',
      notes: '',
      completed: false,
      tagId: null
    });
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

  const getTagColor = (tagId) => {
    const tag = workoutTags.find(t => t.id === tagId);
    return tag ? tag.color : null;
  };

  const updateCurrentDayData = (updates) => {
    const updatedData = { ...currentDayData, ...updates };
    setCurrentDayData(updatedData);
    
    // Auto-save when data changes
    if (selectedDateForEdit) {
      const dateKey = formatDateKey(selectedDateForEdit);
      const updatedWorkoutData = {
        ...workoutData,
        [dateKey]: updatedData
      };
      setWorkoutData(updatedWorkoutData);
      saveWorkoutData(updatedWorkoutData);
    }
  };

  const renderDay = (date, index) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dateKey = formatDateKey(date);
    const dayData = workoutData[dateKey];
    const hasWorkout = dayData && (
      (dayData.selectedTemplates?.length > 0) || 
      (dayData.customWorkouts?.length > 0) || 
      dayData.youtubeLink || 
      dayData.tagId
    );
    const isToday = formatDateKey(new Date()) === dateKey;
    const isSelected = selectedDateForEdit && formatDateKey(selectedDateForEdit) === dateKey;
    const tagColor = dayData?.tagId ? getTagColor(dayData.tagId) : null;
    const isCompleted = dayData?.completed || false;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
          tagColor && { backgroundColor: tagColor + '40', borderColor: tagColor }
        ]}
        onPress={() => selectDate(date)}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          isSelected && styles.selectedText,
          tagColor && { color: tagColor }
        ]}>
          {date.getDate()}
        </Text>
        {hasWorkout && (
          <View style={styles.workoutIndicator}>
            <Text style={[styles.indicatorText, tagColor && { color: tagColor }]}>
              {isCompleted ? '✓' : '•'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTagSelector = () => (
    <View style={styles.tagSelector}>
      <Text style={styles.inputLabel}>Workout Tag</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScrollView}>
        <TouchableOpacity
          style={[
            styles.tagOption,
            !currentDayData.tagId && styles.selectedTag
          ]}
          onPress={() => updateCurrentDayData({ tagId: null })}
        >
          <Text style={[
            styles.tagText,
            !currentDayData.tagId && styles.selectedTagText
          ]}>None</Text>
        </TouchableOpacity>
        
        {workoutTags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagOption,
              { borderColor: tag.color },
              currentDayData.tagId === tag.id && [styles.selectedTag, { backgroundColor: tag.color + '40' }]
            ]}
            onPress={() => updateCurrentDayData({ tagId: tag.id })}
          >
            <Text style={[
              styles.tagText,
              currentDayData.tagId === tag.id && { color: tag.color }
            ]}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLegend = () => (
    <Modal
      visible={showLegend}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.legendModal}>
          <View style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Workout Tags</Text>
            <TouchableOpacity onPress={() => setShowLegend(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legendScroll}>
            {workoutTags.map(tag => (
              <View key={tag.id} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: tag.color }]} />
                <Text style={styles.legendText}>{tag.name}</Text>
                {tag.id.startsWith('custom_') && (
                  <TouchableOpacity
                    style={styles.deleteTagButton}
                    onPress={() => deleteCustomTag(tag.id)}
                  >
                    <Text style={styles.deleteTagText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => {
              setShowLegend(false);
              setShowTagModal(true);
            }}
          >
            <Text style={styles.addTagButtonText}>+ Add Custom Tag</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAddTagModal = () => (
    <Modal
      visible={showTagModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tagModalContent}>
          <Text style={styles.modalTitle}>Add Custom Tag</Text>
          
          <Text style={styles.inputLabel}>Tag Name</Text>
          <TextInput
            style={styles.textInput}
            value={newTag.name}
            onChangeText={(text) => setNewTag({ ...newTag, name: text })}
            placeholder="e.g., HIIT, Yoga, Stretching"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
          
          <Text style={styles.inputLabel}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
            {PREDEFINED_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newTag.color === color && styles.selectedColor
                ]}
                onPress={() => setNewTag({ ...newTag, color })}
              />
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowTagModal(false);
                setNewTag({ name: '', color: PREDEFINED_COLORS[0] });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={addCustomTag}
            >
              <Text style={styles.saveButtonText}>Add Tag</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDayEditor = () => {
    if (!selectedDateForEdit) return null;

    return (
      <View style={styles.dayEditor}>
        <Text style={styles.dayEditorTitle}>
          {selectedDateForEdit.toDateString()}
        </Text>
        
        <ScrollView style={styles.dayEditorScroll} showsVerticalScrollIndicator={false}>
          {renderTagSelector()}
          
          <Text style={styles.inputLabel}>Workouts</Text>
          <View style={styles.workoutSelector}>
            {/* Template Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workoutScrollView}>
              {templatesForRendering.map((template) => {
                const isSelected = currentDayData.selectedTemplates?.includes(template.id);
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.workoutOption,
                      isSelected && styles.selectedWorkout
                    ]}
                    onPress={() => {
                      const currentTemplates = currentDayData.selectedTemplates || [];
                      const updatedTemplates = isSelected
                        ? currentTemplates.filter(id => id !== template.id)
                        : [...currentTemplates, template.id];
                      updateCurrentDayData({ selectedTemplates: updatedTemplates });
                    }}
                  >
                    <Text style={[
                      styles.workoutText,
                      isSelected && styles.selectedWorkoutText
                    ]}>
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addWorkoutButton}
                onPress={() => setShowWorkoutModal(true)}
              >
                <Text style={styles.addWorkoutText}>+ Add Template</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Custom Workouts */}
            <View style={styles.customWorkoutContainer}>
              {currentDayData.customWorkouts?.map((workout, index) => (
                <View key={index} style={styles.customWorkoutItem}>
                  <Text style={styles.customWorkoutText}>{workout}</Text>
                  <TouchableOpacity
                    style={styles.removeWorkoutButton}
                    onPress={() => {
                      const updatedCustom = currentDayData.customWorkouts.filter((_, i) => i !== index);
                      updateCurrentDayData({ customWorkouts: updatedCustom });
                    }}
                  >
                    <Text style={styles.removeWorkoutText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Summary of selected workouts */}
            {((currentDayData.selectedTemplates?.length > 0) || (currentDayData.customWorkouts?.length > 0)) && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryTitle}>Selected Workouts:</Text>
                {currentDayData.selectedTemplates?.map(templateId => {
                  const template = getTemplateById ? getTemplateById(templateId) : 
                    templatesForRendering.find(t => t.id === templateId);
                  return template ? (
                    <Text key={templateId} style={styles.selectedSummaryText}>• {template.name}</Text>
                  ) : null;
                })}
                {currentDayData.customWorkouts?.map((workout, index) => (
                  <Text key={`custom-${index}`} style={styles.selectedSummaryText}>• {workout}</Text>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.inputLabel}>YouTube Link</Text>
          <TextInput
            style={styles.textInput}
            value={currentDayData.youtubeLink}
            onChangeText={(text) => updateCurrentDayData({ youtubeLink: text })}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={currentDayData.notes}
            onChangeText={(text) => updateCurrentDayData({ notes: text })}
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
            onPress={() => updateCurrentDayData({ completed: !currentDayData.completed })}
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

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteDayData}
          >
            <Text style={styles.deleteButtonText}>Delete All Data for This Day</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
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

        {/* Legend Button */}
        <TouchableOpacity
          style={styles.legendButton}
          onPress={() => setShowLegend(true)}
        >
          <Text style={styles.legendButtonText}>🏷️ Tags</Text>
        </TouchableOpacity>

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

        {/* Day Editor */}
        {renderDayEditor()}
      </ScrollView>

      {renderLegend()}
      {renderAddTagModal()}

      {/* Add New Workout Template Modal */}
      <Modal
        visible={showWorkoutModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tagModalContent}>
            <Text style={styles.modalTitle}>Add New Workout Template</Text>
            
            <Text style={styles.inputLabel}>Workout Name</Text>
            <TextInput
              style={styles.textInput}
              value={newWorkoutTemplate}
              onChangeText={setNewWorkoutTemplate}
              placeholder="e.g., Overhead Press, Romanian Deadlifts"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowWorkoutModal(false);
                  setNewWorkoutTemplate('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addWorkoutTemplate}
              >
                <Text style={styles.saveButtonText}>Add Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Custom Workout Modal */}
      <Modal
        visible={showCustomWorkoutModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tagModalContent}>
            <Text style={styles.modalTitle}>Add Custom Workout</Text>
            
            <Text style={styles.inputLabel}>Workout Name</Text>
            <TextInput
              style={styles.textInput}
              value={customWorkoutInput}
              onChangeText={setCustomWorkoutInput}
              placeholder="e.g., Morning Run, Home Yoga Session"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCustomWorkoutModal(false);
                  setCustomWorkoutInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (customWorkoutInput.trim()) {
                    const updatedCustom = [...(currentDayData.customWorkouts || []), customWorkoutInput.trim()];
                    updateCurrentDayData({ customWorkouts: updatedCustom });
                    setCustomWorkoutInput('');
                    setShowCustomWorkoutModal(false);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Add</Text>
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
    backgroundColor: '#4242bbff',
  },
  mainScroll: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  legendButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  legendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  dayNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dayEditorTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },

  todayText: {
    color: '#4ecdc4',
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
    backgroundColor: '#4c4c8fff',
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
  tagSelector: {
    marginBottom: 5,
  },
  tagScrollView: {
    marginBottom: 10,
  },
  tagOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  tagText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagText: {
    color: 'white',
    fontWeight: '600',
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
  workoutSelector: {
  marginBottom: 15,
  },
  subLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 8,
    marginTop: 10,
  },
  workoutScrollView: {
    marginBottom: 15,
  },
  workoutOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedWorkout: {
    backgroundColor: 'rgba(76, 205, 196, 0.3)',
    borderColor: '#4ecdc4',
  },
  workoutText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedWorkoutText: {
    color: '#4ecdc4',
    fontWeight: '600',
  },
  customWorkoutContainer: {
    marginBottom: -10,
  },
  customWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 5,
  },
  customWorkoutText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
  },
  removeWorkoutButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeWorkoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCustomWorkoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCustomWorkoutText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSummary: {
    backgroundColor: 'rgba(76, 205, 196, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  selectedSummaryTitle: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  selectedSummaryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginLeft: 5,
  },
  workoutSelector: {
  marginBottom: 10,
  },
  workoutScrollView: {
    marginBottom: 10,
  },
  workoutOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedWorkout: {
    backgroundColor: 'rgba(76, 205, 196, 0.3)',
    borderColor: '#4ecdc4',
  },
  workoutText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedWorkoutText: {
    color: '#4ecdc4',
    fontWeight: '600',
  },
  addWorkoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  addWorkoutText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedWorkoutsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
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
    borderWidth: 2,
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 20,
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
  legendModal: {
    backgroundColor: '#4c4c8fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  legendTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  legendScroll: {
    maxHeight: 300,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  legendText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  deleteTagButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTagText: {
    color: '#dc3545',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addTagButton: {
    backgroundColor: 'rgba(76, 205, 196, 0.2)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  addTagButtonText: {
    color: '#4ecdc4',
    fontSize: 16,
    fontWeight: '600',
  },
  tagModalContent: {
    backgroundColor: '#4c4c8fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white',
    borderWidth: 3,
  },
});

export default CalendarScreen;