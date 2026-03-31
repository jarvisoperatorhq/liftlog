import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Exercise, Library, RootStackParamList } from '../../types';
import { exercises as builtInExercises } from '../../data/exercises';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;
type ExerciseDetailNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const navigation = useNavigation<ExerciseDetailNavigationProp>();
  const insets = useSafeAreaInsets();
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadExercise = useCallback(async () => {
    setImageError(false); // Reset image error state
    // First check built-in exercises
    const found = builtInExercises.find(e => e.id === exerciseId);
    if (found) {
      setExercise(found);
      navigation.setOptions({ title: found.name });
      return;
    }

    // Then check custom exercises
    try {
      const stored = await AsyncStorage.getItem('@liftlog_custom_exercises');
      if (stored) {
        const customExercises: Exercise[] = JSON.parse(stored);
        const customFound = customExercises.find(e => e.id === exerciseId);
        if (customFound) {
          setExercise(customFound);
          navigation.setOptions({ title: customFound.name });
        }
      }
    } catch (e) {
      console.error('Failed to load custom exercise:', e);
    }
  }, [exerciseId, navigation]);

  useEffect(() => {
    loadExercise();
    loadLibraries();
  }, [loadExercise]);

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

  const addToLibrary = async (libraryId: string) => {
    try {
      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      if (stored) {
        const allLibraries: Library[] = JSON.parse(stored);
        const updated = allLibraries.map(lib => {
          if (lib.id === libraryId) {
            const exists = lib.items.some(i => i.exerciseId === exerciseId);
            if (exists) {
              Alert.alert('Already added', 'This exercise is already in this workout');
              return lib;
            }
            return {
              ...lib,
              items: [
                ...lib.items,
                { exerciseId, addedAt: Date.now() },
              ],
              updatedAt: Date.now(),
            };
          }
          return lib;
        });
        await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(updated));
        setLibraries(updated);
        setShowAddModal(false);
        Alert.alert('Success', 'Exercise added to workout');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          {exercise.imageUrl && !imageError ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.exerciseImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.headerIcon}>
              <Ionicons name="barbell" size={40} color="#7C5CFF" />
            </View>
          )}
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.muscleChips}>
            {exercise.muscleGroups.map((muscle, i) => (
              <View key={i} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{muscle}</Text>
              </View>
            ))}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={16} color="#888" />
              <Text style={styles.metaText}>{exercise.equipment}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="speedometer-outline" size={16} color="#888" />
              <Text style={[
                styles.metaText,
                exercise.difficulty === 'beginner' && styles.difficultyBeginner,
                exercise.difficulty === 'intermediate' && styles.difficultyIntermediate,
                exercise.difficulty === 'advanced' && styles.difficultyAdvanced,
              ]}>
                {exercise.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.map((step, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro Tips</Text>
            {exercise.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={16} color="#FFB347" style={styles.tipIcon} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Workout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add to Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Library Selection Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Workout</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            
            {libraries.length === 0 ? (
              <View style={styles.emptyLibraries}>
                <Text style={styles.emptyLibrariesText}>
                  You don't have any workouts yet
                </Text>
                <TouchableOpacity
                  style={styles.createLibraryButton}
                  onPress={() => {
                    setShowAddModal(false);
                    navigation.navigate('CreateLibrary');
                  }}
                >
                  <Text style={styles.createLibraryButtonText}>Create Workout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView>
                {libraries.map(lib => (
                  <TouchableOpacity
                    key={lib.id}
                    style={styles.libraryOption}
                    onPress={() => addToLibrary(lib.id)}
                  >
                    <View style={styles.libraryOptionInfo}>
                      <Text style={styles.libraryOptionName}>{lib.name}</Text>
                      <Text style={styles.libraryOptionCount}>
                        {lib.items.length} exercises
                      </Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#7C5CFF" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
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
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  scrollContent: {
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 40,
  },
  headerCard: {
    backgroundColor: '#181A1D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  muscleChip: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleChipText: {
    fontSize: 13,
    color: '#888',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  difficultyBeginner: {
    color: '#2AD08A',
  },
  difficultyIntermediate: {
    color: '#FFB347',
  },
  difficultyAdvanced: {
    color: '#FF6B6B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#181A1D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0F1113',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C5CFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#181A1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  libraryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  libraryOptionInfo: {
    flex: 1,
  },
  libraryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  libraryOptionCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyLibraries: {
    padding: 40,
    alignItems: 'center',
  },
  emptyLibrariesText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  createLibraryButton: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createLibraryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
