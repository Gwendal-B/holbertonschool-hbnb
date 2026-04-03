/**
 * place.js
 * Script de la page détail d'une place.
 * Il récupère l'ID dans l'URL, charge les informations du logement,
 * affiche la galerie, gère l'authentification et permet
 * l'édition/suppression des reviews autorisées.
 */
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

/*
  Récupère l'utilisateur authentifié via /auth/me.
  Cette information sert ensuite à afficher les actions "Edit/Delete"
  uniquement sur les reviews que l'utilisateur a le droit de gérer.
*/
async function fetchCurrentUser() {
  // Sert à savoir si l'utilisateur courant peut modifier une review.
  const token = getCookie('token');

  if (!token) return null;

  try {
    return await window.HBnB.api.getCurrentUser();
  } catch (_) {
    return null;
  }
}

function getLocationLabel(place) {
  // Même logique que sur la home : données API si disponibles, sinon fallback lisible.
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
  // Fournit un fallback si le backend ne renvoie pas explicitement le nombre de guests.
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
  // Associe une icône simple à chaque amenity pour améliorer la lecture visuelle.
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
  if (n.includes('pet')) return '🐶';
  if (n.includes('forest')) return '🌲';
  if (n.includes('feeding')) return '🍖';
  if (n.includes('wood')) return '🪵';
  if (n.includes('magical')) return '🧙‍♂️';
  if (n.includes('environment')) return '🕯️';
  if (n.includes('lake')) return '🌊';
  if (n.includes('stone')) return '🪨';
  if (n.includes('fire')) return '🔥';
  if (n.includes('fishing')) return '🐟';
  if (n.includes('phenomena')) return '⚠️';

  return '✔️';
}

function checkAuthentication() {
  // Adapte le lien Login/Logout et déclenche ensuite le chargement de la place.
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
        window.location.href = 'index.html';
      };
    }
  }

  fetchPlaceDetails(token, placeId);
}

