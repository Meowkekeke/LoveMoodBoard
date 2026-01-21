import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQP9HoDS1HmdJ6qwTl3caORQCs2Olyqpw",
  authDomain: "loveboard-coco.firebaseapp.com",
  projectId: "loveboard-coco",
  storageBucket: "loveboard-coco.firebasestorage.app",
  messagingSenderId: "100626181075",
  appId: "1:100626181075:web:0ad79dd2836620e9531d26",
  measurementId: "G-L1BZDK00N7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);