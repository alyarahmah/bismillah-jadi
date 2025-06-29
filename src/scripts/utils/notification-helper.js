const NotificationHelper = {
  async requestPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  },

  async sendNotification({ title, options }) {
    if (!(await this.requestPermission())) {
      console.log("Notification permission denied")
      return
    }

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.showNotification(title, {
        body: options.body,
        icon: "/images/icon-192x192.png",
        badge: "/images/icon-72x72.png",
        ...options,
      })
    } else {
      new Notification(title, {
        icon: "/images/icon-192x192.png",
        ...options,
      })
    }
  },
}

export default NotificationHelper
