# Requirements Document

## 1. Navigation and Global UI

### 1.1 Navigation Bar
- **R1.1.1:** The navigation bar must appear at the top of every page in the application.
- **R1.1.2:** The navigation bar must display the application logo/name on the left side.
- **R1.1.3:** The application logo/name must function as a clickable link that navigates to the home page.
- **R1.1.4:** The navigation bar must display a "Leaderboard" hyperlink on the right side.
- **R1.1.5:** The navigation bar must display either a "Login" button or a user menu on the right side, depending on authentication state.
- **R1.1.6:** When a user clicks the "Leaderboard" hyperlink, the application must navigate to the leaderboard page.

---

## 2. User Authentication

### 2.1 Login and Registration UI
- **R2.1.1:** When not signed in, clicking the "Login" button must open an authentication modal popup.
- **R2.1.2:** The authentication modal must contain two tabs: "Sign In" and "Register".
- **R2.1.3:** The "Sign In" tab must display input fields for email and password.
- **R2.1.4:** The "Sign In" tab must display a "Forgot Password?" link below the password field.
- **R2.1.5:** The "Register" tab must display input fields for email, password, and confirm password.

### 2.2 User Menu
- **R2.2.1:** When signed in, the "Login" button must be replaced with a dropdown menu.
- **R2.2.2:** The user menu must display the user's username or email at the top.
- **R2.2.3:** The user menu must contain a "My Ratings" option that navigates to the My Ratings page.
- **R2.2.4:** The user menu must contain a "Sign Out" option that signs the user out and returns them to an unauthenticated state.

### 2.3 Authentication Logic
- **R2.3.1:** The system must authenticate users using their email and password credentials.
- **R2.3.2:** The system must create new user accounts with unique email addresses, password, and password confirmation.
- **R2.3.3:** The system must reject sign-in attempts with invalid credentials and display "Email or password is incorrect".
- **R2.3.4:** The system must reject registration attempts with an email that already exists and display "An account with this email already exists".
- **R2.3.5:** The system must reject registration attempts where password and confirm password fields do not match and display "Passwords do not match".
- **R2.3.6:** The system must reject registration attempts with passwords shorter than 8 characters and display "Password must be at least 8 characters".
- **R2.3.7:** The system must persist user authentication state across page navigation within the application.
- **R2.3.8:** When a user signs out, the system must clear all authentication state and return to the unauthenticated UI state.

---

## 3. Home Page


### 3.1 Dining Hall Cards Layout
- **R3.1.1:** The home page must display exactly three dining hall cards: Feast, Open Kitchen, and Gather.
- **R3.1.2:** On desktop viewports, the three dining hall cards must be arranged horizontally.
- **R3.1.3:** On mobile viewports, the three dining hall cards must be arranged vertically.
- **R3.1.4:** Each dining hall card must be visually distinct through photos of the dining hall or color coding.

### 3.2 Dining Hall Card Content
- **R3.2.1:** Each dining hall card must display the dining hall name as a heading.
- **R3.2.2:** Each dining hall card must display the current date.
- **R3.2.3:** Each dining hall card must display the current meal period (Breakfast, Lunch, or Dinner) based on the current time.

### 3.3 Meal Period Logic
- **R3.3.1:** The system must determine the current meal period based on the current time of day.
- **R3.3.2:** The system must display "Breakfast" for morning hours, "Lunch" for midday hours, and "Dinner" for evening hours.

---

## 4. Dining Hall Page

### 4.1 Page Header
- **R4.1.1:** The dining hall page must display the dining hall name (e.g., "Feast", "Open Kitchen", "Gather") as the main heading.
- **R4.1.2:** The dining hall page must display a date selector that defaults to the current date.
- **R4.1.3:** The date selector must allow users to select different dates to view menus.
- **R4.1.4:** The dining hall page must display a meal period selector with options for Breakfast, Lunch, and Dinner.
- **R4.1.5:** The meal period selector must default to the current or next meal period based on the current time.
- **R4.1.6:** The dining hall page must display a back button that returns the user to the home page.

