"use client";

import { create } from "zustand";
import { Activity, ActivityCategory, Player } from "@/types";
import { mockActivities } from "@/lib/mock-data";
import { getDistanceKm, formatDistance } from "@/lib/geo-utils";
import {
  createActivityInFirestore,
  updateActivityInFirestore,
  deleteActivityInFirestore,
  joinActivityInFirestore,
  leaveActivityInFirestore,
  removePlayerInFirestore,
  leaveWaitlistInFirestore,
  createActivitySeries,
  deleteSeriesFromDate,
  deleteSeriesDate,
} from "@/lib/activity-service";

/**
 * Weekly activities have one document per date. Lists show only the next
 * upcoming date of each series (input must already be upcoming-only).
 */
function nextDatePerSeries(list: Activity[]): Activity[] {
  const firstOfSeries = new Map<string, Activity>();
  for (const a of list) {
    if (!a.seriesId) continue;
    const cur = firstOfSeries.get(a.seriesId);
    if (!cur || `${a.date}T${a.time}` < `${cur.date}T${cur.time}`) firstOfSeries.set(a.seriesId, a);
  }
  return list.filter((a) => !a.seriesId || firstOfSeries.get(a.seriesId)?.id === a.id);
}

interface ActivityState {
  activities: Activity[];
  userLocation: { lat: number; lng: number } | null;
  radiusKm: number;
  isFirebaseConnected: boolean;

  // Actions
  setActivities: (activities: Activity[]) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  setRadiusKm: (km: number) => void;
  setFirebaseConnected: (connected: boolean) => void;

  // Queries
  getActivities: (filter?: ActivityCategory) => Activity[];
  getNearbyActivities: (filter?: ActivityCategory) => Activity[];
  getActivity: (id: string) => Activity | undefined;

  // Mutations — write to Firestore if connected, else local
  addActivity: (activity: Omit<Activity, "id">) => Promise<Activity>;
  /** Joins, or adds to the waitlist when full. */
  joinActivity: (activityId: string, player: Player) => Promise<"joined" | "waitlisted" | "noop">;
  leaveActivity: (activityId: string, playerId: string) => void;
  leaveWaitlist: (activityId: string, playerId: string) => void;

  // Owner CRUD
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
  removePlayer: (activityId: string, playerId: string) => void;
  /** Delete this date and all later dates of a weekly series. */
  deleteSeriesFrom: (seriesId: string, fromDate: string) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: mockActivities,
  userLocation: null,
  radiusKm: 10,
  isFirebaseConnected: false,

  setActivities: (activities) => set({ activities }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setRadiusKm: (km) => set({ radiusKm: km }),
  setFirebaseConnected: (connected) => set({ isFirebaseConnected: connected }),

  getActivities: (filter?: ActivityCategory) => {
    const { activities } = get();
    const now = new Date();
    let result = activities.filter((a) => {
      const activityDate = new Date(`${a.date}T${a.time || "23:59"}`);
      return activityDate >= now;
    });
    result = nextDatePerSeries(result);
    if (filter) {
      result = result.filter((a) => a.category === filter);
    }
    return result;
  },

  getNearbyActivities: (filter?: ActivityCategory) => {
    const { activities, userLocation, radiusKm } = get();
    const now = new Date();
    let result = activities.filter((a) => {
      const activityDate = new Date(`${a.date}T${a.time || "23:59"}`);
      return activityDate >= now;
    });
    result = nextDatePerSeries(result);

    if (userLocation) {
      result = result
        .map((a) => {
          const dist = getDistanceKm(userLocation.lat, userLocation.lng, a.lat || 0, a.lng || 0);
          return { ...a, distance: formatDistance(dist), _dist: dist };
        })
        .filter((a) => (a as any)._dist <= radiusKm)
        .sort((a, b) => (a as any)._dist - (b as any)._dist)
        .map(({ _dist, ...rest }: any) => rest as Activity);
    }

    if (filter) {
      result = result.filter((a) => a.category === filter);
    }

    return result;
  },

  getActivity: (id: string) => {
    const { activities } = get();
    return activities.find((a) => a.id === id);
  },

  addActivity: async (newActivity: Omit<Activity, "id">) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      const id =
        newActivity.recurrence === "weekly"
          ? await createActivitySeries(newActivity)
          : await createActivityInFirestore(newActivity);
      // Real-time listener will pick up the new activity
      return { ...newActivity, id } as Activity;
    } else {
      // Local fallback
      const id = crypto.randomUUID();
      const activity: Activity = { ...newActivity, id, playersJoined: 0, players: [] };
      set((state) => ({ activities: [activity, ...state.activities] }));
      return activity;
    }
  },

  joinActivity: async (activityId: string, player: Player) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      // Real-time listener will update the state
      return joinActivityInFirestore(activityId, player);
    } else {
      set((state) => ({
        activities: state.activities.map((activity) => {
          if (activity.id !== activityId) return activity;
          if (activity.playersJoined >= activity.playersNeeded) return activity;
          if (activity.players.some((p) => p.id === player.id)) return activity;
          return {
            ...activity,
            playersJoined: activity.playersJoined + 1,
            players: [...activity.players, player],
          };
        }),
      }));
      return "joined";
    }
  },

  leaveWaitlist: (activityId: string, playerId: string) => {
    if (get().isFirebaseConnected) leaveWaitlistInFirestore(activityId, playerId);
  },

  leaveActivity: (activityId: string, playerId: string) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      leaveActivityInFirestore(activityId, playerId);
    } else {
      set((state) => ({
        activities: state.activities.map((activity) => {
          if (activity.id !== activityId) return activity;
          if (!activity.players.some((p) => p.id === playerId)) return activity;
          return {
            ...activity,
            playersJoined: activity.playersJoined - 1,
            players: activity.players.filter((p) => p.id !== playerId),
          };
        }),
      }));
    }
  },

  updateActivity: (activityId: string, updates: Partial<Activity>) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      updateActivityInFirestore(activityId, updates);
    } else {
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, ...updates } : a
        ),
      }));
    }
  },

  deleteActivity: (activityId: string) => {
    const { isFirebaseConnected } = get();
    const activity = get().activities.find((a) => a.id === activityId);

    if (isFirebaseConnected && activity?.seriesId) {
      deleteSeriesDate(activityId, activity.seriesId, activity.date);
    } else if (isFirebaseConnected) {
      deleteActivityInFirestore(activityId);
    } else {
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== activityId),
      }));
    }
  },

  removePlayer: (activityId: string, playerId: string) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      removePlayerInFirestore(activityId, playerId);
    } else {
      set((state) => ({
        activities: state.activities.map((activity) => {
          if (activity.id !== activityId) return activity;
          if (!activity.players.some((p) => p.id === playerId)) return activity;
          return {
            ...activity,
            playersJoined: activity.playersJoined - 1,
            players: activity.players.filter((p) => p.id !== playerId),
          };
        }),
      }));
    }
  },

  deleteSeriesFrom: async (seriesId: string, fromDate: string) => {
    if (get().isFirebaseConnected) {
      await deleteSeriesFromDate(seriesId, fromDate);
    } else {
      set((state) => ({
        activities: state.activities.filter((a) => !(a.seriesId === seriesId && a.date >= fromDate)),
      }));
    }
  },
}));
