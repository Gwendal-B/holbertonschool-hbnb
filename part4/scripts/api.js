/**
 * api.js — Shared API helpers for HBnB Part 4
 *
 * Centralise l'URL de base, la gestion du token JWT (cookie),
 * et les wrappers fetch pour tous les endpoints.
 */

'use strict';

/* ─────────────────────────────────────────────────
   Configuration
   ───────────────────────────────────────────────── */
const API_BASE = 'http://127.0.0.1:5000/api/v1';

/* ─────────────────────────────────────────────────
   Cookie helpers
   ───────────────────────────────────────────────── */

/**
 * Lit la valeur d'un cookie par son nom.
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Stocke une valeur dans un cookie (session uniquement par défaut).
 * @param {string} name
 * @param {string} value
 * @param {number} [days]  Si omis → cookie de session
 */
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${d.toUTCString()}`;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

/**
 * Supprime un cookie (déconnexion).
 * @param {string} name
 */
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/* ─────────────────────────────────────────────────
   Token JWT
   ───────────────────────────────────────────────── */

const TOKEN_KEY = 'token';

/** Récupère le JWT stocké en cookie. */
function getToken() {
  return getCookie(TOKEN_KEY);
}

/** Stocke le JWT en cookie (session). */
function setToken(token) {
  setCookie(TOKEN_KEY, token);
}

/** Supprime le JWT (logout). */
function removeToken() {
  deleteCookie(TOKEN_KEY);
}

/** Retourne true si l'utilisateur est authentifié. */
function isAuthenticated() {
  return Boolean(getToken());
}

/* ─────────────────────────────────────────────────
   Fetch wrapper
   ───────────────────────────────────────────────── */

/**
 * Wrapper générique autour de fetch().
 * Ajoute automatiquement le header Authorization si un token existe.
 *
 * @param {string} path        Chemin relatif, ex: '/places'
 * @param {RequestInit} [opts] Options fetch supplémentaires
 * @returns {Promise<any>}     Corps JSON parsé
 * @throws {Error}             Si la réponse n'est pas OK
 */
async function apiFetch(path, opts = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    // Tente de lire un message d'erreur JSON
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.message || err.error || message;
    } catch (_) { /* ignore */ }
    throw new Error(message);
  }

  // 204 No Content → pas de corps JSON
  if (response.status === 204) return null;
  return response.json();
}

/* ─────────────────────────────────────────────────
   API endpoints
   ───────────────────────────────────────────────── */

const api = {
  /**
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string}>}
   */
  login(email, password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * GET /places
   * @returns {Promise<Array>}
   */
  getPlaces() {
    return apiFetch('/places');
  },

  /**
   * GET /places/:id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getPlace(id) {
    return apiFetch(`/places/${id}`);
  },

  /**
   * POST /places/:id/reviews
   * @param {string} placeId
   * @param {{text: string, rating: number}} data
   * @returns {Promise<Object>}
   */
  addReview(placeId, data) {
    return apiFetch(`/places/${placeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/* ─────────────────────────────────────────────────
   Exports (module ES6 — ou globals si pas de bundler)
   ───────────────────────────────────────────────── */
// Si tu utilises un bundler : export { api, getToken, setToken, removeToken, isAuthenticated };
// En pur HTML/JS (fichiers servis statiquement), on expose sur window :
window.HBnB = { api, getToken, setToken, removeToken, isAuthenticated };