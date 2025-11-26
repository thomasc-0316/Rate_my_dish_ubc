# Frontend Image Generation - How It Works

Since you only have database access (no Edge Function deployment), we've implemented **client-side image generation** that works with just your Supabase keys.

## How It Works

### 1. **Pollinations.ai Direct URLs**
Instead of downloading and uploading images to Supabase Storage, we generate direct Pollinations.ai URLs:
```
https://image.pollinations.ai/prompt/A%20delicious%20Pizza...
```

These URLs work like magic:
- No API key needed
- Images generated on-the-fly by Pollinations.ai
- URLs are stable and can be saved to the database

### 2. **Automatic Generation on Display**
When a dish is displayed on the frontend:
- The `useDishImage` hook checks if the dish has an `image_url`
- If yes → uses the existing URL
- If no → generates a new Pollinations.ai URL and saves it to the database

### 3. **Caching via Database**
- First time a dish is viewed: Image URL is generated and saved to `dishes.image_url`
- Next time: The saved URL is used (no regeneration)
- This provides automatic caching across all users

## Files Created

### `src/lib/dishImages.js`
Utility functions for image generation:
- `generateDishImageUrl(name, description)` - Creates Pollinations.ai URL
- `updateDishImage(dishId, imageUrl)` - Saves URL to database
- `ensureDishImage(dish)` - Generates and saves if needed

### `src/hooks/useDishImage.js`
React hook that components use:
- Automatically handles image generation
- Returns the image URL to display
- Updates database in background

## Components Updated

All dish display components now use the `useDishImage` hook:
- ✅ `DishPage.jsx` - Detailed dish view
- ✅ `DishCard.jsx` - Dish cards in grids
- ✅ `DishListItem.jsx` - Dish list items

## Usage Example

```jsx
import { useDishImage } from '../hooks/useDishImage';

function MyComponent({ dish }) {
  const imageUrl = useDishImage(dish);

  return <img src={imageUrl} alt={dish.name} />;
}
```

That's it! The hook handles everything automatically.

## Benefits of This Approach

✅ **No server access needed** - Works with just database keys
✅ **No file storage needed** - Uses Pollinations.ai direct URLs
✅ **Automatic caching** - Database stores URLs for reuse
✅ **Progressive enhancement** - Works even if database writes fail
✅ **Zero cost** - Pollinations.ai is free, no storage costs

## How Images Load

1. User views a dish page
2. Component renders with `useDishImage(dish)` hook
3. Hook checks: Does `dish.image_url` exist?
   - **Yes**: Return existing URL immediately
   - **No**: Generate Pollinations.ai URL, save to DB (async), return URL
4. Image displays using the Pollinations.ai URL
5. Next user sees the cached URL from the database

## What You Need

- ✅ Database with `image_url` column (already added)
- ✅ Supabase keys in `.env` (you already have these)
- ✅ No Edge Function deployment needed
- ✅ No Supabase Storage needed
- ✅ No external API keys needed

## Testing

Just run your frontend:
```bash
npm run dev
```

Then navigate to any dish page. You should see:
- AI-generated images appear automatically
- First load: Image URL generated and saved
- Subsequent loads: Cached URL used

## Troubleshooting

**Images not appearing?**
- Check browser console for errors
- Verify your Supabase keys in `.env` are correct
- Check Network tab to see if Pollinations.ai URLs are loading

**Database errors?**
- Ensure `image_url` column exists in `dishes` table
- Verify your anon key has INSERT/UPDATE permissions on `dishes`

**Images look wrong?**
- The AI generates based on dish name + description
- Better descriptions = better images
- URLs are deterministic (same prompt = same image)

## Notes

- Images generate lazily (only when viewed)
- No batch generation needed
- Works great for your use case (database-only access)
- Images persist across users via database caching
