import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { getPublicRecipes } from '../services/recipeService.js';
import { PREDEFINED_TAGS } from '../constants/tags.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import RecipeCard from '../components/recipes/RecipeCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import AppNav from '../components/layout/AppNav.jsx';

export default function Browse() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await getPublicRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      showToast(t('error.failedToLoadRecipes'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedTags.every((tag) => recipe.tags && recipe.tags.includes(tag))
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        break;
      case 'highest-rated':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'quickest':
        sorted.sort((a, b) => {
          const timeA = (a.prepTime || 0) + (a.cookTime || 0);
          const timeB = (b.prepTime || 0) + (b.cookTime || 0);
          return timeA - timeB;
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [recipes, searchTerm, selectedTags, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('browse.title')}</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('browse.search')}
              </label>
              <Input
                type="text"
                placeholder={t('browse.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">{t('browse.sortNewest')}</option>
                <option value="highest-rated">{t('browse.sortHighestRated')}</option>
                <option value="quickest">{t('browse.sortQuickest')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.filterByTags')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-2 text-sm text-green-600 hover:text-green-700"
              >
                {t('common.clearAllFilters')}
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {t(recipes.length === 1 ? 'common.showing' : 'common.showing_plural', {
            count: filteredAndSortedRecipes.length,
            total: recipes.length
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAndSortedRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('browse.noRecipesFound')}</h3>
            <p className="text-gray-600">
              {recipes.length === 0
                ? t('browse.noPublicRecipes')
                : t('browse.tryAdjustingFilters')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
