import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Library, RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DiscoverScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Featured libraries for discover page
const featuredLibraries = [
  {
    id: 'featured_push',
    name: 'Push Day Essentials',
    description: 'Chest, shoulders, and triceps — everything you need for a solid push day',
    ownerId: 'coach_mike',
    ownerName: 'Coach Mike',
    items: [
      { exerciseId: 'bench-press-barbell', addedAt: 0 },
      { exerciseId: 'overhead-press', addedAt: 0 },
      { exerciseId: 'dumbbell-flyes', addedAt: 0 },
      { exerciseId: 'lateral-raises', addedAt: 0 },
      { exerciseId: 'tricep-pushdown', addedAt: 0 },
    ],
    isPublic: true,
    tags: ['push', 'strength', 'hypertrophy'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
    likes: 342,
  },
  {
    id: 'featured_pull',
    name: 'Pull Day Power',
    description: 'Back and biceps focused routine for mass and strength',
    ownerId: 'sarah_fitness',
    ownerName: 'Sarah Fitness',
    items: [
      { exerciseId: 'deadlift', addedAt: 0 },
      { exerciseId: 'pull-ups', addedAt: 0 },
      { exerciseId: 'bent-over-row', addedAt: 0 },
      { exerciseId: 'lat-pulldown', addedAt: 0 },
      { exerciseId: 'barbell-curls', addedAt: 0 },
    ],
    isPublic: true,
    tags: ['pull', 'back', 'strength'],
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 10,
    likes: 287,
  },
  {
    id: 'featured_legs',
    name: 'Leg Day Destroyer',
    description: 'Skip leg day? Not with this routine. Quads, hams, and glutes.',
    ownerId: 'iron_tom',
    ownerName: 'Iron Tom',
    items: [
      { exerciseId: 'squat', addedAt: 0 },
      { exerciseId: 'romanian-deadlift', addedAt: 0 },
      { exerciseId: 'leg-press', addedAt: 0 },
      { exerciseId: 'lunges', addedAt: 0 },
    ],
    isPublic: true,
    tags: ['legs', 'squats', 'strength'],
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 15,
    likes: 521,
  },
  {
    id: 'featured_beginner',
    name: 'Beginner Full Body',
    description: 'Perfect for those just starting out. No equipment needed.',
    ownerId: 'fit_with_jen',
    ownerName: 'Fit With Jen',
    items: [
      { exerciseId: 'push-ups', addedAt: 0 },
      { exerciseId: 'bodyweight-squats', addedAt: 0 },
      { exerciseId: 'plank', addedAt: 0 },
    ],
    isPublic: true,
    tags: ['beginner', 'bodyweight', 'full-body'],
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 20,
    likes: 892,
  },
];

const categories = ['All', 'Strength', 'Hypertrophy', 'Beginner', 'Advanced', 'Bodyweight'];

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [myLibraries, setMyLibraries] = useState<Library[]>([]);

  useEffect(() => {
    loadMyLibraries();
  }, []);

  const loadMyLibraries = async () => {
    try {
      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      if (stored) {
        setMyLibraries(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load libraries:', e);
    }
  };

  const allLibraries = [...featuredLibraries, ...myLibraries.filter(l => l.isPublic)];

  const filteredLibraries = selectedCategory === 'All' 
    ? allLibraries 
    : allLibraries.filter(lib => 
        lib.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      );

  const copyLibrary = async (library: Library) => {
    try {
      const newLibrary: Library = {
        ...library,
        id: `lib_${Date.now()}`,
        name: `${library.name} (Copy)`,
        ownerId: 'current_user',
        ownerName: 'You',
        isPublic: false,
        likes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      const libraries: Library[] = stored ? JSON.parse(stored) : [];
      libraries.unshift(newLibrary);
      await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(libraries));

      // Switch to My Library tab
      navigation.navigate('Main');
    } catch (e) {
      console.error('Failed to copy library:', e);
    }
  };

  const renderLibraryCard = ({ item }: { item: Library }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate('LibraryDetail', { libraryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="library" size={24} color="#7C5CFF" />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardAuthor}>by {item.ownerName}</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Ionicons name="barbell-outline" size={14} color="#888" />
          <Text style={styles.statText}>{item.items.length} exercises</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="heart" size={14} color="#FF6B6B" />
          <Text style={styles.statText}>{item.likes}</Text>
        </View>
      </View>

      {item.ownerId !== 'current_user' && (
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => copyLibrary(item)}
        >
          <Ionicons name="copy-outline" size={16} color="#7C5CFF" />
          <Text style={styles.copyButtonText}>Save to My Library</Text>
        </TouchableOpacity>
      )}

      {item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find workout libraries from the community</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredLibraries}
        keyExtractor={(item) => item.id}
        renderItem={renderLibraryCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No libraries found</Text>
            <Text style={styles.emptyText}>Try a different category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#181A1D',
    borderWidth: 1,
    borderColor: '#222',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#7C5CFF',
    borderColor: '#7C5CFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#888',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#181A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardPressed: {
    backgroundColor: '#1e2024',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardAuthor: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#888',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 12,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#7C5CFF',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
