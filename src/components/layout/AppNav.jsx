import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { logout } from '../../services/authService.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import Button from '../ui/Button.jsx';

export default function AppNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      showToast(t('success.loggedOut'), 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast(t('error.failedToLogout'), 'error');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-green-600">
            {t('app.name')}
          </Link>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/my-recipes"
                  className={`font-medium transition-colors ${
                    isActive('/my-recipes')
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.myRecipes')}
                </Link>
                <Link
                  to="/shopping-list"
                  className={`font-medium transition-colors ${
                    isActive('/shopping-list')
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.shoppingList')}
                </Link>
                <Link
                  to="/browse"
                  className={`font-medium transition-colors ${
                    isActive('/browse')
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.browse')}
                </Link>
                <span className="text-gray-700">@{user.username}</span>
                <Link
                  to="/settings"
                  className={`text-2xl transition-colors ${
                    isActive('/settings')
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={t('nav.settings')}
                >
                  ⚙️
                </Link>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">{t('nav.signup')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
