import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Library, RootStackParamList } from '../../types';

type AddToLibraryRouteProp = RouteProp<RootStackParamList, 'AddToLibrary'>;
type AddToLibraryNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AddToLibraryScreen() {
  const route = useRoute<AddToLibraryRouteProp>();
  const navigation = useNavigation<AddToLibraryNavigationProp>();
  const { exerciseId } = route.params;
  
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
              items: [...lib.items, { exerciseId, addedAt: Date.now() }],
              updatedAt: Date.now(),
            };
          }
          return lib;
        });
        await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(updated));
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add exercise to workout');
    }
  };

  const renderLibraryItem = ({ item }: { item: Library }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => addToLibrary(item.id)}
    >
      <View style={styles.libraryInfo}>
        <Text style={styles.libraryName}>{item.name}</Text>
        <Text style={styles.libraryCount}>{item.items.length} exercises</Text>
      </View>
      <Ionicons name="add-circle-outline" size={28} color="#7C5CFF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Workout</Text>
        <Text style={styles.headerSubtitle}>Choose which workout to add this exercise to</Text>
      </View>

      {libraries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={64} color="#444" />
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptyText}>Create a workout first to add exercises</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateLibrary')}
          >
            <Text style={styles.createButtonText}>Create Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={libraries}
          keyExtractor={(item) => item.id}
          renderItem={renderLibraryItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  libraryCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
