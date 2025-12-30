import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RecipeCard({
  recipe,
  folders = [],
  recipeFolders = [],
  onAddToFolder,
  onRemoveFromFolder
}) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowFolderMenu(false);
      }
    };

    if (showFolderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFolderMenu]);

  const handleFolderToggle = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();

    const isInFolder = recipeFolders.some((f) => f.id === folderId);

    if (isInFolder) {
      onRemoveFromFolder(recipe.id, folderId);
    } else {
      onAddToFolder(recipe.id, folderId);
    }
  };

  const toggleFolderMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFolderMenu(!showFolderMenu);
  };

  const hasFolderFeature = folders && folders.length > 0 && onAddToFolder && onRemoveFromFolder;

  return (
    <div className="relative">
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

    {hasFolderFeature && (
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button
          onClick={toggleFolderMenu}
          className="w-9 h-9 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
          aria-label="Add to folder"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </button>

        {showFolderMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
              Add to Folder
            </div>
            <div className="max-h-64 overflow-y-auto">
              {folders.map((folder) => {
                const isInFolder = recipeFolders.some((f) => f.id === folder.id);
                return (
                  <button
                    key={folder.id}
                    onClick={(e) => handleFolderToggle(e, folder.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-700">{folder.name}</span>
                    {isInFolder && (
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  );
}
