export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  imageUrl?: string;
}

export interface LibraryItem {
  exerciseId: string;
  customNotes?: string;
  defaultSets?: number;
  defaultReps?: number;
  addedAt: number;
}

export interface Library {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  items: LibraryItem[];
  isPublic: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  likes: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  followers: number;
  following: number;
  libraryCount: number;
}

export type RootStackParamList = {
  Main: undefined;
  ExerciseDetail: { exerciseId: string };
  LibraryDetail: { libraryId: string };
  CreateLibrary: undefined;
  AddToLibrary: { exerciseId: string };
  CreateExercise: undefined;
  EditExercise: { exerciseId: string };
};

export type BottomTabParamList = {
  Workouts: undefined;
  Discover: undefined;
  Search: undefined;
  Profile: undefined;
};
