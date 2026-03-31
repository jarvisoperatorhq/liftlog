import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { RootStackParamList, BottomTabParamList } from '../types';

// Screens
import LibraryScreen from '../screens/Library/LibraryScreen';
import DiscoverScreen from '../screens/Discover/DiscoverScreen';
import SearchScreen from '../screens/Exercise/SearchScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ExerciseDetailScreen from '../screens/Exercise/ExerciseDetailScreen';
import LibraryDetailScreen from '../screens/Library/LibraryDetailScreen';
import CreateLibraryScreen from '../screens/Library/CreateLibraryScreen';
import AddToLibraryScreen from '../screens/Library/AddToLibraryScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Workouts') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C5CFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#0F1113',
          borderTopColor: '#222',
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        headerStyle: {
          backgroundColor: '#0F1113',
          shadowColor: 'transparent',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen
        name="Workouts"
        component={LibraryScreen}
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F1113',
              shadowColor: 'transparent',
            },
            headerTintColor: '#fff',
            headerBackTitle: 'Back',
            cardStyle: { backgroundColor: '#0F1113' },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ExerciseDetail" 
            component={ExerciseDetailScreen}
            options={{ title: 'Exercise' }}
          />
          <Stack.Screen 
            name="LibraryDetail" 
            component={LibraryDetailScreen}
            options={{ title: 'Library' }}
          />
          <Stack.Screen 
            name="CreateLibrary" 
            component={CreateLibraryScreen}
            options={{ title: 'New Library' }}
          />
          <Stack.Screen 
            name="AddToLibrary" 
            component={AddToLibraryScreen}
            options={{ title: 'Add to Library' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
