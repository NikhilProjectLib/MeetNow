export type ActivityCategory = string;

export interface Player {
  id: string;
  name: string;
  avatar: string;
  ticketId?: string; // Generated on join (like BookMyShow ticket)
  joinedAt?: string; // ISO timestamp
}

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  category: ActivityCategory;
  location: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  distance: string;
  playersJoined: number;
  playersNeeded: number;
  players: Player[];
  description: string;
  createdBy: string;
  expiresAt?: string; // ISO timestamp — activity auto-deletes after this time
  autoDeleteAfter?: string; // Duration label for display (e.g., "1 hour after event")
}

export interface UserProfile {
  id: string;
  name: string;
  location: string;
  avatar: string;
  stats: {
    joined: number;
    created: number;
    rating: number;
  };
}

export interface CreateActivityForm {
  name: string;
  location: string;
  date: string;
  time: string;
  playersNeeded: number;
  category: ActivityCategory;
  description: string;
}
