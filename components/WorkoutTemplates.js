import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEMPLATES_KEY = 'workout_templates';
const { width } = Dimensions.get('window');

export default function WorkoutTemplates({ 
  onSelectTemplate, 
  HeaderComponent, 
  contentContainerStyle,
  navigation
}) {
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  // Load templates when component mounts
  useEffect(() => {
    loadTemplates();
  }, []);

  // Load templates from AsyncStorage
  const loadTemplates = async () => {
    try {
      const storedTemplates = await AsyncStorage.getItem(TEMPLATES_KEY);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout templates');
    }
  };

  // Save templates to AsyncStorage
  const saveTemplates = async (updatedTemplates) => {
    try {
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout templates');
    }
  };

  // Add or update template
  const saveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      Alert.alert('Error', 'Please enter both template name and content');
      return;
    }

    let updatedTemplates;
    
    if (editingTemplate) {
      // Update existing template
      updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, name: templateName.trim(), content: templateContent.trim() }
          : t
      );
    } else {
      // Add new template
      const newTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        content: templateContent.trim(),
        createdAt: new Date().toISOString(),
      };
      updatedTemplates = [...templates, newTemplate];
    }

    await saveTemplates(updatedTemplates);
    
    setTemplateName('');
    setTemplateContent('');
    setEditingTemplate(null);
    setIsModalVisible(false);
    Alert.alert('Success', `Template ${editingTemplate ? 'updated' : 'saved'} successfully!`);
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            await saveTemplates(updatedTemplates);
          },
        },
      ]
    );
  };

  // Handle long press to enter delete mode
  const handleLongPress = () => {
    setDeleteMode(true);
  };

  // Exit delete mode
  const exitDeleteMode = () => {
    setDeleteMode(false);
  };

  // Select template - only works when not in delete mode
  const selectTemplate = (template) => {
    if (deleteMode) {
      return; // Don't select template in delete mode
    }
    
    onSelectTemplate(template.content);
    
    try {
      if (navigation) {
        if (navigation.jumpTo) {
          console.log('Using jumpTo...');
          navigation.jumpTo('Timer');
        } else if (navigation.navigate) {
          console.log('Using navigate...');
          navigation.navigate('Timer');
        } else if (navigation.dispatch) {
          console.log('Using dispatch with TabActions...');
          const { TabActions } = require('@react-navigation/native');
          navigation.dispatch(TabActions.jumpTo('Timer'));
        } else {
          throw new Error('No suitable navigation method found');
        }
      } else {
        throw new Error('Navigation object not available');
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert(
        'Navigation Issue', 
        'Template loaded successfully! Please manually switch to the Timer tab.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle edit template - only works when not in delete mode
  const handleEditTemplate = (template) => {
    if (deleteMode) {
      return; // Don't edit in delete mode
    }
    
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setIsModalVisible(true);
  };

  // Handle add new template
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setIsModalVisible(true);
  };

  // Render template item as a note card
  const renderTemplateItem = ({ item, index }) => (
    <View style={[
      styles.noteCard, 
      { width: (width - 60) / numColumns },
      deleteMode && styles.noteCardWiggle
    ]}>
      <TouchableOpacity
        style={styles.noteContent}
        onPress={() => selectTemplate(item)}
        onLongPress={handleLongPress}
        activeOpacity={deleteMode ? 1 : 0.7}
      >
        {/* Title section */}
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        
        {/* Content preview */}
        <Text style={styles.notePreview} numberOfLines={8}>
          {item.content}
        </Text>
        
        {/* Date at bottom */}
        <View style={styles.noteFooter}>
          <Text style={styles.noteDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Edit button - top left corner - always visible */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditTemplate(item)}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </TouchableOpacity>
      
      {/* Delete button - top right corner - only visible in delete mode */}
      {deleteMode && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTemplate(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Custom header
  const renderHeader = () => (
    <View>
      {HeaderComponent && <HeaderComponent />}
      <View style={styles.headerContainer}>
        {deleteMode ? (
          <TouchableOpacity
            style={[styles.addButton, styles.doneButton]}
            onPress={exitDeleteMode}
          >
            <Text style={[styles.addButtonText, styles.doneButtonText]}>Done</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTemplate}
          >
            <Text style={styles.addButtonText}>+ New Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Calculate number of columns based on screen width
  const numColumns = width > 600 ? 3 : 2;

  return (
    <View style={styles.fullContainer}>
      <FlatList
        data={templates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        numColumns={numColumns}
        key={numColumns} // Force re-render when numColumns changes
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No workout notes yet.{'\n'}Tap "New Workout" to create your first one!
            </Text>
          </View>
        }
      />

      {/* Note Editor Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.noteEditorContainer}>
          {/* Header with title input */}
          <View style={styles.noteEditorHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsModalVisible(false);
                setEditingTemplate(null);
                setTemplateName('');
                setTemplateContent('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveTemplate}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Workout Name"
            value={templateName}
            onChangeText={setTemplateName}
            autoFocus={!editingTemplate}
            placeholderTextColor="#999"
          />

          {/* Content Editor */}
          <ScrollView style={styles.contentEditor} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.contentTextInput}
              placeholder="Write your workout here...

For example:
• 30s Push-ups
• 15s Rest
• 45s Squats
• 15s Rest
• 1min Plank
• 30s Rest

Or write it however you like!"
              value={templateContent}
              onChangeText={setTemplateContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  doneButtonText: {
    color: 'white',
  },
  noteCardWiggle: {
    // You can add animation here if desired
    transform: [{ rotate: '0.5deg' }],
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 12,
    minHeight: 200,
    maxHeight: 250,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  row: {
    justifyContent: 'space-between',
  },
  noteContent: {
    flex: 1,
    padding: 12,
  },
  noteHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Courier New',
  },
  notePreview: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    fontFamily: 'Verdana',
    flex: 1,
  },
  noteFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  noteDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  editButton: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
  },
  noteEditorContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  noteEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'courier-new',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contentEditor: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 20,
    textAlignVertical: 'top',
    minHeight: 400,
    lineHeight: 24,
  },
});