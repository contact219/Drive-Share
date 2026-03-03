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
- **AddVehicleScreen:** Full vehicle listing form with brand, model, year, type, fuel, transmission, features, pricing, and location
- **Verification Status:** Pending, verified, or unverified status badges
- **Earnings Tracking:** Total earnings and response rate display
- **Database Tables:** `owner_profiles` and `owner_vehicles`

### Social Sign-In (Apple & Google)
- **Apple Sign-In:** Uses `expo-apple-authentication` — available on iOS devices only
- **Google Sign-In:** Uses `expo-auth-session` with Google OAuth — requires `EXPO_PUBLIC_GOOGLE_CLIENT_ID` env var
- **Backend Verification:** Server-side token verification via `/api/auth/social` endpoint
  - Google: Validates access token against Google userinfo API
  - Apple: Decodes and validates Apple identity token JWT
- **Security:** Tokens are verified server-side; email is extracted from provider, not trusted from client
- **Account Creation:** Social auth users get auto-created accounts with random secure passwords
- **Platform Behavior:** Apple button only shows on iOS; Google shows inline setup message if client ID not configured

### Email Notifications (SendGrid Integration)
- **Service:** `server/email.ts` with SendGrid SDK integration
- **Templates:** Professional HTML email templates for all notifications
- **Notifications Sent:**
  - Booking confirmation to renters
  - New booking notification to vehicle owners
  - Vehicle verification approved/rejected to owners
  - Trip completed with review prompt to renters
- **Non-blocking:** All email operations run asynchronously to avoid affecting main flows

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

## Admin Dashboard (v3.1)
- **URL:** `/admin` (port 5000)
- **Credentials:** admin@rush.com / admin123
- **Features:**
  - Analytics dashboard with revenue trends chart, trip status distribution, and top vehicles
  - **Booking Calendar** with monthly view, color-coded bookings by status, vehicle filtering, and day-detail view
  - Vehicle verification queue with approve/reject workflow and reviewer notes
  - Insurance policy management for owner-provided and platform coverage
  - Payment history with platform fees and owner payouts breakdown
  - Vehicle CRUD, user management, trip overview, stats dashboard

### Booking Calendar
- **Monthly View:** Navigate between months, quick "Today" button
- **Color Coding:** Upcoming (amber), Active (blue), Completed (green), Cancelled (gray)
- **Vehicle Filter:** Filter calendar by specific vehicle
- **Day Details:** Click any day to see all bookings with vehicle image, user info, dates, and cost
- **API Endpoint:** `/api/admin/calendar` returns trips with vehicle and user details

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

## Stripe Payment Integration
- **Setup:** Connected via Replit integration with stripe-replit-sync
- **Payment Flow:** Create payment intent → Collect payment → Confirm and update trip status
- **Customer Management:** Auto-creates Stripe customers for users on first payment
- **Fee Structure:** 10% platform fee, remaining 90% for owner payout
- **Database Tables:** `payments` and `payouts` for tracking all transactions

## New Database Tables (Phase 3)
- `vehicle_verifications` - Tracks verification requests with pending/approved/rejected status
- `insurance_policies` - Owner-provided and platform insurance with verification status
- `payments` - Stripe payment intents with platform fees and owner payouts
- `payouts` - Owner payout tracking and status

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
- Admin Dashboard v3.0 with new sections:
  - Analytics dashboard with Chart.js charts
  - Vehicle verification queue with approve/reject workflow
  - Insurance policy management
  - Payment history with fee breakdown
- SendGrid email notifications integrated:
  - Booking confirmation emails to renters
  - New booking alerts to vehicle owners
  - Verification status updates to owners
  - Trip completion emails with review prompts
- Marketing Landing Page (December 2025):
  - Hero section with app description and download links
  - Features section with 6 key platform features
  - How It Works section for Renters and Hosts
  - Earnings section explaining 90% host payout model
  - Terms of Service page (/terms)
  - Privacy Policy page (/privacy) with GDPR/CCPA compliance
- Persisted Settings (March 2026):
  - SettingsContext with AsyncStorage persistence (`client/contexts/SettingsContext.tsx`)
  - Theme/Appearance: System Default, Light Mode, Dark Mode — persists and applies globally via useColorScheme hook
  - Language: Selection persists across restarts (9 languages available)
  - Notification preferences: 6 toggles (push, booking, reminders, promotions, email, sms) persist
  - Default Location: Saved locations with GPS via expo-location, proper permission handling with Open Settings fallback
  - Settings screen shows current values dynamically from context
