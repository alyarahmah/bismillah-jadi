import IndexedDBHelper from "../utils/indexeddb-helper"
import { showFormattedDate } from "../utils"

export default class OfflineStoriesView {
  async render() {
    return `
      <section class="offline-stories-section">
        <div class="container">
          <div class="page-header">
            <h1><i class="fas fa-wifi-slash" aria-hidden="true"></i> Cerita Tersimpan</h1>
            <p>Cerita yang tersimpan secara offline di perangkat Anda</p>
          </div>
          
          <div class="offline-actions">
            <button id="refresh-offline-stories" class="btn btn-primary">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button id="clear-offline-stories" class="btn btn-danger">
              <i class="fas fa-trash"></i> Hapus Semua
            </button>
          </div>
          
          <div id="offline-stories-container" class="stories-container">
            <div class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Memuat cerita tersimpan...</p>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    await this.loadOfflineStories()
    this.initializeEventListeners()
  }

  async loadOfflineStories() {
    try {
      const stories = await IndexedDBHelper.getAllStories()
      this.displayOfflineStories(stories)
    } catch (error) {
      console.error("Failed to load offline stories:", error)
      this.showError("Gagal memuat cerita tersimpan")
    }
  }

  displayOfflineStories(stories) {
    const container = document.getElementById("offline-stories-container")

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Belum ada cerita tersimpan</h3>
          <p>Cerita yang Anda simpan secara offline akan muncul di sini</p>
        </div>
      `
      return
    }

    const storiesHTML = stories
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .map(
        (story) => `
        <article class="story-card offline-story-card" data-story-id="${story.id}">
          <div class="story-image">
            <img src="${story.photoUrl}" alt="Foto cerita: ${story.description}" loading="lazy" />
            <div class="offline-badge">
              <i class="fas fa-wifi-slash"></i> Offline
            </div>
          </div>
          <div class="story-content">
            <h3 class="story-title">${story.name}</h3>
            <p class="story-description">${story.description}</p>
            <div class="story-meta">
              <span class="story-date">
                <i class="fas fa-save" aria-hidden="true"></i>
                Disimpan: ${showFormattedDate(story.savedAt, "id-ID")}
              </span>
              <span class="story-date">
                <i class="fas fa-calendar" aria-hidden="true"></i>
                Dibuat: ${showFormattedDate(story.createdAt, "id-ID")}
              </span>
            </div>
            <div class="story-actions">
              <button class="btn btn-danger btn-sm delete-offline-story" data-story-id="${story.id}">
                <i class="fas fa-trash"></i> Hapus
              </button>
            </div>
          </div>
        </article>
      `,
      )
      .join("")

    container.innerHTML = storiesHTML

    // Add event listeners for delete buttons
    container.querySelectorAll(".delete-offline-story").forEach((button) => {
      button.addEventListener("click", (e) => {
        const storyId = e.target.dataset.storyId
        this.deleteOfflineStory(storyId)
      })
    })
  }

  async deleteOfflineStory(storyId) {
    if (!confirm("Yakin ingin menghapus cerita ini dari penyimpanan offline?")) {
      return
    }

    try {
      await IndexedDBHelper.deleteStory(storyId)
      await this.loadOfflineStories()
      this.showSuccess("Cerita berhasil dihapus dari penyimpanan offline")
    } catch (error) {
      console.error("Failed to delete offline story:", error)
      this.showError("Gagal menghapus cerita")
    }
  }

  initializeEventListeners() {
    const refreshBtn = document.getElementById("refresh-offline-stories")
    const clearBtn = document.getElementById("clear-offline-stories")

    refreshBtn.addEventListener("click", () => {
      this.loadOfflineStories()
    })

    clearBtn.addEventListener("click", async () => {
      if (confirm("Yakin ingin menghapus semua cerita tersimpan? Tindakan ini tidak dapat dibatalkan.")) {
        try {
          await IndexedDBHelper.clearAllStories()
          await this.loadOfflineStories()
          this.showSuccess("Semua cerita tersimpan berhasil dihapus")
        } catch (error) {
          console.error("Failed to clear offline stories:", error)
          this.showError("Gagal menghapus cerita tersimpan")
        }
      }
    })
  }

  showSuccess(message) {
    const notification = document.createElement("div")
    notification.className = "notification success"
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  showError(message) {
    const notification = document.createElement("div")
    notification.className = "notification error"
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 5000)
  }
}
