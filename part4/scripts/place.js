/**
 * place.js — Task 3 : Place Details
 *
 * Fonctions exactes demandées par le cahier des charges :
 *   - getPlaceIdFromURL()
 *   - getCookie(name)
 *   - checkAuthentication()
 *   - fetchPlaceDetails(token, placeId)
 *   - displayPlaceDetails(place)
 */

'use strict';

/* ─────────────────────────────────────────────
   Extrait le place ID depuis ?id=... dans l'URL
   ───────────────────────────────────────────── */
function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/* ─────────────────────────────────────────────
   Récupère la valeur d'un cookie par son nom
   ───────────────────────────────────────────── */
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found   = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

/* ─────────────────────────────────────────────
   Vérifie l'authentification
   - Pas de token  → cache #add-review
   - Token présent → affiche #add-review + fetch
   ───────────────────────────────────────────── */
function checkAuthentication() {
  const token            = getCookie('token');
  const loginLink        = document.getElementById('login-link');
  const addReviewSection = document.getElementById('add-review');

  if (!token) {
    loginLink.style.display        = 'block';
    loginLink.textContent          = 'Login';
    loginLink.href                 = 'login.html';
    addReviewSection.style.display = 'none';  // cache "Write a review"
  } else {
    loginLink.style.display        = 'block';
    loginLink.textContent          = 'Logout';
    loginLink.href                 = '#';
    loginLink.onclick = (e) => {
      e.preventDefault();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = 'index.html';
    };
    addReviewSection.style.display = 'block';
  }
  // Toujours fetch les détails, connecté ou non
  fetchPlaceDetails(token, placeId);
}

/* ─────────────────────────────────────────────
   Fetch GET /places/:id avec le token en header
   ───────────────────────────────────────────── */
async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const place = await response.json();
    displayPlaceDetails(place);

  } catch (err) {
    document.getElementById('place-details').innerHTML = `
      <div class="empty-state">
        <p>⚠ Could not load place: ${escHtml(err.message)}</p>
        <a href="index.html" style="color:var(--accent);display:inline-block;margin-top:1rem;">← Back to places</a>
      </div>`;
  }
}

/* ─────────────────────────────────────────────
   Construit et affiche les détails dans #place-details
   ───────────────────────────────────────────── */
function displayPlaceDetails(place) {
  const detailsEl = document.getElementById('place-details');
  detailsEl.innerHTML = '';   // vide le contenu actuel

  const price = place.price_by_night ?? place.price ?? '?';
  const name  = place.title || place.name || 'Unknown';

  /* ── Met à jour le titre de la page ── */
  document.title = `HBnB — ${name}`;

  /* ── Met à jour le lien "Write a review" ── */
  const reviewLink = document.getElementById('add-review-link');
  if (reviewLink) {
    reviewLink.href = `add_review.html?id=${encodeURIComponent(place.id)}`;
  }

  /* ── Amenities ── */
  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a =>
        `<li class="amenity-tag">${escHtml(a.name || a)}</li>`
      ).join('')
    : '<li class="amenity-tag text-muted">None listed</li>';

  /* ── Reviews ── */
  const reviewsHTML = (place.reviews && place.reviews.length)
    ? place.reviews.map(r => {
        const stars = '⭐'.repeat(r.rating ?? 0);
        const author = r.user_name || r.user?.first_name || 'Anonymous';
        return `
          <div class="review-card">
            <div class="review-card-header">
              <span class="review-author">${escHtml(author)}</span>
              <span class="review-rating">${stars} ${r.rating ?? '?'}/5</span>
            </div>
            <p class="review-text">${escHtml(r.text || r.comment || '')}</p>
          </div>`;
      }).join('')
    : '<p class="text-muted">No reviews yet. Be the first!</p>';

  /* ── Bloc principal ── */
  const section = document.createElement('div');
  section.innerHTML = `
    <div class="place-details">

      <div class="place-details-header">
        <h1 class="place-details-title">${escHtml(name)}</h1>
        <span class="place-price-tag">$${price} / night</span>
      </div>

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
      </div>

      <p class="place-description">${escHtml(place.description || 'No description provided.')}</p>

      <h2 class="section-title">Amenities</h2>
      <ul class="amenities-list">${amenitiesHTML}</ul>

    </div>

    <h2 class="section-title" style="margin-top:2rem;">Reviews</h2>
    <div class="reviews-grid">${reviewsHTML}</div>
  `;

  detailsEl.appendChild(section);
}

/* ─────────────────────────────────────────────
   Helper anti-XSS
   ───────────────────────────────────────────── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────────
   Point d'entrée
   ───────────────────────────────────────────── */
const placeId = getPlaceIdFromURL();

document.addEventListener('DOMContentLoaded', () => {
  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }
  checkAuthentication();
});