import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { getPublicRecipes, getMyRecipes } from '../services/recipeService.js';
import { calculateRecipeMatch } from '../utils/fuzzyMatch.js';
import RecipeCard from '../components/recipes/RecipeCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function LeftoverScanner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [user]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const [publicRecipes, userRecipes] = await Promise.all([
        getPublicRecipes(),
        user ? getMyRecipes(user.uid) : Promise.resolve([]),
      ]);

      // Combine and deduplicate recipes
      const allRecipes = [...publicRecipes];
      const recipeIds = new Set(publicRecipes.map((r) => r.id));

      userRecipes.forEach((recipe) => {
        if (!recipeIds.has(recipe.id)) {
          allRecipes.push(recipe);
        }
      });

      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      showToast(t('error.failedToLoadRecipes'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();

    if (!newIngredient.trim()) {
      showToast(t('validation.ingredientRequired'), 'error');
      return;
    }

    if (availableIngredients.includes(newIngredient.trim().toLowerCase())) {
      showToast(t('leftoverScanner.ingredientExists'), 'info');
      return;
    }

    setAvailableIngredients([...availableIngredients, newIngredient.trim().toLowerCase()]);
    setNewIngredient('');
  };

  const handleRemoveIngredient = (index) => {
    setAvailableIngredients(availableIngredients.filter((_, i) => i !== index));
  };

  const handleScanRecipes = () => {
    if (availableIngredients.length === 0) {
      showToast(t('leftoverScanner.addIngredientsPrompt'), 'error');
      return;
    }

    setScanning(true);

    try {
      const matches = recipes
        .map((recipe) => {
          const matchResult = calculateRecipeMatch(recipe, availableIngredients);
          return {
            ...recipe,
            matchPercentage: matchResult.percentage,
            matchedCount: matchResult.matchedCount,
            totalCount: matchResult.totalCount,
          };
        })
        .filter((recipe) => recipe.matchPercentage >= 80)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      setMatchedRecipes(matches);

      if (matches.length === 0) {
        showToast(t('leftoverScanner.noMatches'), 'info');
      } else {
        showToast(t('success.recipesFound', { count: matches.length }), 'success');
      }
    } catch (error) {
      console.error('Error scanning recipes:', error);
      showToast(t('error.failedToScan'), 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleClearAll = () => {
    setAvailableIngredients([]);
    setMatchedRecipes([]);
  };

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
                {t('nav.dashboard')}
              </Link>
              <Link to="/browse" className="text-gray-600 hover:text-gray-900">
                {t('nav.browse')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('leftoverScanner.title')}</h1>
          <p className="text-gray-600">
            {t('leftoverScanner.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('leftoverScanner.yourIngredients')}</h2>

              <form onSubmit={handleAddIngredient} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder={t('leftoverScanner.placeholder')}
                  />
                  <Button type="submit">{t('common.add')}</Button>
                </div>
              </form>

              {availableIngredients.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {availableIngredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{ingredient}</span>
                        <button
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-green-600 hover:text-green-800"
                          aria-label="Remove ingredient"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('leftoverScanner.ingredientsAdded', { count: availableIngredients.length })}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleScanRecipes}
                  disabled={availableIngredients.length === 0 || scanning}
                  className="w-full"
                >
                  {scanning ? t('leftoverScanner.scanning') : t('leftoverScanner.scanButton')}
                </Button>
                {availableIngredients.length > 0 && (
                  <Button variant="secondary" onClick={handleClearAll} className="w-full">
                    {t('leftoverScanner.clearAll')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : matchedRecipes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {availableIngredients.length === 0
                    ? t('leftoverScanner.addIngredientsPrompt')
                    : t('leftoverScanner.noMatches')}
                </h3>
                <p className="text-gray-600">
                  {availableIngredients.length === 0
                    ? t('leftoverScanner.description')
                    : t('leftoverScanner.noMatchesDescription')}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('leftoverScanner.matchingRecipes')} ({matchedRecipes.length})
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t('leftoverScanner.recipesWith80Percent')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedRecipes.map((recipe) => (
                    <div key={recipe.id} className="relative">
                      <RecipeCard recipe={recipe} />
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {recipe.matchPercentage.toFixed(0)}% {t('common.match')}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        {t('leftoverScanner.ingredientMatch', { matched: recipe.matchedCount, total: recipe.totalCount })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
