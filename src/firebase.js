import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { getMessaging } from "firebase/messaging";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuJfb4ygJ-Amrj0qsvqb9cQ1VxDeRuHdY",
  authDomain: "lms1-d28be.firebaseapp.com",
  databaseURL: "https://lms1-d28be-default-rtdb.firebaseio.com",
  projectId: "lms1-d28be",
  storageBucket: "lms1-d28be.appspot.com", // Ensure the correct storage bucket URL
  messagingSenderId: "511896644859",
  appId: "1:511896644859:web:7de2bc775d627033b6145e",
  measurementId: "G-REN576F0DS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore, Auth, and Storage
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage
const messaging = getMessaging(app);
// Export the Firebase services
export { app, db, auth, storage,messaging };
