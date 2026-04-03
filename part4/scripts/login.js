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

/* ─── Fonction principale de login ─── */
async function loginUser(email, password) {
  const data = await window.HBnB.api.login(email, password);
  window.HBnB.setToken(data.access_token);
  window.location.href = 'index.html';
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
      } catch (err) {
        const msgEl = document.getElementById('form-message');
        const message = err instanceof Error ? err.message : 'Login failed';

        if (msgEl) {
          msgEl.textContent = `Login failed: ${message}`;
          msgEl.className = 'form-message error';
          msgEl.style.display = 'block';
        } else {
          alert('Login failed: ' + message);
        }
      } finally {
        /* Ré-active si on reste sur la page (échec) */
        if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
      }
    });
  }
});
