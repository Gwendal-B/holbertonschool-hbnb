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
  if (place.guests) return place.guests;

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
  if (n.includes('kitchenette')) return '🍳';
  if (n.includes('heating')) return '🔥';
  if (n.includes('air')) return '❄️';
  if (n.includes('fireplace')) return '🔥';
  if (n.includes('workspace')) return '💻';
  if (n.includes('balcony')) return '🌿';
  if (n.includes('coffee')) return '☕';
  if (n.includes('sea')) return '🌊';
  if (n.includes('mountain')) return '🏔️';
  if (n.includes('ski')) return '🎿';
  if (n.includes('garden')) return '🌿';
  if (n.includes('terrace')) return '🌤️';
  if (n.includes('tv')) return '📺';
  if (n.includes('elevator')) return '🛗';

  return '✔️';
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
      </div>
    `;
  }
}

function buildGalleryHTML(place, name) {
  const photos = getPhotosForPlace(place);
  const mainPhoto = photos[0] || 'images/places/default-place.jpg';
  const sidePhotos = photos.slice(1, 3);

  return `
    <div class="place-gallery">
      <div class="place-gallery-main">
        <img
          src="${mainPhoto}"
          alt="${escHtml(name)}"
          class="gallery-img gallery-main-img"
          data-full="${mainPhoto}"
        />
      </div>

      <div class="place-gallery-side">
        ${sidePhotos.map((photo, index) => `
          <img
            src="${photo}"
            alt="${escHtml(name)} photo ${index + 2}"
            class="gallery-img gallery-side-img"
            data-full="${photo}"
          />
        `).join('')}
      </div>
    </div>
  `;
}

function displayPlaceDetails(place) {
  const detailsEl = document.getElementById('place-details');
  detailsEl.innerHTML = '';

  const name = place.title || place.name || 'Unknown';
  const price = place.price_by_night ?? place.price ?? '?';
  const locationLabel = getLocationLabel(place);
  const guestsLabel = getGuestsLabel(place);
  const galleryHTML = buildGalleryHTML(place, name);

  document.title = `HBnB — ${name}`;

  const reviewLink = document.getElementById('add-review-link');
  if (reviewLink) {
    reviewLink.href = `add_review.html?id=${encodeURIComponent(place.id)}`;
  }

  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a => `
        <li class="amenity-tag">
          ${getAmenityIcon(a.name || a)} ${escHtml(a.name || a)}
        </li>
      `).join('')
    : `
      <li class="amenity-tag">📶 WiFi</li>
      <li class="amenity-tag">🍳 Kitchen</li>
      <li class="amenity-tag">🔥 Heating</li>
    `;

  const reviewsHTML = (place.reviews && place.reviews.length)
    ? place.reviews.map(r => {
        const rating = Number(r.rating ?? 0);
        const safeRating = Math.max(0, Math.min(5, rating));
        const stars = '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
        const author = r.user_name || r.user?.first_name || 'Anonymous';

        return `
          <div class="review-card">
            <div class="review-card-header">
              <span class="review-author">${escHtml(author)}</span>
              <span class="review-rating">${stars}</span>
            </div>
            <p class="review-text">${escHtml(r.text || r.comment || '')}</p>
          </div>
        `;
      }).join('')
    : '<p class="text-muted" style="font-style:italic;">No reviews yet — be the first to share your experience.</p>';

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="place-details">
      ${galleryHTML}

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

      <h2 class="section-title">Amenities</h2>
      <ul class="amenities-list">
        ${amenitiesHTML}
      </ul>
    </div>

    <h2 class="section-title" style="margin-top:2.5rem;">Guest reviews</h2>
    <div class="reviews-grid">${reviewsHTML}</div>
  `;

  detailsEl.appendChild(section);
  applyImageFallbacks();
  initLightbox();
}

function applyImageFallbacks() {
  const images = document.querySelectorAll('.gallery-img');

  images.forEach((img) => {
    img.addEventListener('error', function handleError() {
      this.onerror = null;
      this.src = 'images/places/default-place.jpg';
      this.dataset.full = 'images/places/default-place.jpg';
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));

  if (!lightbox || !lightboxImage || galleryImages.length === 0) return;

  let currentIndex = 0;

  function showImage(index) {
    if (galleryImages.length === 0) return;

    if (index < 0) {
      currentIndex = galleryImages.length - 1;
    } else if (index >= galleryImages.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const selectedImage = galleryImages[currentIndex];
    lightboxImage.src = selectedImage.dataset.full || selectedImage.src;
    lightboxImage.alt = selectedImage.alt || 'Expanded photo';
  }

  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentIndex = index;
      showImage(currentIndex);
      lightbox.classList.remove('hidden');
    });
  });

  if (lightboxPrev) {
    lightboxPrev.onclick = (e) => {
      e.stopPropagation();
      showImage(currentIndex - 1);
    };
  }

  if (lightboxNext) {
    lightboxNext.onclick = (e) => {
      e.stopPropagation();
      showImage(currentIndex + 1);
    };
  }

  if (lightboxClose) {
    lightboxClose.onclick = () => {
      lightbox.classList.add('hidden');
      lightboxImage.src = '';
    };
  }

  lightbox.onclick = (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add('hidden');
      lightboxImage.src = '';
    }
  };

  document.onkeydown = (e) => {
    if (lightbox.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      lightbox.classList.add('hidden');
      lightboxImage.src = '';
    }

    if (e.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    }

    if (e.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    }
  };
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
