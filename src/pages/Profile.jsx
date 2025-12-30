import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFollow } from '../hooks/useFollow.js';
import { getUserByUsername, getUserPublicRecipes } from '../services/userService.js';
import { logout } from '../services/authService.js';
import Button from '../components/ui/Button.jsx';
import RecipeCard from '../components/recipes/RecipeCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(true);

  const { following, toggleFollow } = useFollow(currentUser?.uid, profileUser?.uid);

  const isOwnProfile = currentUser && profileUser && currentUser.uid === profileUser.uid;

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profileUser) {
      loadRecipes();
    }
  }, [profileUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = await getUserByUsername(username);
      setProfileUser(user);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('User not found', 'error');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setRecipesLoading(true);
      const data = await getUserPublicRecipes(profileUser.uid);
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      showToast('Failed to load recipes', 'error');
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      showToast('Please log in to follow users', 'info');
      navigate('/login');
      return;
    }

    try {
      await toggleFollow();
      showToast(following ? 'Unfollowed successfully' : 'Followed successfully', 'success');
      // Reload profile to update counts
      await loadProfile();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      showToast(error.message || 'Failed to update follow status', 'error');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return null;
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
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/my-recipes" className="text-gray-600 hover:text-gray-900">
                    My Recipes
                  </Link>
                  <Link to="/browse" className="text-gray-600 hover:text-gray-900">
                    Browse
                  </Link>
                  <Link to="/shopping-list" className="text-gray-600 hover:text-gray-900">
                    Shopping List
                  </Link>
                  <span className="text-gray-700">@{currentUser.username}</span>
                  <Button onClick={handleLogout} variant="secondary" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/browse" className="text-gray-600 hover:text-gray-900">
                    Browse
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl">
                {profileUser.displayName?.[0]?.toUpperCase() ||
                  profileUser.username?.[0]?.toUpperCase() ||
                  '👤'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <p className="text-lg text-gray-600 mb-4">@{profileUser.username}</p>
                {profileUser.bio && <p className="text-gray-700 mb-4">{profileUser.bio}</p>}
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{profileUser.recipeCount || 0}</span>{' '}
                    <span className="text-gray-600">Recipes</span>
                  </div>
                  <div>
                    <span className="font-semibold">{profileUser.followerCount || 0}</span>{' '}
                    <span className="text-gray-600">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{profileUser.followingCount || 0}</span>{' '}
                    <span className="text-gray-600">Following</span>
                  </div>
                </div>
              </div>
            </div>
            {!isOwnProfile && currentUser && (
              <Button onClick={handleFollowToggle} variant={following ? 'secondary' : 'primary'}>
                {following ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Public Recipes ({recipes.length})
          </h2>
        </div>

        {recipesLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No public recipes yet</h3>
            <p className="text-gray-600">
              {isOwnProfile
                ? 'Create and share your first recipe to get started!'
                : `${profileUser.displayName || profileUser.username} hasn't shared any recipes yet.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
