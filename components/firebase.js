
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7anqoPmJ4oO9WexAnsjE8mulzV1vEKcA",
  authDomain: "real-social-meet.firebaseapp.com",
  projectId: "real-social-meet",
  storageBucket: "real-social-meet.appspot.com",
  messagingSenderId: "127740805841",
  appId: "1:127740805841:web:31dbb7cc27ff8fc29bfbf0",
  measurementId: "G-B6470ZZT1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export default app;
