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

// Combined Workout Screen with toggle functionality
function WorkoutScreen({ navigation }) {  // Accept the real navigation prop from tab navigator
  const [activeScreen, setActiveScreen] = React.useState('Manual');

  const enhancedNavigation = {
    navigate: (screenName) => {
      if (screenName === 'Timer') {
        // Use the real tab navigation to switch to Timer tab
        navigation.navigate('Timer');
      } else {
        // Handle internal screen switching within Workout tab
        setActiveScreen(screenName);
      }
    },
    jumpTo: (screenName) => {
      if (screenName === 'Timer') {
        // Use jumpTo for tab navigation
        navigation.jumpTo('Timer');
      } else {
        setActiveScreen(screenName);
      }
    }
  };

  if (activeScreen === 'Templates') {
    return <TemplatesScreen navigation={enhancedNavigation} />;
  }
  
  return <ManualWorkoutScreen navigation={enhancedNavigation} />;
}

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
              tabBarActiveTintColor: '#5541edff',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#d5c4f5ff',
                borderTopWidth: 1,
                borderTopColor: '#d5c4f5ff',
                height: 70,
                paddingBottom: 20,
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
              name="Workout"
              component={WorkoutScreen}
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