import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// TODO: Replace with your own Firebase project credentials
// Get these from: https://console.firebase.google.com/ -> Project Settings -> Your Apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com"
};

// Check if config is using placeholders
const isConfigured = import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

let app: any;
let auth: any;
let googleProvider: any;
let database: any;

if (isConfigured) {
    // Initialize Firebase normally
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    database = getDatabase(app);
} else {
    console.warn("Firebase not configured. Using mock services.");
    // Mock services to prevent crash
    app = null;
    auth = { currentUser: null }; // minimal mock
    googleProvider = {};
    database = {};
}

export { app, auth, googleProvider, database, isConfigured };
export default app;
