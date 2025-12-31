import React, { useState } from 'react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import TagSelector from './TagSelector.jsx';
import { DIFFICULTY_LEVELS } from '../../constants/validation.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import {
  validateRecipeTitle,
  validateRecipeDescription,
  validateServings,
  validateTime,
} from '../../utils/validators.js';

export default function RecipeForm({ initialData = {}, onSubmit, loading = false }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    servings: initialData.servings || 4,
    prepTime: initialData.prepTime || 0,
    cookTime: initialData.cookTime || 0,
    difficulty: initialData.difficulty || 'Easy',
    ingredients: initialData.ingredients || [],
    instructions: initialData.instructions || [],
    tags: initialData.tags || [],
    source: initialData.source || '',
    isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
  });

  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
  });
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setCurrentIngredient((prev) => ({ ...prev, [name]: value }));
  };

  const addIngredient = () => {
    if (!currentIngredient.name.trim()) return;

    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name: currentIngredient.name.trim(),
          quantity: parseFloat(currentIngredient.quantity) || 1,
          unit: currentIngredient.unit.trim(),
        },
      ],
    }));

    setCurrentIngredient({ name: '', quantity: '', unit: '' });
  };

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    if (!currentInstruction.trim()) return;

    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, currentInstruction.trim()],
    }));

    setCurrentInstruction('');
  };

  const removeInstruction = (index) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const titleError = validateRecipeTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descError = validateRecipeDescription(formData.description);
    if (descError) newErrors.description = descError;

    const servingsError = validateServings(formData.servings);
    if (servingsError) newErrors.servings = servingsError;

    const prepTimeError = validateTime(formData.prepTime, 'Prep time');
    if (prepTimeError) newErrors.prepTime = prepTimeError;

    const cookTimeError = validateTime(formData.cookTime, 'Cook time');
    if (cookTimeError) newErrors.cookTime = cookTimeError;

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = t('validation.ingredientsRequired');
    }

    if (formData.instructions.length === 0) {
      newErrors.instructions = t('validation.instructionsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        name="title"
        label={t('recipe.title')}
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder={t('recipe.titlePlaceholder')}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
          {t('recipe.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={t('recipe.descriptionPlaceholder')}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="servings"
          name="servings"
          type="number"
          label={t('recipe.servings')}
          value={formData.servings}
          onChange={handleChange}
          error={errors.servings}
          required
          min="1"
        />

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-900 mb-1">
            {t('recipe.difficulty')} <span className="text-red-500">*</span>
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="prepTime"
          name="prepTime"
          type="number"
          label={t('recipe.prepTime')}
          value={formData.prepTime}
          onChange={handleChange}
          error={errors.prepTime}
          required
          min="0"
        />

        <Input
          id="cookTime"
          name="cookTime"
          type="number"
          label={t('recipe.cookTime')}
          value={formData.cookTime}
          onChange={handleChange}
          error={errors.cookTime}
          required
          min="0"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('recipe.ingredients')} <span className="text-red-500">*</span>
        </h3>
        <div className="grid grid-cols-12 gap-2 mb-3">
          <div className="col-span-6">
            <input
              type="text"
              name="name"
              value={currentIngredient.name}
              onChange={handleIngredientChange}
              placeholder={t('recipe.ingredientName')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              name="quantity"
              value={currentIngredient.quantity}
              onChange={handleIngredientChange}
              placeholder={t('recipe.quantity')}
              step="0.1"
              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="col-span-2">
            <input
              type="text"
              name="unit"
              value={currentIngredient.unit}
              onChange={handleIngredientChange}
              placeholder={t('recipe.unit')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="col-span-2">
            <Button type="button" onClick={addIngredient} className="w-full">
              {t('common.add')}
            </Button>
          </div>
        </div>

        {formData.ingredients.length > 0 && (
          <ul className="space-y-2">
            {formData.ingredients.map((ing, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  {t('common.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.ingredients && <p className="text-sm text-red-500 mt-1">{errors.ingredients}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('recipe.instructions')} <span className="text-red-500">*</span>
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentInstruction}
            onChange={(e) => setCurrentInstruction(e.target.value)}
            placeholder={t('recipe.instructionPlaceholder')}
            className="flex-1 h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button type="button" onClick={addInstruction}>
            {t('common.addStep')}
          </Button>
        </div>

        {formData.instructions.length > 0 && (
          <ol className="space-y-2 list-decimal list-inside">
            {formData.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                <span className="flex-1">{instruction}</span>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  {t('common.remove')}
                </button>
              </li>
            ))}
          </ol>
        )}
        {errors.instructions && <p className="text-sm text-red-500 mt-1">{errors.instructions}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('recipe.tags')}</h3>
        <TagSelector
          selectedTags={formData.tags}
          onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
        />
      </div>

      <Input
        id="source"
        name="source"
        label={t('recipe.source')}
        value={formData.source}
        onChange={handleChange}
        placeholder={t('recipe.sourcePlaceholder')}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-900">
          {t('recipe.makePublic')}
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} className="flex-1" size="lg">
          {initialData.title ? t('recipe.updateRecipe') : t('recipe.createRecipe')}
        </Button>
      </div>
    </form>
  );
}
