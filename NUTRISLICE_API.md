# Nutrislice API Guide for UBC Dining

This guide documents the Nutrislice API endpoints used to fetch menu data for UBC dining halls.

## Base URL
The API is hosted at `https://ubc.api.nutrislice.com`

## 1. List All Dining Locations (Schools)

**Endpoint:**  
`GET /menu/api/schools/?format=json`

**Description:**  
Returns a list of all "schools" (Dining Halls and Cafes).

**Response Structure:**
An array of objects. Each object represents a location.

**Key Fields:**
*   `id`: Unique ID for the location (e.g., `40777`).
*   `name`: Name of the location (e.g., "Open Kitchen | Orchard Commons Residence").
*   `slug`: URL slug (e.g., `ubc-open-kitchen`).
*   `active_menu_types`: An array of menu categories available at this location.

**Example `active_menu_types` item:**
```json
{
    "id": 6032,
    "name": "Open Kitchen | Orchard Commons Residence | Lunch & Dinner",
    "slug": "open-kitchen-at-orchard-commons"
}
```

**Relevant UBC IDs (as of Oct 2023):**
*   **Open Kitchen:** `40777`
*   **Feast:** `40778`
*   **Gather:** `40779`

## 2. Fetch Weekly Menu

**Endpoint:**  
`GET /menu/api/weeks/school/{school_id}/menu-type/{menu_type_id}/{year}/{month}/{day}/?format=json`

**Parameters:**
*   `school_id`: The ID from the schools list (e.g., `40777`).
*   `menu_type_id`: The ID of the specific menu (Breakfast, Lunch/Dinner) obtained from `active_menu_types` (e.g., `6032`).
*   `year`, `month`, `day`: The date you want to view. The API returns the week surrounding this date.

**Example URL:**
`https://ubc.api.nutrislice.com/menu/api/weeks/school/40777/menu-type/6032/2023/10/26/?format=json`

**Response Structure:**
*   `start_date`: Start of the week.
*   `days`: Array of day objects.

**Day Object:**
*   `date`: "YYYY-MM-DD"
*   `menu_items`: Array of dishes being served.

**Menu Item Object:**
*   `id`: Unique ID for the menu item instance.
*   `food`: Object containing details about the dish.
    *   `name`: Name of the dish (e.g., "Classic Burger").
    *   `description`: Ingredients or description.
    *   `image_url`: URL to an image of the dish.
*   `station_name`: Where it is served (e.g., "Grill").
*   `price`: Price (if available).

## 3. Example Workflow (JavaScript/TypeScript)

1.  **Fetch Schools** to get the IDs for "Open Kitchen", "Feast", and "Gather".
2.  For each school, iterate through `active_menu_types` to get the IDs for "Breakfast", "Lunch", "Dinner".
3.  **Fetch Menu** for today using the IDs.
4.  Parse the JSON to extract `menu_items` for the specific date.

## Code Example

```typescript
import axios from 'axios';

async function getMenu() {
    // 1. Get Schools
    const schools = await axios.get('https://ubc.api.nutrislice.com/menu/api/schools/?format=json');
    const openKitchen = schools.data.find(s => s.name.includes('Open Kitchen'));
    
    if (!openKitchen) return;

    const menuType = openKitchen.active_menu_types[0]; // e.g. Lunch & Dinner

    // 2. Get Menu for Today
    const date = new Date();
    const url = `https://ubc.api.nutrislice.com/menu/api/weeks/school/${openKitchen.id}/menu-type/${menuType.id}/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/?format=json`;
    
    const menuData = await axios.get(url);
    console.log(menuData.data);
}
```
