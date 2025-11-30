# Navigation Structure
## Global Navigation Bar
The navigation bar appears at the top of every page with the following elements:

Left side: Application logo/name serving as home button
Center: Empty space for visual balance
Right side: Two elements:
- "Leaderboard" hyperlink
- "Login" button (changes to user menu when signed in)

## User Authentication States
When not signed in, the "Login" button opens a popup:
- "Sign In" tab with email and password fields, plus "Forgot Password?" link
- "Register" tab with email, password, and confirm password fields

When signed in, the "Login" button is replaced with a dropdown menu showing:
- Username or email at the top
- "My Ratings" option
- "Sign Out" option

Error states for authentication:
- Invalid credentials: "Email or password is incorrect"
- Email already exists: "An account with this email already exists"
- Password mismatch: "Passwords do not match"
- Weak password: "Password must be at least 8 characters"

## Home Page
The home page displays three large, clearly labeled cards arranged horizontally (or vertically on mobile):
- Feast card
- Open Kitchen card
- Gather card

Each card shows:
- Dining hall name as heading
- Current date
- Meal period indicator (Breakfast, Lunch, or Dinner) based on current time
- "View Menu" button

Visual design: Cards should be visually distinct with either photos of each dining hall or color coding. Cards are clickable in their entirety, not just the button.

## Dining Hall Page
Page Header

- Dining hall name (e.g., "Feast")
- Date selector (dropdown or calendar picker) defaulting to today
- Meal period selector (Breakfast, Lunch, Dinner) defaulting to current/next meal
- Back button returning to home page

### Station Layout
Stations are displayed in a two-column grid (single column on mobile). Each station is represented as a collapsible section with:
- Station name as heading (e.g., "Grill Station", "International Station", "Salad Bar")
- Down arrow icon indicating expandable content
- Collapsed state by default

### Collapsed Station State
- Shows only the station name with a right-facing chevron or down arrow icon.
- Expanded Station State

When clicked, the station expands to reveal a list of dishes. Each dish displays:
- Dish name in bold
- Average rating displayed as "X.X/10" (one decimal place)
- Star rating visualization (filled stars corresponding to rating out of 10, converted to 5-star scale for visual display)
- Dietary tags if applicable (small badges: "V" for vegetarian, "VG" for vegan, "GF" for gluten-free, "DF" for dairy-free)

Dishes are sorted by rating (highest first) within each station.

### Empty States

If a station has no dishes: "No dishes available at this station"
If no menu data exists for selected date/meal: "Menu information not yet available for this date"

### Interaction
Clicking anywhere on a dish row navigates to the Dish Detail Page.

## Dish Detail Page
Page Header

Dish name as main heading
Navigation: "Home > [Dining Hall] > [Station] > [Dish Name]"
Date and meal period displayed below heading

### Dish Information Section
- Dish photo (if available in database)
- If no photo: Gray placeholder with dish name and "No photo available" text
- Photos should be a consistent aspect ratio (e.g., 16:9 or 4:3)

Average rating prominently displayed
- Large number format: "8.7/10"
- Total number of ratings: "(Based on 42 ratings)"


Dietary information badges (same as dining hall page)
Description if available from Nutrislice data

## Rating Submission Section
If user is NOT signed in:
- Message: "Sign in to rate this dish"
- "Sign In" button that opens authentication modal

If user IS signed in and has NOT rated this dish:
- Heading: "Rate this dish"
- Interactive 10-star selector (clickable stars, highlighting on hover)
- Optional text field: "Add a comment (optional)" with 500 character limit
- "Submit Rating" button
- Character counter below text field

If user IS signed in and HAS rated this dish:
- Shows user's existing rating with stars highlighted
- Shows user's comment if provided
- "Edit" button that makes rating and comment editable
- "Delete" button that removes their rating (with confirmation dialog: "Are you sure you want to delete your rating?")

Rating submission errors:
- No rating selected: "Please select a rating"
- Comment too long: "Comment must be 500 characters or less"
- Submission failure: "Failed to submit rating. Please try again."

## Comments Section
Heading: "What others are saying" (only appears if comments exist)
List of comments from other users, each showing:
- "Anonymous" as author (all ratings are anonymous)
- Star rating they gave (out of 10)
- Comment text
- Relative timestamp: "2 hours ago", "3 days ago", etc.

Comments sorted by most recent first
If no comments exist: Section is hidden entirely (not shown as empty)

## Edge Cases:
- Dish with 0 ratings: Shows "No ratings yet" and "Be the first to rate!"
- Dish only has ratings but no comments: Comments section is hidden
- Very long dish names: Truncate with ellipsis on smaller screens

## Leaderboard Page
Page Header
"Top Dishes Today" as main heading
Date display (always shows current date)
Subtitle: "Highest rated dishes across all dining halls"

### Leaderboard Table
Displays top 10 dishes for the current day in a ranked list or table format:
Each entry shows:
- Rank number (1-10) with visual emphasis on #1
- Dish name (clickable, links to Dish Detail Page)
- Dining hall name
- Station name (optional, for additional context)
- Average rating (X.X/10 format)

### Visual Design:
- Top 3 entries should have visual distinction (gold/silver/bronze styling or larger cards)
- Entries 4-10 in standard list format

## Data Rules:
- Only includes dishes served today
- Minimum 3 ratings required to appear on leaderboard (prevents single 10/10 rating from dominating)
- Ties are sorted alphabetically by dish name

## My Ratings Page
Accessible from user dropdown menu when signed in.
Page Header

"My Ratings" as main heading
Total count: "You have rated X dishes"

### Ratings List
Shows all dishes the user has rated, with each entry displaying:
- Dish name (clickable, links to Dish Detail Page)
- Dining hall and station name
- User's rating (stars out of 10)
- User's comment (if provided)
- Date of rating
- "Edit" and "Delete" buttons

#### Sorting Options
Dropdown menu to sort by:
- Most recent first (default)
- Highest rated first
- Lowest rated first
- Alphabetical by dish name

### Empty State:
If user has not rated anything: "You haven't rated any dishes yet. Start exploring dining hall menus to add your first rating!"

### Responsive Design Requirements
#### Mobile (< 768px):
- Single column layout throughout
- Hamburger menu for navigation
- Stations displayed one per row
- Bottom navigation bar with Home and Leaderboard icons

#### Desktop (> 1024px):
- Full horizontal navigation bar
- Maximum content width for readability
- Hover states for interactive elements

## Loading and Error States
### Loading States:
- Page load: Skeleton screens showing layout structure
- Station expansion: Spinner in station area
- Rating submission: Disabled submit button with "Submitting..." text

### Error States:
- Network error: "Unable to load menu data. Check your connection and try again." with "Retry" button
- Database error: "Something went wrong. Please try again later."
- No menu data: "Menu not available for this date" (not treated as error, just informational)

### Data Freshness:
- Menu data should refresh automatically when date or meal period changes
- Ratings update in real-time when new ratings are submitted (user sees their rating immediately)
- Leaderboard refreshes automatically when viewing the page
