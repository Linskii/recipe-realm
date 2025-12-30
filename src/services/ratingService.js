import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Get the user's rating for a recipe
 * @param {string} userId - The user ID
 * @param {string} recipeId - The recipe ID
 * @returns {Promise<number|null>} The user's rating (1-5) or null if not rated
 */
export async function getUserRating(userId, recipeId) {
  if (!userId || !recipeId) {
    return null;
  }

  try {
    const ratingRef = doc(db, 'recipes', recipeId, 'ratings', userId);
    const ratingDoc = await getDoc(ratingRef);

    if (ratingDoc.exists()) {
      return ratingDoc.data().rating;
    }

    return null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    throw new Error('Failed to get user rating');
  }
}

/**
 * Update a recipe's rating using a transaction
 * @param {string} recipeId - The recipe ID
 * @param {string} userId - The user ID
 * @param {number} newRating - The new rating (1-5)
 * @param {number|null} oldRating - The old rating (1-5) or null if first rating
 * @returns {Promise<void>}
 */
export async function updateRecipeRating(recipeId, userId, newRating, oldRating = null) {
  if (!recipeId || !userId) {
    throw new Error('Recipe ID and User ID are required');
  }

  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  try {
    await runTransaction(db, async (transaction) => {
      const recipeRef = doc(db, 'recipes', recipeId);
      const ratingRef = doc(db, 'recipes', recipeId, 'ratings', userId);

      const recipeDoc = await transaction.get(recipeRef);

      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found');
      }

      const recipeData = recipeDoc.data();
      let ratingSum = recipeData.ratingSum || 0;
      let ratingCount = recipeData.ratingCount || 0;

      // If user had a previous rating, subtract it
      if (oldRating !== null) {
        ratingSum -= oldRating;
        ratingCount -= 1;
      }

      // Add new rating
      ratingSum += newRating;
      ratingCount += 1;

      // Calculate new average
      const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

      // Update recipe with new rating stats
      transaction.update(recipeRef, {
        ratingSum,
        ratingCount,
        averageRating,
      });

      // Update user's rating
      transaction.set(ratingRef, {
        rating: newRating,
        userId,
        recipeId,
        createdAt: new Date(),
      });
    });
  } catch (error) {
    console.error('Error updating recipe rating:', error);
    throw new Error(error.message || 'Failed to update rating');
  }
}
