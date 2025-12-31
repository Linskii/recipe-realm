import React, { useState } from 'react';
import { PREDEFINED_TAGS, TAG_VALIDATION, validateTag, normalizeTag } from '../../constants/tags.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import Button from '../ui/Button.jsx';

export default function TagSelector({ selectedTags = [], onChange, maxTags = TAG_VALIDATION.MAX_TAGS_PER_RECIPE }) {
  const { t } = useTranslation();
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= maxTags) {
        setError(t('tagSelector.maxTagsReached', { count: maxTags }));
        return;
      }
      onChange([...selectedTags, tag]);
      setError('');
    }
  };

  const handleAddCustomTag = () => {
    const normalized = normalizeTag(customTag);
    const validationError = validateTag(normalized);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedTags.includes(normalized)) {
      setError(t('tagSelector.tagAlreadyAdded'));
      return;
    }

    if (selectedTags.length >= maxTags) {
      setError(t('tagSelector.maxTagsReached', { count: maxTags }));
      return;
    }

    onChange([...selectedTags, normalized]);
    setCustomTag('');
    setError('');
  };

  const handleRemoveTag = (tag) => {
    onChange(selectedTags.filter((t) => t !== tag));
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          {t('tagSelector.selectedTags', { count: selectedTags.length, total: maxTags })}
        </h3>
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                ✓ {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('tagSelector.noTagsSelected')}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t('tagSelector.addTags')}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {PREDEFINED_TAGS.sort().map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              disabled={selectedTags.length >= maxTags && !selectedTags.includes(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t('tagSelector.createCustomTag')}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => {
              setCustomTag(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={t('tagSelector.customTagPlaceholder')}
            className="flex-1 h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={selectedTags.length >= maxTags}
          />
          <Button
            type="button"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim() || selectedTags.length >= maxTags}
            size="md"
          >
            {t('common.add')}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-xs text-gray-500 mt-1">
          {t('tagSelector.customTagHelper')}
        </p>
      </div>
    </div>
  );
}
