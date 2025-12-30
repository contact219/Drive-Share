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

## New Features (P2P Rental Platform)

### Enhanced Search & Filters
- **FilterScreen:** Advanced filtering by fuel type, transmission, price range, minimum seats, search radius, and vehicle features
- **Geographic Search:** Haversine formula for radius-based vehicle filtering (default 50km)
- **API Endpoint:** `/api/vehicles` with query params for all filter options

### Vehicle Location Map
- **VehicleMapScreen:** Interactive map using react-native-maps
- **Location Permissions:** Uses expo-location for user location access
- **Vehicle Markers:** Price markers on map with vehicle selection cards
- **Platform Support:** Maps work on iOS/Android via Expo Go, web shows fallback message

### Real-Time Availability System
- **Availability Checking:** `/api/vehicles/:id/availability/check` endpoint
- **Conflict Prevention:** Checks existing trips and blocked slots for double-booking prevention
- **Database Table:** `availability_slots` for owner-defined blocked times

### Trip Cost Estimator
- **Quote API:** `/api/trips/quote` returns detailed cost breakdown
- **Pricing Logic:** Hourly rate for <24hrs, daily rate (20x hourly) for longer trips
- **Breakdown:** Base cost, optional insurance ($15/day), 10% service fee
- **BookingScreen Integration:** Real-time quote display with insurance toggle

### Push Notifications
- **useNotifications Hook:** Uses expo-notifications for token registration
- **Platform Support:** iOS/Android via Expo Go (web shows unsupported message)
- **API Endpoints:** `/api/notifications/register` and `/api/notifications/deactivate`
- **Database Table:** `push_tokens` stores user device tokens

### Vehicle Reviews & Ratings
- **useReviews Hook:** For creating and fetching vehicle reviews
- **API Endpoints:** `/api/vehicles/:id/reviews`, `/api/reviews`, `/api/users/:id/reviews`
- **Auto-Updates:** Creating a review auto-updates vehicle rating and review count
- **Database Table:** `reviews` with user, vehicle, trip references

### Vehicle Owner Mode (Turo-style P2P)
- **OwnerDashboardScreen:** Host dashboard for vehicle owners
- **Become a Host:** Onboarding flow with benefits overview
- **Owner Profile:** `/api/owner/profile` endpoints for profile management
- **Vehicle Listings:** `/api/owner/vehicles` for listing management
- **Verification Status:** Pending, verified, or unverified status badges
- **Earnings Tracking:** Total earnings and response rate display
- **Database Tables:** `owner_profiles` and `owner_vehicles`

## Running the App
- Start workflow: `npm run server:dev && npm run expo:dev`
- The Expo app runs on port 8081
- The Express backend runs on port 5000

## Data Persistence
- **Database:** PostgreSQL with Drizzle ORM
- **Schema:** `shared/schema.ts` - vehicles, users, trips, favorites tables
- **API:** REST endpoints in `server/routes.ts`
- Local storage for auth state and favorites: `client/lib/storage.ts`
- The mobile app now fetches vehicle data from `/api/vehicles`

## Admin Dashboard
- **URL:** `/admin` (port 5000)
- **Credentials:** admin@rush.com / admin123
- **Features:** Vehicle CRUD, user management (add/edit/delete users, toggle admin, reset passwords), trip overview, stats dashboard

## User Management
- Admin can create new users and administrators via the admin dashboard
- Admin can change any user's password (for forgot password cases)
- Admin can toggle user admin status
- Admin can delete users (with confirmation)
- Logged-in users can change their own password in the mobile app (requires current password)

## Security Notes
- Passwords are hashed with bcrypt
- Password change requires current password verification
- Users who forget their password should contact an administrator for reset
- For production: Add authentication middleware to admin endpoints

## Recent Changes
- Initial MVP build with complete navigation structure
- All screens implemented with full functionality
- Custom theme with Rush branding
- App icon generated and configured
- Full user management in admin dashboard
- Secure password change flow in mobile app
- Added P2P rental platform features (Phase 2 & 3):
  - Enhanced search filters with advanced filter UI
  - Vehicle location map with react-native-maps
  - Real-time availability checking system
  - Trip cost estimator with dynamic pricing
  - Push notification infrastructure
  - Vehicle reviews & ratings system
  - Vehicle owner mode (Turo-style P2P hosting)
