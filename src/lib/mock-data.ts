import { Activity, UserProfile } from "@/types";

// Default categories - users can add more dynamically
export const defaultCategories = [
  { id: "cricket", label: "Cricket", emoji: "\u{1F3CF}" },
  { id: "football", label: "Football", emoji: "\u26BD" },
  { id: "clubbing", label: "Clubbing", emoji: "\u{1F389}" },
  { id: "trekking", label: "Trekking", emoji: "\u{1F97E}" },
  { id: "bike-ride", label: "Bike Ride", emoji: "\u{1F6B4}" },
  { id: "basketball", label: "Basketball", emoji: "\u{1F3C0}" },
  { id: "swimming", label: "Swimming", emoji: "\u{1F3CA}" },
  { id: "yoga", label: "Yoga", emoji: "\u{1F9D8}" },
  { id: "running", label: "Running", emoji: "\u{1F3C3}" },
  { id: "badminton", label: "Badminton", emoji: "\u{1F3F8}" },
  { id: "tennis", label: "Tennis", emoji: "\u{1F3BE}" },
  { id: "gaming", label: "Gaming", emoji: "\u{1F3AE}" },
  { id: "movies", label: "Movies", emoji: "\u{1F3AC}" },
  { id: "food", label: "Food Meetup", emoji: "\u{1F355}" },
  { id: "study", label: "Study Group", emoji: "\u{1F4DA}" },
  { id: "music", label: "Music Jam", emoji: "\u{1F3B5}" },
  { id: "photography", label: "Photography", emoji: "\u{1F4F7}" },
  { id: "volunteering", label: "Volunteering", emoji: "\u{1F91D}" },
  { id: "other", label: "Other", emoji: "\u2728" },
];

export const categoryEmojis: Record<string, string> = Object.fromEntries(
  defaultCategories.map((c) => [c.id, c.emoji])
);

export const categoryLabels: Record<string, string> = Object.fromEntries(
  defaultCategories.map((c) => [c.id, c.label])
);

// Quick time slot suggestions
export const quickTimeSlots = [
  { label: "Morning", time: "07:00", icon: "\u{1F305}" },
  { label: "Late Morning", time: "10:00", icon: "\u2600\uFE0F" },
  { label: "Afternoon", time: "14:00", icon: "\u{1F324}\uFE0F" },
  { label: "Evening", time: "17:00", icon: "\u{1F307}" },
  { label: "Night", time: "20:00", icon: "\u{1F319}" },
  { label: "Late Night", time: "22:00", icon: "\u{1F303}" },
];

// Player count presets
export const playerPresets = [
  { label: "Small (2-4)", value: 4 },
  { label: "Medium (5-10)", value: 10 },
  { label: "Large (11-22)", value: 22 },
  { label: "Huge (50+)", value: 50 },
];

// Auto-delete duration options
export const autoDeleteOptions = [
  { label: "Immediately after event", value: 0, description: "Deleted when event time passes" },
  { label: "1 hour after event", value: 60, description: "Gives time for late joiners" },
  { label: "6 hours after event", value: 360, description: "Stays visible for a while" },
  { label: "24 hours after event", value: 1440, description: "Next day cleanup" },
  { label: "3 days after event", value: 4320, description: "Stays in history longer" },
  { label: "Never (manual delete)", value: -1, description: "You delete it yourself" },
];

// ========== TEST DATA ==========
// Activities are structured so you can test all scenarios:
// - owned-*  : Created by current user (owner controls visible)
// - joined-* : Joined by current user, owned by others
// - past-*   : Past activities (history section / access control)
// - other-*  : Activities by others, not joined (can test Join flow)

