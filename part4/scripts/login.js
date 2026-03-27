/**
 * login.js — Task 1 : Login functionality
 *
 * - Écoute le submit du formulaire #login-form
 * - POST /auth/login via Fetch API
 * - Stocke le JWT dans le cookie `token`
 * - Redirige vers index.html si succès
 * - Affiche un message d'erreur si échec
 */

'use strict';

/* ─── Helper : stocke le JWT dans un cookie ─── */
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}

/* ─── Fonction principale de login ─── */
async function loginUser(email, password) {
  const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const data = await response.json();
    setCookie('token', data.access_token);
    window.location.href = 'index.html';
  } else {
    /* Essaie de lire un message JSON, sinon affiche le statusText */
    let message = response.statusText;
    try {
      const err = await response.json();
      message = err.message || err.error || message;
    } catch (_) { /* pas de corps JSON */ }

    const msgEl = document.getElementById('form-message');
    if (msgEl) {
      msgEl.textContent   = `Login failed: ${message}`;
      msgEl.className     = 'form-message error';
      msgEl.style.display = 'block';
    } else {
      alert('Login failed: ' + message);
    }
  }
}

/* ─── Event listener sur DOMContentLoaded ─── */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      /* Validation minimale côté client */
      if (!email || !password) {
        const msgEl = document.getElementById('form-message');
        if (msgEl) {
          msgEl.textContent   = 'Please fill in both fields.';
          msgEl.className     = 'form-message error';
          msgEl.style.display = 'block';
        }
        return;
      }

      /* Désactive le bouton pendant la requête */
      const btn = document.getElementById('submit-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

      try {
        await loginUser(email, password);
      } finally {
        /* Ré-active si on reste sur la page (échec) */
        if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
      }
    });
  }
});