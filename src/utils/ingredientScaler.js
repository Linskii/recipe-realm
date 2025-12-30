/**
 * Scales a single ingredient based on original and new servings
 * @param {Object} ingredient - The ingredient object with quantity, unit, and name
 * @param {number} originalServings - Original number of servings
 * @param {number} newServings - New number of servings
 * @returns {Object} Scaled ingredient object
 */
export function scaleIngredient(ingredient, originalServings, newServings) {
  if (!ingredient || !originalServings || !newServings || originalServings <= 0 || newServings <= 0) {
    return ingredient;
  }

  const scaleFactor = newServings / originalServings;

  // Handle quantity scaling
  let scaledQuantity = ingredient.quantity;

  // Try to parse quantity as a number
  const quantityNum = parseFloat(ingredient.quantity);

  if (!isNaN(quantityNum)) {
    // Scale the numeric value
    const scaled = quantityNum * scaleFactor;

    // Format to 2 decimal places and remove trailing zeros
    scaledQuantity = Number(scaled.toFixed(2)).toString();

    // Convert decimals to fractions for common values
    if (scaledQuantity.includes('.')) {
      const decimal = parseFloat(scaledQuantity);
      const fractionMap = {
        0.25: '1/4',
        0.33: '1/3',
        0.5: '1/2',
        0.67: '2/3',
        0.75: '3/4',
      };

      const whole = Math.floor(decimal);
      const fraction = decimal - whole;

      for (const [value, text] of Object.entries(fractionMap)) {
        if (Math.abs(fraction - value) < 0.05) {
          scaledQuantity = whole > 0 ? `${whole} ${text}` : text;
          break;
        }
      }
    }
  } else {
    // Handle fraction strings like "1/2" or "1 1/2"
    const fractionMatch = ingredient.quantity.match(/(\d+)?\s*(\d+)\/(\d+)/);
    if (fractionMatch) {
      const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0;
      const numerator = parseInt(fractionMatch[2]);
      const denominator = parseInt(fractionMatch[3]);
      const total = whole + numerator / denominator;
      const scaled = total * scaleFactor;
      scaledQuantity = Number(scaled.toFixed(2)).toString();
    }
  }

  return {
    ...ingredient,
    quantity: scaledQuantity,
  };
}

/**
 * Scales all ingredients in a recipe
 * @param {Array} ingredients - Array of ingredient objects
 * @param {number} originalServings - Original number of servings
 * @param {number} newServings - New number of servings
 * @returns {Array} Array of scaled ingredient objects
 */
export function scaleAllIngredients(ingredients, originalServings, newServings) {
  if (!ingredients || !Array.isArray(ingredients)) {
    return ingredients;
  }

  return ingredients.map((ingredient) =>
    scaleIngredient(ingredient, originalServings, newServings)
  );
}
