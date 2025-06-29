import CONFIG from "../globals/config"

const PushNotification = {
  async init() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported")
      return false
    }

    const registration = await navigator.serviceWorker.ready
    return registration
  },

  async getSubscription() {
    const registration = await this.init()
    if (!registration) return null

    return await registration.pushManager.getSubscription()
  },

  async subscribe() {
    try {
      const registration = await this.init()
      if (!registration) return null

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY),
      })

      console.log("Push subscription successful:", subscription)
      return subscription
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      return null
    }
  },

  async unsubscribe() {
    try {
      const subscription = await this.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        console.log("Push subscription cancelled")
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error)
      return false
    }
  },

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  },
}

export default PushNotification
