# Review & Rating System Demo

A standalone product page with a complete review and rating system for an e-commerce artwork marketplace.

## How to Run

1. Open `index.html` in a web browser (double-click or drag into browser).
2. Or serve via a local server:
   ```bash
   npx serve .
   # or: python -m http.server 8080
   ```

## Features

- **Verified buyers only** – Only users who "purchased" can submit reviews (use "Simulate Purchase" for demo).
- **Star rating** – Clickable 1–5 stars with visual feedback.
- **Text review** – Minimum 5 characters.
- **Rating summary** – Average rating, total count, and star display at top.
- **Review list** – Buyer name, stars, comment, date.
- **Edit/Delete** – Buyers can edit/delete only their own review; artists cannot modify any review.

## Demo Controls

- **View as Buyer** / **View as Artist** – Switch between buyer and artist perspectives.
- **Your Name** – Enter a name (used for reviews).
- **Simulate Purchase** – Marks you as a verified buyer so you can leave a review.

## Tech Stack

- HTML, CSS, JavaScript (vanilla)
- localStorage (no backend)
