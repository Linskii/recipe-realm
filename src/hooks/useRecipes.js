import { useState, useEffect } from 'react';
import { subscribeToUserRecipes } from '../services/recipeService.js';

export function useRecipes(userId, filters = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserRecipes(
      userId,
      (data) => {
        setRecipes(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, JSON.stringify(filters)]);

  return { recipes, loading, error };
}
