import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useShoppingList } from '../hooks/useShoppingList.js';
import {
  getRecurringItems,
  addRecurringItem,
  removeRecurringItem,
  checkAndAddDueRecurringItems,
  getCommonFoods,
  addCommonFood,
  removeCommonFood,
} from '../services/shoppingService.js';
import { logout } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Modal from '../components/ui/Modal.jsx';

export default function ShoppingListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    items,
    loading,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedItems,
  } = useShoppingList(user?.uid);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [recurringItems, setRecurringItems] = useState([]);
  const [commonFoods, setCommonFoods] = useState([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showCommonFoodsModal, setShowCommonFoodsModal] = useState(false);
  const [newRecurringName, setNewRecurringName] = useState('');
  const [newRecurringQuantity, setNewRecurringQuantity] = useState('');
  const [newRecurringFrequency, setNewRecurringFrequency] = useState(7);
  const [newCommonFood, setNewCommonFood] = useState('');

  useEffect(() => {
    if (user) {
      loadRecurringAndCommonFoods();
      checkRecurringItems();
    }
  }, [user]);

  const loadRecurringAndCommonFoods = async () => {
    try {
      const [recurring, common] = await Promise.all([
        getRecurringItems(user.uid),
        getCommonFoods(user.uid),
      ]);
      setRecurringItems(recurring);
      setCommonFoods(common);
    } catch (error) {
      console.error('Error loading recurring items and common foods:', error);
    }
  };

  const checkRecurringItems = async () => {
    try {
      const addedCount = await checkAndAddDueRecurringItems(user.uid);
      if (addedCount > 0) {
        showToast(`Added ${addedCount} recurring item(s) to your list`, 'success');
      }
    } catch (error) {
      console.error('Error checking recurring items:', error);
    }
  };

  const handleAddRecurring = async () => {
    if (!newRecurringName.trim()) {
      showToast('Please enter an item name', 'error');
      return;
    }

    try {
      await addRecurringItem(
        user.uid,
        {
          name: newRecurringName.trim(),
          quantity: newRecurringQuantity.trim(),
          category: 'other',
        },
        newRecurringFrequency
      );
      showToast('Recurring item added', 'success');
      setNewRecurringName('');
      setNewRecurringQuantity('');
      setNewRecurringFrequency(7);
      setShowRecurringModal(false);
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error adding recurring item:', error);
      showToast(error.message || 'Failed to add recurring item', 'error');
    }
  };

  const handleRemoveRecurring = async (itemId) => {
    try {
      await removeRecurringItem(user.uid, itemId);
      showToast('Recurring item removed', 'success');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error removing recurring item:', error);
      showToast(error.message || 'Failed to remove recurring item', 'error');
    }
  };

  const handleAddCommonFood = async () => {
    if (!newCommonFood.trim()) {
      showToast('Please enter a food name', 'error');
      return;
    }

    try {
      await addCommonFood(user.uid, newCommonFood);
      showToast('Common food added', 'success');
      setNewCommonFood('');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error adding common food:', error);
      showToast(error.message || 'Failed to add common food', 'error');
    }
  };

  const handleRemoveCommonFood = async (foodId) => {
    try {
      await removeCommonFood(user.uid, foodId);
      showToast('Common food removed', 'success');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error removing common food:', error);
      showToast(error.message || 'Failed to remove common food', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Failed to log out', 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItemName.trim()) {
      showToast('Please enter an item name', 'error');
      return;
    }

    try {
      await addShoppingItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
        category: newItemCategory,
      });
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCategory('other');
      showToast('Item added to shopping list', 'success');
    } catch (error) {
      console.error('Failed to add item:', error);
      showToast(error.message || 'Failed to add item', 'error');
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      await toggleShoppingItem(itemId);
    } catch (error) {
      console.error('Failed to toggle item:', error);
      showToast(error.message || 'Failed to toggle item', 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeShoppingItem(itemId);
      showToast('Item removed', 'success');
    } catch (error) {
      console.error('Failed to remove item:', error);
      showToast(error.message || 'Failed to remove item', 'error');
    }
  };

  const handleClearChecked = async () => {
    const checkedCount = items.filter((item) => item.checked).length;
    if (checkedCount === 0) {
      showToast('No checked items to clear', 'info');
      return;
    }

    try {
      await clearCheckedItems();
      showToast(`Cleared ${checkedCount} checked item(s)`, 'success');
    } catch (error) {
      console.error('Failed to clear checked items:', error);
      showToast(error.message || 'Failed to clear checked items', 'error');
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-green-600">
              Recipe Realm
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/my-recipes" className="text-gray-600 hover:text-gray-900">
                My Recipes
              </Link>
              <Link to="/browse" className="text-gray-600 hover:text-gray-900">
                Browse
              </Link>
              <span className="text-gray-700">@{user?.username}</span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowRecurringModal(true)} variant="secondary" size="sm">
              Recurring Items
            </Button>
            <Button onClick={() => setShowCommonFoodsModal(true)} variant="secondary" size="sm">
              Common Foods
            </Button>
            {checkedItems.length > 0 && (
              <Button onClick={handleClearChecked} variant="secondary" size="sm">
                Clear Checked ({checkedItems.length})
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <Input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Tomatoes"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (optional)
                </label>
                <Input
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="e.g., 2 lbs"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="pantry">Pantry</option>
                  <option value="frozen">Frozen</option>
                  <option value="recipe">Recipe</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <Button type="submit">Add to List</Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600">Add items to your shopping list above.</p>
          </div>
        ) : (
          <>
            {uncheckedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">To Buy ({uncheckedItems.length})</h2>
                <div className="space-y-2">
                  {uncheckedItems.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {checkedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-500">
                  Checked ({checkedItems.length})
                </h2>
                <div className="space-y-2">
                  {checkedItems.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        title="Recurring Items"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Add items that you buy regularly. They'll be automatically added to your shopping list based on the frequency you set.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <Input
                  type="text"
                  value={newRecurringName}
                  onChange={(e) => setNewRecurringName(e.target.value)}
                  placeholder="e.g., Milk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (optional)</label>
                <Input
                  type="text"
                  value={newRecurringQuantity}
                  onChange={(e) => setNewRecurringQuantity(e.target.value)}
                  placeholder="e.g., 1 gallon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (days)</label>
                <Input
                  type="number"
                  value={newRecurringFrequency}
                  onChange={(e) => setNewRecurringFrequency(parseInt(e.target.value) || 7)}
                  min="1"
                />
              </div>
              <Button onClick={handleAddRecurring}>Add Recurring Item</Button>
            </div>
          </div>

          {recurringItems.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Recurring Items</h3>
              <div className="space-y-2">
                {recurringItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Every {item.frequencyDays} day{item.frequencyDays !== 1 ? 's' : ''}
                        {item.quantity && ` • ${item.quantity}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRecurring(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showCommonFoodsModal}
        onClose={() => setShowCommonFoodsModal(false)}
        title="Common Foods"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Add foods you always have on hand. These won't be added to your shopping list when you add recipes.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newCommonFood}
                onChange={(e) => setNewCommonFood(e.target.value)}
                placeholder="e.g., salt, pepper, oil"
              />
              <Button onClick={handleAddCommonFood}>Add</Button>
            </div>
          </div>

          {commonFoods.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Common Foods</h3>
              <div className="flex flex-wrap gap-2">
                {commonFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{food.name}</span>
                    <button
                      onClick={() => handleRemoveCommonFood(food.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ShoppingListItem({ item, onToggle, onRemove }) {
  const categoryColors = {
    produce: 'bg-green-100 text-green-800',
    dairy: 'bg-blue-100 text-blue-800',
    pantry: 'bg-yellow-100 text-yellow-800',
    frozen: 'bg-cyan-100 text-cyan-800',
    recipe: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        item.checked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
      />
      <div className="flex-1">
        <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.name}
        </div>
        {item.quantity && (
          <div className={`text-sm ${item.checked ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.quantity}
          </div>
        )}
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          categoryColors[item.category] || categoryColors.other
        }`}
      >
        {item.category}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-600 hover:text-red-800 p-1"
        aria-label="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
