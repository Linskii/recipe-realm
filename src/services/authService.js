import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase.js';

export async function checkUsernameAvailable(username) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

export async function signUp(email, password, username, displayName) {
  // Check username availability
  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Username is already taken');
  }

  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    username: username.toLowerCase(),
    displayName: displayName || username,
    bio: '',
    createdAt: serverTimestamp(),
    recipeCount: 0,
    followerCount: 0,
    followingCount: 0,
  });

  return user;
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback({ ...user, ...userDoc.data() });
      } else {
        callback(user);
      }
    } else {
      callback(null);
    }
  });
}

export function getErrorMessage(error) {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
  };

  return errorMessages[error.code] || error.message || 'An error occurred';
}