### 4.2 Station Layout
- **R4.2.1:** Stations must be displayed in a two-column grid on desktop viewports.
- **R4.2.2:** Stations must be displayed in a single column on mobile viewports.
- **R4.2.3:** Each station must be represented as a collapsible section with a heading showing the station name.
- **R4.2.4:** Each station heading must display an icon indicating expandable content (chevron or arrow).
- **R4.2.5:** All stations must be in a collapsed state by default when the page loads.

### 4.3 Station Expansion and Dish Display
- **R4.3.1:** When a user clicks on a collapsed station, the station must expand to reveal its list of dishes.
- **R4.3.2:** When a user clicks on an expanded station, the station must collapse to hide its list of dishes.
- **R4.3.3:** Each dish in an expanded station must display the dish name in bold.
- **R4.3.4:** Each dish must display its average rating in the format "X.X" with one decimal place.
- **R4.3.5:** Each dish must display dietary tag badges for applicable dietary attributes: "V" for vegetarian, "VG" for vegan, "GF" for gluten-free, "DF" for dairy-free.
- **R4.3.6:** Dishes within each station must be sorted by rating in descending order (highest rated first).

### 4.4 Dish Interaction
- **R4.4.1:** When a user clicks anywhere on a dish row, the application must navigate to the Dish Detail Page for that dish.

### 4.5 Empty States
- **R4.5.1:** If a station has no dishes, the station must display the message "No dishes available at this station".
- **R4.5.2:** If no menu data exists for the selected date and meal period, the page must display the message "Menu information not yet available for this date".

### 4.6 Menu Data Updates
- **R4.6.1:** When the user changes the selected date, the page must refresh the menu data to show dishes for the new date.
- **R4.6.2:** When the user changes the selected meal period, the page must refresh the menu data to show dishes for the new meal period.

---

## 5. Dish Detail Page

### 5.1 Page Header
- **R5.1.1:** The dish detail page must display the dish name as the main heading.
- **R5.1.2:** The dish detail page must display a breadcrumb navigation in the format "Home > [Dining Hall] > [Station] > [Dish Name]".
- **R5.1.3:** Each segment of the breadcrumb navigation must be clickable and navigate to the corresponding page.
- **R5.1.4:** The page must display the date and meal period for which the dish is being served below the heading.

### 5.2 Dish Information Section
- **R5.2.1:** The page must display a photo of the dish if available in the database.
- **R5.2.2:** If no photo is available, the page must display a gray placeholder with the dish name and the text "No photo available".
- **R5.2.3:** All dish photos and placeholders must maintain a consistent aspect ratio (16:9 or 4:3).
- **R5.2.4:** The page must display the average rating prominently in large number format as "X.X" with one decimal place.
- **R5.2.5:** The page must display the total number of ratings in the format "(Based on X ratings)".
- **R5.2.6:** The page must display dietary information badges for applicable dietary attributes (V, VG, GF, DF).
- **R5.2.7:** If available from Nutrislice data, the page must display a description of the dish.

### 5.3 Rating Submission - Unauthenticated State
- **R5.3.1:** If the user is not signed in, the page must display the message "Sign in to rate this dish".
- **R5.3.2:** If the user is not signed in, the page must display a "Sign In" button that opens the authentication modal.

