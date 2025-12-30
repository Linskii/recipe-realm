import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/ui/Button.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-green-600">
              Recipe Realm
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, {user?.displayName || user?.username}</span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.recipeCount || 0}</div>
            <div className="text-gray-600">Recipes</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.followerCount || 0}</div>
            <div className="text-gray-600">Followers</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.followingCount || 0}</div>
            <div className="text-gray-600">Following</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">0</div>
            <div className="text-gray-600">Favorites</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/recipe/new" className="block">
                <button className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                  + Create New Recipe
                </button>
              </Link>
              <Link to="/my-recipes" className="block">
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  View My Recipes
                </button>
              </Link>
              <Link to="/browse" className="block">
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  Browse All Recipes
                </button>
              </Link>
              <Link to="/shopping-list" className="block">
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  Shopping List
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity yet. Start by creating your first recipe!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
