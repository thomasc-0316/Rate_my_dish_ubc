import { useState, useEffect } from 'react';
import { ensureDishImage } from '../lib/dishImages';

/**
 * Hook to automatically handle dish image generation
 * @param {object} dish - The dish object
 * @returns {string|null} The image URL to display
 */
export function useDishImage(dish) {
  const [imageUrl, setImageUrl] = useState(dish?.image_url || null);

  useEffect(() => {
    if (!dish) {
      setImageUrl(null);
      return;
    }

    // If we already have an image URL from the dish, use it
    if (dish.image_url) {
      setImageUrl(dish.image_url);
      return;
    }

    // Otherwise, generate one
    ensureDishImage(dish).then(url => {
      setImageUrl(url);
    }).catch(err => {
      console.error('Failed to ensure dish image:', err);
      setImageUrl(null);
    });
  }, [dish?.id, dish?.image_url]);

  return imageUrl;
}
