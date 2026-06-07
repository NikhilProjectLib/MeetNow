import { ref, onValue, off, set, get } from "firebase/database";
import { rtdb } from "./firebase";

/**
 * Update the "last seen" timestamp (call when user opens the chat)
 */
export async function updateLastSeen(userId: string, activityId: string): Promise<void> {
  const lastSeenRef = ref(rtdb, `chatLastSeen/${userId}/${activityId}`);
  await set(lastSeenRef, Date.now());
}

/**
 * Subscribe to unread message counts for multiple activities.
 * Compares message timestamps against user's last-seen time.
 */
export function subscribeToUnreadCounts(
  userId: string,
  activityIds: string[],
  callback: (counts: Record<string, number>) => void
): () => void {
  const listeners: (() => void)[] = [];
  const counts: Record<string, number> = {};

  for (const activityId of activityIds) {
    const messagesRef = ref(rtdb, `chats/${activityId}/messages`);

    // Single listener per activity — reads lastSeen on each update
    const listener = onValue(messagesRef, async (msgSnap) => {
      // Get last seen time
      let lastSeen = 0;
      try {
        const lastSeenRef = ref(rtdb, `chatLastSeen/${userId}/${activityId}`);
        const snap = await get(lastSeenRef);
        lastSeen = snap.val() || 0;
      } catch {
        lastSeen = 0;
      }

      let unread = 0;
      msgSnap.forEach((child) => {
        const msg = child.val();
        const msgTime = msg.timestamp || 0;
        // Count messages from others that arrived after last seen
        if (msgTime > lastSeen && msg.senderId !== userId) {
          unread++;
        }
      });

      counts[activityId] = unread;
      callback({ ...counts });
    });

    listeners.push(() => off(messagesRef));
  }

  return () => {
    listeners.forEach((unsub) => unsub());
  };
}
