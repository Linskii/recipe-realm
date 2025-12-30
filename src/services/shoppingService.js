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
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';

export async function getShoppingList(userId) {
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');
  const q = query(shoppingRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addItem(userId, item) {
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');
  const newItem = {
    name: item.name,
    quantity: item.quantity || '',
    category: item.category || 'other',
    checked: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(shoppingRef, newItem);
  return docRef.id;
}

export async function toggleItem(userId, itemId) {
  const itemRef = doc(db, 'users', userId, 'shoppingList', itemId);
  const itemDoc = await getDoc(itemRef);

  if (!itemDoc.exists()) {
    throw new Error('Item not found');
  }

  await updateDoc(itemRef, {
    checked: !itemDoc.data().checked,
  });
}

export async function removeItem(userId, itemId) {
  const itemRef = doc(db, 'users', userId, 'shoppingList', itemId);
  await deleteDoc(itemRef);
}

export async function clearChecked(userId) {
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');
  const q = query(shoppingRef, where('checked', '==', true));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

export async function addRecipeIngredientsToList(userId, ingredients, servings, commonFoods) {
  if (!ingredients || ingredients.length === 0) {
    return;
  }

  const batch = writeBatch(db);
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');

  ingredients.forEach((ingredient) => {
    // Skip common pantry items
    const ingredientLower = ingredient.toLowerCase();
    const isCommon = commonFoods.some((food) => ingredientLower.includes(food.toLowerCase()));

    if (!isCommon) {
      const newItemRef = doc(shoppingRef);
      batch.set(newItemRef, {
        name: ingredient,
        quantity: servings ? `for ${servings} servings` : '',
        category: 'recipe',
        checked: false,
        createdAt: serverTimestamp(),
      });
    }
  });

  await batch.commit();
}

export function subscribeToShoppingList(userId, callback, onError) {
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');
  const q = query(shoppingRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    onError
  );
}

export async function addRecurringItem(userId, item, frequencyDays) {
  if (!userId || !item || !item.name) {
    throw new Error('User ID and item name are required');
  }

  if (!frequencyDays || frequencyDays < 1) {
    throw new Error('Frequency must be at least 1 day');
  }

  try {
    const recurringRef = collection(db, 'users', userId, 'recurringItems');
    const newItem = {
      name: item.name,
      quantity: item.quantity || '',
      category: item.category || 'other',
      frequencyDays: frequencyDays,
      lastAdded: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(recurringRef, newItem);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recurring item:', error);
    throw new Error('Failed to add recurring item');
  }
}

export async function removeRecurringItem(userId, itemId) {
  if (!userId || !itemId) {
    throw new Error('User ID and item ID are required');
  }

  try {
    const itemRef = doc(db, 'users', userId, 'recurringItems', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Error removing recurring item:', error);
    throw new Error('Failed to remove recurring item');
  }
}

export async function getRecurringItems(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const recurringRef = collection(db, 'users', userId, 'recurringItems');
    const snapshot = await getDocs(recurringRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting recurring items:', error);
    throw new Error('Failed to get recurring items');
  }
}

export async function checkAndAddDueRecurringItems(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const recurringItems = await getRecurringItems(userId);
    const now = new Date();
    const batch = writeBatch(db);
    let addedCount = 0;

    for (const item of recurringItems) {
      const lastAdded = item.lastAdded?.toDate() || new Date(0);
      const daysSinceAdded = (now - lastAdded) / (1000 * 60 * 60 * 24);

      if (daysSinceAdded >= item.frequencyDays) {
        const shoppingRef = collection(db, 'users', userId, 'shoppingList');
        const newItemRef = doc(shoppingRef);
        batch.set(newItemRef, {
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          checked: false,
          createdAt: serverTimestamp(),
        });

        const recurringItemRef = doc(db, 'users', userId, 'recurringItems', item.id);
        batch.update(recurringItemRef, {
          lastAdded: serverTimestamp(),
        });

        addedCount++;
      }
    }

    if (addedCount > 0) {
      await batch.commit();
    }

    return addedCount;
  } catch (error) {
    console.error('Error checking recurring items:', error);
    throw new Error('Failed to check recurring items');
  }
}

export async function addCommonFood(userId, foodName) {
  if (!userId || !foodName || !foodName.trim()) {
    throw new Error('User ID and food name are required');
  }

  try {
    const commonFoodsRef = collection(db, 'users', userId, 'commonFoods');
    const newFood = {
      name: foodName.trim().toLowerCase(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(commonFoodsRef, newFood);
    return docRef.id;
  } catch (error) {
    console.error('Error adding common food:', error);
    throw new Error('Failed to add common food');
  }
}

export async function removeCommonFood(userId, foodId) {
  if (!userId || !foodId) {
    throw new Error('User ID and food ID are required');
  }

  try {
    const foodRef = doc(db, 'users', userId, 'commonFoods', foodId);
    await deleteDoc(foodRef);
  } catch (error) {
    console.error('Error removing common food:', error);
    throw new Error('Failed to remove common food');
  }
}

export async function getCommonFoods(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const commonFoodsRef = collection(db, 'users', userId, 'commonFoods');
    const snapshot = await getDocs(commonFoodsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting common foods:', error);
    throw new Error('Failed to get common foods');
  }
}
