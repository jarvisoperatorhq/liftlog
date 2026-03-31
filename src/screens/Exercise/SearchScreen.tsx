import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Exercise, RootStackParamList } from '../../types';
import { exercises, muscleGroups, equipmentTypes } from '../../data/exercises';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscleGroups.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesMuscle = 
        selectedMuscles.length === 0 || 
        exercise.muscleGroups.some(m => selectedMuscles.includes(m));
      
      const matchesEquipment = 
        selectedEquipment.length === 0 || 
        selectedEquipment.includes(exercise.equipment);
      
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [searchQuery, selectedMuscles, selectedEquipment]);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const clearFilters = () => {
    setSelectedMuscles([]);
    setSelectedEquipment([]);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <Pressable
      style={({ pressed }) => [styles.exerciseItem, pressed && styles.exerciseItemPressed]}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
    >
      <View style={styles.exerciseIcon}>
        <Ionicons name="barbell" size={24} color="#7C5CFF" />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={styles.exerciseMeta}>
          <Text style={styles.exerciseMuscle}>{item.muscleGroups.join(', ')}</Text>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.exerciseEquipment}>{item.equipment}</Text>
        </View>
        <View style={styles.difficultyBadge}>
          <Text style={[
            styles.difficultyText,
            item.difficulty === 'beginner' && styles.difficultyBeginner,
            item.difficulty === 'intermediate' && styles.difficultyIntermediate,
            item.difficulty === 'advanced' && styles.difficultyAdvanced,
          ]}>
            {item.difficulty}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </Pressable>
  );

  const activeFiltersCount = selectedMuscles.length + selectedEquipment.length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={activeFiltersCount > 0 ? '#7C5CFF' : '#888'} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Muscle Groups</Text>
              {selectedMuscles.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedMuscles([])}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {muscleGroups.map(muscle => (
                  <TouchableOpacity
                    key={muscle}
                    style={[
                      styles.chip,
                      selectedMuscles.includes(muscle) && styles.chipActive,
                    ]}
                    onPress={() => toggleMuscle(muscle)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedMuscles.includes(muscle) && styles.chipTextActive,
                    ]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Equipment</Text>
              {selectedEquipment.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedEquipment([])}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {equipmentTypes.map(equipment => (
                  <TouchableOpacity
                    key={equipment}
                    style={[
                      styles.chip,
                      selectedEquipment.includes(equipment) && styles.chipActive,
                    ]}
                    onPress={() => toggleEquipment(equipment)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedEquipment.includes(equipment) && styles.chipTextActive,
                    ]}>
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
              <Text style={styles.clearAllText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
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
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A1D',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#181A1D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    position: 'relative',
  },
  filterButtonActive: {
    borderColor: '#7C5CFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#7C5CFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  filtersPanel: {
    backgroundColor: '#181A1D',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  clearText: {
    fontSize: 12,
    color: '#7C5CFF',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: {
    backgroundColor: '#7C5CFF',
    borderColor: '#7C5CFF',
  },
  chipText: {
    fontSize: 13,
    color: '#888',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  clearAllButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  resultsText: {
    fontSize: 14,
    color: '#888',
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
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 13,
    color: '#888',
  },
  bullet: {
    fontSize: 13,
    color: '#666',
  },
  exerciseEquipment: {
    fontSize: 13,
    color: '#666',
  },
  difficultyBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 11,
    textTransform: 'capitalize',
    fontWeight: '500',
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
