'use strict';

/**
 * Retourne un tableau de 3 photos Unsplash cohérentes avec le logement.
 * La première photo est la principale (hero), les suivantes complètent la galerie.
 */
function getPhotoForPlace(place) {
  const name = (place.title || place.name || '').toLowerCase();
  const id = String(place.id || '');

  if (name.includes('cozy apartement in paris')) {
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
  const imageUrl = getPhotoForPlace(place);

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