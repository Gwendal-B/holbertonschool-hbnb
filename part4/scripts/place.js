/**
 * login.js — Gestion du formulaire de connexion
 *
 * Flux :
 *  1. Si déjà authentifié → redirect index.html
 *  2. Submit → POST /auth/login
 *  3. Stockage du JWT dans un cookie
 *  4. Redirect vers index.html
 */

'use strict';

/* Charge api.js en premier (tag <script> dans le HTML) */
document.addEventListener('DOMContentLoaded', () => {
  const { api, setToken, isAuthenticated } = window.HBnB;

  /* ── Redirect si déjà connecté ── */
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  /* ── Éléments DOM ── */
  const form      = document.getElementById('login-form');
  const emailEl   = document.getElementById('email');
  const passEl    = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  const msgEl     = document.getElementById('form-message');

  /* ── Helpers ── */
  function showMessage(text, type /* 'success' | 'error' */) {
    msgEl.textContent = text;
    msgEl.className   = `form-message ${type}`;
    msgEl.style.display = 'block';
  }

  function showError(id, text) {
    const el = document.getElementById(id);
    if (el) { el.textContent = text; el.style.display = 'block'; }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.style.display = 'none';
    });
    msgEl.style.display = 'none';
  }

  function validateForm() {
    let valid = true;
    clearErrors();

    if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      showError('email-error', 'Please enter a valid email address.');
      valid = false;
    }

    if (!passEl.value) {
      showError('password-error', 'Password is required.');
      valid = false;
    }

    return valid;
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled   = true;
    submitBtn.textContent = 'Signing in…';

    try {
      const data = await api.login(emailEl.value.trim(), passEl.value);
      setToken(data.access_token);
      showMessage('Login successful! Redirecting…', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    } catch (err) {
      showMessage(
        err.message.includes('401') || err.message.toLowerCase().includes('invalid')
          ? 'Invalid email or password.'
          : `Error: ${err.message}`,
        'error'
      );
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = 'Sign in';
    }
  });
});