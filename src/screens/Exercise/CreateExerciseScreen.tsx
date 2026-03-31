import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, Exercise } from '../../types';
import { muscleGroups, equipmentTypes } from '../../data/exercises';

type CreateExerciseNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CreateExerciseScreen() {
  const navigation = useNavigation<CreateExerciseNavigationProp>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, text: string) => {
    const updated = [...instructions];
    updated[index] = text;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const addTip = () => {
    setTips([...tips, '']);
  };

  const updateTip = (index: number, text: string) => {
    const updated = [...tips];
    updated[index] = text;
    setTips(updated);
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please give your exercise a name');
      return;
    }

    if (selectedMuscles.length === 0) {
      Alert.alert('Error', 'Please select at least one muscle group');
      return;
    }

    if (!selectedEquipment) {
      Alert.alert('Error', 'Please select an equipment type');
      return;
    }

    const validInstructions = instructions.filter(i => i.trim());
    if (validInstructions.length === 0) {
      Alert.alert('Error', 'Please add at least one instruction');
      return;
    }

    try {
      const newExercise: Exercise = {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        muscleGroups: selectedMuscles,
        equipment: selectedEquipment,
        difficulty,
        instructions: validInstructions,
        tips: tips.filter(t => t.trim()) || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      const stored = await AsyncStorage.getItem('@liftlog_custom_exercises');
      const customExercises: Exercise[] = stored ? JSON.parse(stored) : [];
      customExercises.unshift(newExercise);
      await AsyncStorage.setItem('@liftlog_custom_exercises', JSON.stringify(customExercises));

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create exercise');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Exercise</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Exercise Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exercise Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Custom Squat Variation"
              placeholderTextColor="#666"
              maxLength={50}
              autoFocus
            />
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image/GIF URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/exercise.gif"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={styles.helpText}>Add a link to an image or GIF showing the exercise</Text>
          </View>

          {/* Muscle Groups */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Muscle Groups *</Text>
            <View style={styles.chipContainer}>
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
          </View>

          {/* Equipment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Equipment *</Text>
            <View style={styles.chipContainer}>
              {equipmentTypes.map(equipment => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.chip,
                    selectedEquipment === equipment && styles.chipActive,
                  ]}
                  onPress={() => setSelectedEquipment(equipment)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedEquipment === equipment && styles.chipTextActive,
                  ]}>
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Difficulty *</Text>
            <View style={styles.difficultyContainer}>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyChip,
                    difficulty === level && styles.difficultyChipActive,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[
                    styles.difficultyText,
                    difficulty === level && styles.difficultyTextActive,
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Instructions *</Text>
              <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="#7C5CFF" />
              </TouchableOpacity>
            </View>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.instructionInput]}
                  value={instruction}
                  onChangeText={(text) => updateInstruction(index, text)}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor="#666"
                  multiline
                />
                {instructions.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeInstruction(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Pro Tips (optional)</Text>
              <TouchableOpacity onPress={addTip} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="#7C5CFF" />
              </TouchableOpacity>
            </View>
            {tips.length === 0 && (
              <Text style={styles.helpText}>Add tips to help others perform this exercise correctly</Text>
            )}
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={20} color="#FFB347" style={styles.tipIcon} />
                <TextInput
                  style={[styles.input, styles.tipInput]}
                  value={tip}
                  onChangeText={(text) => updateTip(index, text)}
                  placeholder="Helpful tip..."
                  placeholderTextColor="#666"
                  multiline
                />
                <TouchableOpacity
                  onPress={() => removeTip(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Exercise</Text>
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
  header: {
    padding: 20,
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
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#181A1D',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#7C5CFF',
    borderColor: '#7C5CFF',
  },
  chipText: {
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#181A1D',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  difficultyChipActive: {
    backgroundColor: '#7C5CFF',
    borderColor: '#7C5CFF',
  },
  difficultyText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 14,
  },
  tipInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#0F1113',
  },
  createButton: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
