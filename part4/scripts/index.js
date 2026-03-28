/**
 * index.js — Task 2 : List of Places
 *
 * Fonctions exactes demandées par le cahier des charges :
 *   - getCookie(name)
 *   - checkAuthentication()
 *   - fetchPlaces(token)
 *   - displayPlaces(places)
 *   - filtre #price-filter (event listener)
 */

'use strict';

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
   - Pas de token  → affiche le lien login
   - Token présent → cache le lien login + fetch les places
   ───────────────────────────────────────────── */
function checkAuthentication() {
  const token     = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }
}

/* ─────────────────────────────────────────────
   Fetch GET /places avec le token en header
   ───────────────────────────────────────────── */
async function fetchPlaces(token) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const places = await response.json();
    displayPlaces(places);

  } catch (err) {
    const listEl = document.getElementById('places-list');
    listEl.innerHTML = `
      <div class="empty-state">
        <p>⚠ Could not load places: ${err.message}</p>
        <p style="font-size:0.82rem;margin-top:0.5rem;">
          Make sure the API is running on <code>http://127.0.0.1:5000</code>
        </p>
      </div>`;
  }
}

/* ─────────────────────────────────────────────
   Construit et affiche les cards dans #places-list
   Stocke le prix en data-price pour le filtre
   ───────────────────────────────────────────── */
function displayPlaces(places) {
  const listEl = document.getElementById('places-list');
  listEl.innerHTML = '';   // vide le contenu actuel

  if (!places || places.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No places available.</p>';
    return;
  }

  places.forEach(place => {
    const price = place.price_by_night ?? place.price ?? 0;

    const card = document.createElement('div');
    card.className        = 'place-card';
    card.dataset.price    = price;   // utilisé par le filtre

    card.innerHTML = `
      <div class="place-card-name">${escHtml(place.title || place.name)}</div>
      <div class="place-card-price">$${price} / night</div>
      <div class="place-card-location">${escHtml(place.city || '')}${place.country ? ', ' + escHtml(place.country) : ''}</div>
      <a class="details-button" href="place.html?id=${encodeURIComponent(place.id)}">View Details</a>
    `;

    listEl.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   Filtre par prix côté client (sans rechargement)
   options : 10 | 50 | 100 | All
   ───────────────────────────────────────────── */
document.getElementById('price-filter').addEventListener('change', (event) => {
  const selected = event.target.value;
  const cards    = document.querySelectorAll('.place-card');

  cards.forEach(card => {
    const cardPrice = parseFloat(card.dataset.price);

    if (selected === 'All') {
      card.style.display = '';          // affiche tout
    } else {
      const maxPrice = parseFloat(selected);
      card.style.display = cardPrice <= maxPrice ? '' : 'none';
    }
  });
});

/* ─────────────────────────────────────────────
   Point d'entrée
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});

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