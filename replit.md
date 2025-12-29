# Rush - Vehicle Rental Mobile App

## Overview
Rush is a vehicle rental mobile application similar to Zipcar or Turo. It allows users to browse available vehicles, make bookings, manage trips, and save favorite vehicles.

## Project Architecture

### Frontend (Expo/React Native)
- **Location:** `client/`
- **Framework:** Expo with React Native
- **Navigation:** React Navigation v7 with bottom tabs and native stack
- **State Management:** React hooks with AsyncStorage for persistence
- **Styling:** React Native StyleSheet with custom theme system

### Backend (Express.js)
- **Location:** `server/`
- **Framework:** Express.js with TypeScript
- **Purpose:** Serves landing page and API endpoints (currently minimal)

### Key Directories
```
client/
├── components/     # Reusable UI components
├── constants/      # Theme and design tokens
├── hooks/          # Custom React hooks (useAuth, useFavorites, useTrips)
├── lib/            # Storage utilities and mock data
├── navigation/     # Navigation structure
├── screens/        # App screens
└── types/          # TypeScript type definitions

server/
├── templates/      # Landing page HTML
├── index.ts        # Express server setup
└── routes.ts       # API routes
```

## Design System
- **Primary Color:** #FF6B35 (vibrant orange)
- **Secondary Color:** #004E89 (deep blue)
- **Accent Color:** #F7B801 (amber)
- See `design_guidelines.md` for full design specifications

## Navigation Structure
1. **Browse Tab** - Vehicle listings with search and filters
2. **Trips Tab** - Upcoming and past bookings
3. **Favorites Tab** - Saved vehicles
4. **Profile Tab** - User account and settings

## Features (MVP)
- Vehicle browsing with search functionality
- Category and filter options
- Vehicle detail view with booking flow
- Date/time picker for reservations
- Trip management (upcoming/past)
- Favorites system
- User authentication (mock)
- Profile and settings

## Running the App
- Start workflow: `npm run server:dev && npm run expo:dev`
- The Expo app runs on port 8081
- The Express backend runs on port 5000

## Data Persistence
- Uses AsyncStorage for local data persistence
- Mock data in `client/lib/mockData.ts`
- Storage utilities in `client/lib/storage.ts`

## Recent Changes
- Initial MVP build with complete navigation structure
- All screens implemented with full functionality
- Custom theme with Rush branding
- App icon generated and configured
