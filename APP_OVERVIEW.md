# Meelo — App Overview & Feature Documentation

## What is Meelo?

Meelo is a real-time social activity platform where users can discover, create, and join nearby activities like cricket matches, football games, trekking, clubbing, and more. Think of it as "BookMyShow meets Uber" — but for spontaneous group activities.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State Management | Zustand |
| Backend & Database | Firebase Firestore (real-time sync) |
| Authentication | Firebase Auth (Google + Email/Password) |
| Chat | Firebase Realtime Database |
| Maps | Leaflet + OpenStreetMap (free, no API key) |
| Animations | Framer Motion |
| Notifications | Sonner (toast library) |

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Sign in with Google or Email/Password |
| `/` | Home | Map view + activity list with category filters |
| `/explore` | Explore | Distance-based search with radius filter |
| `/create` | Create Activity | Full form with map picker, calendar, categories |
| `/activity/[id]` | Activity Detail | Full info, join/leave, chat, share, owner controls |
| `/my-activities` | My Activities | Upcoming, History, and Created tabs |
| `/profile` | Profile | User info, stats, sign out |

---

## Features & Functions

### 1. Authentication

| Function | What it does |
|----------|-------------|
| Google Sign-In | One-tap sign in using Google account popup |
| Email Sign-Up | Create account with name, email, password |
| Email Sign-In | Login with existing email/password |
| Sign Out | Ends session, redirects to login page |
| Auth Guard | Protects all pages — unauthenticated users redirected to login |
| Persistent Session | User stays logged in across page refreshes |

---

### 2. Activity Discovery (Home Page)

| Function | What it does |
|----------|-------------|
| Map View | Interactive map showing all activities as emoji pins |
| List View | Scrollable card list below the map |
| Split/Map/List Toggle | Switch between combined view, full map, or full list |
| Category Filter | Pill buttons to filter by activity type (cricket, football, etc.) |
| "Starting Soon" Section | Highlights activities within 3 hours (red badge) |
| Urgency Badges | Shows "Starting soon!", "In 2h", "In 3 days" on cards |
| Pin Selection | Click map pin → highlights matching card in list |
| My Location Button | Centers map on user's GPS position |
| Real-time Updates | New activities appear instantly when other users create them |

---

### 3. Explore (Nearby Activities)

| Function | What it does |
|----------|-------------|
| Distance Radius Filter | Filter by range: 2km, 5km, 10km, 25km, 50km, All |
| GPS-based Distance | Calculates actual distance between user and each activity |
| Search | Text search across activity names and locations |
| Category Filter | Same as Home — filter by category |
| Distance Sorting | Nearest activities shown first |
| Hide Joined Activities | Already-joined activities hidden from explore results |

---

### 4. Create Activity

| Function | What it does |
|----------|-------------|
| Activity Name | Free-text input with 100-char limit |
| Dynamic Categories | 19 built-in + user can create custom categories with emoji |
| Category Search | Search/filter through available categories |
| Location — Text Input | Type location manually |
| Location — "Use My Location" | GPS detect + reverse geocode to readable address |
| Location — "Select on Map" | Full-screen map modal (Rapido/Uber style) — drag to pick |
| Map Search | Search places within the map picker (Nominatim) |
| Date — Quick Picks | "Today", "Tomorrow", "This Weekend", "Next Week" buttons |
| Date — Calendar Picker | Visual month grid popup (like ticket booking apps) |
| Time — Quick Slots | Morning/Afternoon/Evening/Night presets |
| Time — Custom Input | Standard time picker |
| Players — Presets | "Small (2-4)", "Medium (5-10)", "Large (11-22)", "Huge (50+)" |
| Players — Custom | Number input (2-500) |
| Auto-Delete Timer | Owner selects when activity auto-deletes (0h to 3 days or never) |
| Description | Optional text field |
| Live Preview | Sidebar shows real-time preview card of the activity being created |
| Validation | Inline errors for missing/invalid fields |
| Success Modal | Animated checkmark popup after creation (like payment success) |
| Firebase Sync | Created activity instantly visible to all users |

---

### 5. Activity Detail Page

| Function | What it does |
|----------|-------------|
| Full Activity Info | Name, emoji, category, location, date, time, description |
| Player List | Shows all joined players with initials |
| Capacity Bar | Visual progress bar showing fill percentage |
| Join Button | Adds user to activity (disabled when full) |
| Leave Button | Removes user from activity |
| "Activity Full" Label | Shown when at capacity |
| Share Button | Share via WhatsApp or copy link |
| Past Activity Guard | Non-participants blocked from viewing ended activities |
| "Activity Ended" State | Shows read-only view for past activities |
| Toast Notifications | "Joined!" / "Left activity" confirmations |

---

### 6. Owner Controls (Activity Creator Only)

