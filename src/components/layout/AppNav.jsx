import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast(t('success.loggedOut'), 'success');
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast(t('error.failedToLogout'), 'error');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600"
            aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.menu')}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="flex flex-col gap-4">
                <span className="text-gray-700 font-medium px-2">@{user.username}</span>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`px-2 py-2 font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/my-recipes"
                  onClick={closeMobileMenu}
                  className={`px-2 py-2 font-medium transition-colors ${
                    isActive('/my-recipes')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.myRecipes')}
                </Link>
                <Link
                  to="/shopping-list"
                  onClick={closeMobileMenu}
                  className={`px-2 py-2 font-medium transition-colors ${
                    isActive('/shopping-list')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.shoppingList')}
                </Link>
                <Link
                  to="/browse"
                  onClick={closeMobileMenu}
                  className={`px-2 py-2 font-medium transition-colors ${
                    isActive('/browse')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.browse')}
                </Link>
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className={`px-2 py-2 font-medium transition-colors flex items-center gap-2 ${
                    isActive('/settings')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">⚙️</span>
                  {t('nav.settings')}
                </Link>
                <div className="px-2 pt-2">
                  <Button onClick={handleLogout} variant="secondary" size="sm" className="w-full">
                    {t('nav.logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-2">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="secondary" size="sm" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/signup" onClick={closeMobileMenu}>
                  <Button size="sm" className="w-full">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
