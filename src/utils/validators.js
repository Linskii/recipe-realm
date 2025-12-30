import { USERNAME_VALIDATION, RECIPE_VALIDATION } from '../constants/validation.js';

export function validateUsername(username) {
  if (!username || username.length < USERNAME_VALIDATION.MIN_LENGTH) {
    return `Username must be at least ${USERNAME_VALIDATION.MIN_LENGTH} characters`;
  }

  if (username.length > USERNAME_VALIDATION.MAX_LENGTH) {
    return `Username must be no more than ${USERNAME_VALIDATION.MAX_LENGTH} characters`;
  }

  if (!USERNAME_VALIDATION.PATTERN.test(username)) {
    return 'Username can only contain lowercase letters, numbers, and underscores';
  }

  return null; // valid
}

export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

export function validateRecipeTitle(title) {
  if (!title || title.trim().length < RECIPE_VALIDATION.TITLE_MIN_LENGTH) {
    return `Title must be at least ${RECIPE_VALIDATION.TITLE_MIN_LENGTH} characters`;
  }

  if (title.length > RECIPE_VALIDATION.TITLE_MAX_LENGTH) {
    return `Title must be no more than ${RECIPE_VALIDATION.TITLE_MAX_LENGTH} characters`;
  }

  return null;
}

export function validateRecipeDescription(description) {
  if (description && description.length > RECIPE_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return `Description must be no more than ${RECIPE_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`;
  }
  return null;
}

export function validateServings(servings) {
  const num = parseInt(servings, 10);
  if (isNaN(num) || num < RECIPE_VALIDATION.MIN_SERVINGS) {
    return `Servings must be at least ${RECIPE_VALIDATION.MIN_SERVINGS}`;
  }
  if (num > RECIPE_VALIDATION.MAX_SERVINGS) {
    return `Servings must be no more than ${RECIPE_VALIDATION.MAX_SERVINGS}`;
  }
  return null;
}

export function validateTime(time, fieldName = 'Time') {
  const num = parseInt(time, 10);
  if (isNaN(num) || num < RECIPE_VALIDATION.MIN_TIME) {
    return `${fieldName} must be at least ${RECIPE_VALIDATION.MIN_TIME} minutes`;
  }
  if (num > RECIPE_VALIDATION.MAX_TIME) {
    return `${fieldName} must be no more than ${RECIPE_VALIDATION.MAX_TIME} minutes`;
  }
  return null;
}
