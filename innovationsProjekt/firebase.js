import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDaXVV5IYG9jVe2hqyunWsMD3dN-HgmMTA",
  authDomain: "tutormatch3520-7cf45.firebaseapp.com",
  databaseURL: "https://tutormatch3520-7cf45-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tutormatch3520-7cf45",
  storageBucket: "tutormatch3520-7cf45.appspot.com",
  messagingSenderId: "1099419957035",
  appId: "1:1099419957035:web:baa4db538e00b6f70d376e"
};

// Initialiser Firebase-appen
const app = initializeApp(firebaseConfig);

// Få reference til Realtime Database
const db = getDatabase(app);

// Få reference til Firebase Storage
const storage = getStorage(app);

// Initialiser Auth med AsyncStorage-persistence, og giv det et unikt navn, fx firebaseAuth
const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Eksporter database, storage og firebaseAuth
export { db, storage, firebaseAuth };
