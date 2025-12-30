import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '../services/favoritesService.js';

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserFavorites(
      userId,
      (data) => {
        setFavorites(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const toggleFavorite = useCallback(
    async (recipeId) => {
      if (!userId) return;

      try {
        const isCurrentlyFavorite = await isFavorite(userId, recipeId);
        if (isCurrentlyFavorite) {
          await removeFromFavorites(userId, recipeId);
        } else {
          await addToFavorites(userId, recipeId);
        }
      } catch (err) {
        throw new Error(err.message || 'Failed to toggle favorite');
      }
    },
    [userId]
  );

  const checkIsFavorite = useCallback(
    async (recipeId) => {
      if (!userId) return false;
      return await isFavorite(userId, recipeId);
    },
    [userId]
  );

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    checkIsFavorite,
  };
}
