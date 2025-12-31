import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { getMyRecipes } from '../services/recipeService.js';
import {
  getUserFolders,
  createFolder,
  deleteFolder,
  addRecipeToFolder,
  removeRecipeFromFolder,
} from '../services/folderService.js';
import RecipeCard from '../components/recipes/RecipeCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import AppNav from '../components/layout/AppNav.jsx';

export default function MyRecipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recipesData, foldersData] = await Promise.all([
        getMyRecipes(user.uid),
        getUserFolders(user.uid),
      ]);
      setRecipes(recipesData);
      setFolders(foldersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || t('error.failedToLoadData'));
      showToast(t('error.failedToLoadData'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast(t('validation.folderNameRequired'), 'error');
      return;
    }

    setIsCreatingFolder(true);
    try {
      await createFolder(user.uid, newFolderName);
      showToast(t('success.folderCreated'), 'success');
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast(error.message || t('myRecipes.folderCreateFailed'), 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm(t('myRecipes.deleteFolderConfirm'))) {
      return;
    }

    try {
      await deleteFolder(user.uid, folderId);
      showToast(t('success.folderDeleted'), 'success');
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      showToast(error.message || t('myRecipes.folderDeleteFailed'), 'error');
    }
  };

  const handleAddToFolder = async (recipeId, folderId) => {
    try {
      await addRecipeToFolder(user.uid, folderId, recipeId);
      showToast(t('success.recipeAddedToFolder'), 'success');
      loadData();
    } catch (error) {
      console.error('Error adding recipe to folder:', error);
      showToast(error.message || t('myRecipes.addToFolderFailed'), 'error');
    }
  };

  const handleRemoveFromFolder = async (recipeId, folderId) => {
    try {
      await removeRecipeFromFolder(user.uid, folderId, recipeId);
      showToast(t('success.recipeRemovedFromFolder'), 'success');
      loadData();
    } catch (error) {
      console.error('Error removing recipe from folder:', error);
      showToast(error.message || t('myRecipes.removeFromFolderFailed'), 'error');
    }
  };

  const getRecipeFolders = (recipeId) => {
    return folders.filter((folder) => folder.recipeIds?.includes(recipeId));
  };

  const getFilteredRecipes = () => {
    if (!selectedFolder) {
      return recipes;
    }

    const folder = folders.find((f) => f.id === selectedFolder);
    if (!folder) {
      return recipes;
    }

    return recipes.filter((recipe) => folder.recipeIds.includes(recipe.id));
  };

  const filteredRecipes = getFilteredRecipes();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNav />

        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myRecipes.title')}</h1>
            <p className="text-gray-600 mt-1">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? t('myRecipes.recipe') : t('myRecipes.recipes')}
              {selectedFolder && ` ${t('myRecipes.inThisFolder')}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowNewFolderModal(true)}>
              {t('myRecipes.newFolder')}
            </Button>
            <Link to="/recipe/new">
              <Button>{t('myRecipes.createNewRecipe')}</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {folders.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('myRecipes.folders')}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFolder === null
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('myRecipes.allRecipes')} ({recipes.length})
              </button>
              {folders.map((folder) => (
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {folder.name} ({folder.recipeIds?.length || 0})
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    aria-label="Delete folder"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('myRecipes.noRecipesYet')}</h2>
            <p className="text-gray-600 mb-6">{t('myRecipes.createFirstRecipe')}</p>
            <Link to="/recipe/new">
              <Button>{t('myRecipes.createYourFirstRecipe')}</Button>
            </Link>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('myRecipes.noRecipesInFolder')}</h2>
            <p className="text-gray-600 mb-6">
              {t('myRecipes.addRecipesToFolder')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                folders={folders}
                recipeFolders={getRecipeFolders(recipe.id)}
                onAddToFolder={handleAddToFolder}
                onRemoveFromFolder={handleRemoveFromFolder}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showNewFolderModal}
        onClose={() => {
          setShowNewFolderModal(false);
          setNewFolderName('');
        }}
        title={t('myRecipes.createNewFolder')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('myRecipes.folderName')}</label>
            <Input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={t('myRecipes.folderNamePlaceholder')}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewFolderModal(false);
                setNewFolderName('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder}>
              {isCreatingFolder ? t('myRecipes.creating') : t('myRecipes.createFolder')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
