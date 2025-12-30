/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0 = no match, 1 = exact match)
 */
function similarityScore(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
}

/**
 * Fuzzy match a recipe ingredient against available ingredients
 * @param {Object|string} recipeIngredient - Recipe ingredient (object with name property or string)
 * @param {Array} availableIngredients - Array of available ingredient strings
 * @returns {Object} Match result with { matched: boolean, score: number, matchedWith: string }
 */
export function fuzzyMatchIngredient(recipeIngredient, availableIngredients) {
  if (!recipeIngredient || !availableIngredients || !Array.isArray(availableIngredients)) {
    return { matched: false, score: 0, matchedWith: null };
  }

  const ingredientName =
    typeof recipeIngredient === 'string'
      ? recipeIngredient.toLowerCase().trim()
      : (recipeIngredient.name || '').toLowerCase().trim();

  if (!ingredientName) {
    return { matched: false, score: 0, matchedWith: null };
  }

  let bestMatch = { matched: false, score: 0, matchedWith: null };

  for (const available of availableIngredients) {
    const availableName = available.toLowerCase().trim();

    // Exact match
    if (ingredientName === availableName) {
      return { matched: true, score: 1.0, matchedWith: available };
    }

    // Substring match
    if (
      ingredientName.includes(availableName) ||
      availableName.includes(ingredientName)
    ) {
      const score = 0.9;
      if (score > bestMatch.score) {
        bestMatch = { matched: true, score, matchedWith: available };
      }
      continue;
    }

    // Fuzzy match with threshold
    const score = similarityScore(ingredientName, availableName);
    if (score >= 0.7 && score > bestMatch.score) {
      bestMatch = { matched: true, score, matchedWith: available };
    }
  }

  return bestMatch;
}

/**
 * Calculate recipe match percentage against available ingredients
 * @param {Object} recipe - Recipe object with ingredients array
 * @param {Array} availableIngredients - Array of available ingredient strings
 * @returns {Object} Match result with { percentage: number, matchedCount: number, totalCount: number, matches: Array }
 */
export function calculateRecipeMatch(recipe, availableIngredients) {
  if (
    !recipe ||
    !recipe.ingredients ||
    !Array.isArray(recipe.ingredients) ||
    recipe.ingredients.length === 0
  ) {
    return { percentage: 0, matchedCount: 0, totalCount: 0, matches: [] };
  }

  if (!availableIngredients || !Array.isArray(availableIngredients)) {
    return {
      percentage: 0,
      matchedCount: 0,
      totalCount: recipe.ingredients.length,
      matches: [],
    };
  }

  const matches = [];
  let matchedCount = 0;

  for (const ingredient of recipe.ingredients) {
    const matchResult = fuzzyMatchIngredient(ingredient, availableIngredients);
    matches.push({
      ingredient,
      ...matchResult,
    });

    if (matchResult.matched) {
      matchedCount++;
    }
  }

  const totalCount = recipe.ingredients.length;
  const percentage = totalCount > 0 ? (matchedCount / totalCount) * 100 : 0;

  return {
    percentage,
    matchedCount,
    totalCount,
    matches,
  };
}
