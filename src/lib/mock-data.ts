import { Activity } from "@/types";

// Default categories - users can add more dynamically
export const defaultCategories = [
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "clubbing", label: "Clubbing", emoji: "🎉" },
  { id: "trekking", label: "Trekking", emoji: "🥾" },
  { id: "bike-ride", label: "Bike Ride", emoji: "🚴" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "movies", label: "Movies", emoji: "🎬" },
  { id: "food", label: "Food Meetup", emoji: "🍕" },
  { id: "study", label: "Study Group", emoji: "📚" },
  { id: "music", label: "Music Jam", emoji: "🎵" },
  { id: "photography", label: "Photography", emoji: "📷" },
  { id: "volunteering", label: "Volunteering", emoji: "🤝" },
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "dance", label: "Dance", emoji: "💃" },
  { id: "cooking", label: "Cooking", emoji: "👨‍🍳" },
  { id: "networking", label: "Networking", emoji: "🚀" },
  { id: "tech", label: "Tech", emoji: "☕" },
  { id: "chess", label: "Chess", emoji: "♟️" },
  { id: "volleyball", label: "Volleyball", emoji: "🏐" },
  { id: "table-tennis", label: "Table Tennis", emoji: "🏓" },
  { id: "board-games", label: "Board Games", emoji: "🎲" },
  { id: "other", label: "Other", emoji: "✨" },
];

export const categoryEmojis: Record<string, string> = Object.fromEntries(
  defaultCategories.map((c) => [c.id, c.emoji])
);

export const categoryLabels: Record<string, string> = Object.fromEntries(
  defaultCategories.map((c) => [c.id, c.label])
);

// Quick time slot suggestions
export const quickTimeSlots = [
  { label: "Morning", time: "07:00", icon: "🌅" },
  { label: "Late Morning", time: "10:00", icon: "☀️" },
  { label: "Afternoon", time: "14:00", icon: "🌤️" },
  { label: "Evening", time: "17:00", icon: "🌇" },
  { label: "Night", time: "20:00", icon: "🌙" },
  { label: "Late Night", time: "22:00", icon: "🌃" },
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
  { label: "Immediately after event", value: 0 },
  { label: "1 hour after event", value: 60 },
  { label: "6 hours after event", value: 360 },
  { label: "24 hours after event", value: 1440 },
  { label: "3 days after event", value: 4320 },
  { label: "Never (manual delete)", value: -1 },
];

// Empty initial activities (Firebase provides real data)
export const mockActivities: Activity[] = [];
