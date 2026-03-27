/**
 * index.js — Page principale : liste des places + filtre par pays
 *
 * Flux :
 *  1. Vérifie l'authentification → adapte le bouton header
 *  2. GET /places (public, pas de token requis selon spec)
 *  3. Construit la liste de pays pour le filtre
 *  4. Affiche les cards, filtre côté client sur changement du select
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const { api, isAuthenticated } = window.HBnB;

  /* ── Header : bouton login / logout ── */
  const loginLink = document.getElementById('login-link');
  if (isAuthenticated()) {
    loginLink.textContent = 'Logout';
    loginLink.href        = '#';
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.HBnB.removeToken();
      window.location.reload();
    });
  }

  /* ── DOM refs ── */
  const listEl    = document.getElementById('places-list');
  const filterEl  = document.getElementById('country-filter');

  let allPlaces = [];  // cache complet

  /* ── Construit une place card ── */
  function buildCard(place) {
    const card = document.createElement('div');
    card.className   = 'place-card';
    card.dataset.country = (place.country || '').toLowerCase();

    // Image placeholder générique si aucune image fournie par l'API
    const imgSrc = place.image_url || 'images/placeholder.svg';

    card.innerHTML = `
      <img class="place-card-img" src="${imgSrc}" alt="${escHtml(place.title || place.name)}" loading="lazy" />
      <div class="place-card-name">${escHtml(place.title || place.name)}</div>
      <div class="place-card-price">$${place.price_by_night ?? place.price ?? '—'} / night</div>
      <div class="place-card-location">${escHtml(place.city || '')}${place.country ? ', ' + escHtml(place.country) : ''}</div>
      <a class="details-button" href="place.html?id=${encodeURIComponent(place.id)}">View Details</a>
    `;
    return card;
  }

  /* ── Peuple le select des pays ── */
  function populateFilter(places) {
    const countries = [...new Set(
      places.map(p => p.country).filter(Boolean)
    )].sort();

    countries.forEach(country => {
      const opt = document.createElement('option');
      opt.value = country.toLowerCase();
      opt.textContent = country;
      filterEl.appendChild(opt);
    });
  }

  /* ── Affiche / filtre les cards ── */
  function renderPlaces(places) {
    listEl.innerHTML = '';

    if (places.length === 0) {
      listEl.innerHTML = '<p class="empty-state">No places found for this filter.</p>';
      return;
    }

    places.forEach(place => listEl.appendChild(buildCard(place)));
  }

  /* ── Filtre sur changement du select ── */
  filterEl.addEventListener('change', () => {
    const val = filterEl.value;
    if (val === 'all') {
      renderPlaces(allPlaces);
    } else {
      renderPlaces(allPlaces.filter(p =>
        (p.country || '').toLowerCase() === val
      ));
    }
  });

  /* ── Fetch initial ── */
  async function loadPlaces() {
    try {
      const places = await api.getPlaces();
      allPlaces = places;

      populateFilter(places);
      renderPlaces(places);
    } catch (err) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>⚠ Could not load places: ${escHtml(err.message)}</p>
          <p style="font-size:0.82rem; margin-top:0.5rem;">Make sure the API is running at <code>http://127.0.0.1:5000</code></p>
        </div>`;
    }
  }

  loadPlaces();
});

/* ── XSS helper ── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}