// firebase.js
import { initializeApp } from 'firebase/app';
import {getDatabase} from 'firebase/database'; // Import Firestore
import {getStorage} from 'firebase/storage'; // Import Firebase Storage


const firebaseConfig = {
  apiKey: "AIzaSyClbP8unZuO8HCJFfD60v0O9d5-JApYS9w",
  authDomain: "finalyear-cfd4a.firebaseapp.com",
  databaseURL: "https://finalyear-cfd4a-default-rtdb.firebaseio.com",
  projectId: "finalyear-cfd4a",
  storageBucket: "finalyear-cfd4a.appspot.com",
  messagingSenderId: "846783383522",
  appId: "1:846783383522:web:98a15e5697578ccb039bbb",
  measurementId: "G-S14355M7Q0"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); // Initialize Firestore
export const storage = getStorage(app);