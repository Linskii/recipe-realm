import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import AppNav from '../components/layout/AppNav.jsx';
import Button from '../components/ui/Button.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard.title')}</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.recipeCount || 0}</div>
            <div className="text-gray-600">{t('dashboard.recipes')}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.followerCount || 0}</div>
            <div className="text-gray-600">{t('dashboard.followers')}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">{user?.followingCount || 0}</div>
            <div className="text-gray-600">{t('dashboard.following')}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-2">0</div>
            <div className="text-gray-600">{t('dashboard.favorites')}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.recentActivity')}</h2>
          <p className="text-gray-600">{t('dashboard.noActivity')}</p>
        </div>
      </div>
    </div>
  );
}
