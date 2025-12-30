import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase.js';

export async function getUserFavorites(userId) {
  const favoritesRef = collection(db, 'users', userId, 'favorites');
  const q = query(favoritesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const favoriteRecipeIds = snapshot.docs.map((doc) => doc.id);

  if (favoriteRecipeIds.length === 0) {
    return [];
  }

  // Fetch all recipe details
  const recipes = [];
  for (const recipeId of favoriteRecipeIds) {
    try {
      const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
      if (recipeDoc.exists()) {
        recipes.push({ id: recipeDoc.id, ...recipeDoc.data() });
      }
    } catch (error) {
      console.error(`Error fetching recipe ${recipeId}:`, error);
    }
  }

  return recipes;
}

export async function addToFavorites(userId, recipeId) {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
  await setDoc(favoriteRef, {
    createdAt: serverTimestamp(),
  });
}

export async function removeFromFavorites(userId, recipeId) {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
  await deleteDoc(favoriteRef);
}

export async function isFavorite(userId, recipeId) {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
  const favoriteDoc = await getDoc(favoriteRef);
  return favoriteDoc.exists();
}

export function subscribeToUserFavorites(userId, callback, onError) {
  const favoritesRef = collection(db, 'users', userId, 'favorites');
  const q = query(favoritesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    async (snapshot) => {
      const favoriteRecipeIds = snapshot.docs.map((doc) => doc.id);

      if (favoriteRecipeIds.length === 0) {
        callback([]);
        return;
      }

      // Fetch all recipe details
      const recipes = [];
      for (const recipeId of favoriteRecipeIds) {
        try {
          const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
          if (recipeDoc.exists()) {
            recipes.push({ id: recipeDoc.id, ...recipeDoc.data() });
          }
        } catch (error) {
          console.error(`Error fetching recipe ${recipeId}:`, error);
        }
      }

      callback(recipes);
    },
    onError
  );
}
