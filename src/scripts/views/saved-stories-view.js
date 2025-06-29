import SavedStoriesHelper from "../utils/saved-stories-helper"
import { showFormattedDate } from "../utils"

export default class SavedStoriesView {
  async render() {
    return `
      <section class="saved-stories-section">
        <div class="container">
          <div class="page-header">
            <h1><i class="fas fa-bookmark" aria-hidden="true"></i> Cerita Disimpan</h1>
            <p>Cerita yang Anda simpan untuk dibaca kembali</p>
          </div>
          
          <div class="saved-actions">
            <button id="refresh-saved-stories" class="btn btn-primary">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button id="clear-saved-stories" class="btn btn-danger">
              <i class="fas fa-trash"></i> Hapus Semua
            </button>
          </div>
          
          <div id="saved-stories-container" class="stories-container">
            <div class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Memuat cerita disimpan...</p>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    await this.loadSavedStories()
    this.initializeEventListeners()
  }

  async loadSavedStories() {
    try {
      const stories = SavedStoriesHelper.getSavedStories()
      this.displaySavedStories(stories)
    } catch (error) {
      console.error("Failed to load saved stories:", error)
      this.showError("Gagal memuat cerita disimpan")
    }
  }

  displaySavedStories(stories) {
    const container = document.getElementById("saved-stories-container")

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-bookmark"></i>
          <h3>Belum ada cerita disimpan</h3>
          <p>Simpan cerita favorit Anda dengan menekan tombol bookmark pada cerita</p>
          <a href="#/" class="btn btn-primary">
            <i class="fas fa-home"></i> Lihat Cerita
          </a>
        </div>
      `
      return
    }

    const storiesHTML = stories
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .map(
        (story) => `
        <article class="story-card saved-story-card" data-story-id="${story.id}">
          <div class="story-image">
            <img src="${story.photoUrl}" alt="Foto cerita: ${story.description}" loading="lazy" />
            <div class="saved-badge">
              <i class="fas fa-bookmark"></i> Disimpan
            </div>
          </div>
          <div class="story-content">
            <h3 class="story-title">${story.name}</h3>
            <p class="story-description">${story.description}</p>
            <div class="story-meta">
              <span class="story-date">
                <i class="fas fa-bookmark" aria-hidden="true"></i>
                Disimpan: ${showFormattedDate(story.savedAt, "id-ID")}
              </span>
              <span class="story-date">
                <i class="fas fa-calendar" aria-hidden="true"></i>
                Dibuat: ${showFormattedDate(story.createdAt, "id-ID")}
              </span>
            </div>
            <div class="story-actions">
              <button class="btn btn-danger btn-sm remove-saved-story" data-story-id="${story.id}">
                <i class="fas fa-bookmark-slash"></i> Hapus dari Simpanan
              </button>
            </div>
          </div>
        </article>
      `,
      )
      .join("")

    container.innerHTML = storiesHTML

    // Add event listeners for remove buttons
    container.querySelectorAll(".remove-saved-story").forEach((button) => {
      button.addEventListener("click", (e) => {
        const storyId = e.target.dataset.storyId
        this.removeSavedStory(storyId)
      })
    })
  }

  async removeSavedStory(storyId) {
    if (!confirm("Yakin ingin menghapus cerita ini dari simpanan?")) {
      return
    }

    try {
      SavedStoriesHelper.removeSavedStory(storyId)
      await this.loadSavedStories()
      this.showSuccess("Cerita berhasil dihapus dari simpanan")
    } catch (error) {
      console.error("Failed to remove saved story:", error)
      this.showError("Gagal menghapus cerita dari simpanan")
    }
  }

  initializeEventListeners() {
    const refreshBtn = document.getElementById("refresh-saved-stories")
    const clearBtn = document.getElementById("clear-saved-stories")

    refreshBtn.addEventListener("click", () => {
      this.loadSavedStories()
    })

    clearBtn.addEventListener("click", async () => {
      if (confirm("Yakin ingin menghapus semua cerita disimpan? Tindakan ini tidak dapat dibatalkan.")) {
        try {
          SavedStoriesHelper.clearAllSavedStories()
          await this.loadSavedStories()
          this.showSuccess("Semua cerita disimpan berhasil dihapus")
        } catch (error) {
          console.error("Failed to clear saved stories:", error)
          this.showError("Gagal menghapus cerita disimpan")
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
