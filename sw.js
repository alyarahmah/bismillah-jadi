const CACHE_NAME = "storybegin-v1"
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

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available, otherwise fetch from network
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // If the fetch is successful, clone it and store it in the cache.
        // We check for a valid, successful response.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return networkResponse
      }).catch(() => {
        // If the network request fails, serve the offline page for navigation requests.
        if (event.request.destination === "document") {
          return caches.match("/")
        }
      })
    })
  )
})

// Activate event
self.addEventListener("activate", (event) => {
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
