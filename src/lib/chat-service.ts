import {
  ref,
  push,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { rtdb } from "./firebase";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  type: "text" | "system"; // system = "X joined the group", etc.
}

const db = rtdb;

/**
 * Send a message to an activity's group chat.
 */
export async function sendMessage(
  activityId: string,
  message: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    type?: "text" | "system";
  }
): Promise<void> {
  const chatRef = ref(db, `chats/${activityId}/messages`);
  await push(chatRef, {
    ...message,
    type: message.type || "text",
    timestamp: serverTimestamp(),
  });
}

/**
 * Subscribe to messages for an activity.
 * Returns unsubscribe function.
 */
export function subscribeToMessages(
  activityId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 100
): () => void {
  const chatRef = query(
    ref(db, `chats/${activityId}/messages`),
    orderByChild("timestamp"),
    limitToLast(messageLimit)
  );

  const listener = onValue(chatRef, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((child) => {
      messages.push({
        id: child.key!,
        ...child.val(),
      });
    });
    callback(messages);
  });

  return () => off(chatRef);
}

/**
 * Send a system message (e.g., "User joined the group")
 */
export async function sendSystemMessage(
  activityId: string,
  text: string
): Promise<void> {
  await sendMessage(activityId, {
    senderId: "system",
    senderName: "MeetNow",
    senderAvatar: "",
    text,
    type: "system",
  });
}
