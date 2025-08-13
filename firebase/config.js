// firebase/config.ts
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

// Konfigurasi tetap sama
const firebaseConfig = {
  apiKey: 'AIzaSyAFEGO8JapapF5giAjCbp521HySuKC8CYQ',
  authDomain: 'hppmaster-75408.firebaseapp.com',
  projectId: 'hppmaster-75408',
  storageBucket: 'hppmaster-75408.appspot.com',
  messagingSenderId: '512167328296',
  appId: '1:512167328296:web:5ca44076b9f15cba58931d',
};

// Initialize Firebase (tidak perlu export app untuk RN)
initializeApp(firebaseConfig);

// Export instances
export const db = firestore();
export const firebaseAuth = auth();
export const firebaseStorage = storage();
