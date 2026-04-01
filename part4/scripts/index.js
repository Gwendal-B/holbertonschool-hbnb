'use strict';

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

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

function checkAuthentication() {
  const token = getCookie('token');
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
        window.location.reload();
      };
    }
  }

  fetchPlaces(token);
}

async function fetchPlaces(token) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const places = await response.json();
    displayPlaces(places);
  } catch (err) {
    const listEl = document.getElementById('places-list');
    if (listEl) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>⚠ Could not load places: ${escHtml(err.message)}</p>
          <p style="font-size:0.82rem;margin-top:0.5rem;">
            Make sure the API is running on <code>http://127.0.0.1:5000</code>
          </p>
        </div>
      `;
    }
  }
}

function displayPlaces(places) {
  const listEl = document.getElementById('places-list');
  if (!listEl) return;

  listEl.innerHTML = '';

  if (!places || places.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No places available.</p>';
    return;
  }

  places.forEach((place) => {
    const price = place.price_by_night ?? place.price ?? 0;
    const name = place.title || place.name || 'Unknown place';
    const imageUrl = getPhotoForPlace(place);
    const locationLabel = getLocationLabel(place);

    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.price = price;

    card.innerHTML = `
      <img class="place-card-img" src="${imageUrl}" alt="${escHtml(name)}" />
      <div class="place-card-name">${escHtml(name)}</div>
      <div class="place-card-price">$${price} / night</div>
      <div class="place-card-location">
        <span class="location-pin">📍</span> ${escHtml(locationLabel)}
      </div>
      <a class="details-button" href="place.html?id=${encodeURIComponent(place.id)}">View Details</a>
    `;

    listEl.appendChild(card);
  });

  applyCardImageFallbacks();
}

function applyCardImageFallbacks() {
  const images = document.querySelectorAll('.place-card-img');

  images.forEach((img) => {
    img.addEventListener('error', function handleError() {
      this.onerror = null;
      this.src = 'images/places/default-place.jpg';
    });
  });
}

function initPriceFilter() {
  const filter = document.getElementById('price-filter');
  if (!filter) return;

  filter.addEventListener('change', (event) => {
    const selected = event.target.value;
    const cards = document.querySelectorAll('.place-card');

    cards.forEach((card) => {
      const cardPrice = parseFloat(card.dataset.price);

      if (selected === 'All') {
        card.style.display = '';
      } else {
        const maxPrice = parseFloat(selected);
        card.style.display = cardPrice <= maxPrice ? '' : 'none';
      }
    });
  });
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  initPriceFilter();
  checkAuthentication();
});