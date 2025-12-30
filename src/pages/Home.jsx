import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
            Welcome to Recipe Realm
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Share and discover delicious vegetarian recipes
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Login
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-xl font-semibold mb-2">Share Recipes</h3>
            <p className="text-gray-600">
              Create and share your favorite vegetarian recipes with the community
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Discover New Dishes</h3>
            <p className="text-gray-600">
              Browse recipes by tags, search ingredients, and find inspiration
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Shopping Lists</h3>
            <p className="text-gray-600">
              Easily create shopping lists from recipes and manage recurring items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
