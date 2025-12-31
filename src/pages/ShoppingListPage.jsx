import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
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
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Modal from '../components/ui/Modal.jsx';
import AppNav from '../components/layout/AppNav.jsx';

export default function ShoppingListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
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
      showToast(t('validation.itemNameRequired'), 'error');
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
      showToast(t('success.recurringAdded'), 'success');
      setNewRecurringName('');
      setNewRecurringQuantity('');
      setNewRecurringFrequency(7);
      setShowRecurringModal(false);
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error adding recurring item:', error);
      showToast(error.message || t('error.failedToAddRecurring'), 'error');
    }
  };

  const handleRemoveRecurring = async (itemId) => {
    try {
      await removeRecurringItem(user.uid, itemId);
      showToast(t('success.recurringRemoved'), 'success');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error removing recurring item:', error);
      showToast(error.message || t('error.failedToRemoveRecurring'), 'error');
    }
  };

  const handleAddCommonFood = async () => {
    if (!newCommonFood.trim()) {
      showToast(t('validation.foodNameRequired'), 'error');
      return;
    }

    try {
      await addCommonFood(user.uid, newCommonFood);
      showToast(t('success.commonFoodAdded'), 'success');
      setNewCommonFood('');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error adding common food:', error);
      showToast(error.message || t('error.failedToAddCommonFood'), 'error');
    }
  };

  const handleRemoveCommonFood = async (foodId) => {
    try {
      await removeCommonFood(user.uid, foodId);
      showToast(t('success.commonFoodRemoved'), 'success');
      loadRecurringAndCommonFoods();
    } catch (error) {
      console.error('Error removing common food:', error);
      showToast(error.message || t('error.failedToRemoveCommonFood'), 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItemName.trim()) {
      showToast(t('validation.itemNameRequired'), 'error');
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
      showToast(t('success.itemAdded'), 'success');
    } catch (error) {
      console.error('Failed to add item:', error);
      showToast(error.message || t('error.failedToAddItem'), 'error');
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      await toggleShoppingItem(itemId);
    } catch (error) {
      console.error('Failed to toggle item:', error);
      showToast(error.message || t('error.failedToToggleItem'), 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeShoppingItem(itemId);
      showToast(t('success.itemRemoved'), 'success');
    } catch (error) {
      console.error('Failed to remove item:', error);
      showToast(error.message || t('error.failedToRemoveItem'), 'error');
    }
  };

  const handleClearChecked = async () => {
    const checkedCount = items.filter((item) => item.checked).length;
    if (checkedCount === 0) {
      showToast(t('shoppingList.noCheckedItems'), 'info');
      return;
    }

    try {
      await clearCheckedItems();
      showToast(t('success.itemsCleared', { count: checkedCount }), 'success');
    } catch (error) {
      console.error('Failed to clear checked items:', error);
      showToast(error.message || t('error.failedToClearItems'), 'error');
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('shoppingList.title')}</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowRecurringModal(true)} variant="secondary" size="sm">
              {t('shoppingList.recurringItems')}
            </Button>
            <Button onClick={() => setShowCommonFoodsModal(true)} variant="secondary" size="sm">
              {t('shoppingList.commonFoods')}
            </Button>
            {checkedItems.length > 0 && (
              <Button onClick={handleClearChecked} variant="secondary" size="sm">
                {t('shoppingList.clearChecked')} ({checkedItems.length})
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('shoppingList.addItem')}</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('shoppingList.itemName')}
                </label>
                <Input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t('shoppingList.itemNamePlaceholder')}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('shoppingList.quantity')}
                </label>
                <Input
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder={t('shoppingList.quantityPlaceholder')}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('shoppingList.category')}
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="produce">{t('shoppingList.categories.produce')}</option>
                  <option value="dairy">{t('shoppingList.categories.dairy')}</option>
                  <option value="pantry">{t('shoppingList.categories.pantry')}</option>
                  <option value="frozen">{t('shoppingList.categories.frozen')}</option>
                  <option value="recipe">{t('shoppingList.categories.recipe')}</option>
                  <option value="other">{t('shoppingList.categories.other')}</option>
                </select>
              </div>
            </div>
            <Button type="submit">{t('shoppingList.addToList')}</Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('shoppingList.noItems')}</h3>
            <p className="text-gray-600">{t('shoppingList.startAdding')}</p>
          </div>
        ) : (
          <>
            {uncheckedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">{t('shoppingList.toBuy')} ({uncheckedItems.length})</h2>
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
                  {t('shoppingList.checked')} ({checkedItems.length})
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
        title={t('shoppingList.recurringItems')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {t('shoppingList.recurringDescription')}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shoppingList.itemName')}</label>
                <Input
                  type="text"
                  value={newRecurringName}
                  onChange={(e) => setNewRecurringName(e.target.value)}
                  placeholder={t('shoppingList.recurringNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shoppingList.quantity')}</label>
                <Input
                  type="text"
                  value={newRecurringQuantity}
                  onChange={(e) => setNewRecurringQuantity(e.target.value)}
                  placeholder={t('shoppingList.recurringQuantityPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shoppingList.frequency')}</label>
                <Input
                  type="number"
                  value={newRecurringFrequency}
                  onChange={(e) => setNewRecurringFrequency(parseInt(e.target.value) || 7)}
                  min="1"
                />
              </div>
              <Button onClick={handleAddRecurring}>{t('shoppingList.addRecurringItem')}</Button>
            </div>
          </div>

          {recurringItems.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('shoppingList.yourRecurringItems')}</h3>
              <div className="space-y-2">
                {recurringItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {t('shoppingList.every')} {item.frequencyDays} {t(item.frequencyDays !== 1 ? 'shoppingList.days' : 'shoppingList.day')}
                        {item.quantity && ` • ${item.quantity}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRecurring(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('common.remove')}
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
        title={t('shoppingList.commonFoods')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {t('shoppingList.commonFoodsDescription')}
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newCommonFood}
                onChange={(e) => setNewCommonFood(e.target.value)}
                placeholder={t('shoppingList.commonFoodsPlaceholder')}
              />
              <Button onClick={handleAddCommonFood}>{t('common.add')}</Button>
            </div>
          </div>

          {commonFoods.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('shoppingList.yourCommonFoods')}</h3>
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
  const { t } = useTranslation();
  const categoryColors = {
    produce: 'bg-green-100 text-green-800',
    dairy: 'bg-blue-100 text-blue-800',
    pantry: 'bg-yellow-100 text-yellow-800',
    frozen: 'bg-cyan-100 text-cyan-800',
    recipe: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      produce: t('shoppingList.categories.produce'),
      dairy: t('shoppingList.categories.dairy'),
      pantry: t('shoppingList.categories.pantry'),
      frozen: t('shoppingList.categories.frozen'),
      recipe: t('shoppingList.categories.recipe'),
      other: t('shoppingList.categories.other'),
    };
    return categoryMap[category] || category;
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
        {getCategoryLabel(item.category)}
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