### 5.4 Rating Submission - Authenticated, No Prior Rating
- **R5.4.1:** If the user is signed in and has not rated this dish, the page must display a heading "Rate this dish".
- **R5.4.2:** The page must display an interactive 10-star rating selector with clickable stars.
- **R5.4.3:** The star selector must highlight stars on hover to indicate the rating that would be selected.
- **R5.4.4:** The page must display an optional text field labeled "Add a comment (optional)" with a 500 character limit.
- **R5.4.5:** The page must display a character counter below the comment text field.
- **R5.4.6:** The page must display a "Submit Rating" button.
- **R5.4.7:** When the user clicks "Submit Rating" without selecting a rating, the system must display the error "Please select a rating".
- **R5.4.8:** When the user enters a comment exceeding 500 characters, the system must display the error "Comment must be 500 characters or less".
- **R5.4.9:** When the rating submission fails, the system must display the error "Failed to submit rating. Please try again."
- **R5.4.10:** When the user successfully submits a rating, the system must save the rating (1-10 stars), optional comment, user ID, dish ID, and timestamp to the database.
- **R5.4.11:** After successful rating submission, the page must immediately update to show the user's submitted rating in the "existing rating" state.

### 5.5 Rating Submission - Authenticated, Existing Rating
- **R5.5.1:** If the user is signed in and has previously rated this dish, the page must display the user's existing rating with the appropriate stars highlighted.
- **R5.5.2:** If the user provided a comment with their rating, the page must display the comment text.
- **R5.5.3:** The page must display an "Edit" button that makes the rating and comment editable.
- **R5.5.4:** When the user clicks "Edit", the star selector and comment field must become editable with the current values pre-filled.
- **R5.5.5:** The page must display a "Delete" button that allows the user to remove their rating.
- **R5.5.6:** When the user clicks "Delete", the system must display a confirmation dialog with the message "Are you sure you want to delete your rating?"
- **R5.5.7:** If the user confirms deletion, the system must remove the rating from the database and update the UI to the "no prior rating" state.
- **R5.5.8:** If the user cancels deletion, the system must close the confirmation dialog without making changes.

### 5.6 Comments Section
- **R5.6.1:** If comments exist for the dish, the page must display a heading "What others are saying".
- **R5.6.2:** The comments section must display a list of all comments from other users.
- **R5.6.3:** Each comment must display "Anonymous" as the author name.
- **R5.6.4:** Each comment must display the star rating (out of 10) given by that user.
- **R5.6.5:** Each comment must display the comment text.
- **R5.6.6:** Each comment must display a relative timestamp in the format "X hours ago", "X days ago", etc.
- **R5.6.7:** Comments must be sorted with most recent first.
- **R5.6.8:** If no comments exist, the comments section must be hidden entirely (not shown as empty).
- **R5.6.9:** The user's own comment must not appear in the "What others are saying" section.

### 5.7 Rating Calculations
- **R5.7.1:** The average rating displayed must be calculated as the sum of all ratings divided by the total number of ratings.
- **R5.7.2:** The average rating must be displayed to one decimal place.
- **R5.7.3:** When the user submits a new rating, the average rating must recalculate and update immediately.
- **R5.7.4:** When the user edits their rating, the average rating must recalculate and update immediately.
- **R5.7.5:** When the user deletes their rating, the average rating must recalculate and update immediately.

### 5.8 Edge Cases
- **R5.8.1:** If a dish has zero ratings, the page must display "No ratings yet" and "Be the first to rate!".
- **R5.8.2:** If a dish has ratings but no comments, the comments section must be hidden.
- **R5.8.3:** On smaller screens, very long dish names must be truncated with ellipsis.

---

## 6. Leaderboard Page

### 6.1 Page Header
- **R6.1.1:** The leaderboard page must display "Top Dishes Today" as the main heading.
- **R6.1.2:** The page must display the current date.
- **R6.1.3:** The page must display the subtitle "Highest rated dishes across all dining halls".

### 6.2 Leaderboard Display
- **R6.2.1:** The leaderboard must display the top 10 highest-rated dishes for the current day.
- **R6.2.2:** Each leaderboard entry must display a rank number from 1 to 10.
- **R6.2.3:** The #1 ranked entry must have visual emphasis distinct from other entries.
- **R6.2.4:** Each leaderboard entry must display the dish name as a clickable link.
- **R6.2.5:** When a user clicks a dish name, the application must navigate to that dish's detail page.
- **R6.2.6:** Each leaderboard entry must display the dining hall name.
- **R6.2.7:** Each leaderboard entry may optionally display the station name for additional context.
- **R6.2.8:** Each leaderboard entry must display the average rating in the format "X.X/10".

