import { ref, push, onValue, off, update, serverTimestamp, query, orderByChild, limitToLast } from "firebase/database";
import { rtdb } from "./firebase";

export interface AppNotification {
  id: string;
  type: "join" | "leave" | "chat" | "update" | "delete" | "removed";
  title: string;
  message: string;
  activityId: string;
  activityName: string;
  timestamp: number;
  read: boolean;
}

/**
 * Send a notification to a specific user
 */
export async function sendNotification(
  userId: string,
  notification: {
    type: AppNotification["type"];
    title: string;
    message: string;
    activityId: string;
    activityName: string;
  }
): Promise<void> {
  const notifRef = ref(rtdb, `notifications/${userId}`);
  await push(notifRef, {
    ...notification,
    timestamp: serverTimestamp(),
    read: false,
  });
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): () => void {
  const notifRef = query(
    ref(rtdb, `notifications/${userId}`),
    orderByChild("timestamp"),
    limitToLast(30)
  );

  const listener = onValue(notifRef, (snapshot) => {
    const notifications: AppNotification[] = [];
    snapshot.forEach((child) => {
      notifications.push({
        id: child.key!,
        ...child.val(),
      });
    });
    // Newest first
    notifications.reverse();
    callback(notifications);
  });

  return () => off(notifRef);
}

/**
 * Mark a notification as read
 */
export async function markAsRead(userId: string, notificationId: string): Promise<void> {
  const notifRef = ref(rtdb, `notifications/${userId}/${notificationId}`);
  await update(notifRef, { read: true });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string, notifications: AppNotification[]): Promise<void> {
  const updates: Record<string, boolean> = {};
  notifications.forEach((n) => {
    if (!n.read) {
      updates[`notifications/${userId}/${n.id}/read`] = true;
    }
  });
  if (Object.keys(updates).length > 0) {
    const rootRef = ref(rtdb);
    await update(rootRef, updates);
  }
}

/**
 * Helper: Notify activity owner when someone joins
 */
export async function notifyOwnerOnJoin(
  ownerId: string,
  joinerName: string,
  activityId: string,
  activityName: string
): Promise<void> {
  await sendNotification(ownerId, {
    type: "join",
    title: "New participant!",
    message: `${joinerName} joined "${activityName}"`,
    activityId,
    activityName,
  });
}

/**
 * Helper: Notify activity owner when someone leaves
 */
export async function notifyOwnerOnLeave(
  ownerId: string,
  leaverName: string,
  activityId: string,
  activityName: string
): Promise<void> {
  await sendNotification(ownerId, {
    type: "leave",
    title: "Someone left",
    message: `${leaverName} left "${activityName}"`,
    activityId,
    activityName,
  });
}

/**
 * Helper: Notify all participants when activity is updated
 */
export async function notifyParticipantsOnUpdate(
  participantIds: string[],
  activityId: string,
  activityName: string,
  changeDescription: string
): Promise<void> {
  for (const userId of participantIds) {
    await sendNotification(userId, {
      type: "update",
      title: "Activity updated",
      message: `"${activityName}" was updated: ${changeDescription}`,
      activityId,
      activityName,
    });
  }
}

/**
 * Helper: Notify participant they were removed
 */
export async function notifyPlayerRemoved(
  playerId: string,
  activityId: string,
  activityName: string
): Promise<void> {
  await sendNotification(playerId, {
    type: "removed",
    title: "Removed from activity",
    message: `You were removed from "${activityName}"`,
    activityId,
    activityName,
  });
}
