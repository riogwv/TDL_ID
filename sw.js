'use strict';
// Flow Service Worker — shell caching only.
// Firebase CDN scripts, Firestore, and Auth are network-only so we never
// accidentally serve stale auth tokens or SDK versions from cache.
//
// DEPLOYMENT NOTE: bump CACHE (e.g. flow-shell-v2, flow-shell-v3) whenever
// you change app.js, style.css, or index.html so users receive the updated
// files instead of the cached version. The activate handler automatically
// deletes the previous cache version.

const CACHE = 'flow-shell-v1';

// Only cache the app shell files we own. Everything on gstatic / googleapis
// goes through the network.
const SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Let Firebase CDN, Firestore, Auth, and Storage go straight to the network.
  const networkOnly = [
    'gstatic.com', 'googleapis.com', 'firebaseapp.com',
    'firebase.com', 'firebasestorage.app'
  ];
  if (networkOnly.some(h => url.hostname.endsWith(h))) return;

  // For same-origin navigation requests: serve index.html from cache if offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for shell assets; fall back to network.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