| Function | What it does |
|----------|-------------|
| Edit Activity | Modify name, location, date, time, player count, description |
| Delete Activity | Permanent removal with confirmation dialog |
| Remove Player | Kick any player from the activity |
| Visible to Owner Only | Other users never see these controls |
| Hidden for Past Events | Can't edit/delete activities that already ended |

---

### 7. Group Chat

| Function | What it does |
|----------|-------------|
| Real-time Messaging | Firebase Realtime DB — messages appear instantly |
| Per-Activity Chat | Each activity has its own chat room |
| Message Bubbles | WhatsApp-style — own messages on right (purple), others on left |
| Sender Info | Shows name + initial avatar for other users |
| Timestamps | Time shown on each message |
| System Messages | "User joined the group" style notifications |
| Access Control | Only joined members can send messages |
| Expand/Collapse | Chat starts collapsed, click to open |
| Send on Enter | Keyboard shortcut for quick sending |

---

### 8. My Activities

| Function | What it does |
|----------|-------------|
| Upcoming Tab | Activities you joined that haven't happened yet (sorted by soonest) |
| History Tab | Past activities (sorted by most recent) |
| Created by Me Tab | All activities you created |
| Stats Summary | Cards showing Upcoming/Completed/Created counts |
| Leave Button | Quick leave from any upcoming activity |
| Ticket ID | Shows pass number (MN-XXXXXX) for each joined activity |
| Status Badges | "Upcoming" (green) / "Completed" (grey) |
| Click to View | Each card links to the activity detail page |

---

### 9. Profile Page

| Function | What it does |
|----------|-------------|
| Profile Photo | Google photo (or initial avatar) |
| Display Name | From Google account or signup |
| Email | Shown below name |
| Stats | Joined count, Created count, Rating |
| Activity Lists | Your joined and created activities |
| Sign Out Button | Red button to end session |

---

### 10. Map Features

| Function | What it does |
|----------|-------------|
| OpenStreetMap Tiles | Free map — no API key needed |
| Emoji Markers | Each activity shown as its category emoji on the map |
| User Location Marker | Blue dot showing where you are |
| Location Circle | Subtle radius indicator around user position |
| Click Pin → Popup | Shows activity name, location, time, player count |
| Click Pin → Highlight Card | Matching card in list gets purple ring |
| Fly To Location | Smooth animation when centering on position |
| Map in Create | Full-screen draggable map for location selection |
| Center Pin (Uber style) | Fixed pin in center — drag map to select |
| Reverse Geocoding | Converts lat/lng to readable address (Nominatim) |
| Place Search | Search places by name in map picker |

---

### 11. Auto-Delete System

| Function | What it does |
|----------|-------------|
| Owner Sets Duration | Choose when activity auto-removes after event time |
| Options | Immediately / 1h / 6h / 24h / 3 days / Never |
| Expiry Calculation | expiresAt = event date+time + selected duration |
| Auto Cleanup | Expired activities deleted from Firestore automatically |
| Hidden Immediately | Users don't see expired activities even before deletion |

---

### 12. Real-time Multi-User Sync

| Function | What it does |
|----------|-------------|
| Firestore Listener | All clients subscribe to activity collection changes |
| Instant Create | New activity appears for all users within 1-2 seconds |
| Instant Join/Leave | Player count updates live for everyone |
| Instant Delete | Removed activities disappear for all users |
| Instant Edit | Owner's edits reflect everywhere in real-time |

---

### 13. UI/UX Features

| Function | What it does |
|----------|-------------|
| Category Color System | Each category has unique color (cards, badges, filters) |
| Framer Motion | Smooth page transitions, card animations |
| Toast Notifications | Success/error feedback on all actions |
| Responsive Layout | Desktop: sidebar nav / Mobile: bottom tab bar |
| Dark Mode | Follows system preference automatically |
| Loading Skeletons | Animated placeholders while data loads |
| Success Modal | Payment-complete style popup after creating activity |
| Calendar Picker | Month grid popup for date selection |
| Quick-pick Buttons | Preset options throughout (dates, times, player counts) |

---

## Data Flow

```
User Action → Zustand Store → Firestore Write → Real-time Listener → All Clients Updated
```

## Folder Structure

```
meelo/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # Reusable UI components
│   ├── stores/           # Zustand state stores
│   ├── lib/              # Utilities, services, Firebase config
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript interfaces
├── .env.local            # Firebase + API keys
└── package.json          # Dependencies
```

---

## How to Run

```bash
cd meelo
npm install
npm run dev
# Open http://localhost:3000
```

## Required Setup

1. Firebase project with Firestore + Realtime DB + Auth enabled
2. `.env.local` with Firebase config values
3. Firestore rules set to allow read/write
4. Auth providers enabled (Google + Email/Password)
