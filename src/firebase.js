import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDqGkAoBDT-uFjv941QohhlzhrzmwEiTeI",
  authDomain: "vintageavenuelb.firebaseapp.com",
  projectId: "vintageavenuelb",
  storageBucket: "vintageavenuelb.firebasestorage.app",
  messagingSenderId: "530041810571",
  appId: "1:530041810571:web:a572bbcf6a35862934ee8e",
  measurementId: "G-40WC04KER7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
