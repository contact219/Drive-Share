# Rush Mobile App - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app involves user accounts, bookings, payments, and backend sync.

**Implementation:**
- Primary: Apple Sign-In (iOS) and Google Sign-In (Android/cross-platform)
- Secondary: Email/password option
- Mock auth flow in prototype using local state
- Include:
  - Welcome screen with SSO buttons and email option
  - Email signup/login screens
  - Privacy policy & terms of service links (placeholder URLs)
  - Account deletion flow: Settings > Account > Delete Account (double confirmation alert)

### Navigation Structure
**Tab Navigation** (4 tabs with floating action button)

**Tab Bar:**
1. **Browse** - Vehicle listings and search
2. **Trips** - Upcoming and past bookings
3. **Favorites** - Saved vehicles
4. **Profile** - Account and settings

**Floating Action Button (FAB):**
- Position: Bottom-right, above tab bar
- Action: Quick search/filter overlay
- Always visible except on booking flow screens

## Screen Specifications

### 1. Browse Screen (Default Tab)
**Purpose:** Discover and search available vehicles

**Layout:**
- Custom transparent header with search bar
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Scrollable vertical list of vehicle cards

**Header:**
- Transparent background
- Search bar (icon left, filter button right)
- Location indicator below search

**Main Content:**
- Vehicle cards in vertical list
- Each card shows: vehicle image, name, type, price/hour, distance, favorite icon
- Pull-to-refresh enabled
- Empty state: "No vehicles nearby" with expand search radius button

**Components:**
- Search bar with location dropdown
- Filter button (right header)
- Vehicle cards (pressable, with heart icon)
- Category chips (SUV, Sedan, Electric, etc.)

---

### 2. Filter Modal
**Purpose:** Refine vehicle search results

**Layout:**
- Native modal (slides up from bottom)
- Fixed header with "Clear All" and "Apply" buttons
- Scrollable form content
- Bottom inset: `insets.bottom + Spacing.xl`

**Form Fields:**
- Vehicle Type (multi-select chips)
- Price Range (slider: $5-$50/hour)
- Distance (slider: 0.5-10 miles)
- Features (checkboxes: Bluetooth, GPS, Baby Seat, etc.)
- Fuel Type (Electric, Gas, Hybrid)

**Buttons:**
- Cancel (header left)
- Apply (header right, primary color)

---

### 3. Vehicle Detail Screen
**Purpose:** View full vehicle information and initiate booking

**Layout:**
- Stack navigation modal
- Scrollable content
- Top inset: `insets.top + Spacing.xl` (no header)
- Bottom inset: `insets.bottom + Spacing.xl`

**Content Structure:**
1. Hero image carousel (swipeable)
2. Vehicle name, type, rating
3. Price per hour (large, prominent)
4. Quick stats (seats, fuel type, transmission)
5. Features list (icon + text grid)
6. Location map (static, tappable to expand)
7. Reviews section (summary + recent 3)
8. Host information (if applicable)

**Floating Elements:**
- Back button (top-left, circular, subtle shadow)
- Favorite button (top-right, circular, subtle shadow)
- Book button (bottom, full-width, primary color, shadow specs from guidelines)

---

### 4. Booking Flow

**4a. Select Dates/Times Screen**
**Purpose:** Choose rental period

**Layout:**
- Standard navigation header ("Book Vehicle")
- Scrollable form
- Top inset: `Spacing.xl`
- Bottom inset: `Spacing.xl`

**Form:**
- Start date/time picker
- End date/time picker
- Duration display (auto-calculated)
- Estimated cost (real-time calculation)
- Availability indicator

**Buttons:**
- Continue (bottom of form, full-width)

**4b. Booking Confirmation Screen**
**Purpose:** Review and confirm booking

**Layout:**
- Standard header ("Review Booking")
- Scrollable content
- Bottom inset: `Spacing.xl`

