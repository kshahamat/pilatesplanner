import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { WorkoutProvider } from './context/WorkoutContext';

import TemplatesScreen from './screens/TemplatesScreen';
import ManualWorkoutScreen from './screens/ManualWorkoutScreen';
import TimerScreen from './screens/TimerScreen';
import CalendarScreen from './screens/CalendarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  React.useEffect(() => {
    activateKeepAwakeAsync();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#FF6B35',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#f8f8f8',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: 'bold',
              },
            }}
          >
            <Tab.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="calendar-month" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Manual"
              component={ManualWorkoutScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="fitness-center" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Timer"
              component={TimerScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="timer" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Templates"
              component={TemplatesScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="list" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </WorkoutProvider>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
});