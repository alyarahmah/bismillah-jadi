import CONFIG from "../globals/config"
import * as AuthModel from "../models/auth-model"

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

      // Kirim subscription ke server Anda untuk disimpan
      await this._sendSubscriptionToServer(subscription)

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
        // Beri tahu server untuk menghapus subscription ini
        await this._removeSubscriptionFromServer(subscription)

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

  async _sendSubscriptionToServer(subscription) {
    // NOTE: Ini adalah placeholder. Anda perlu membuat endpoint backend sungguhan.
    // Endpoint ini harus menyimpan data subscription yang berelasi dengan user.
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthModel.getAuthToken()}`, // Asumsi Anda perlu otentikasi
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error("Failed to send subscription to server.")
      }

      console.log("Subscription sent to server.")
    } catch (error) {
      console.error("Error sending subscription to server:", error)
      // Jika gagal mengirim ke server, batalkan subscription di sisi klien
      // agar state tetap konsisten dan UI tidak menampilkan status yang salah.
      if (subscription) {
        await subscription.unsubscribe()
      }
      throw error // Lemparkan error agar bisa ditangani di UI (misal: menampilkan alert)
    }
  },

  async _removeSubscriptionFromServer(subscription) {
    // NOTE: Ini adalah placeholder. Anda perlu membuat endpoint backend sungguhan.
    // Endpoint ini harus mencari dan menghapus data subscription berdasarkan endpoint-nya.
    try {
      await fetch(`${CONFIG.API_BASE_URL}/unsubscribe`, {
        method: "POST", // Anda bisa juga menggunakan metode DELETE
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthModel.getAuthToken()}`, // Asumsi Anda perlu otentikasi
        },
        // Kirim 'endpoint' sebagai pengenal unik untuk subscription yang akan dihapus
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      console.log("Unsubscribe request sent to server.")
    } catch (error) {
      console.error("Failed to send unsubscribe request to server:", error)
      // Tidak perlu melempar error di sini, agar proses unsubscribe di browser tetap berjalan.
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
