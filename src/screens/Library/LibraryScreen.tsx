import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Library, RootStackParamList } from '../../types';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const gradientColors: [string, string][] = [
  ['#7C5CFF', '#9B7CFF'],
  ['#28D3D3', '#5BE8E8'],
  ['#2AD08A', '#5CE8A8'],
  ['#FF6B6B', '#FF8E8E'],
  ['#FFB347', '#FFCC7A'],
  ['#6C5CE7', '#A29BFE'],
];

export default function LibraryScreen() {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

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

  useFocusEffect(
    React.useCallback(() => {
      loadLibraries();
    }, [])
  );

  const getGradientForLibrary = (id: string) => {
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientColors.length;
    return gradientColors[index];
  };

  const renderLibraryCard = ({ item, index }: { item: Library; index: number }) => {
    const colors = getGradientForLibrary(item.id);
    const itemCount = item.items.length;
    
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate('LibraryDetail', { libraryId: item.id })}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.cardFooter}>
              <View style={styles.badge}>
                <Ionicons name="barbell-outline" size={12} color="#fff" />
                <Text style={styles.badgeText}>{itemCount} exercises</Text>
              </View>
              {item.isPublic && (
                <Ionicons name="globe-outline" size={16} color="rgba(255,255,255,0.7)" />
              )}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No libraries yet</Text>
      <Text style={styles.emptyText}>
        Create your first workout library to organize your exercises
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('CreateLibrary')}
      >
        <Text style={styles.emptyButtonText}>Create Library</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSubtitle}>
            {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateLibrary')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={libraries}
        keyExtractor={(item) => item.id}
        renderItem={renderLibraryCard}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? renderEmptyState : null}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 12,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    aspectRatio: 1,
    padding: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
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
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