export const mockActivities: Activity[] = [
  // ===== OWNED BY CURRENT USER (test Edit, Delete, Remove Player) =====
  {
    id: "owned-1",
    name: "My Cricket Match",
    emoji: "\u{1F3CF}",
    category: "cricket",
    location: "Central Park Ground",
    lat: 19.076,
    lng: 72.8777,
    date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "18:00",
    distance: "2.5 km away",
    playersJoined: 3,
    playersNeeded: 11,
    players: [
      { id: "current-user", name: "Alex Johnson", avatar: "/avatars/1.png", ticketId: "MN-AX4K92", joinedAt: new Date().toISOString() },
      { id: "p2", name: "Priya Sharma", avatar: "/avatars/2.png", ticketId: "MN-PR7Y2A", joinedAt: new Date().toISOString() },
      { id: "p3", name: "Amit Patel", avatar: "/avatars/3.png", ticketId: "MN-AM3TPL", joinedAt: new Date().toISOString() },
    ],
    description: "Friendly evening cricket match. All skill levels welcome! Bring your own bat if you have one.",
    createdBy: "current-user",
  },
  {
    id: "owned-2",
    name: "Weekend Yoga Session",
    emoji: "\u{1F9D8}",
    category: "yoga",
    location: "Joggers Park, Bandra",
    lat: 19.0544,
    lng: 72.8202,
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "07:00",
    distance: "3.0 km away",
    playersJoined: 5,
    playersNeeded: 15,
    players: [
      { id: "current-user", name: "Alex Johnson", avatar: "/avatars/1.png", ticketId: "MN-YG5KL8", joinedAt: new Date().toISOString() },
      { id: "p4", name: "Sneha Reddy", avatar: "/avatars/4.png", ticketId: "MN-SN8RDY", joinedAt: new Date().toISOString() },
      { id: "p5", name: "Vikram Singh", avatar: "/avatars/5.png", ticketId: "MN-VK5SNG", joinedAt: new Date().toISOString() },
      { id: "p6", name: "Neha Gupta", avatar: "/avatars/6.png", ticketId: "MN-NH6GPT", joinedAt: new Date().toISOString() },
      { id: "p7", name: "Arjun Mehta", avatar: "/avatars/7.png", ticketId: "MN-AR7MHT", joinedAt: new Date().toISOString() },
    ],
    description: "Relaxing yoga for beginners and intermediate. Bring your mat. I will guide the session.",
    createdBy: "current-user",
  },

  // ===== JOINED BY CURRENT USER, OWNED BY OTHERS (test Leave, view ticket) =====
  {
    id: "joined-1",
    name: "5-a-side Football",
    emoji: "\u26BD",
    category: "football",
    location: "Sports Complex Turf",
    lat: 19.082,
    lng: 72.89,
    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "17:00",
    distance: "1.2 km away",
    playersJoined: 7,
    playersNeeded: 10,
    players: [
      { id: "p2", name: "Priya Sharma", avatar: "/avatars/2.png", ticketId: "MN-PR2SHA", joinedAt: new Date().toISOString() },
      { id: "p3", name: "Amit Patel", avatar: "/avatars/3.png", ticketId: "MN-AM3PTL", joinedAt: new Date().toISOString() },
      { id: "p5", name: "Vikram Singh", avatar: "/avatars/5.png", ticketId: "MN-VK5SNG", joinedAt: new Date().toISOString() },
      { id: "p9", name: "Ravi Kumar", avatar: "/avatars/9.png", ticketId: "MN-RV9KMR", joinedAt: new Date().toISOString() },
      { id: "p10", name: "Deepa Nair", avatar: "/avatars/10.png", ticketId: "MN-DP0NAR", joinedAt: new Date().toISOString() },
      { id: "p11", name: "Suresh Iyer", avatar: "/avatars/1.png", ticketId: "MN-SR1IYR", joinedAt: new Date().toISOString() },
      { id: "current-user", name: "Alex Johnson", avatar: "/avatars/1.png", ticketId: "MN-AX7FB2", joinedAt: new Date().toISOString() },
    ],
    description: "Quick 5-a-side game after work. Bring water and good vibes!",
    createdBy: "p2",
  },
  {
    id: "joined-2",
    name: "Sunrise Trek to Karnala",
    emoji: "\u{1F97E}",
    category: "trekking",
    location: "Karnala Bird Sanctuary Gate",
    lat: 19.062,
    lng: 73.118,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "05:30",
    distance: "28 km away",
    playersJoined: 6,
    playersNeeded: 12,
    players: [
      { id: "p1", name: "Rahul Verma", avatar: "/avatars/1.png", ticketId: "MN-RH1VMA", joinedAt: new Date().toISOString() },
      { id: "p7", name: "Arjun Mehta", avatar: "/avatars/7.png", ticketId: "MN-AR7MHT", joinedAt: new Date().toISOString() },
      { id: "p15", name: "Anita Das", avatar: "/avatars/9.png", ticketId: "MN-AN5DAS", joinedAt: new Date().toISOString() },
      { id: "p16", name: "Jay Prakash", avatar: "/avatars/10.png", ticketId: "MN-JY6PRK", joinedAt: new Date().toISOString() },
      { id: "current-user", name: "Alex Johnson", avatar: "/avatars/1.png", ticketId: "MN-AX9TRK", joinedAt: new Date().toISOString() },
      { id: "p12", name: "Meera Joshi", avatar: "/avatars/2.png", ticketId: "MN-MR2JSH", joinedAt: new Date().toISOString() },
    ],
    description: "Early morning trek to Karnala Fort. Moderate difficulty. Bring snacks, water, and torch.",
    createdBy: "p1",
  },

  // ===== PAST - JOINED (visible in My Activities > History) =====
  {
    id: "past-1",
    name: "Beach Volleyball Last Week",
    emoji: "\u{1F3D0}",
    category: "football",
    location: "Juhu Beach",
    lat: 19.098,
    lng: 72.826,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "16:00",
    distance: "5 km away",
    playersJoined: 8,
    playersNeeded: 8,
    players: [
      { id: "current-user", name: "Alex Johnson", avatar: "/avatars/1.png", ticketId: "MN-AX2BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p2", name: "Priya Sharma", avatar: "/avatars/2.png", ticketId: "MN-PR4BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p3", name: "Amit Patel", avatar: "/avatars/3.png", ticketId: "MN-AM6BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p4", name: "Sneha Reddy", avatar: "/avatars/4.png", ticketId: "MN-SN8BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p5", name: "Vikram Singh", avatar: "/avatars/5.png", ticketId: "MN-VK0BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p6", name: "Neha Gupta", avatar: "/avatars/6.png", ticketId: "MN-NH2BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p7", name: "Arjun Mehta", avatar: "/avatars/7.png", ticketId: "MN-AR4BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p9", name: "Ravi Kumar", avatar: "/avatars/9.png", ticketId: "MN-RV6BVL", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    description: "Was a great game! Everyone had fun.",
    createdBy: "p9",
  },

  // ===== PAST - NOT JOINED (should NOT be visible to current user on detail page) =====
  {
    id: "past-2",
    name: "Night Clubbing Downtown",
    emoji: "\u{1F389}",
    category: "clubbing",
    location: "Club XYZ, Colaba",
    lat: 18.922,
    lng: 72.833,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "22:00",
    distance: "12 km away",
    playersJoined: 6,
    playersNeeded: 8,
    players: [
      { id: "p4", name: "Sneha Reddy", avatar: "/avatars/4.png", ticketId: "MN-SN4CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p6", name: "Neha Gupta", avatar: "/avatars/6.png", ticketId: "MN-NH6CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p13", name: "Rohan Kapoor", avatar: "/avatars/3.png", ticketId: "MN-RH3CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p14", name: "Tanya Bose", avatar: "/avatars/5.png", ticketId: "MN-TN5CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p11", name: "Suresh Iyer", avatar: "/avatars/1.png", ticketId: "MN-SR1CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "p12", name: "Meera Joshi", avatar: "/avatars/2.png", ticketId: "MN-MR2CLB", joinedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    description: "Saturday night at Club XYZ. Good music and vibes.",
    createdBy: "p4",
  },

  // ===== OTHERS' FUTURE ACTIVITIES (test Join flow) =====
  {
    id: "other-1",
    name: "Saturday Night Out",
    emoji: "\u{1F389}",
    category: "clubbing",
    location: "Downtown Club District",
    lat: 19.06,
    lng: 72.835,
    date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "22:00",
    distance: "4.0 km away",
    playersJoined: 5,
    playersNeeded: 8,
    players: [
      { id: "p4", name: "Sneha Reddy", avatar: "/avatars/4.png", ticketId: "MN-SN4NIT", joinedAt: new Date().toISOString() },
      { id: "p6", name: "Neha Gupta", avatar: "/avatars/6.png", ticketId: "MN-NH6NIT", joinedAt: new Date().toISOString() },
      { id: "p8", name: "Kavita Rao", avatar: "/avatars/8.png", ticketId: "MN-KV8NIT", joinedAt: new Date().toISOString() },
      { id: "p13", name: "Rohan Kapoor", avatar: "/avatars/3.png", ticketId: "MN-RH3NIT", joinedAt: new Date().toISOString() },
      { id: "p14", name: "Tanya Bose", avatar: "/avatars/5.png", ticketId: "MN-TN5NIT", joinedAt: new Date().toISOString() },
    ],
    description: "Let us hit the clubs this Saturday. Meeting at the main entrance at 10 PM.",
    createdBy: "p4",
  },
  {
    id: "other-2",
    name: "Weekend Bike Ride",
    emoji: "\u{1F6B4}",
    category: "bike-ride",
    location: "Lakeside Cycling Path",
    lat: 19.095,
    lng: 72.865,
    date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "06:00",
    distance: "3.5 km away",
    playersJoined: 6,
    playersNeeded: 15,
    players: [
      { id: "p3", name: "Amit Patel", avatar: "/avatars/3.png", ticketId: "MN-AM3BKE", joinedAt: new Date().toISOString() },
      { id: "p5", name: "Vikram Singh", avatar: "/avatars/5.png", ticketId: "MN-VK5BKE", joinedAt: new Date().toISOString() },
      { id: "p9", name: "Ravi Kumar", avatar: "/avatars/9.png", ticketId: "MN-RV9BKE", joinedAt: new Date().toISOString() },
      { id: "p10", name: "Deepa Nair", avatar: "/avatars/10.png", ticketId: "MN-DP0BKE", joinedAt: new Date().toISOString() },
      { id: "p17", name: "Sanjay Thakur", avatar: "/avatars/6.png", ticketId: "MN-SJ7BKE", joinedAt: new Date().toISOString() },
      { id: "p18", name: "Pooja Desai", avatar: "/avatars/8.png", ticketId: "MN-PJ8BKE", joinedAt: new Date().toISOString() },
    ],
    description: "30km ride along the lake. Intermediate level. Bring your own bike or rent one at the starting point.",
    createdBy: "p3",
  },
  {
    id: "other-3",
    name: "Gaming Night - Valorant",
    emoji: "\u{1F3AE}",
    category: "gaming",
    location: "Online (Discord)",
    lat: 19.076,
    lng: 72.877,
    date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "21:00",
    distance: "0 km away",
    playersJoined: 3,
    playersNeeded: 5,
    players: [
      { id: "p7", name: "Arjun Mehta", avatar: "/avatars/7.png", ticketId: "MN-AR7GME", joinedAt: new Date().toISOString() },
      { id: "p11", name: "Suresh Iyer", avatar: "/avatars/1.png", ticketId: "MN-SR1GME", joinedAt: new Date().toISOString() },
      { id: "p13", name: "Rohan Kapoor", avatar: "/avatars/3.png", ticketId: "MN-RH3GME", joinedAt: new Date().toISOString() },
    ],
    description: "Competitive Valorant 5-stack. Need 2 more. Minimum Silver rank.",
    createdBy: "p7",
  },
  {
    id: "other-4",
    name: "Photography Walk - Heritage",
    emoji: "\u{1F4F7}",
    category: "photography",
    location: "CST Station Area",
    lat: 18.94,
    lng: 72.836,
    date: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "16:00",
    distance: "15 km away",
    playersJoined: 4,
    playersNeeded: 10,
    players: [
      { id: "p15", name: "Anita Das", avatar: "/avatars/9.png", ticketId: "MN-AN5PHT", joinedAt: new Date().toISOString() },
      { id: "p16", name: "Jay Prakash", avatar: "/avatars/10.png", ticketId: "MN-JY6PHT", joinedAt: new Date().toISOString() },
      { id: "p12", name: "Meera Joshi", avatar: "/avatars/2.png", ticketId: "MN-MR2PHT", joinedAt: new Date().toISOString() },
      { id: "p18", name: "Pooja Desai", avatar: "/avatars/8.png", ticketId: "MN-PJ8PHT", joinedAt: new Date().toISOString() },
    ],
    description: "Explore Mumbai heritage architecture and practice street photography. All camera types welcome.",
    createdBy: "p15",
  },
];

export const mockUser: UserProfile = {
  id: "current-user",
  name: "Alex Johnson",
  location: "Mumbai, India",
  avatar: "/avatars/1.png",
  stats: {
    joined: 12,
    created: 3,
    rating: 4.5,
  },
};
