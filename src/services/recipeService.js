import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.js';

export async function createRecipe(recipeData, userId, username) {
  const recipeRef = await addDoc(collection(db, 'recipes'), {
    ...recipeData,
    imageUrl: null, // Always null - images not supported
    createdBy: userId,
    createdByUsername: username,
    copiedFrom: null,
    ratingSum: 0,
    ratingCount: 0,
    averageRating: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user recipe count
  await updateDoc(doc(db, 'users', userId), {
    recipeCount: increment(1),
  });

  return recipeRef.id;
}

export async function getRecipe(recipeId) {
  const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));

  if (!recipeDoc.exists()) {
    throw new Error('Recipe not found');
  }

  return { id: recipeDoc.id, ...recipeDoc.data() };
}

export async function updateRecipe(recipeId, updates) {
  await updateDoc(doc(db, 'recipes', recipeId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRecipe(recipeId, userId) {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'recipes', recipeId));
  batch.update(doc(db, 'users', userId), {
    recipeCount: increment(-1),
  });

  await batch.commit();
}

export function subscribeToUserRecipes(userId, callback, onError) {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(recipes);
    },
    onError
  );
}

export async function getPublicRecipes(filters = {}) {
  const recipesRef = collection(db, 'recipes');
  let q = query(recipesRef, where('isPublic', '==', true), orderBy('createdAt', 'desc'));

  if (filters.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getMyRecipes(userId) {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function copyRecipe(recipeId, userId, username) {
  // Get the original recipe
  const originalRecipe = await getRecipe(recipeId);

  if (!originalRecipe) {
    throw new Error('Recipe not found');
  }

  // Create a copy with reference to original
  const copiedRecipe = {
    title: originalRecipe.title,
    description: originalRecipe.description,
    ingredients: originalRecipe.ingredients,
    instructions: originalRecipe.instructions,
    servings: originalRecipe.servings,
    prepTime: originalRecipe.prepTime,
    cookTime: originalRecipe.cookTime,
    difficulty: originalRecipe.difficulty,
    tags: originalRecipe.tags,
    source: originalRecipe.source,
    isPublic: false,
    copiedFrom: recipeId,
    originalCreator: originalRecipe.createdByUsername,
  };

  // Create the new recipe
  const newRecipeId = await createRecipe(copiedRecipe, userId, username);

  return newRecipeId;
}
