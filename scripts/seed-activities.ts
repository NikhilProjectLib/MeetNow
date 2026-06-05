/**
 * Seed script — creates 30 test activities with fake users in Firebase
 * 
 * Run: npx tsx scripts/seed-activities.ts
 */

import { initializeApp } from "firebase/app";
import { collection, addDoc, getDocs, deleteDoc, doc, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZKcncNZ3_otUbMFgYPGfkNA1Q1R0n1pU",
  authDomain: "meelo-connect.firebaseapp.com",
  projectId: "meelo-connect",
  storageBucket: "meelo-connect.firebasestorage.app",
  messagingSenderId: "169878818018",
  appId: "1:169878818018:web:02bc4d198afb5e0a0f22bb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== FAKE USERS =====================
const fakeUsers = [
  { id: "user-seed-01", name: "Aarav Sharma", avatar: "" },
  { id: "user-seed-02", name: "Priya Patel", avatar: "" },
  { id: "user-seed-03", name: "Rohan Mehta", avatar: "" },
  { id: "user-seed-04", name: "Sneha Gupta", avatar: "" },
  { id: "user-seed-05", name: "Vikram Singh", avatar: "" },
  { id: "user-seed-06", name: "Ananya Reddy", avatar: "" },
  { id: "user-seed-07", name: "Karan Joshi", avatar: "" },
  { id: "user-seed-08", name: "Meera Nair", avatar: "" },
  { id: "user-seed-09", name: "Arjun Desai", avatar: "" },
  { id: "user-seed-10", name: "Ishita Verma", avatar: "" },
];

function randomUsers(min: number, max: number) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...fakeUsers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((u) => ({
    ...u,
    ticketId: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    joinedAt: new Date().toISOString(),
  }));
}

// ===================== LOCATIONS (Mumbai area) =====================
const locations = [
  { name: "Marine Drive, Mumbai", lat: 18.9432, lng: 72.8235 },
  { name: "Juhu Beach, Mumbai", lat: 19.0988, lng: 72.8267 },
  { name: "Shivaji Park, Dadar", lat: 19.0282, lng: 72.8387 },
  { name: "Oval Maidan, Churchgate", lat: 18.9285, lng: 72.8277 },
  { name: "Powai Lake Garden", lat: 19.1255, lng: 72.9045 },
  { name: "Andheri Sports Complex", lat: 19.1197, lng: 72.8464 },
  { name: "BKC Ground, Bandra", lat: 19.0657, lng: 72.8694 },
  { name: "Hiranandani Garden, Powai", lat: 19.1180, lng: 72.9100 },
  { name: "Carter Road, Bandra", lat: 19.0565, lng: 72.8198 },
  { name: "Mahalaxmi Racecourse", lat: 18.9845, lng: 72.8190 },
  { name: "Wankhede Stadium Area", lat: 18.9389, lng: 72.8258 },
  { name: "Sanjay Gandhi National Park", lat: 19.2147, lng: 72.9107 },
  { name: "Aarey Colony, Goregaon", lat: 19.1550, lng: 72.8740 },
  { name: "Versova Beach", lat: 19.1318, lng: 72.8120 },
  { name: "Thane Creek Flamingo Point", lat: 19.1800, lng: 72.9750 },
  { name: "Borivali National Park", lat: 19.2285, lng: 72.8715 },
  { name: "Worli Sea Face", lat: 19.0095, lng: 72.8145 },
  { name: "Phoenix Mall, Lower Parel", lat: 18.9930, lng: 72.8270 },
  { name: "Gateway of India", lat: 18.9220, lng: 72.8347 },
  { name: "Lokhandwala Complex", lat: 19.1415, lng: 72.8345 },
];

// ===================== ACTIVITIES =====================
function getDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

