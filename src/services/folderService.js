import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Get all folders for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of folder objects
 */
export async function getUserFolders(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const foldersRef = collection(db, 'users', userId, 'folders');
    const q = query(foldersRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user folders:', error);
    throw new Error('Failed to get folders');
  }
}

/**
 * Create a new folder
 * @param {string} userId - The user ID
 * @param {string} folderName - The name of the folder
 * @returns {Promise<string>} The new folder ID
 */
export async function createFolder(userId, folderName) {
  if (!userId || !folderName || !folderName.trim()) {
    throw new Error('User ID and folder name are required');
  }

  try {
    const foldersRef = collection(db, 'users', userId, 'folders');
    const folderDoc = await addDoc(foldersRef, {
      name: folderName.trim(),
      recipeIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return folderDoc.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder');
  }
}

/**
 * Add a recipe to a folder
 * @param {string} userId - The user ID
 * @param {string} folderId - The folder ID
 * @param {string} recipeId - The recipe ID
 * @returns {Promise<void>}
 */
export async function addRecipeToFolder(userId, folderId, recipeId) {
  if (!userId || !folderId || !recipeId) {
    throw new Error('User ID, folder ID, and recipe ID are required');
  }

  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await updateDoc(folderRef, {
      recipeIds: arrayUnion(recipeId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding recipe to folder:', error);
    throw new Error('Failed to add recipe to folder');
  }
}

/**
 * Remove a recipe from a folder
 * @param {string} userId - The user ID
 * @param {string} folderId - The folder ID
 * @param {string} recipeId - The recipe ID
 * @returns {Promise<void>}
 */
export async function removeRecipeFromFolder(userId, folderId, recipeId) {
  if (!userId || !folderId || !recipeId) {
    throw new Error('User ID, folder ID, and recipe ID are required');
  }

  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await updateDoc(folderRef, {
      recipeIds: arrayRemove(recipeId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error removing recipe from folder:', error);
    throw new Error('Failed to remove recipe from folder');
  }
}

/**
 * Delete a folder
 * @param {string} userId - The user ID
 * @param {string} folderId - The folder ID
 * @returns {Promise<void>}
 */
export async function deleteFolder(userId, folderId) {
  if (!userId || !folderId) {
    throw new Error('User ID and folder ID are required');
  }

  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await deleteDoc(folderRef);
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw new Error('Failed to delete folder');
  }
}

/**
 * Rename a folder
 * @param {string} userId - The user ID
 * @param {string} folderId - The folder ID
 * @param {string} newName - The new folder name
 * @returns {Promise<void>}
 */
export async function renameFolder(userId, folderId, newName) {
  if (!userId || !folderId || !newName || !newName.trim()) {
    throw new Error('User ID, folder ID, and new name are required');
  }

  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await updateDoc(folderRef, {
      name: newName.trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error renaming folder:', error);
    throw new Error('Failed to rename folder');
  }
}
