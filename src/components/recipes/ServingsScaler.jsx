import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function ServingsScaler({ currentServings, onServingsChange, originalServings }) {
  const { t } = useTranslation();
  const handleDecrease = () => {
    if (currentServings > 1) {
      onServingsChange(currentServings - 1);
    }
  };

  const handleIncrease = () => {
    if (currentServings < 99) {
      onServingsChange(currentServings + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div>
        <div className="text-xs text-gray-500">{t('recipe.servings')}</div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleDecrease}
            disabled={currentServings <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease servings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
            {currentServings}
          </span>
          <button
            onClick={handleIncrease}
            disabled={currentServings >= 99}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase servings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
      {currentServings !== originalServings && (
        <button
          onClick={() => onServingsChange(originalServings)}
          className="text-xs text-green-600 hover:text-green-700 underline"
        >
          {t('servingsScaler.resetTo', { servings: originalServings })}
        </button>
      )}
    </div>
  );
}