const activities = [
  // Cricket
  { name: "Morning Cricket Match", emoji: "🏏", category: "cricket", time: "06:30", playersNeeded: 22, desc: "Leather ball match. Bring your own kit. All skill levels welcome.", days: 0 },
  { name: "Weekend Gully Cricket", emoji: "🏏", category: "cricket", time: "16:00", playersNeeded: 12, desc: "Tape ball cricket. Casual fun, no pressure.", days: 1 },
  { name: "Corporate Cricket League", emoji: "🏏", category: "cricket", time: "07:00", playersNeeded: 16, desc: "Inter-company friendly match. White dress preferred.", days: 3 },

  // Football
  { name: "5-a-side Football", emoji: "⚽", category: "football", time: "18:00", playersNeeded: 10, desc: "Turf booked at Andheri Sports Complex. ₹100 per person.", days: 0 },
  { name: "Sunday Football League", emoji: "⚽", category: "football", time: "06:00", playersNeeded: 22, desc: "Full match with referee. Intermediate+ level.", days: 2 },
  { name: "Night Football Session", emoji: "⚽", category: "football", time: "21:00", playersNeeded: 14, desc: "Floodlit turf. Studs mandatory. Water provided.", days: 1 },

  // Yoga & Fitness
  { name: "Sunrise Yoga at Beach", emoji: "🧘", category: "yoga", time: "05:30", playersNeeded: 20, desc: "Bring your own mat. All levels. 1 hour session.", days: 0 },
  { name: "Park Yoga & Meditation", emoji: "🧘", category: "yoga", time: "06:00", playersNeeded: 15, desc: "Guided meditation + stretching. Free session.", days: 1 },
  { name: "HIIT Workout Group", emoji: "💪", category: "fitness", time: "07:00", playersNeeded: 12, desc: "45 min high intensity session. No equipment needed.", days: 0 },
  { name: "Evening Run Club", emoji: "🏃", category: "running", time: "18:30", playersNeeded: 25, desc: "5km run along Marine Drive. All paces welcome.", days: 1 },

  // Badminton
  { name: "Badminton Doubles", emoji: "🏸", category: "badminton", time: "19:00", playersNeeded: 4, desc: "Indoor court booked. Bring own racket.", days: 0 },
  { name: "Badminton Singles Tournament", emoji: "🏸", category: "badminton", time: "17:00", playersNeeded: 8, desc: "Knockout format. Entry ₹200. Prizes for top 3.", days: 2 },

  // Basketball
  { name: "Basketball Pickup Game", emoji: "🏀", category: "basketball", time: "17:30", playersNeeded: 10, desc: "Open court at Shivaji Park. First come first play.", days: 0 },
  { name: "3v3 Basketball", emoji: "🏀", category: "basketball", time: "16:00", playersNeeded: 6, desc: "Half court game. Shoes with grip recommended.", days: 1 },

  // Swimming
  { name: "Morning Swim Session", emoji: "🏊", category: "swimming", time: "06:00", playersNeeded: 8, desc: "Olympic pool. Bring own cap & goggles. ₹150 entry.", days: 1 },

  // Cycling
  { name: "Early Morning Cycling", emoji: "🚴", category: "cycling", time: "05:00", playersNeeded: 15, desc: "30km ride. Route: Bandra → Worli Sea Link → Haji Ali. Helmet mandatory.", days: 0 },
  { name: "Weekend Mountain Biking", emoji: "🚴", category: "cycling", time: "06:00", playersNeeded: 10, desc: "Off-road trail in Aarey Colony. MTB recommended.", days: 2 },

  // Hiking
  { name: "Kanheri Caves Trek", emoji: "🥾", category: "hiking", time: "06:30", playersNeeded: 20, desc: "Easy-medium trek. 3 hours. Carry 2L water.", days: 3 },
  { name: "Sunset Hike — Matheran", emoji: "🥾", category: "hiking", time: "14:00", playersNeeded: 12, desc: "Train from Neral. Return by 8pm. Pack light snacks.", days: 5 },

  // Table Tennis
  { name: "Table Tennis Knockout", emoji: "🏓", category: "table-tennis", time: "19:00", playersNeeded: 8, desc: "Best of 3 sets. Winner gets free dinner!", days: 1 },

  // Board Games
  { name: "Board Game Night", emoji: "🎲", category: "board-games", time: "19:30", playersNeeded: 8, desc: "Catan, Ticket to Ride, Codenames. Snacks provided.", days: 0 },
  { name: "Chess Tournament", emoji: "♟️", category: "chess", time: "15:00", playersNeeded: 16, desc: "Rapid format. 10+5. FIDE rated players welcome.", days: 2 },

  // Photography
  { name: "Street Photography Walk", emoji: "📸", category: "photography", time: "16:00", playersNeeded: 10, desc: "Golden hour walk through old Mumbai. Any camera welcome.", days: 1 },

  // Music
  { name: "Open Mic Jam Session", emoji: "🎸", category: "music", time: "20:00", playersNeeded: 15, desc: "Bring instruments or just vibe. Acoustic preferred.", days: 0 },

  // Dance
  { name: "Bollywood Dance Class", emoji: "💃", category: "dance", time: "18:00", playersNeeded: 20, desc: "Learn a full choreography in 1.5 hours. Beginners welcome.", days: 1 },

  // Volleyball
  { name: "Beach Volleyball", emoji: "🏐", category: "volleyball", time: "07:00", playersNeeded: 12, desc: "At Juhu Beach. Casual game, no experience needed.", days: 0 },

  // Cooking
  { name: "Group Cooking Session", emoji: "👨‍🍳", category: "cooking", time: "11:00", playersNeeded: 8, desc: "Make South Indian thali together. Ingredients provided. ₹300 per head.", days: 2 },

  // Startup / Networking
  { name: "Startup Networking Meetup", emoji: "🚀", category: "networking", time: "18:00", playersNeeded: 30, desc: "Pitch your idea in 60 seconds. Connect with founders & investors.", days: 1 },
  { name: "Tech Talk & Coffee", emoji: "☕", category: "tech", time: "10:00", playersNeeded: 15, desc: "Discuss AI, web3, and open source. Free coffee.", days: 3 },

  // Gaming
  { name: "LAN Party — Valorant", emoji: "🎮", category: "gaming", time: "20:00", playersNeeded: 10, desc: "5v5 custom match. Bring laptop. WiFi provided.", days: 0 },
];

