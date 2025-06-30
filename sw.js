const CACHE_NAME = "storybegin-v1"
const API_BASE_URL = "https://story-api.dicoding.dev/v1" // Tambahkan base URL API Anda
const urlsToCache = [
  "/",
  "/manifest.json",
  "/images/icon-72x72.png",
  "/images/icon-96x96.png",
  "/images/icon-128x128.png",
  "/images/icon-144x144.png",
  "/images/icon-152x152.png",
  "/images/icon-192x192.png",
  "/images/icon-384x384.png",
  "/images/icon-512x512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
]

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting() // <-- TAMBAHKAN INI: Paksa SW untuk aktif segera
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  // We only want to cache GET requests with http/https-schemes.
  // This is a common strategy to ignore requests that are not relevant to the app's assets,
  // especially during development with tools like webpack-dev-server (e.g., HMR, WebSockets)
  // or requests from browser extensions (chrome-extension://).
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return
  }

  // Strategi Network-First untuk permintaan API
  if (event.request.url.startsWith(API_BASE_URL)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Jika berhasil, simpan ke cache dan kembalikan respons jaringan
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return networkResponse
        })
        .catch(() => {
          // Jika jaringan gagal, coba ambil dari cache
          return caches.match(event.request)
        }),
    )
    return
  }

  // Strategi Cache-First untuk aset statis (default)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return networkResponse
        })
      )
    }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim()) // <-- TAMBAHKAN INI: Ambil kontrol halaman segera
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Push event
self.addEventListener("push", (event) => {
  console.log("Push event received:", event)

  const options = {
    body: event.data ? event.data.text() : "Ada cerita baru yang ditambahkan!",
    icon: "/images/icon-192x192.png",
    badge: "/images/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Lihat Cerita",
        icon: "/images/icon-192x192.png",
      },
      {
        action: "close",
        title: "Tutup",
        icon: "/images/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Story Begin - Cerita Baru!", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  } else if (event.action === "close") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})
