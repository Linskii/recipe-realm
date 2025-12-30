import React from 'react';
import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <span className="text-6xl">🥗</span>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-4">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {totalTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {recipe.servings}
                </span>
              )}
            </div>
            {recipe.difficulty && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{recipe.difficulty}</span>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-gray-500">+{recipe.tags.length - 3}</span>
              )}
            </div>
          )}

          {recipe.averageRating > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
              <span>⭐</span>
              <span>
                {recipe.averageRating.toFixed(1)} ({recipe.ratingCount})
              </span>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            by @{recipe.createdByUsername || 'Unknown'}
          </div>
        </div>
      </div>
    </Link>
  );
}
