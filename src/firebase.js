// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuJfb4ygJ-Amrj0qsvqb9cQ1VxDeRuHdY",
  authDomain: "lms1-d28be.firebaseapp.com",
  databaseURL: "https://lms1-d28be-default-rtdb.firebaseio.com",
  projectId: "lms1-d28be",
  storageBucket: "lms1-d28be.firebasestorage.app",
  messagingSenderId: "511896644859",
  appId: "1:511896644859:web:7de2bc775d627033b6145e",
  measurementId: "G-REN576F0DS"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);
export const storage = getStorage(app);

export { app, db, auth };






