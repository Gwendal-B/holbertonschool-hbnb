# HBnB Evolution — Part 4: Web Client

## Overview

Part 4 is the frontend of the HBnB project. It connects a static HTML/CSS/JavaScript interface to the REST API built in Part 3 and provides the main user experience of the platform.

This part includes:

- User login with JWT authentication
- Place listing on the home page
- Place details page with amenities and reviews
- Review creation for authenticated users
- Review update/delete actions for the author or an admin
- Local image galleries for places with lightbox navigation
- Responsive styling and animated backgrounds

---

## Project Structure

```bash
part4/
├── index.html                   # Home page with places list + price filter
├── login.html                   # Login page
├── place.html                   # Place details page
├── add_review.html              # Review submission page
├── styles.css                   # Main aggregated stylesheet
├── styles/
│   ├── 01-base.css
│   ├── 02-layout.css
│   ├── 03-header-footer.css
│   ├── 04-home.css
│   ├── 05-place.css
│   ├── 06-reviews.css
│   ├── 07-modal-gallery.css
│   ├── 08-background.css
│   ├── 09-forms.css
│   └── 10-responsive.css
├── scripts/
│   ├── api.js                   # Shared API helpers + cookie/JWT helpers
│   ├── login.js                 # Login form logic
│   ├── index.js                 # Fetch and render places on home page
│   ├── place.js                 # Place details, reviews, gallery, edit/delete
│   ├── add_review.js            # Review creation flow
│   └── places-images.js         # Local image mapping per place
└── images/                      # Logo, icons, backgrounds, place photos
```

---

## Features

### 1. Authentication

- `login.html` sends credentials to `POST /api/v1/auth/login`
- The returned JWT is stored in a `token` cookie
- Navigation changes automatically between `Sign in` and `Logout`
- Unauthenticated users are redirected to `login.html` when trying to add a review

### 2. Home Page

The home page:

- Loads places from `GET /api/v1/places`
- Displays each place as a card with image, title, price, and location
- Provides a max-price filter
- Links each card to `place.html?id=<place_id>`

### 3. Place Details

The place page:

- Loads data from `GET /api/v1/places/<id>`
- Displays host, location, nightly price, guest capacity, description, and amenities
- Shows a gallery using local images from `scripts/places-images.js`
- Opens images in a lightbox with previous/next navigation
- Lists existing reviews

### 4. Review Management

Authenticated users can:

- Open `add_review.html` and submit a review with a rating
- Create a review through `POST /api/v1/reviews`

Review owners and admins can also:

- Edit a review with `PUT /api/v1/reviews/<review_id>`
- Delete a review with `DELETE /api/v1/reviews/<review_id>`

The page also calls `GET /api/v1/auth/me` to determine whether the current user can manage a review.

---

## Backend Requirements

This frontend expects the Part 3 API to be running locally at:

```bash
http://127.0.0.1:5000/api/v1
```

Configured in:

```js
const API_BASE = 'http://127.0.0.1:5000/api/v1';
```

If your backend runs on another host or port, update the fetch URLs in:

- `scripts/api.js`
- `scripts/login.js`
- `scripts/index.js`
- `scripts/place.js`
- `scripts/add_review.js`

---

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/login` | Authenticate a user |
| GET | `/api/v1/auth/me` | Get current authenticated user |
| GET | `/api/v1/places` | List all places |
| GET | `/api/v1/places/<id>` | Get one place with details |
| POST | `/api/v1/reviews` | Create a review |
| PUT | `/api/v1/reviews/<id>` | Update a review |
| DELETE | `/api/v1/reviews/<id>` | Delete a review |

---

## Running Part 4

### 1. Start the backend

From the Part 3 application:

```bash
cd part3/hbnb
python3 run.py
```

### 2. Serve the frontend

From the project root:

```bash
cd part4
python3 -m http.server 8000
```

Then open:

```bash
http://127.0.0.1:8000
```

Using a local HTTP server is recommended so pages, scripts, and assets behave correctly in the browser.

---

## Typical User Flow

1. Open `index.html`
2. Browse available places
3. Open a place details page
4. Click `Sign in` and authenticate
5. Return to a place and add a review
6. If the review belongs to the logged-in user, edit or delete it from the modal

---

## Notes

- JWT authentication is handled with browser cookies
- Place images are mapped locally based on place names
- A default image is used if no matching image is found
- Some UI labels such as location and guest count include frontend fallbacks when backend data is incomplete

---

## Authors

- Gwendal Boisard
