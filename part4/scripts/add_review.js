/**
 * add_review.js — Formulaire d'ajout de review
 *
 * Flux :
 *  1. Si NON authentifié → redirect index.html
 *  2. Lit ?id= pour avoir le placeId
 *  3. Submit → POST /places/:id/reviews
 *  4. Succès → redirect place.html?id=...
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const { api, isAuthenticated } = window.HBnB;

  /* ── Guard : authentification requise ── */
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  /* ── Lit l'ID de la place ── */
  const params  = new URLSearchParams(window.location.search);
  const placeId = params.get('id');

  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }

  /* ── DOM refs ── */
  const form       = document.getElementById('review-form');
  const ratingEl   = document.getElementById('rating');
  const textEl     = document.getElementById('review-text');
  const submitBtn  = document.getElementById('submit-btn');
  const msgEl      = document.getElementById('form-message');

  /* ── Helpers ── */
  function showMessage(text, type) {
    msgEl.textContent   = text;
    msgEl.className     = `form-message ${type}`;
    msgEl.style.display = 'block';
  }

  function showFieldError(id, text) {
    const el = document.getElementById(id);
    if (el) { el.textContent = text; el.style.display = 'block'; }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.style.display = 'none';
    });
    msgEl.style.display = 'none';
  }

  function validate() {
    let valid = true;
    clearErrors();

    if (!ratingEl.value) {
      showFieldError('rating-error', 'Please select a rating.');
      valid = false;
    }

    if (!textEl.value.trim()) {
      showFieldError('text-error', 'Please write your review before submitting.');
      valid = false;
    } else if (textEl.value.trim().length < 10) {
      showFieldError('text-error', 'Your review must be at least 10 characters.');
      valid = false;
    }

    return valid;
  }

  /* ── Optionnel : affiche le nom de la place dans le sous-titre ── */
  async function fetchPlaceName() {
    try {
      const place = await window.HBnB.api.getPlace(placeId);
      const subEl = document.getElementById('place-name-sub');
      if (subEl && (place.title || place.name)) {
        subEl.textContent = `You're reviewing "${place.title || place.name}".`;
      }
    } catch (_) { /* pas bloquant */ }
  }

  fetchPlaceName();

  /* ── Submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting…';

    try {
      await api.addReview(placeId, {
        text:   textEl.value.trim(),
        rating: parseInt(ratingEl.value, 10),
      });

      showMessage('Review submitted! Redirecting…', 'success');
      setTimeout(() => {
        window.location.href = `place.html?id=${encodeURIComponent(placeId)}`;
      }, 1200);
    } catch (err) {
      showMessage(`Failed to submit review: ${err.message}`, 'error');
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit review';
    }
  });
});