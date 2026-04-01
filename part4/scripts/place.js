'use strict';

/**
 * Retourne un tableau de 3 photos Unsplash cohérentes avec le logement.
 * La première photo est la principale (hero), les suivantes complètent la galerie.
 */
function getPhotosForPlace(name) {
  const n = (name || '').toLowerCase();

  // Chalet / montagne / ski / chamonix
  if (/chalet|montagne|ski|alpes?|chamonix|neige|piste/.test(n))
    return [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', // chalet ext enneigé
      'https://images.unsplash.com/photo-1520984032042-162d526883e0?w=1200&q=80', // intérieur chalet bois
      'https://images.unsplash.com/photo-1605537964076-4b9e85e7e73a?w=1200&q=80', // salon chalet feu de cheminée
    ];

  // Maison bretonne / quiberon / bord de mer
  if (/bretonne|quiberon|biarr/.test(n))
    return [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', // maison côtière
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', // plage bretagne
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80', // chambre vue mer
    ];

  // Villa / piscine / nice / provence
  if (/villa|piscine|luxe|nice|provence|sud|cannes|antibes/.test(n))
    return [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80', // villa piscine ext
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80', // piscine intérieure villa
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', // salon villa luxe
    ];

  // Haussmannien / bordeaux
  if (/haussmann|bordeaux|classique|bourgeois/.test(n))
    return [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', // salon haussmannien
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80', // cuisine haussmannienne
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', // chambre élégante
    ];

  // Loft / industriel / lyon
  if (/loft|industriel|design|lyon|atelier/.test(n))
    return [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', // loft open space
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', // cuisine industrielle
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80', // salon loft design
    ];

  // Studio / cosy / coeur de paris
  if (/studio|cosy|coeur|centre/.test(n))
    return [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80', // studio parisien
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80', // coin bureau studio
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=80', // cuisine studio moderne
    ];

  // Cozy apartment / Paris
  if (/cozy|apartment|paris/.test(n))
    return [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', // appart parisien lumineux
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80', // chambre appart parisien
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80', // salon cozy appart
    ];

  // Appartement générique
  if (/appartement|appart|flat/.test(n))
    return [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', // appart moderne
      'https://images.unsplash.com/photo-1560185127-6a28f73e7b5d?w=1200&q=80', // chambre moderne
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80', // cuisine appart
    ];

  // Mer / plage générique
  if (/mer|plage|côte|bord/.test(n))
    return [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', // terrasse vue mer
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', // plage
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80', // chambre vue mer
    ];

  // Maison générique
  if (/maison|house|home/.test(n))
    return [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', // maison ext
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80', // salon maison
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80', // cuisine maison
    ];

  // Fallback
  return [
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  ];
}

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
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    addReviewSection.style.display = 'none';
    loginLink.style.display = 'block';
  } else {
    addReviewSection.style.display = 'block';
    loginLink.style.display = 'none';
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

  const reviewLink = document.getElementById('add-review-link');
  if (reviewLink) {
    reviewLink.href = `add_review.html?id=${encodeURIComponent(place.id)}`;
  }

  /* Galerie de photos */
  const photos = place.image_url
    ? [place.image_url, ...getPhotosForPlace(name).slice(1)]
    : getPhotosForPlace(name);

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

  /* Galerie HTML */
  const galleryDotsHTML = photos.map((_, i) =>
    `<button class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Photo ${i + 1}"></button>`
  ).join('');

  const galleryImgsHTML = photos.map((url, i) =>
    `<img class="gallery-slide ${i === 0 ? 'active' : ''}"
          src="${url}"
          alt="${escHtml(name)} — photo ${i + 1}"
          loading="${i === 0 ? 'eager' : 'lazy'}" />`
  ).join('');

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="place-details">

      <!-- Galerie photos -->
      <div class="gallery">
        <div class="gallery-track">
          ${galleryImgsHTML}
        </div>
        <button class="gallery-btn gallery-btn-prev" aria-label="Photo précédente">&#8249;</button>
        <button class="gallery-btn gallery-btn-next" aria-label="Photo suivante">&#8250;</button>
        <div class="gallery-dots">${galleryDotsHTML}</div>
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

  /* Logique de la galerie */
  initGallery(section, photos.length);
}

function initGallery(container, total) {
  let current = 0;

  const slides = container.querySelectorAll('.gallery-slide');
  const dots   = container.querySelectorAll('.gallery-dot');
  const prev   = container.querySelector('.gallery-btn-prev');
  const next   = container.querySelector('.gallery-btn-next');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => goTo(+dot.dataset.index)));

  /* Swipe tactile */
  let startX = 0;
  const track = container.querySelector('.gallery-track');
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
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