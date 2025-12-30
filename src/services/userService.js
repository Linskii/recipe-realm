import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.js';

export async function getUserByUsername(username) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = snapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() };
}

export async function getUserById(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  return { uid: userDoc.id, ...userDoc.data() };
}

export async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself');
  }

  const batch = writeBatch(db);

  // Create following relationship
  const followingRef = doc(db, 'users', followerId, 'following', followingId);
  batch.set(followingRef, {
    createdAt: serverTimestamp(),
  });

  // Create follower relationship
  const followerRef = doc(db, 'users', followingId, 'followers', followerId);
  batch.set(followerRef, {
    createdAt: serverTimestamp(),
  });

  // Update counts
  batch.update(doc(db, 'users', followerId), {
    followingCount: increment(1),
  });
  batch.update(doc(db, 'users', followingId), {
    followerCount: increment(1),
  });

  await batch.commit();
}

export async function unfollowUser(followerId, followingId) {
  const batch = writeBatch(db);

  // Remove following relationship
  const followingRef = doc(db, 'users', followerId, 'following', followingId);
  batch.delete(followingRef);

  // Remove follower relationship
  const followerRef = doc(db, 'users', followingId, 'followers', followerId);
  batch.delete(followerRef);

  // Update counts
  batch.update(doc(db, 'users', followerId), {
    followingCount: increment(-1),
  });
  batch.update(doc(db, 'users', followingId), {
    followerCount: increment(-1),
  });

  await batch.commit();
}

export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;

  const followingRef = doc(db, 'users', followerId, 'following', followingId);
  const followingDoc = await getDoc(followingRef);
  return followingDoc.exists();
}

export async function getUserPublicRecipes(userId) {
  const recipesRef = collection(db, 'recipes');
  const q = query(
    recipesRef,
    where('createdBy', '==', userId),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getFollowing(userId) {
  const followingRef = collection(db, 'users', userId, 'following');
  const snapshot = await getDocs(followingRef);

  const followingIds = snapshot.docs.map((doc) => doc.id);
  const followingUsers = [];

  for (const id of followingIds) {
    try {
      const user = await getUserById(id);
      followingUsers.push(user);
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
    }
  }

  return followingUsers;
}

export async function getFollowers(userId) {
  const followersRef = collection(db, 'users', userId, 'followers');
  const snapshot = await getDocs(followersRef);

  const followerIds = snapshot.docs.map((doc) => doc.id);
  const followers = [];

  for (const id of followerIds) {
    try {
      const user = await getUserById(id);
      followers.push(user);
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
    }
  }

  return followers;
}
