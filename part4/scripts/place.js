'use strict';

function getPhotosForPlace(place) {
  const name = (place.title || place.name || '').toLowerCase();
  const id = String(place.id || '');

  if (name.includes('cozy apartment in paris') || name.includes('cozy apartement in paris')) {
    return [
      'images/places/cozy-apartment-paris/1.jpg',
      'images/places/cozy-apartment-paris/2.jpg',
      'images/places/cozy-apartment-paris/3.jpg'
    ];
  }

  if (name.includes('studio cosy au coeur de paris')) {
    return [
      'images/places/studio-cosy-paris/1.jpg',
      'images/places/studio-cosy-paris/2.jpg',
      'images/places/studio-cosy-paris/3.jpg'
    ];
  }

  if (name.includes('villa avec piscine vue mer') || name.includes('nice')) {
    return [
      'images/places/villa-nice/1.jpg',
      'images/places/villa-nice/2.jpg',
      'images/places/villa-nice/3.jpg'
    ];
  }

  if (name.includes('appartement haussmannien bordeaux')) {
    return [
      'images/places/bordeaux/1.jpg',
      'images/places/bordeaux/2.jpg',
      'images/places/bordeaux/3.jpg'
    ];
  }

  if (name.includes('chalet au pied des pistes') || name.includes('chamonix')) {
    return [
      'images/places/chamonix/1.jpg',
      'images/places/chamonix/2.jpg',
      'images/places/chamonix/3.jpg'
    ];
  }

  if (name.includes('loft industriel design') || name.includes('vieux lyon')) {
    return [
      'images/places/loft-lyon/1.jpg',
      'images/places/loft-lyon/2.jpg',
      'images/places/loft-lyon/3.jpg'
    ];
  }

  if (name.includes('maison bretonne bord de mer') && name.includes('quiberon')) {
    return id.endsWith('2')
      ? [
          'images/places/quiberon-2/1.jpg',
          'images/places/quiberon-2/2.jpg',
          'images/places/quiberon-2/3.jpg'
        ]
      : [
          'images/places/quiberon-1/1.jpg',
          'images/places/quiberon-1/2.jpg',
          'images/places/quiberon-1/3.jpg'
        ];
  }

  return [
    'images/places/default-place.jpg',
    'images/places/default-place.jpg',
    'images/places/default-place.jpg'
  ];
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (!token) {
      loginLink.style.display = 'inline-block';
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
      loginLink.onclick = null;
    } else {
      loginLink.style.display = 'inline-block';
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
  const name = place.title || place.name || 'Unknown';
  const imageUrl = getPhotoForPlace(place);

  document.title = `HBnB — ${name}`;

  const reviewLink = document.getElementById('add-review-link');
  if (reviewLink) {
    reviewLink.href = `add_review.html?id=${encodeURIComponent(place.id)}`;
  }

  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a => `<li class="amenity-tag">${escHtml(a.name || a)}</li>`).join('')
    : '<li class="amenity-tag text-muted">None listed</li>';

  const reviewsHTML = (place.reviews && place.reviews.length)
    ? place.reviews.map(r => {
        const stars = '★'.repeat(r.rating ?? 0) + '☆'.repeat(5 - (r.rating ?? 0));
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
      <img class="place-details-img" src="${imageUrl}" alt="${escHtml(name)}" />

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