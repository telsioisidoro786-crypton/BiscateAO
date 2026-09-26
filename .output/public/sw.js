// Service Worker para BiscateAO - Offline-first PWA
// Gerado automaticamente - não edite diretamente

const CACHE_NAME = 'biscateao-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/oficios',
  '/pedidos',
  '/pedir',
  '/guardados',
  '/como-funciona',
  '/login',
  '/favicon.svg',
  '/images/hero-oficina.jpg',
];

// Install - pré-cache assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
    }).then(() => self.skipWaiting())
  );
});

// Activate - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia: Network First para HTML/API, Cache First para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') return;

  // Ignorar requests cross-origin (exceto fonts.googleapis.com)
  if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }

  // API requests - Network First com fallback para cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_server')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // HTML pages - Network First com fallback offline
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Assets estáticos (JS, CSS, imagens) - Cache First
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request));
});

// Network First Strategy
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Network First com página offline como fallback
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback para página offline
    const offlineResponse = await cache.match(OFFLINE_URL);
    if (offlineResponse) return offlineResponse;
    // Último recurso: resposta básica
    return new Response(
      '<html><body><h1>Offline</h1><p>Você está offline. Algumas funcionalidades podem não estar disponíveis.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    // Atualizar cache em background (stale-while-revalidate)
    fetch(request).then((response) => {
      if (response.ok) cache.put(request, response);
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// Background Sync para ações offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-propostas') {
    event.waitUntil(syncPropostas());
  } else if (event.tag === 'sync-pedidos') {
    event.waitUntil(syncPedidos());
  } else if (event.tag === 'sync-chat') {
    event.waitUntil(syncChat());
  }
});

async function syncPropostas() {
  const db = await openIndexedDB();
  const propostas = await db.getAll('pendingPropostas');
  for (const proposta of propostas) {
    try {
      await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposta),
      });
      await db.delete('pendingPropostas', proposta.id);
    } catch (e) {
      console.error('Sync propostas failed:', e);
    }
  }
}

async function syncPedidos() {
  const db = await openIndexedDB();
  const pedidos = await db.getAll('pendingPedidos');
  for (const pedido of pedidos) {
    try {
      await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido),
      });
      await db.delete('pendingPedidos', pedido.id);
    } catch (e) {
      console.error('Sync pedidos failed:', e);
    }
  }
}

async function syncChat() {
  const db = await openIndexedDB();
  const messages = await db.getAll('pendingChat');
  for (const msg of messages) {
    try {
      await fetch(`/api/pedidos/${msg.jobId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.text }),
      });
      await db.delete('pendingChat', msg.id);
    } catch (e) {
      console.error('Sync chat failed:', e);
    }
  }
}

// IndexedDB helper
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('biscateao-offline', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingPropostas')) {
        db.createObjectStore('pendingPropostas', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingPedidos')) {
        db.createObjectStore('pendingPedidos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingChat')) {
        db.createObjectStore('pendingChat', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedProfissionais')) {
        db.createObjectStore('cachedProfissionais', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedJobs')) {
        db.createObjectStore('cachedJobs', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'biscateao-notification',
    data: data.url ? { url: data.url } : {},
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Tentar focar janela existente
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Abrir nova janela
      return clients.openWindow(url);
    })
  );
});

// Periodic Background Sync (se suportado)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-profissionais') {
    event.waitUntil(refreshProfissionaisCache());
  }
});

async function refreshProfissionaisCache() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch('/api/profissionais?limit=50');
    if (response.ok) {
      await cache.put('/api/profissionais?limit=50', response);
    }
  } catch (e) {
    console.error('Periodic sync failed:', e);
  }
}

// Message handling para comunicação com o app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'CACHE_PROFISSIONAIS') {
    event.waitUntil(cacheProfissionais(event.data.profissionais));
  } else if (event.data?.type === 'CACHE_JOBS') {
    event.waitUntil(cacheJobs(event.data.jobs));
  } else if (event.data?.type === 'REGISTER_SYNC') {
    self.registration.sync.register(event.data.tag);
  }
});

async function cacheProfissionais(profissionais) {
  const cache = await caches.open(CACHE_NAME);
  const requests = profissionais.map((p) => new Request(`/api/profissionais/${p.id}`));
  const responses = await Promise.all(
    requests.map((req) => fetch(req).then((r) => r.ok ? r : null))
  );
  for (let i = 0; i < requests.length; i++) {
    if (responses[i]) {
      await cache.put(requests[i], responses[i].clone());
    }
  }
}

async function cacheJobs(jobs) {
  const cache = await caches.open(CACHE_NAME);
  const requests = jobs.map((j) => new Request(`/api/pedidos/${j.id}`));
  const responses = await Promise.all(
    requests.map((req) => fetch(req).then((r) => r.ok ? r : null))
  );
  for (let i = 0; i < requests.length; i++) {
    if (responses[i]) {
      await cache.put(requests[i], responses[i].clone());
    }
  }
}

console.log('[SW] BiscateAO Service Worker loaded');