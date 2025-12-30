/**
 * Filter out common foods from ingredients list
 * @param {Array} ingredients - Array of ingredient strings or objects
 * @param {Array} commonFoods - Array of common food objects with 'name' property
 * @returns {Array} Filtered ingredients array
 */
export function filterCommonFoods(ingredients, commonFoods) {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  if (!commonFoods || !Array.isArray(commonFoods) || commonFoods.length === 0) {
    return ingredients;
  }

  // Convert common foods to lowercase for case-insensitive matching
  const commonFoodNames = commonFoods.map((food) =>
    typeof food === 'string' ? food.toLowerCase() : food.name.toLowerCase()
  );

  return ingredients.filter((ingredient) => {
    // Handle both string and object ingredients
    const ingredientName =
      typeof ingredient === 'string'
        ? ingredient.toLowerCase()
        : (ingredient.name || '').toLowerCase();

    // Check if any common food is contained in the ingredient name
    const isCommon = commonFoodNames.some((commonFood) =>
      ingredientName.includes(commonFood)
    );

    return !isCommon;
  });
}

/**
 * Check if an ingredient should be filtered based on common foods list
 * @param {string|Object} ingredient - The ingredient to check
 * @param {Array} commonFoods - Array of common food objects with 'name' property
 * @returns {boolean} True if ingredient is a common food and should be filtered
 */
export function isCommonFood(ingredient, commonFoods) {
  if (!ingredient || !commonFoods || !Array.isArray(commonFoods)) {
    return false;
  }

  const ingredientName =
    typeof ingredient === 'string'
      ? ingredient.toLowerCase()
      : (ingredient.name || '').toLowerCase();

  const commonFoodNames = commonFoods.map((food) =>
    typeof food === 'string' ? food.toLowerCase() : food.name.toLowerCase()
  );

  return commonFoodNames.some((commonFood) => ingredientName.includes(commonFood));
}
