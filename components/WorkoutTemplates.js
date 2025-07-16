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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEMPLATES_KEY = 'workout_templates';

export default function WorkoutTemplates({ 
  onSelectTemplate, 
  HeaderComponent, 
  contentContainerStyle 
}) {
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');

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
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load workout templates');
    }
  };

  // Save templates to AsyncStorage
  const saveTemplates = async (updatedTemplates) => {
    try {
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
      Alert.alert('Error', 'Failed to save workout templates');
    }
  };

  // Add new template
  const addTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      Alert.alert('Error', 'Please enter both template name and content');
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      content: templateContent.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    await saveTemplates(updatedTemplates);
    
    setTemplateName('');
    setTemplateContent('');
    setIsModalVisible(false);
    Alert.alert('Success', 'Template saved successfully!');
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

  // Select template
  const selectTemplate = (template) => {
    onSelectTemplate(template.content);
    Alert.alert('Template Loaded', `"${template.name}" has been loaded into the workout timer`);
  };

  // Render template item
  const renderTemplateItem = ({ item }) => (
    <View style={styles.templateItem}>
      <TouchableOpacity
        style={styles.templateContent}
        onPress={() => selectTemplate(item)}
      >
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templatePreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.templateDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTemplate(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  // Custom header that combines the screen title with the component header
  const renderHeader = () => (
    <View>
      {HeaderComponent && <HeaderComponent />}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Templates</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      <FlatList
        data={templates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.emptyText}>
              No templates saved yet. Create your first template!
            </Text>
          </View>
        }
      />

      {/* Add Template Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Template</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Template Name"
            value={templateName}
            onChangeText={setTemplateName}
          />

          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Workout Content (e.g., 30s pushups, 15s rest, 45s squats, 15s rest)"
            value={templateContent}
            onChangeText={setTemplateContent}
            multiline
            numberOfLines={6}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={addTemplate}
          >
            <Text style={styles.saveButtonText}>Save Template</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  templateItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  templateContent: {
    flex: 1,
    padding: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  templatePreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  templateDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});