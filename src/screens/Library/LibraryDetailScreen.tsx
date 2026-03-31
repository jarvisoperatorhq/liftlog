import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Library, LibraryItem, Exercise, RootStackParamList } from '../../types';
import { exercises } from '../../data/exercises';

type LibraryDetailRouteProp = RouteProp<RootStackParamList, 'LibraryDetail'>;
type LibraryDetailNavigationProp = StackNavigationProp<RootStackParamList>;

export default function LibraryDetailScreen() {
  const route = useRoute<LibraryDetailRouteProp>();
  const navigation = useNavigation<LibraryDetailNavigationProp>();
  const insets = useSafeAreaInsets();
  const { libraryId } = route.params;
  
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      if (stored) {
        const libraries: Library[] = JSON.parse(stored);
        const found = libraries.find(l => l.id === libraryId);
        if (found) {
          setLibrary(found);
        }
      }
    } catch (e) {
      console.error('Failed to load library:', e);
    } finally {
      setLoading(false);
    }
  };

  const getExercise = (exerciseId: string): Exercise | undefined => {
    return exercises.find(e => e.id === exerciseId);
  };

  const removeExercise = (exerciseId: string) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from the workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!library) return;

            const updatedItems = library.items.filter(i => i.exerciseId !== exerciseId);
            const updatedLibrary = { ...library, items: updatedItems, updatedAt: Date.now() };

            try {
              const stored = await AsyncStorage.getItem('@liftlog_libraries');
              if (stored) {
                const libraries: Library[] = JSON.parse(stored);
                const updated = libraries.map(l => l.id === libraryId ? updatedLibrary : l);
                await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(updated));
                setLibrary(updatedLibrary);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to remove exercise');
            }
          },
        },
      ]
    );
  };

  const deleteLibrary = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem('@liftlog_libraries');
              if (stored) {
                const libraries: Library[] = JSON.parse(stored);
                const filtered = libraries.filter(l => l.id !== libraryId);
                await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(filtered));
                navigation.goBack();
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = ({ item, index }: { item: LibraryItem; index: number }) => {
    const exercise = getExercise(item.exerciseId);
    if (!exercise) return null;

    return (
      <Pressable
        style={({ pressed }) => [styles.exerciseItem, pressed && styles.exerciseItemPressed]}
        onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })}
      >
        <View style={styles.exerciseNumber}>
          <Text style={styles.exerciseNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseMuscle}>{exercise.muscleGroups.join(', ')}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
          </View>
          {item.customNotes && (
            <Text style={styles.exerciseNotes}>{item.customNotes}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeExercise(item.exerciseId)}
        >
          <Ionicons name="close-circle" size={24} color="#666" />
        </TouchableOpacity>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="barbell-outline" size={48} color="#444" />
      <Text style={styles.emptyTitle}>No exercises yet</Text>
      <Text style={styles.emptyText}>
        Add exercises to this workout from the Search tab
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Main', { screen: 'Search' } as never)}
      >
        <Text style={styles.emptyButtonText}>Browse Exercises</Text>
      </TouchableOpacity>
    </View>
  );

  if (!library) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.libraryName}>{library.name}</Text>
          {library.description && (
            <Text style={styles.libraryDescription}>{library.description}</Text>
          )}
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="barbell-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{library.items.length} exercises</Text>
            </View>
            {library.isPublic && (
              <View style={styles.metaItem}>
                <Ionicons name="globe-outline" size={14} color="#888" />
                <Text style={styles.metaText}>Public</Text>
              </View>
            )}
          </View>
          {library.tags.length > 0 && (
            <View style={styles.tags}>
              {library.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={deleteLibrary} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={library.items}
        keyExtractor={(item) => item.exerciseId}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerContent: {
    flex: 1,
  },
  libraryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  libraryDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    lineHeight: 20,
  },
  headerMeta: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
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
  deleteButton: {
    padding: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  exerciseItemPressed: {
    backgroundColor: '#1e2024',
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  exerciseMuscle: {
    fontSize: 12,
    color: '#888',
  },
  bullet: {
    fontSize: 12,
    color: '#666',
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#666',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#7C5CFF',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
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
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 40,
  },
});