**Content:**
- Vehicle summary card
- Rental period details
- Cost breakdown (hourly rate, fees, total)
- Payment method selector
- Terms checkbox

**Buttons:**
- Confirm & Pay (bottom, primary)

---

### 5. Trips Screen
**Purpose:** Manage current and past bookings

**Layout:**
- Standard header with segment control
- Scrollable list
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Header:**
- Title: "My Trips"
- Segment control: Upcoming | Past

**Content:**
- Trip cards (different styling for upcoming vs past)
- Upcoming: Vehicle image, dates, "Start Trip" button, "Cancel" option
- Past: Vehicle image, dates, rating prompt
- Empty state for each segment

**Components:**
- Segment control
- Trip cards (pressable to view details)
- Swipe actions (Cancel for upcoming, Rate for completed)

---

### 6. Favorites Screen
**Purpose:** Quick access to saved vehicles

**Layout:**
- Standard header
- Scrollable grid (2 columns)
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Header:**
- Title: "Favorites"
- No additional buttons

**Content:**
- Vehicle cards (grid layout, compact version)
- Each card: image, name, price, unfavorite icon
- Empty state: "No favorites yet" with "Browse Vehicles" button

---

### 7. Profile Screen
**Purpose:** Account management and settings

**Layout:**
- Transparent header
- Scrollable content
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Header:**
- Transparent
- Settings icon (right)

**Content Sections:**
1. Profile header (avatar, name, email, rating)
2. Quick stats (trips completed, favorite vehicles)
3. Settings list:
   - Payment Methods
   - Notifications
   - Driving License
   - Help & Support
   - Terms & Privacy
   - Account (contains Log Out and Delete Account)

**Components:**
- Avatar (user-customizable from preset options)
- List items (icon left, chevron right)

---

### 8. Active Trip Screen
**Purpose:** Manage ongoing rental

**Layout:**
- Full-screen overlay (modal)
- Map view as background
- Top inset: `insets.top + Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl`

**Floating Elements:**
- Trip info card (top): time remaining, vehicle name, end time
- Navigation card (middle): directions to vehicle or return location
- End Trip button (bottom, full-width, prominent, shadow)

**Components:**
- Map with vehicle pin
- Timer display
- Support button (floating top-right)

---

## Design System

### Color Palette
**Primary:** #FF6B35 (vibrant orange - energy, movement)
**Secondary:** #004E89 (deep blue - trust, reliability)
**Accent:** #F7B801 (amber - highlights)
**Success:** #06D6A0
**Error:** #EF476F
**Background:** #FFFFFF
**Surface:** #F8F9FA
**Text Primary:** #1A1A1A
**Text Secondary:** #6C757D

### Typography
**Headers:** SF Pro Display (iOS) / Roboto (Android)
- H1: 28pt, Bold
- H2: 22pt, Semibold
- H3: 18pt, Semibold

**Body:** SF Pro Text (iOS) / Roboto (Android)
- Large: 17pt, Regular
- Regular: 15pt, Regular
- Small: 13pt, Regular

**Buttons:** 16pt, Semibold

### Interaction Design
- All touchable elements have 0.7 opacity on press
- Cards have gentle press scale (0.98)
- Floating buttons use specified shadow:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

### Icons
- Use Feather icons from @expo/vector-icons
- Standard system icons for navigation
- Primary actions: 24px
- Secondary actions: 20px

### Required Assets
1. **Vehicle placeholders** (3 variations)
   - SUV silhouette
   - Sedan silhouette
   - Electric car silhouette
2. **User avatars** (4 preset options)
   - Modern, minimal geometric faces
   - Automotive theme colors
3. **Empty state illustrations** (2)
   - No vehicles found (car with magnifying glass)
   - No trips yet (calendar with car key)

### Accessibility
- Minimum touch target: 44x44 pts
- Color contrast ratio: 4.5:1 minimum
- Support Dynamic Type
- VoiceOver labels for all interactive elements
- Form inputs with clear labels and error states