### 6.3 Visual Styling
- **R6.3.1:** The top 3 entries (ranks 1-3) must have visual distinction through gold/silver/bronze styling or larger cards.
- **R6.3.2:** Entries ranked 4-10 must be displayed in a standard list format.

### 6.4 Leaderboard Data Rules
- **R6.4.1:** The leaderboard must only include dishes that are being served on the current date.
- **R6.4.2:** A dish must have a minimum of 3 ratings to be eligible for the leaderboard.
- **R6.4.3:** Dishes must be ranked by average rating in descending order (highest first).
- **R6.4.4:** When multiple dishes have the same average rating (ties), they must be sorted alphabetically by dish name.
- **R6.4.5:** The leaderboard data must refresh automatically each time the page is loaded.

---

## 7. My Ratings Page

### 7.1 Access Control
- **R7.1.1:** The My Ratings page must only be accessible to signed-in users.
- **R7.1.2:** The My Ratings page must be accessible from the "My Ratings" option in the user menu.

### 7.2 Page Header
- **R7.2.1:** The page must display "My Ratings" as the main heading.
- **R7.2.2:** The page must display the total count of dishes the user has rated in the format "You have rated X dishes".

### 7.3 Ratings List Display
- **R7.3.1:** The page must display all dishes the user has rated.
- **R7.3.2:** Each rating entry must display the dish name as a clickable link.
- **R7.3.3:** When a user clicks a dish name, the application must navigate to that dish's detail page.
- **R7.3.4:** Each rating entry must display the dining hall name and station name.
- **R7.3.5:** Each rating entry must display the user's rating as stars out of 10.
- **R7.3.6:** If the user provided a comment, the entry must display the comment text.
- **R7.3.7:** Each rating entry must display the date the rating was submitted.
- **R7.3.8:** Each rating entry must display an "Edit" button.
- **R7.3.9:** Each rating entry must display a "Delete" button.

### 7.4 Rating Modification
- **R7.4.1:** When the user clicks "Edit" on a rating entry, the system must navigate to the dish detail page with the rating in edit mode.
- **R7.4.2:** When the user clicks "Delete" on a rating entry, the system must display a confirmation dialog with the message "Are you sure you want to delete your rating?"
- **R7.4.3:** If the user confirms deletion, the system must remove the rating from the database and remove the entry from the My Ratings list.

### 7.5 Sorting Options
- **R7.5.1:** The page must display a sorting dropdown menu with four options: "Most recent first", "Highest rated first", "Lowest rated first", and "Alphabetical by dish name".
- **R7.5.2:** The sorting dropdown must default to "Most recent first".
- **R7.5.3:** When the user selects "Most recent first", ratings must be sorted by submission date in descending order.
- **R7.5.4:** When the user selects "Highest rated first", ratings must be sorted by the user's rating value in descending order.
- **R7.5.5:** When the user selects "Lowest rated first", ratings must be sorted by the user's rating value in ascending order.
- **R7.5.6:** When the user selects "Alphabetical by dish name", ratings must be sorted by dish name in ascending alphabetical order.

### 7.6 Empty State
- **R7.6.1:** If the user has not rated any dishes, the page must display the message "You haven't rated any dishes yet. Start exploring dining hall menus to add your first rating!".
- **R7.6.2:** When the empty state is displayed, the sorting dropdown must not be shown.

---

## 8. Responsive Design

### 8.1 Mobile Layout (< 768px)
- **R8.1.1:** On viewports less than 768px wide, all content must be displayed in a single-column layout.
- **R8.1.2:** On mobile viewports, the navigation bar must use a hamburger menu icon for navigation.
- **R8.1.3:** On mobile viewports, dining hall stations must be displayed one per row.
- **R8.1.4:** On mobile viewports, the application must display a bottom navigation bar with Home and Leaderboard icons.

