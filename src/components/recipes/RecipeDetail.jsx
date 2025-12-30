import React, { useState, useEffect } from 'react';
import ServingsScaler from './ServingsScaler.jsx';
import StarRating from './StarRating.jsx';
import { scaleAllIngredients } from '../../utils/ingredientScaler.js';
import { getUserRating, updateRecipeRating } from '../../services/ratingService.js';
import { copyRecipe } from '../../services/recipeService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../ui/Button.jsx';

export default function RecipeDetail({ recipe, onRecipeUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const [currentServings, setCurrentServings] = useState(recipe.servings || 1);
  const [userRating, setUserRating] = useState(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

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
      showToast('Please log in to rate recipes', 'error');
      return;
    }

    if (user.uid === recipe.createdBy) {
      showToast('You cannot rate your own recipe', 'error');
      return;
    }

    setIsRatingLoading(true);
    try {
      await updateRecipeRating(recipe.id, user.uid, newRating, userRating);
      setUserRating(newRating);
      showToast('Rating submitted successfully', 'success');

      if (onRecipeUpdate) {
        onRecipeUpdate();
      }
    } catch (error) {
      console.error('Error rating recipe:', error);
      showToast(error.message || 'Failed to submit rating', 'error');
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleCopyRecipe = async () => {
    if (!user) {
      showToast('Please log in to save recipes', 'error');
      return;
    }

    if (user.uid === recipe.createdBy) {
      showToast('This is already your recipe', 'info');
      return;
    }

    setIsCopying(true);
    try {
      await copyRecipe(recipe.id, user.uid, user.username);
      showToast('Recipe saved to your recipes', 'success');
    } catch (error) {
      console.error('Error copying recipe:', error);
      showToast(error.message || 'Failed to save recipe', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareRecipe = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/recipe/${recipe.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Recipe link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy link', 'error');
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
            <div className="flex gap-2">
              <Button onClick={handleShareRecipe} variant="secondary" size="sm">
                Share
              </Button>
              {user && user.uid !== recipe.createdBy && (
                <Button onClick={handleCopyRecipe} disabled={isCopying} size="sm">
                  {isCopying ? 'Saving...' : 'Save to My Recipes'}
                </Button>
              )}
            </div>
          </div>
          {recipe.description && <p className="text-lg text-gray-600">{recipe.description}</p>}
        </div>

        <div className="mb-6 text-sm text-gray-500">
          <span>by @{recipe.createdByUsername || 'Unknown'}</span>
          {recipe.copiedFrom && recipe.originalCreator && (
            <span className="ml-2 text-gray-400">
              (adapted from @{recipe.originalCreator})
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
                <div className="text-xs text-gray-500">Total Time</div>
                <div className="font-semibold text-gray-900">{totalTime} min</div>
              </div>
            </div>
          )}

          {recipe.prepTime > 0 && (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">Prep Time</div>
                <div className="font-semibold text-gray-900">{recipe.prepTime} min</div>
              </div>
            </div>
          )}

          {recipe.cookTime > 0 && (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-gray-500">Cook Time</div>
                <div className="font-semibold text-gray-900">{recipe.cookTime} min</div>
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
                <div className="text-xs text-gray-500">Difficulty</div>
                <div className="font-semibold text-gray-900">{recipe.difficulty}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="space-y-4">
            {recipe.averageRating > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">Average Rating</div>
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
                  {userRating ? 'Your Rating' : 'Rate this Recipe'}
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
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Tags</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Source</h3>
            <p className="text-gray-600">{recipe.source}</p>
          </div>
        )}
      </div>
    </div>
  );
}
