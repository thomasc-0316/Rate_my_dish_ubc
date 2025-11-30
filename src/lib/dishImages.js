import { supabase } from './supabase';

/**
 * Generates a Pollinations.ai image URL for a dish
 * @param {string} dishName - Name of the dish
 * @param {string|null} description - Optional description
 * @returns {string} The Pollinations.ai image URL
 */
export function generateDishImageUrl(dishName, description) {
  const prompt = description
    ? `A delicious ${dishName}, ${description}, professional food photography, appetizing, high quality`
    : `A delicious ${dishName} from a university dining hall, professional food photography, appetizing, high quality`;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

/**
 * Updates a dish's image_url in the database
 * @param {number} dishId - The dish ID
 * @param {string} imageUrl - The image URL to save
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function updateDishImage(dishId, imageUrl) {
  try {
    const { error } = await supabase
      .from('dishes')
      .update({ image_url: imageUrl })
      .eq('id', dishId);

    if (error) {
      console.error('Failed to update dish image:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating dish image:', err);
    return false;
  }
}

/**
 * Ensures a dish has an image URL, generating and saving one if needed
 * @param {object} dish - The dish object with id, name, description, and image_url
 * @returns {Promise<string>} The image URL (existing or newly generated)
 */
export async function ensureDishImage(dish) {
  // If dish already has an image URL, return it
  if (dish.image_url) {
    return dish.image_url;
  }

  // Generate a new image URL
  const imageUrl = generateDishImageUrl(dish.name, dish.description);

  // Save it to the database (fire and forget - don't wait)
  updateDishImage(dish.id, imageUrl).catch(err => {
    console.error('Background image URL save failed:', err);
  });

  return imageUrl;
}
