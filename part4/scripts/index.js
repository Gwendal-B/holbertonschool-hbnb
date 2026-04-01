/**
 * index.js — Task 2 : List of Places (redesign nature/voyage)
 */

'use strict';

/**
 * Retourne une photo Unsplash cohérente avec le nom du logement.
 * Chaque catégorie a une photo distincte pour éviter les doublons.
 */
function getPhotoForPlace(name) {
  const n = (name || '').toLowerCase();

  // Chalet / montagne / ski / chamonix → chalet alpin avec neige
  if (/chalet|montagne|ski|alpes?|chamonix|neige|piste/.test(n))
    return 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=75';

  // Maison bretonne / quiberon / bord de mer spécifique → maison côtière
  if (/bretonne|quiberon|biarr/.test(n))
    return 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75';

  // Villa / piscine / nice / provence → villa piscine
  if (/villa|piscine|luxe|nice|provence|sud|cannes|antibes/.test(n))
    return 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=75';

  // Haussmannien / bordeaux → salon classique haussmannien
  if (/haussmann|bordeaux|classique|bourgeois/.test(n))
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=75';

  // Loft / industriel / lyon → loft design ouvert
  if (/loft|industriel|design|lyon|atelier/.test(n))
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=75';

  // Studio / cosy / coeur de paris → studio parisien compact
  if (/studio|cosy|coeur|centre/.test(n))
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=75';

  // Cozy apartment / Paris → appart parisien lumineux (distinct du studio)
  if (/cozy|apartment|paris/.test(n))
    return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=75';

  // Appartement générique → appart moderne lumineux
  if (/appartement|appart|flat/.test(n))
    return 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=75';

  // Mer / plage générique → terrasse vue mer
  if (/mer|plage|côte|bord/.test(n))
    return 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75';

  // Maison générique → maison de ville
  if (/maison|house|home/.test(n))
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=75';

  // Fallback
  return 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=75';
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found   = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
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

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
    listEl.innerHTML = '<p class="empty-state">No places available yet.</p>';
    return;
  }

  places.forEach((place) => {
    const price   = place.price_by_night ?? place.price ?? 0;
    const photo   = getPhotoForPlace(place.title || place.name);
    const country = place.country || place.city || 'Worldwide';

    const card = document.createElement('div');
    card.className     = 'place-card';
    card.dataset.price = price;

    card.innerHTML = `
      <div class="place-card-img-wrap">
        <img class="place-card-img"
             src="${photo}"
             alt="${escHtml(place.title || place.name)}"
             loading="lazy" />
        <span class="place-card-badge">${escHtml(country)}</span>
      </div>
      <div class="place-card-name">${escHtml(place.title || place.name)}</div>
      <div class="place-card-location">${escHtml(place.city || country)}</div>
      <div class="place-card-price">
        $${price} <span>/ night</span>
      </div>
      <a class="details-button"
         href="place.html?id=${encodeURIComponent(place.id)}">
        View Details
      </a>
    `;

    listEl.appendChild(card);
  });
}

/* Filtre prix côté client */
document.getElementById('price-filter').addEventListener('change', (event) => {
  const selected = event.target.value;
  const cards    = document.querySelectorAll('.place-card');

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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}