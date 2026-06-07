/**
 * Seed chat messages from fake users to test unread badges
 * 
 * Run: npx tsx scripts/seed-chat-messages.ts ACTIVITY_ID
 * 
 * Example: npx tsx scripts/seed-chat-messages.ts TQ5mHdQN33focrtiZqfx
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDZKcncNZ3_otUbMFgYPGfkNA1Q1R0n1pU",
  authDomain: "meelo-connect.firebaseapp.com",
  projectId: "meelo-connect",
  storageBucket: "meelo-connect.firebasestorage.app",
  messagingSenderId: "169878818018",
  appId: "1:169878818018:web:02bc4d198afb5e0a0f22bb",
  databaseURL: "https://meelo-connect-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fakeMessages = [
  { name: "Aarav Sharma", text: "Hey! Is everyone ready for today?" },
  { name: "Priya Patel", text: "Yes! I'll be there by 6:30" },
  { name: "Rohan Mehta", text: "Can someone bring an extra bat?" },
  { name: "Sneha Gupta", text: "I'm bringing water bottles for everyone 🧴" },
  { name: "Vikram Singh", text: "Weather looks perfect, see you all there!" },
];

async function seedMessages() {
  const activityId = process.argv[2];
  
  if (!activityId) {
    console.log("❌ Usage: npx tsx scripts/seed-chat-messages.ts ACTIVITY_ID");
    console.log("");
    console.log("   Get the activity ID from the URL when viewing an activity:");
    console.log("   http://localhost:3000/activity/TQ5mHdQN33focrtiZqfx");
    console.log("                                   ^^^^^^^^^^^^^^^^^^^^^^^^");
    process.exit(1);
  }

  console.log(`💬 Sending ${fakeMessages.length} chat messages to activity: ${activityId}\n`);

  const chatRef = ref(db, `chats/${activityId}/messages`);

  for (const msg of fakeMessages) {
    await push(chatRef, {
      senderId: `fake-${msg.name.toLowerCase().replace(/\s/g, "-")}`,
      senderName: msg.name,
      senderAvatar: "",
      text: msg.text,
      type: "text",
      timestamp: Date.now(),
    });
    console.log(`  ✅ ${msg.name}: "${msg.text}"`);
    // Small delay between messages
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Done! ${fakeMessages.length} messages sent.`);
  console.log("   Go check the activity card — you should see 💬 5 badge.");
  process.exit(0);
}

seedMessages();
