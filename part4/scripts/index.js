'use strict';

function getPhotoForPlace(place) {
  const name = (place.title || place.name || '').toLowerCase();
  const id = String(place.id || '');

  if (name.includes('cozy apartment in paris') || name.includes('cozy apartement in paris')) {
    return 'images/places/cozy-apartment-paris.jpg';
  }

  if (name.includes('studio cosy au coeur de paris')) {
    return 'images/places/studio-cosy-paris.jpg';
  }

  if (name.includes('villa avec piscine vue mer') || name.includes('nice')) {
    return 'images/places/villa-piscine-vue-mer-nice.jpg';
  }

  if (name.includes('appartement haussmannien bordeaux')) {
    return 'images/places/appartement-haussmannien-bordeaux.jpg';
  }

  if (name.includes('chalet au pied des pistes') || name.includes('chamonix')) {
    return 'images/places/chalet-pied-des-pistes-chamonix.jpg';
  }

  if (name.includes('loft industriel design') || name.includes('vieux lyon')) {
    return 'images/places/loft-industriel-vieux-lyon.jpg';
  }

  if (name.includes('maison bretonne bord de mer') && name.includes('quiberon')) {
    return id.endsWith('2')
      ? 'images/places/maison-bretonne-quiberon-2.jpg'
      : 'images/places/maison-bretonne-quiberon-1.jpg';
  }

  return 'images/places/default-place.jpg';
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!loginLink) {
    fetchPlaces(token);
    return;
  }

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
    document.getElementById('places-list').innerHTML = `
      <div class="empty-state">
        <p>⚠ Could not load places: ${escHtml(err.message)}</p>
      </div>`;
  }
}

function displayPlaces(places) {
  const listEl = document.getElementById('places-list');
  listEl.innerHTML = '';

  if (!places || places.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No places available.</p>';
    return;
  }

  places.forEach(place => {
    const price = place.price_by_night ?? place.price ?? 0;
    const imageUrl = getPhotoForPlace(place);

    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.price = price;

    card.innerHTML = `
      <img class="place-card-img" src="${imageUrl}" alt="${escHtml(place.title || place.name)}" />
      <div class="place-card-name">${escHtml(place.title || place.name)}</div>
      <div class="place-card-price">$${price} / night</div>
      <div class="place-card-location">
        ${escHtml(place.city || '')}${place.country ? ', ' + escHtml(place.country) : ''}
      </div>
      <a class="details-button" href="place.html?id=${encodeURIComponent(place.id)}">View Details</a>
    `;

    listEl.appendChild(card);
  });
}

document.getElementById('price-filter').addEventListener('change', (event) => {
  const selected = event.target.value;
  const cards = document.querySelectorAll('.place-card');

  cards.forEach(card => {
    const cardPrice = parseFloat(card.dataset.price);

    if (selected === 'All') {
      card.style.display = '';
    } else {
      card.style.display = cardPrice <= parseFloat(selected) ? '' : 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}