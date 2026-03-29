# LiftLog

**Spotify for workouts** — A mobile-first exercise library and workout playlist manager.

## Core Concept

- **Exercise Library**: Browse 20+ exercises with detailed instructions, muscle groups, equipment filters
- **Personal Libraries**: Create workout "playlists" (like Spotify) — organize exercises into custom routines
- **Social Discovery**: Find and copy libraries from the community
- **AI Trainer** (coming soon): Chat with an AI for workout advice

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Storage**: AsyncStorage (local persistence)
- **Styling**: Native StyleSheet with custom dark theme

## Screens

| Screen | Description |
|--------|-------------|
| **My Library** | Your workout libraries — gradient cards, create new, view/edit |
| **Discover** | Browse public libraries from community, filter by category |
| **Search** | Exercise database with filters (muscle, equipment, difficulty) |
| **Profile** | Stats, settings, AI Trainer access |

## Getting Started

```bash
cd liftlog
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

## Data Model

### Exercise
- `id`, `name`, `muscleGroups[]`, `equipment`, `difficulty`
- `instructions[]`, `tips[]`, `imageUrl`

### Library (Playlist)
- `id`, `name`, `description`, `ownerId`, `ownerName`
- `items[]` (exercise references with notes)
- `isPublic`, `tags[]`, `likes`, `createdAt`

## Future Features

- [ ] AI Trainer chat interface
- [ ] Workout tracking/log
- [ ] Progress analytics
- [ ] Exercise videos/GIFs
- [ ] Social features (follow, comments)
- [ ] Cloud sync (Convex/Firebase)
