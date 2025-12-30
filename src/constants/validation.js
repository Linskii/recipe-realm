// Validation constants for the application

export const USERNAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  PATTERN: /^[a-z0-9_]+$/,
};

export const RECIPE_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 200,
  MIN_SERVINGS: 1,
  MAX_SERVINGS: 100,
  MIN_TIME: 0,
  MAX_TIME: 1440, // 24 hours in minutes
};

export const BIO_MAX_LENGTH = 200;

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
