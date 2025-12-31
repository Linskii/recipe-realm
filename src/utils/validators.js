import { USERNAME_VALIDATION, RECIPE_VALIDATION } from '../constants/validation.js';

export function validateUsername(username) {
  if (!username || username.length < USERNAME_VALIDATION.MIN_LENGTH) {
    return {
      key: 'validation.usernameMinLength',
      params: { min: USERNAME_VALIDATION.MIN_LENGTH }
    };
  }

  if (username.length > USERNAME_VALIDATION.MAX_LENGTH) {
    return {
      key: 'validation.usernameMaxLength',
      params: { max: USERNAME_VALIDATION.MAX_LENGTH }
    };
  }

  if (!USERNAME_VALIDATION.PATTERN.test(username)) {
    return { key: 'validation.usernamePattern' };
  }

  return null; // valid
}

export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return { key: 'validation.emailInvalid' };
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { key: 'validation.passwordMinLength' };
  }
  return null;
}

export function validateRecipeTitle(title) {
  if (!title || title.trim().length < RECIPE_VALIDATION.TITLE_MIN_LENGTH) {
    return {
      key: 'validation.recipeTitleMinLength',
      params: { min: RECIPE_VALIDATION.TITLE_MIN_LENGTH }
    };
  }

  if (title.length > RECIPE_VALIDATION.TITLE_MAX_LENGTH) {
    return {
      key: 'validation.recipeTitleMaxLength',
      params: { max: RECIPE_VALIDATION.TITLE_MAX_LENGTH }
    };
  }

  return null;
}

export function validateRecipeDescription(description) {
  if (description && description.length > RECIPE_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return {
      key: 'validation.recipeDescriptionMaxLength',
      params: { max: RECIPE_VALIDATION.DESCRIPTION_MAX_LENGTH }
    };
  }
  return null;
}

export function validateServings(servings) {
  const num = parseInt(servings, 10);
  if (isNaN(num) || num < RECIPE_VALIDATION.MIN_SERVINGS) {
    return {
      key: 'validation.servingsMin',
      params: { min: RECIPE_VALIDATION.MIN_SERVINGS }
    };
  }
  if (num > RECIPE_VALIDATION.MAX_SERVINGS) {
    return {
      key: 'validation.servingsMax',
      params: { max: RECIPE_VALIDATION.MAX_SERVINGS }
    };
  }
  return null;
}

export function validateTime(time, fieldName = 'Time') {
  const num = parseInt(time, 10);
  if (isNaN(num) || num < RECIPE_VALIDATION.MIN_TIME) {
    return {
      key: 'validation.timeMin',
      params: { field: fieldName, min: RECIPE_VALIDATION.MIN_TIME }
    };
  }
  if (num > RECIPE_VALIDATION.MAX_TIME) {
    return {
      key: 'validation.timeMax',
      params: { field: fieldName, max: RECIPE_VALIDATION.MAX_TIME }
    };
  }
  return null;
}
