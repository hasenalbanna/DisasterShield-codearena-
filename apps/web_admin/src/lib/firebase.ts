import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Official DisasterShield Firebase Web Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD52aeDMpYubc4dTPbSKMUMFGrD3dmFR8Y",
  authDomain: "disastershield-a23cf.firebaseapp.com",
  databaseURL: "https://disastershield-a23cf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "disastershield-a23cf",
  storageBucket: "disastershield-a23cf.firebasestorage.app",
  messagingSenderId: "298522328437",
  appId: "1:298522328437:web:bb407dc981ed2bae58273c",
  measurementId: "G-SBDQ1V96VD"
};

// Initialize Firebase App & Service Instances
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
