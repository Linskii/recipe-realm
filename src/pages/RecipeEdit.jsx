import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { getRecipe, createRecipe, updateRecipe } from '../services/recipeService.js';
import RecipeForm from '../components/recipes/RecipeForm.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Button from '../components/ui/Button.jsx';

export default function RecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const recipeData = await getRecipe(id);

      if (recipeData.createdBy !== user.uid) {
        const errorMsg = t('error.noPermission', { action: 'edit' });
        setError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      setRecipe(recipeData);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError(err.message || t('recipeEdit.loadError'));
      showToast(t('recipeEdit.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      if (isEditMode) {
        await updateRecipe(id, formData);
        showToast(t('recipeEdit.updateSuccess'), 'success');
        navigate(`/recipe/${id}`);
      } else {
        const newRecipeId = await createRecipe(formData, user.uid, user.username);
        showToast(t('recipeEdit.createSuccess'), 'success');
        navigate(`/recipe/${newRecipeId}`);
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      showToast(t(isEditMode ? 'recipeEdit.updateError' : 'recipeEdit.createError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-green-600">
                {t('app.name')}
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-green-600">
                {t('app.name')}
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard">
            <Button>{t('recipeView.goToDashboard')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-green-600">
              {t('app.name')}
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  {t('nav.dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t(isEditMode ? 'recipeEdit.editTitle' : 'recipeEdit.createTitle')}
          </h1>
          <p className="text-gray-600">
            {t(isEditMode ? 'recipeEdit.editSubtitle' : 'recipeEdit.createSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <RecipeForm initialData={recipe || {}} onSubmit={handleSubmit} loading={submitting} />
        </div>

        <div className="mt-6 text-center">
          <Link to={isEditMode ? `/recipe/${id}` : '/dashboard'}>
            <Button variant="outline">{t('common.cancel')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
