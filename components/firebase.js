// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Ensure this import is correct
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDVyOrdf04wItY35DBTkaptWjvdYhJrc7Y",
  authDomain: "fir-realtime-chat-6cc31.firebaseapp.com",
  databaseURL: "https://fir-realtime-chat-6cc31-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-realtime-chat-6cc31",
  storageBucket: "fir-realtime-chat-6cc31.appspot.com",
  messagingSenderId: "827397833293",
  appId: "1:827397833293:web:52068131aaf33594aad204",
  measurementId: "G-Q7W60Q3Q6Z"
};

// Initialize Firebase app if not initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Log the db to check if it's initialized properly
console.log('Firestore Initialized:', db);

export { auth, db };
