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
} from "@/lib/activity-service";

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
  joinActivity: (activityId: string, player: Player) => void;
  leaveActivity: (activityId: string, playerId: string) => void;

  // Owner CRUD
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
  removePlayer: (activityId: string, playerId: string) => void;
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
      const id = await createActivityInFirestore(newActivity);
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

  joinActivity: (activityId: string, player: Player) => {
    const { isFirebaseConnected } = get();

    if (isFirebaseConnected) {
      joinActivityInFirestore(activityId, player);
      // Real-time listener will update the state
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
    }
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

    if (isFirebaseConnected) {
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
}));
