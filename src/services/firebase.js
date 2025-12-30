// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBtrj9OEhSPk86CK8CF4ZB_qhLvhBFFToM',
  authDomain: 'recipe-realm-ac277.firebaseapp.com',
  projectId: 'recipe-realm-ac277',
  storageBucket: 'recipe-realm-ac277.firebasestorage.app',
  messagingSenderId: '570007326970',
  appId: '1:570007326970:web:6895b72d2ff337d354b943',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
