'use strict';

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function checkAuthentication() {
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
  const response = await fetch('http://127.0.0.1:5000/api/v1/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: reviewText,
      rating: parseInt(document.getElementById('rating').value, 10),
      place_id: placeId
    })
  });

  await handleResponse(response, placeId);
}

async function handleResponse(response, placeId) {
  if (response.ok) {
    alert('Review submitted successfully!');
    document.getElementById('review-form').reset();
    window.location.href = `place.html?id=${encodeURIComponent(placeId)}`;
  } else {
    let message = 'Failed to submit review';
    try {
      const err = await response.json();
      message = err.message || err.error || err.msg || JSON.stringify(err);
    } catch (_) {
      // ignore
    }
    alert(message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
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
