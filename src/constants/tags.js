// Predefined commonly-used tags
export const PREDEFINED_TAGS = [
  'vegan',
  'gluten-free',
  'quick',
  'meal-prep',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert',
  'soup',
  'salad',
  'pasta',
  'asian',
  'mexican',
  'italian',
  'indian',
  'tofu',
  'tempeh',
  'beans',
  'lentils',
  'high-protein',
  'low-carb',
  'kid-friendly',
  'one-pot',
  'no-cook',
];

// Validation rules for custom tags
export const TAG_VALIDATION = {
  MAX_TAGS_PER_RECIPE: 5,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 20,
  ALLOWED_PATTERN: /^[a-z0-9-]+$/, // lowercase, numbers, hyphens only
};

export function validateTag(tag) {
  const normalized = tag.toLowerCase().trim();

  if (normalized.length < TAG_VALIDATION.MIN_TAG_LENGTH) {
    return `Tag must be at least ${TAG_VALIDATION.MIN_TAG_LENGTH} characters`;
  }

  if (normalized.length > TAG_VALIDATION.MAX_TAG_LENGTH) {
    return `Tag must be no more than ${TAG_VALIDATION.MAX_TAG_LENGTH} characters`;
  }

  if (!TAG_VALIDATION.ALLOWED_PATTERN.test(normalized)) {
    return 'Tag can only contain lowercase letters, numbers, and hyphens';
  }

  return null; // valid
}

export function normalizeTag(tag) {
  return tag.toLowerCase().trim().replace(/\s+/g, '-');
}
