import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRecipe, deleteRecipe } from '../services/recipeService.js';
import RecipeDetail from '../components/recipes/RecipeDetail.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';

export default function RecipeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const recipeData = await getRecipe(id);
      setRecipe(recipeData);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError(err.message || 'Failed to load recipe');
      showToast('Failed to load recipe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRecipe(id, user.uid);
      showToast('Recipe deleted successfully', 'success');
      navigate('/my-recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      showToast('Failed to delete recipe', 'error');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const isOwner = recipe && user && recipe.createdBy === user.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-green-600">
                Recipe Realm
              </Link>
              <div className="flex items-center gap-4">
                {user && (
                  <Link to="/dashboard">
                    <Button variant="secondary" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
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

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold text-green-600">
                Recipe Realm
              </Link>
              <div className="flex items-center gap-4">
                {user && (
                  <Link to="/dashboard">
                    <Button variant="secondary" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The recipe you are looking for does not exist.'}</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
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
              Recipe Realm
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isOwner && (
          <div className="mb-6 flex gap-3">
            <Link to={`/recipe/${id}/edit`}>
              <Button variant="secondary">Edit Recipe</Button>
            </Link>
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              Delete Recipe
            </Button>
          </div>
        )}

        <RecipeDetail recipe={recipe} />

        <div className="mt-8 text-center">
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Recipe">
        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
