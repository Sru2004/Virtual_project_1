# TODO: Login Redirect for Artwork Actions

## Task Summary

Allow buyers to browse artwork details without login. Require login only for "View in AR" and "Add to Cart" actions, with redirect back to the same Artwork Details page after login.

## Changes Required

### 1. SearchPage.jsx

- **File**: `src/components/pages/SearchPage.jsx`
- **Change**: Remove login requirement for "View Details" button
- **Current**: `handleViewDetails` redirects to login if not logged in
- **New**: Direct navigate to `/artwork-details/{id}` without login check

### 2. ArtworkCard.jsx

- **File**: `src/components/artworks/ArtworkCard.jsx`
- **Change**: Remove login requirement for "View Details" button
- **Current**: `handleViewDetails` redirects to login if not logged in
- **New**: Direct navigate to `/artwork-details/{id}` without login check

### 3. ArtworkDetails.jsx (No changes needed - already correct)

- "View in AR" button already redirects to login with return path
- "Add to Cart" button already redirects to login with return path

### 4. UserAuth.jsx (No changes needed - already correct)

- Already handles redirect back to `location.state.from` after successful login

## Expected Flow After Changes

1. Search Page → View Details → Artwork Details Page (NO login required)
2. Click "View in AR" or "Add to Cart" → Login Page
3. Login Success → Redirect back to same Artwork Details Page

## Status

- [x] Update SearchPage.jsx
- [x] Update ArtworkCard.jsx
- [x] Verify ArtworkDetails.jsx (already correct)
- [x] Verify UserAuth.jsx (already correct)

## Implementation Complete!

Changes made:

1. SearchPage.jsx - Removed login requirement for "View Details" button and image click
2. ArtworkCard.jsx - Removed login requirement for "View Details" button