### 8.2 Tablet Layout (768px - 1024px)
- **R8.2.1:** On viewports between 768px and 1024px, the layout must adapt appropriately between mobile and desktop layouts.

### 8.3 Desktop Layout (> 1024px)
- **R8.3.1:** On viewports greater than 1024px wide, the application must display the full horizontal navigation bar.
- **R8.3.2:** On desktop viewports, content must have a maximum width to maintain readability.
- **R8.3.3:** On desktop viewports, interactive elements must display hover states when the user hovers over them.

---

## 9. Data Management and Backend

### 9.1 Menu Data Integration
- **R9.1.1:** The system must retrieve menu data from the Nutrislice API for all three dining halls (Feast, Open Kitchen, Gather).
- **R9.1.2:** The system must retrieve menu data for Breakfast, Lunch, and Dinner meal periods.
- **R9.1.3:** Menu data must include dish names, stations, dietary information, and descriptions when available.
- **R9.1.4:** The system must store menu data in the database indexed by dining hall, date, meal period, and station.

### 9.2 User Data Management
- **R9.2.1:** The system must store user accounts with unique identifiers, email addresses, and hashed passwords.
- **R9.2.2:** Passwords must be hashed before storage and never stored in plain text.
- **R9.2.3:** User sessions must be managed securely with appropriate timeout periods.

### 9.3 Rating Data Management
- **R9.3.1:** Each rating must be stored with the user ID, dish ID, rating value (1-10), optional comment, and timestamp.
- **R9.3.2:** A user must only be allowed to have one active rating per dish.
- **R9.3.3:** When a user submits a new rating for a dish they have already rated, the system must replace the existing rating.
- **R9.3.4:** Rating data must be persisted permanently until explicitly deleted by the user.

### 9.4 Dish Data Management
- **R9.4.1:** Each dish must have a unique identifier in the database.
- **R9.4.2:** Dishes must be associated with dining hall, station, date, and meal period.
- **R9.4.3:** Dishes may optionally have associated photos stored as image URLs or binary data.
- **R9.4.4:** The same dish name appearing on different dates or meal periods must be treated as related instances for rating aggregation purposes.

### 9.5 Performance Requirements
- **R9.5.1:** Page load times must not exceed 3 seconds on standard broadband connections.
- **R9.5.2:** Rating submissions must complete and provide user feedback within 2 seconds.
- **R9.5.3:** Menu data changes (date or meal period selection) must update the UI within 1 second.

---

## 10. Loading and Error States

### 10.1 Loading States
- **R10.1.1:** During initial page load, the application must display skeleton screens showing the layout structure.
- **R10.1.2:** When a station is being expanded, the application must display a spinner in the station area.
- **R10.1.3:** During rating submission, the "Submit Rating" button must be disabled and display the text "Submitting...".
- **R10.1.4:** During any data fetch operation, the application must provide visual feedback that loading is in progress.

### 10.2 Error States
- **R10.2.1:** When a network error occurs, the application must display the message "Unable to load menu data. Check your connection and try again." with a "Retry" button.
- **R10.2.2:** When the user clicks the "Retry" button, the application must attempt to reload the failed data.
- **R10.2.3:** When a database error occurs, the application must display the message "Something went wrong. Please try again later."
- **R10.2.4:** When no menu data exists for a selected date, the application must display the informational message "Menu not available for this date" (not treated as an error).
- **R10.2.5:** Error messages must be displayed in a visually distinct manner (e.g., red text or error banner).

### 10.3 Data Freshness
- **R10.3.1:** When the user submits a new rating, the dish's average rating and rating count must update immediately without requiring a page refresh.
- **R10.3.2:** When the user submits a new comment, it must appear in the comments section immediately without requiring a page refresh.
- **R10.3.3:** When the leaderboard page is loaded, it must fetch the most current leaderboard data from the server.