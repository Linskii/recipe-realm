import React, { useState, useEffect } from 'react';
import ServingsScaler from './ServingsScaler.jsx';
import StarRating from './StarRating.jsx';
import { scaleAllIngredients } from '../../utils/ingredientScaler.js';
import { getUserRating, updateRecipeRating } from '../../services/ratingService.js';
import { copyRecipe } from '../../services/recipeService.js';
import { addRecipeIngredientsToList, getCommonFoods } from '../../services/shoppingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import Button from '../ui/Button.jsx';

export default function RecipeDetail({ recipe, onRecipeUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const [currentServings, setCurrentServings] = useState(recipe.servings || 1);
  const [userRating, setUserRating] = useState(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);

  const scaledIngredients = recipe.ingredients
    ? scaleAllIngredients(recipe.ingredients, recipe.servings || 1, currentServings)
    : [];

  useEffect(() => {
    if (user && recipe.id) {
      loadUserRating();
    }
  }, [user, recipe.id]);

  const loadUserRating = async () => {
    try {
      const rating = await getUserRating(user.uid, recipe.id);
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleRate = async (newRating) => {
    if (!user) {
      showToast(t('recipeDetail.loginToRate'), 'error');
      return;
    }

    if (user.uid === recipe.createdBy) {
      showToast(t('recipeDetail.cannotRateOwnRecipe'), 'error');
      return;
    }

    setIsRatingLoading(true);
    try {
      await updateRecipeRating(recipe.id, user.uid, newRating, userRating);
      setUserRating(newRating);
      showToast(t('recipeDetail.ratingSubmitted'), 'success');

      if (onRecipeUpdate) {
        onRecipeUpdate();
      }
    } catch (error) {
      console.error('Error rating recipe:', error);
      showToast(error.message || t('recipeDetail.ratingFailed'), 'error');
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleCopyRecipe = async () => {
    if (!user) {
      showToast(t('recipeDetail.loginToSave'), 'error');
      return;
    }

    if (user.uid === recipe.createdBy) {
      showToast(t('recipeDetail.alreadyYourRecipe'), 'info');
      return;
    }

    setIsCopying(true);
    try {
      await copyRecipe(recipe.id, user.uid, user.username);
      showToast(t('recipeDetail.recipeSaved'), 'success');
    } catch (error) {
      console.error('Error copying recipe:', error);
      showToast(error.message || t('recipeDetail.saveFailed'), 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareRecipe = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/recipe/${recipe.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(t('recipeDetail.linkCopied'), 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast(t('recipeDetail.copyFailed'), 'error');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!user) {
      showToast(t('recipeDetail.loginToUseList'), 'error');
      return;
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      showToast(t('recipeDetail.noIngredients'), 'info');
      return;
    }

    setIsAddingToList(true);
    try {
      // Get user's common foods to filter them out
      const commonFoods = await getCommonFoods(user.uid);
      const commonFoodNames = commonFoods.map((food) => food.name);

      // Extract ingredient names from the scaled ingredients
      const ingredientNames = scaledIngredients.map((ing) => ing.name);

      // Add ingredients to shopping list
      await addRecipeIngredientsToList(user.uid, ingredientNames, currentServings, commonFoodNames);

      showToast(t('recipeDetail.ingredientsAdded'), 'success');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      showToast(error.message || t('recipeDetail.addToListFailed'), 'error');
    } finally {
      setIsAddingToList(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
        <span className="text-9xl">🥗</span>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button onClick={handleShareRecipe} variant="secondary" size="sm">
                {t('recipeDetail.share')}
              </Button>
              {user && (
                <Button onClick={handleAddToShoppingList} disabled={isAddingToList} variant="secondary" size="sm">
                  {isAddingToList ? t('recipeDetail.adding') : t('recipe.addToShoppingList')}
                </Button>
              )}
              {user && user.uid !== recipe.createdBy && (
                <Button onClick={handleCopyRecipe} disabled={isCopying} size="sm">
                  {isCopying ? t('recipeDetail.saving') : t('recipeDetail.saveToMyRecipes')}
                </Button>
              )}
            </div>
          </div>
          {recipe.description && <p className="text-lg text-gray-600">{recipe.description}</p>}
        </div>

        <div className="mb-6 text-sm text-gray-500">
          <span>{t('recipe.by')} @{recipe.createdByUsername || t('common.unknown')}</span>
          {recipe.copiedFrom && recipe.originalCreator && (
            <span className="ml-2 text-gray-400">
              ({t('recipeDetail.adaptedFrom')} @{recipe.originalCreator})
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
          {totalTime > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-xs text-gray-500">{t('recipe.totalTime')}</div>
                <div className="font-semibold text-gray-900">{totalTime} {t('recipeDetail.min')}</div>
              </div>
            </div>
          )}

          {recipe.prepTime > 0 && (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">{t('recipeDetail.prepTime')}</div>
                <div className="font-semibold text-gray-900">{recipe.prepTime} {t('recipeDetail.min')}</div>
              </div>
            </div>
          )}

          {recipe.cookTime > 0 && (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">{t('recipeDetail.cookTime')}</div>
                <div className="font-semibold text-gray-900">{recipe.cookTime} {t('recipeDetail.min')}</div>
              </div>
            </div>
          )}

          {recipe.servings && (
            <ServingsScaler
              currentServings={currentServings}
              originalServings={recipe.servings}
              onServingsChange={setCurrentServings}
            />
          )}

          {recipe.difficulty && (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">{t('recipe.difficulty')}</div>
                <div className="font-semibold text-gray-900">{t(`difficulty.${recipe.difficulty.toLowerCase()}`)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="space-y-4">
            {recipe.averageRating > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">{t('recipeDetail.averageRating')}</div>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={recipe.averageRating}
                    readonly={true}
                    size="lg"
                    showCount={true}
                    ratingCount={recipe.ratingCount}
                  />
                  <span className="text-2xl font-bold text-gray-900">
                    {recipe.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {user && user.uid !== recipe.createdBy && (
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {userRating ? t('recipeDetail.yourRating') : t('recipeDetail.rateThisRecipe')}
                </div>
                <StarRating
                  rating={userRating || 0}
                  onRate={handleRate}
                  readonly={isRatingLoading}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('recipe.tags')}</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {scaledIngredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('recipe.ingredients')}</h2>
            <ul className="space-y-2">
              {scaledIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('recipe.instructions')}</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700 pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {recipe.source && (
          <div className="mb-6 pb-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('recipe.source')}</h3>
            <p className="text-gray-600">{recipe.source}</p>
          </div>
        )}
      </div>
    </div>
  );
}
