/**
 * add_review.js
 * Gère la création d'une review.
 * Vérifie que l'utilisateur est connecté, récupère l'ID de la place
 * depuis l'URL et envoie la review à l'API.
 */
'use strict';

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
  // Redirige vers la page de login si aucun token n'est présent.
  const token = getCookie('token');
  if (!token) {
    window.location.href = 'login.html';
  }
  return token;
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);

  // accepte les 2 formats : ?id=... ou ?place_id=...
  return params.get('id') || params.get('place_id');
}

async function submitReview(token, placeId, reviewText) {
  // Envoie la review au backend avec le texte, la note et l'ID de la place.
  try {
    await window.HBnB.api.createReview(placeId, {
      text: reviewText,
      rating: parseInt(document.getElementById('rating').value, 10)
    });

    alert('Review submitted successfully!');
    document.getElementById('review-form').reset();
    window.location.href = `place.html?id=${encodeURIComponent(placeId)}`;
  } catch (err) {
    let message = 'Failed to submit review';
    if (err instanceof Error && err.message) {
      message = err.message;
    }
    alert(message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialise la page : vérifie la session, récupère l'ID de la place,
  // puis branche l'envoi du formulaire.
  const reviewForm = document.getElementById('review-form');
  const token = checkAuthentication();
  const placeId = getPlaceIdFromURL();

  if (!placeId) {
    alert('Missing place ID in URL.');
    window.location.href = 'index.html';
    return;
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Validation minimale côté client avant l'appel API.
      const reviewText = document.getElementById('review-text').value.trim();
      const rating = document.getElementById('rating').value;

      if (!reviewText) {
        alert('Please write your review before submitting.');
        return;
      }

      if (!rating) {
        alert('Please select a rating.');
        return;
      }

      await submitReview(token, placeId, reviewText);
    });
  }
});
