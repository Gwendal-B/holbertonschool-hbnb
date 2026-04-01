'use strict';

/* Photos Unsplash — lieux & destinations (une seule déclaration) */
const DETAIL_PHOTOS = [
  /* Paris — Tour Eiffel */
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  /* New York — Manhattan skyline */
  'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1200&q=80',
  /* Tokyo — vue urbaine de nuit */
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
  /* Barcelone — architecture */
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
  /* Santorini — maisons blanches */
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
  /* Londres — Tower Bridge */
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
  /* Bali — rizières en terrasse */
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
  /* Marrakech — riad & souk */
  'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=1200&q=80',
];

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found   = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
  const token            = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink        = document.getElementById('login-link');

  if (!token) {
    addReviewSection.style.display = 'none';
    loginLink.style.display        = 'block';
  } else {
    addReviewSection.style.display = 'block';
    loginLink.style.display        = 'none';
    fetchPlaceDetails(token, placeId);
  }
}

async function fetchPlaceDetails(token, placeId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const place = await response.json();
    displayPlaceDetails(place);

  } catch (err) {
    document.getElementById('place-details').innerHTML = `
      <div class="empty-state">
        <p>Could not load place — ${escHtml(err.message)}</p>
        <a href="index.html" style="color:var(--forest);margin-top:1rem;display:inline-block;">← Back to places</a>
      </div>`;
  }
}

function displayPlaceDetails(place) {
  const detailsEl = document.getElementById('place-details');
  detailsEl.innerHTML = '';

  const price = place.price_by_night ?? place.price ?? '?';
  const name  = place.title || place.name || 'Unknown';

  document.title = `HBnB — ${name}`;

  /* Lien add review */
  const reviewLink = document.getElementById('add-review-link');
  if (reviewLink) {
    reviewLink.href = `add_review.html?id=${encodeURIComponent(place.id)}`;
  }

  /* Photo (Unsplash selon hash du titre) */
  const photoIdx = name.charCodeAt(0) % DETAIL_PHOTOS.length;
  const photoUrl = place.image_url || DETAIL_PHOTOS[photoIdx];

  /* Amenities */
  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a => `<li class="amenity-tag">${escHtml(a.name || a)}</li>`).join('')
    : '<li class="amenity-tag text-muted">None listed</li>';

  /* Reviews */
  const reviewsHTML = (place.reviews && place.reviews.length)
    ? place.reviews.map(r => {
        const stars  = '★'.repeat(r.rating ?? 0) + '☆'.repeat(5 - (r.rating ?? 0));
        const author = r.user_name || r.user?.first_name || 'Anonymous';
        return `
          <div class="review-card">
            <div class="review-card-header">
              <span class="review-author">${escHtml(author)}</span>
              <span class="review-rating">${stars}</span>
            </div>
            <p class="review-text">${escHtml(r.text || r.comment || '')}</p>
          </div>`;
      }).join('')
    : '<p class="text-muted" style="font-style:italic;">No reviews yet — be the first to share your experience.</p>';

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="place-details">

      <img class="place-hero-img"
           src="${photoUrl}"
           alt="${escHtml(name)}" />

      <div class="place-info">
        <div class="place-info-item">
          <div class="place-info-label">Host</div>
          <div class="place-info-value">${escHtml(
            place.owner
              ? `${place.owner.first_name} ${place.owner.last_name}`
              : (place.host_name || '—')
          )}</div>
        </div>
        <div class="place-info-item">
          <div class="place-info-label">Location</div>
          <div class="place-info-value">${escHtml(
            [place.city, place.country].filter(Boolean).join(', ') || '—'
          )}</div>
        </div>
        <div class="place-info-item">
          <div class="place-info-label">Price / night</div>
          <div class="place-info-value">$${price}</div>
        </div>
        <div class="place-info-item">
          <div class="place-info-label">Guests</div>
          <div class="place-info-value">${place.max_guests ?? place.number_of_guests ?? '—'}</div>
        </div>
      </div>

      <p class="place-description">${escHtml(place.description || 'No description provided.')}</p>

      <h2 class="section-title">Amenities</h2>
      <ul class="amenities-list">${amenitiesHTML}</ul>

    </div>

    <h2 class="section-title" style="margin-top:2.5rem;">Guest reviews</h2>
    <div class="reviews-grid">${reviewsHTML}</div>
  `;

  detailsEl.appendChild(section);
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const placeId = getPlaceIdFromURL();

document.addEventListener('DOMContentLoaded', () => {
  if (!placeId) { window.location.href = 'index.html'; return; }
  checkAuthentication();
});