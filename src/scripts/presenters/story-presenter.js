import IndexedDBHelper from "../utils/indexeddb-helper"
import NotificationHelper from "../utils/notification-helper"

class StoryPresenter {
  constructor(view, storyModel, authModel) {
    this._view = view
    this._storyModel = storyModel
    this._authModel = authModel
  }

  async loadStories() {
    try {
      this._view.showLoading()

      // Try to load from API first
      try {
        const token = this._authModel.getAuthToken()
        const response = await this._storyModel.getStories(token)

        if (response.error === false && response.listStory) {
          this._view.displayStories(response.listStory)

          // Save stories to IndexedDB for offline access
          for (const story of response.listStory) {
            await IndexedDBHelper.addStory(story).catch(() => {
              // Ignore errors for duplicate entries
            })
          }
        } else {
          throw new Error(response.message || "Failed to load stories")
        }
      } catch (apiError) {
        console.warn("Failed to load from API, trying offline data:", apiError)

        // Fallback to IndexedDB if API fails
        const offlineStories = await IndexedDBHelper.getAllStories()
        if (offlineStories.length > 0) {
          this._view.displayStories(offlineStories)
          this._view.showError("Menampilkan data offline. Periksa koneksi internet Anda.")
        } else {
          throw apiError
        }
      }
    } catch (error) {
      console.error("Failed to load stories:", error)
      this._view.showError("Gagal memuat cerita. Periksa koneksi internet Anda.")
    } finally {
      this._view.hideLoading()
    }
  }

  async submitStory(storyData) {
    try {
      this._view.showLoading()

      const token = this._authModel.getAuthToken()
      if (!token) {
        throw new Error("Token tidak ditemukan")
      }

      const formData = new FormData()
      formData.append("description", storyData.description)
      formData.append("photo", storyData.photo)
      formData.append("lat", storyData.lat)
      formData.append("lon", storyData.lon)

      const response = await this._storyModel.addStory(formData, token)

      if (response.error === false) {
        this._view.showSuccess("Cerita berhasil ditambahkan!")

        // Save to IndexedDB
        const newStory = {
          id: response.data?.id || Date.now().toString(),
          name: this._authModel.getUserName() || "Anonymous",
          description: storyData.description,
          photoUrl: URL.createObjectURL(storyData.photo),
          createdAt: new Date().toISOString(),
          lat: storyData.lat,
          lon: storyData.lon,
        }

        await IndexedDBHelper.addStory(newStory)

        // Send notification about new story
        await NotificationHelper.sendNotification({
          title: "Cerita Baru Ditambahkan!",
          options: {
            body: `"${storyData.description.substring(0, 50)}${storyData.description.length > 50 ? "..." : ""}"`,
            icon: "/images/icon-192x192.png",
            badge: "/images/icon-72x72.png",
            tag: "new-story",
            requireInteraction: true,
          },
        })

        return true
      } else {
        throw new Error(response.message || "Gagal menambahkan cerita")
      }
    } catch (error) {
      console.error("Failed to submit story:", error)
      this._view.showError(error.message || "Gagal menambahkan cerita")
      return false
    } finally {
      this._view.hideLoading()
    }
  }
}

export default StoryPresenter
