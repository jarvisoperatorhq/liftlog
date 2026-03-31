import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Library, RootStackParamList } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [metricUnits, setMetricUnits] = useState(false);

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      if (stored) {
        setLibraries(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load libraries:', e);
    }
  };

  const publicCount = libraries.filter(l => l.isPublic).length;
  const totalExercises = libraries.reduce((acc, lib) => acc + lib.items.length, 0);

  const menuItems = [
    { icon: 'chatbubble-outline' as const, label: 'AI Trainer', badge: 'NEW', onPress: () => {} },
    { icon: 'stats-chart-outline' as const, label: 'Workout Stats', onPress: () => {} },
    { icon: 'trophy-outline' as const, label: 'Achievements', onPress: () => {} },
    { icon: 'bookmark-outline' as const, label: 'Saved Exercises', onPress: () => {} },
  ];

  const settingsItems = [
    { icon: 'notifications-outline' as const, label: 'Notifications', toggle: notifications, setToggle: setNotifications },
    { icon: 'moon-outline' as const, label: 'Dark Mode', toggle: darkMode, setToggle: setDarkMode },
    { icon: 'barbell-outline' as const, label: 'Metric Units (kg)', toggle: metricUnits, setToggle: setMetricUnits },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#7C5CFF" />
        </View>
        <Text style={styles.username}>You</Text>
        <Text style={styles.handle}>@user</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{libraries.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{publicCount}</Text>
            <Text style={styles.statLabel}>Public</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
      </View>

      {/* AI Trainer Card */}
      <TouchableOpacity style={styles.aiCard}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>
        <View style={styles.aiInfo}>
          <Text style={styles.aiTitle}>AI Trainer</Text>
          <Text style={styles.aiSubtitle}>Get personalized workout advice</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>NEW</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </TouchableOpacity>

      {/* Menu Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.label} 
              style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color="#888" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menu}>
          {settingsItems.map((item, index) => (
            <View 
              key={item.label} 
              style={[styles.menuItem, index === settingsItems.length - 1 && styles.menuItemLast]}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color="#888" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Switch
                value={item.toggle}
                onValueChange={item.setToggle}
                trackColor={{ false: '#333', true: '#7C5CFF' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="star-outline" size={22} color="#888" />
              <Text style={styles.menuItemText}>Rate LiftLog</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="share-outline" size={22} color="#888" />
              <Text style={styles.menuItemText}>Share with Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.version}>LiftLog v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C5CFF',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  handle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#222',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C5CFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfo: {
    flex: 1,
    marginLeft: 16,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: '#2AD08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menu: {
    backgroundColor: '#181A1D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: '#2AD08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  version: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 32,
  },
});
