import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToShoppingList,
  addItem,
  toggleItem,
  removeItem,
  clearChecked,
  addRecipeIngredientsToList,
} from '../services/shoppingService.js';

export function useShoppingList(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShoppingList(
      userId,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const addShoppingItem = useCallback(
    async (item) => {
      if (!userId) return;
      try {
        await addItem(userId, item);
      } catch (err) {
        throw new Error(err.message || 'Failed to add item');
      }
    },
    [userId]
  );

  const toggleShoppingItem = useCallback(
    async (itemId) => {
      if (!userId) return;
      try {
        await toggleItem(userId, itemId);
      } catch (err) {
        throw new Error(err.message || 'Failed to toggle item');
      }
    },
    [userId]
  );

  const removeShoppingItem = useCallback(
    async (itemId) => {
      if (!userId) return;
      try {
        await removeItem(userId, itemId);
      } catch (err) {
        throw new Error(err.message || 'Failed to remove item');
      }
    },
    [userId]
  );

  const clearCheckedItems = useCallback(async () => {
    if (!userId) return;
    try {
      await clearChecked(userId);
    } catch (err) {
      throw new Error(err.message || 'Failed to clear checked items');
    }
  }, [userId]);

  const addRecipeIngredients = useCallback(
    async (ingredients, servings, commonFoods) => {
      if (!userId) return;
      try {
        await addRecipeIngredientsToList(userId, ingredients, servings, commonFoods);
      } catch (err) {
        throw new Error(err.message || 'Failed to add ingredients');
      }
    },
    [userId]
  );

  return {
    items,
    loading,
    error,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedItems,
    addRecipeIngredients,
  };
}
