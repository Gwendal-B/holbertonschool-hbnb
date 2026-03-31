/**
 * add_review.js — Task 4 : Add Review Form
 *
 * Fonctions exactes demandées par le cahier des charges :
 *   - getCookie(name)
 *   - checkAuthentication()     → retourne le token ou redirect
 *   - getPlaceIdFromURL()
 *   - submitReview(token, placeId, reviewText)
 *   - handleResponse(response)
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
   Vérifie l'auth — redirige si pas de token
   Retourne le token si présent
   ───────────────────────────────────────────── */
function checkAuthentication() {
  const token = getCookie('token');
  if (!token) {
    window.location.href = 'index.html';
  }
  return token;
}

/* ─────────────────────────────────────────────
   Extrait le place ID depuis ?id=... dans l'URL
   ───────────────────────────────────────────── */
function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/* ─────────────────────────────────────────────
   Envoie le review via POST /places/:id/reviews
   ───────────────────────────────────────────── */
async function submitReview(token, placeId, reviewText) {
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text:   reviewText,
      rating: parseInt(document.getElementById('rating').value, 10),
      place_id: placeId
    })
  });

  handleResponse(response);
}

/* ─────────────────────────────────────────────
   Gère la réponse de l'API
   ───────────────────────────────────────────── */
function handleResponse(response) {
  if (response.ok) {
    alert('Review submitted successfully!');
    document.getElementById('review-form').reset();   // vide le formulaire
  } else {
    alert('Failed to submit review');
  }
}

/* ─────────────────────────────────────────────
   Point d'entrée
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  const token      = checkAuthentication();   // redirect si pas connecté
  const placeId    = getPlaceIdFromURL();

  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const reviewText = document.getElementById('review-text').value.trim();

      if (!reviewText) {
        alert('Please write your review before submitting.');
        return;
      }

      await submitReview(token, placeId, reviewText);
    });
  }
});