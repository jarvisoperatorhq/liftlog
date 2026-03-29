import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Library, RootStackParamList } from '../../types';

type CreateLibraryNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CreateLibraryScreen() {
  const navigation = useNavigation<CreateLibraryNavigationProp>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please give your library a name');
      return;
    }

    setLoading(true);
    
    try {
      const newLibrary: Library = {
        id: `lib_${Date.now()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        ownerId: 'current_user',
        ownerName: 'You',
        items: [],
        isPublic,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likes: 0,
      };

      const stored = await AsyncStorage.getItem('@liftlog_libraries');
      const libraries: Library[] = stored ? JSON.parse(stored) : [];
      libraries.unshift(newLibrary);
      await AsyncStorage.setItem('@liftlog_libraries', JSON.stringify(libraries));

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create library');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Library Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Push Day, Leg Destroyer, Quick HIIT"
              placeholderTextColor="#666"
              maxLength={50}
              autoFocus
            />
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this library for?"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="chest, strength, hypertrophy"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Ionicons 
                name={isPublic ? "globe-outline" : "lock-closed-outline"} 
                size={20} 
                color="#888" 
              />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>
                  {isPublic ? 'Public Library' : 'Private Library'}
                </Text>
                <Text style={styles.switchDescription}>
                  {isPublic 
                    ? 'Anyone can find and view this library' 
                    : 'Only you can see this library'}
                </Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#333', true: '#7C5CFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Library'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#181A1D',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181A1D',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    marginLeft: 12,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  switchDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  createButton: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
