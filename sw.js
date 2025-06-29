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
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === "document") {
            return caches.match("/")
          }
        })
    }),
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