async function fetchPlaceDetails(token, placeId) {
  // Charge en parallèle la place et l'utilisateur courant.
  try {
    const [place, currentUser] = await Promise.all([
      window.HBnB.api.getPlace(placeId),
      fetchCurrentUser()
    ]);
    displayPlaceDetails(place, currentUser);
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
  // Prépare la galerie avec une grande image principale et deux miniatures.
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

function displayPlaceDetails(place, currentUser = null) {
  // Rend tout le contenu principal de la page détail à partir de la réponse API.
  const detailsEl = document.getElementById('place-details');
  detailsEl.innerHTML = '';

  const name = place.title || place.name || 'Unknown';
  const price = place.price_by_night ?? place.price ?? '?';
  const locationLabel = getLocationLabel(place);
  const guestsLabel = getGuestsLabel(place);
  const galleryHTML = buildGalleryHTML(place, name);
  const canManagePlace = currentUser &&
    place.owner &&
    (currentUser.is_admin || currentUser.id === place.owner.id);

  const placeActionsHTML = canManagePlace ? `
    <div class="place-actions">
      <button
        id="edit-place-btn"
        class="edit-place-btn"
        data-place-id="${place.id}"
        data-place-title="${escHtml(name)}"
        data-place-description="${escHtml(place.description || '')}"
        data-place-price="${price}"
        data-place-city="${escHtml(place.city || '')}"
        data-place-country="${escHtml(place.country || '')}"
        data-place-guests="${place.max_guests ?? guestsLabel}">
        Edit place
      </button>
    </div>
  ` : '';

  document.title = `HBnB — ${name}`;

  const amenitiesHTML = (place.amenities && place.amenities.length)
    ? place.amenities.map(a => `
        <li class="amenity-tag">
          ${getAmenityIcon(a.name || a)} ${escHtml(a.name || a)}
        </li>
      `).join('')
    : `
      <!-- Fallback visuel si aucune amenity n'est renvoyée -->
      <li class="amenity-tag">📶 WiFi</li>
      <li class="amenity-tag">🍳 Kitchen</li>
      <li class="amenity-tag">🔥 Heating</li>
    `;

  const reviewsHTML = (place.reviews && place.reviews.length)
    ? place.reviews.map(r => {
        // On sécurise la note entre 0 et 5 avant d'afficher les étoiles.
        const rating = Number(r.rating ?? 0);
        const safeRating = Math.max(0, Math.min(5, rating));
        const stars = '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
        const author = r.user_name || r.user?.first_name || 'Anonymous';

        // Le bouton d'édition n'apparaît que pour l'auteur de la review ou un admin.
        const canManageReview = currentUser &&
          (currentUser.is_admin || currentUser.id === r.user_id);

        return `
          <div class="review-card">
            <div class="review-card-header">
              <span class="review-author">${escHtml(author)}</span>
              <span class="review-rating">${stars}</span>
            </div>

            <p class="review-text">${escHtml(r.text || r.comment || '')}</p>

            ${canManageReview ? `
              <div class="review-actions">
                <button
                  class="edit-review-btn"
                  data-review-id="${r.id}"
                  data-review-text="${escHtml(r.text || r.comment || '')}"
                  data-review-rating="${safeRating}">
                  Edit
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')
    : '<p class="text-muted" style="font-style:italic;">No reviews yet — be the first to share your experience.</p>';

  const token = getCookie('token');

  const addReviewHTML = token ? `
    <div class="add-review-block">
      <h2 class="section-title section-title-light">Add a Review</h2>
      <a href="add_review.html?id=${encodeURIComponent(place.id)}" class="add-review-btn">
        Write a review
      </a>
    </div>
  ` : '';

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="place-details">
      ${galleryHTML}

      <div class="place-details-header">
        <h1 class="place-details-title">${escHtml(name)}</h1>
        <span class="place-price-tag">$${price} / night</span>
        ${placeActionsHTML}
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

    <h2 class="section-title section-title-light" style="margin-top:2.5rem;">Guest reviews</h2>
    <div class="reviews-grid">${reviewsHTML}</div>
    ${addReviewHTML}

  `;

  detailsEl.appendChild(section);
  // Une fois le HTML injecté, on active les comportements liés au DOM créé dynamiquement.
  applyImageFallbacks();
  initLightbox();
  initPlaceActions(place, currentUser);
  initReviewActions(currentUser);
}

function applyImageFallbacks() {
  // Remplace chaque image cassée par l'image par défaut.
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
  // Ouvre les images en grand et permet la navigation clavier/boutons.
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));

  if (!lightbox || !lightboxImage || galleryImages.length === 0) return;

  let currentIndex = 0;

  function showImage(index) {
    // Boucle sur les images pour naviguer sans sortir des bornes.
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
      // Ouvre la lightbox sur l'image cliquée.
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
    // Navigation clavier uniquement quand la lightbox est visible.
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

function initPlaceActions(currentUser) {
  const editBtn = document.getElementById('edit-place-btn');
  const modal = document.getElementById('place-modal');
  const modalClose = document.getElementById('place-modal-close');

  const modalTitle = document.getElementById('place-modal-title');
  const modalDescription = document.getElementById('place-modal-description');
  const modalPrice = document.getElementById('place-modal-price');
  const modalCity = document.getElementById('place-modal-city');
  const modalCountry = document.getElementById('place-modal-country');
  const modalGuests = document.getElementById('place-modal-guests');
  
  const modalSave = document.getElementById('place-modal-save');
  const modalDelete = document.getElementById('place-modal-delete');
  const token = getCookie('token');

  if (
    !editBtn ||
    !modal ||
    !modalClose ||
    !modalSave ||
    !modalDelete ||
    !modalTitle ||
    !modalDescription ||
    !modalPrice ||
    !modalCity ||
    !modalCountry ||
    !modalGuests
  ) return;

  function openModal() {
    modalTitle.value = editBtn.dataset.placeTitle || '';
    modalDescription.value = editBtn.dataset.placeDescription || '';
    modalPrice.value = editBtn.dataset.placePrice || '';
    modalCity.value = editBtn.dataset.placeCity || '';
    modalCountry.value = editBtn.dataset.placeCountry || '';
    modalGuests.value = editBtn.dataset.placeGuests || '';

    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  editBtn.onclick = openModal;
  modalClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (
      e.target.classList.contains('place-modal') ||
      e.target.classList.contains('place-modal-overlay')
    ) {
      closeModal();
    }
  };

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden') && e.key === 'Escape') {
      closeModal();
    }
  });

  // 👉 SAVE (update place)
  modalSave.onclick = async () => {
    const placeId = editBtn.dataset.placeId;

    const body = {
      title: modalTitle.value.trim(),
      description: modalDescription.value.trim(),
      price: parseFloat(modalPrice.value),
      city: modalCity.value.trim(),
      country: modalCountry.value.trim(),
      max_guests: parseInt(modalGuests.value, 10)
    };

    try {
      await window.HBnB.api.updatePlace(placeId, body);
      closeModal();
      location.reload();
    } catch (_) {
      alert('Failed to update place');
    }
  };

  // 👉 DELETE place
  modalDelete.onclick = async () => {
    const placeId = editBtn.dataset.placeId;

    if (!confirm('Delete this place?')) return;

    try {
      await window.HBnB.api.deletePlace(placeId);
      window.location.href = 'index.html';
    } catch (_) {
      alert('Failed to delete place');
    }
  };
}

function initReviewActions(place, currentUser) {
  // Active la modale d'édition uniquement pour les reviews autorisées.
  const token = getCookie('token');
  if (!token) return;

  const modal = document.getElementById('review-modal');
  const modalClose = document.getElementById('review-modal-close');
  const modalText = document.getElementById('review-modal-text');
  const modalRating = document.getElementById('review-modal-rating');
  const modalSave = document.getElementById('review-modal-save');
  const modalDelete = document.getElementById('review-modal-delete');

  if (!modal || !modalText || !modalRating || !modalSave || !modalDelete) return;

  let currentReviewId = null;

  function openModal(reviewId, text, rating) {
    // Pré-remplit la modale avec le contenu actuel de la review.
    currentReviewId = reviewId;
    modalText.value = text || '';
    modalRating.value = String(rating || 5);
    modal.classList.remove('hidden');

    // ⚡ déclenche animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  function closeModal() {
    // Ferme la modale et réinitialise son état local.
    modal.classList.remove('show');

    setTimeout(() => {
      modal.classList.add('hidden');
      currentReviewId = null;
      modalText.value = '';
      modalRating.value = '5';
    }, 200);
  }

  document.querySelectorAll('.edit-review-btn').forEach(btn => {
    btn.onclick = () => {
      // Chaque bouton récupère les données stockées en data-* sur la review.
      const reviewId = btn.dataset.reviewId;
      const reviewText = btn.dataset.reviewText || '';
      const reviewRating = parseInt(btn.dataset.reviewRating || '5', 10);

      openModal(reviewId, reviewText, reviewRating);
    };
  });

  modalSave.onclick = async () => {
    // Met à jour la review sélectionnée via l'endpoint PUT /reviews/:id.
    if (!currentReviewId) return;

    const text = modalText.value.trim();
    const rating = parseInt(modalRating.value, 10);

    try {
      await window.HBnB.api.updateReview(currentReviewId, { text, rating });
      closeModal();
      location.reload();
    } catch (err) {
      let message = 'Failed to update review';
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      alert(message);
    }
  };

  modalDelete.onclick = async () => {
    // Supprime la review après confirmation utilisateur.
    if (!currentReviewId) return;

    if (!confirm('Delete this review?')) return;

    try {
      await window.HBnB.api.deleteReview(currentReviewId);
      closeModal();
      location.reload();
    } catch (err) {
      let message = 'Failed to delete review';
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      alert(message);
    }
  };

  modalClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (
      e.target.classList.contains('review-modal') ||
      e.target.classList.contains('review-modal-overlay')
    ) {
      closeModal();
    }
  };

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden') && e.key === 'Escape') {
      closeModal();
    }
  });
}