// ===================== SEED FUNCTION =====================
async function seed() {
  console.log("🌱 Seeding activities to Firebase...\n");

  let count = 0;
  for (const act of activities) {
    const loc = locations[count % locations.length];
    const players = randomUsers(1, Math.min(5, act.playersNeeded - 1));

    const activityData = {
      name: act.name,
      emoji: act.emoji,
      category: act.category,
      location: loc.name,
      lat: loc.lat + (Math.random() - 0.5) * 0.01, // slight offset
      lng: loc.lng + (Math.random() - 0.5) * 0.01,
      date: getDate(act.days),
      time: act.time,
      distance: `${(Math.random() * 8 + 0.5).toFixed(1)} km`,
      playersNeeded: act.playersNeeded,
      playersJoined: players.length,
      players: players,
      description: act.desc,
      createdBy: fakeUsers[count % fakeUsers.length].id,
      createdAt: new Date(),
    };

    await addDoc(collection(db, "activities"), activityData);
    count++;
    console.log(`  ✅ ${act.emoji} ${act.name} (${loc.name})`);
  }

  console.log(`\n🎉 Done! ${count} activities created.`);
  console.log("   Open http://localhost:3000 to see them.\n");
  process.exit(0);
}

// ===================== CLEAR FUNCTION =====================
async function clearAll() {
  console.log("🗑️  Clearing all activities from Firebase...\n");
  const snapshot = await getDocs(collection(db, "activities"));
  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, "activities", docSnap.id));
    count++;
  }
  console.log(`   Deleted ${count} activities.\n`);
  process.exit(0);
}

// ===================== CLI =====================
const arg = process.argv[2];
if (arg === "--clear") {
  clearAll();
} else {
  seed();
}
