import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('home.welcome')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                {t('common.getStarted')}
              </button>
            </Link>
            <Link to="/login">
              <button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                {t('nav.login')}
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.shareRecipes')}</h3>
            <p className="text-gray-600">
              {t('home.shareRecipesDesc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.discoverDishes')}</h3>
            <p className="text-gray-600">
              {t('home.discoverDishesDesc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.shoppingLists')}</h3>
            <p className="text-gray-600">
              {t('home.shoppingListsDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
