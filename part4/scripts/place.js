'use strict';

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

/* ========================= */
/* 🧠 HELPERS */
/* ========================= */

function getLocationLabel(place) {
  const city = place.city || '';
  const country = place.country || '';

  if (city || country) {
    return [city, country].filter(Boolean).join(', ');
  }

  const name = (place.title || place.name || '').toLowerCase();

  if (name.includes('paris')) return 'Paris, France';
  if (name.includes('nice')) return 'Nice, France';
  if (name.includes('bordeaux')) return 'Bordeaux, France';
  if (name.includes('chamonix')) return 'Chamonix, France';
  if (name.includes('quiberon')) return 'Quiberon, France';
  if (name.includes('lyon')) return 'Lyon, France';

  return 'France';
}

function getGuestsLabel(place) {
  if (place.max_guests) return place.max_guests;
  if (place.number_of_guests) return place.number_of_guests;

  const name = (place.title || place.name || '').toLowerCase();

  if (name.includes('studio')) return 2;
  if (name.includes('villa')) return 8;
  if (name.includes('chalet')) return 6;
  if (name.includes('maison')) return 5;
  if (name.includes('loft')) return 4;

  return 4;
}

function getAmenityIcon(name) {
  const n = name.toLowerCase();

  if (n.includes('wifi')) return '📶';
  if (n.includes('pool')) return '🏊';
  if (n.includes('parking')) return '🚗';
  if (n.includes('kitchen')) return '🍳';
  if (n.includes('heating')) return '🔥';
  if (n.includes('air')) return '❄️';
  if (n.includes('fireplace')) return '🔥';
  if (n.includes('workspace')) return '💻';

  return '✔️';
}

/* ========================= */

function checkAuthentication() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (!token) {
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
    } else {
      loginLink.textContent = 'Logout';
      loginLink.href = '#';
      loginLink.onclick = function (e) {
        e.preventDefault();
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = 'index.html';
      };
    }
  }

  if (addReviewSection) {
    addReviewSection.style.display = token ? 'block' : 'none';
  }

  fetchPlaceDetails(token, placeId);
}

/* ========================= */

async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const place = await response.json();
    displayPlaceDetails(place);
  } catch (err) {
    document.getElementById('place-details').innerHTML = `
      <p>Could not load place — ${escHtml(err.message)}</p>
    `;
  }
}

/* ========================= */

function displayPlaceDetails(place) {
  const detailsEl = document.getElementById('place-details');
  detailsEl.innerHTML = '';

  const name = place.title || place.name;
  const price = place.price_by_night ?? place.price ?? '?';

  const locationLabel = getLocationLabel(place);
  const guestsLabel = getGuestsLabel(place);
  const photos = getPhotosForPlace(place);

  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a => `
        <li class="amenity-tag">
          ${getAmenityIcon(a.name || a)} ${escHtml(a.name || a)}
        </li>
      `).join('')
    : `<li class="amenity-tag">✔️ WiFi</li>
       <li class="amenity-tag">✔️ Kitchen</li>
       <li class="amenity-tag">✔️ Heating</li>`;

  const section = document.createElement('div');

  section.innerHTML = `
    <div class="place-details">

      <img class="place-details-img" src="${photos[0]}" alt="${escHtml(name)}" />

      <h1 class="place-details-title">${escHtml(name)}</h1>

      <span class="place-price-tag">$${price} / night</span>

      <div class="place-info">

        <div class="place-info-item">
          <div class="place-info-label">Host</div>
          <div class="place-info-value">${escHtml(
            place.owner
              ? `${place.owner.first_name} ${place.owner.last_name}`
              : '—'
          )}</div>
        </div>

        <div class="place-info-item">
          <div class="place-info-label">Location</div>
          <div class="place-info-value">${escHtml(locationLabel)}</div>
        </div>

        <div class="place-info-item">
          <div class="place-info-label">Price / night</div>
          <div class="place-info-value">$${price}</div>
        </div>

        <div class="place-info-item">
          <div class="place-info-label">Guests</div>
          <div class="place-info-value">${guestsLabel}</div>
        </div>

      </div>

      <p class="place-description">${escHtml(place.description || '')}</p>

      <h2>Amenities</h2>
      <ul class="amenities-list">
        ${amenitiesHTML}
      </ul>

    </div>
  `;

  detailsEl.appendChild(section);
}

/* ========================= */

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const placeId = getPlaceIdFromURL();

document.addEventListener('DOMContentLoaded', () => {
  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }
  checkAuthentication();
});