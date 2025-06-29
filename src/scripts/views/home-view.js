import StoryPresenter from "../presenters/story-presenter"
import * as StoryModel from "../models/story-model"
import * as AuthModel from "../models/auth-model"
import { showFormattedDate } from "../utils"
import L from "leaflet"

export default class HomeView {
  constructor() {
    this.presenter = new StoryPresenter(this, StoryModel, AuthModel)
    this.map = null
    this.markers = []
  }

  async render() {
    return `
      <section class="hero-section">
        <div class="container">
          <h1 class="hero-title">
            <i class="fas fa-heart" aria-hidden="true"></i>
            The Unforgettable Stories Start Here
          </h1>
          <p class="hero-subtitle">Berbagi Cinta Yang Penuh Dengan Cerita</p>
        </div>
      </section>
      
      <section class="stories-section">
        <div class="container">
          <div class="section-header">
            <h2><i class="fas fa-book" aria-hidden="true"></i> Cerita Terbaru</h2>
            <div class="view-toggle">
              <button id="list-view-btn" class="view-btn active" aria-label="Tampilan daftar">
                <i class="fas fa-list" aria-hidden="true"></i>
              </button>
              <button id="map-view-btn" class="view-btn" aria-label="Tampilan peta">
                <i class="fas fa-map" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          
          <div id="stories-container" class="stories-container">
            <div class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Memuat cerita...</p>
            </div>
          </div>
          
          <div id="map-container" class="map-container hidden">
            <div id="story-map" class="story-map"></div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    await this.presenter.loadStories()
    this.initializeViewToggle()
  }

  initializeViewToggle() {
    const listViewBtn = document.getElementById("list-view-btn")
    const mapViewBtn = document.getElementById("map-view-btn")
    const storiesContainer = document.getElementById("stories-container")
    const mapContainer = document.getElementById("map-container")

    listViewBtn.addEventListener("click", () => {
      listViewBtn.classList.add("active")
      mapViewBtn.classList.remove("active")
      storiesContainer.classList.remove("hidden")
      mapContainer.classList.add("hidden")
    })

    mapViewBtn.addEventListener("click", () => {
      mapViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")
      storiesContainer.classList.add("hidden")
      mapContainer.classList.remove("hidden")
      this.initializeMap()
    })
  }

  initializeMap() {
    if (!this.map) {
      this.map = L.map("story-map").setView([-2.5489, 118.0149], 5)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map)
    }
  }

  displayStories(stories) {
    const container = document.getElementById("stories-container")

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open"></i>
          <h3>Belum ada cerita</h3>
          <p>Jadilah yang pertama berbagi cerita!</p>
          <a href="#/add-story" class="btn btn-primary">
            <i class="fas fa-plus"></i> Tambah Cerita
          </a>
        </div>
      `
      return
    }

    const storiesHTML = stories
      .map(
        (story) => `
      <article class="story-card" data-lat="${story.lat}" data-lon="${story.lon}">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Foto cerita: ${story.description}" loading="lazy" />
        </div>
        <div class="story-content">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span class="story-date">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              ${showFormattedDate(story.createdAt, "id-ID")}
            </span>
            ${
              story.lat && story.lon
                ? `
              <button class="location-btn" data-lat="${story.lat}" data-lon="${story.lon}" aria-label="Lihat lokasi di peta">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                Lihat Lokasi
              </button>
            `
                : ""
            }
          </div>
        </div>
      </article>
    `,
      )
      .join("")

    container.innerHTML = storiesHTML

    // button buat lihat lokasi
    container.querySelectorAll(".location-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lat = Number.parseFloat(e.target.dataset.lat)
        const lon = Number.parseFloat(e.target.dataset.lon)
        this.showLocationOnMap(lat, lon)
      })
    })

    // store cerita untuk digunakan di map
    this.stories = stories
  }

  showLocationOnMap(lat, lon) {
    // switch map ke view
    document.getElementById("map-view-btn").click()

    setTimeout(() => {
      if (this.map) {
        this.map.setView([lat, lon], 15)

        const existingMarker = this.markers.find((m) => m.getLatLng().lat === lat && m.getLatLng().lng === lon)

        if (!existingMarker) {
          const marker = L.marker([lat, lon]).addTo(this.map)
          const story = this.stories.find((s) => s.lat === lat && s.lon === lon)
          if (story) {
            marker.bindPopup(`
              <div class="popup-content">
                <img src="${story.photoUrl}" alt="Foto cerita" style="width: 100%; max-width: 200px; height: auto; border-radius: 4px;" />
                <h4>${story.name}</h4>
                <p>${story.description}</p>
                <small>${showFormattedDate(story.createdAt, "id-ID")}</small>
              </div>
            `)
          }
          this.markers.push(marker)
        }
      }
    }, 100)
  }

  showLoading() {
    document.getElementById("loading").style.display = "flex"
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none"
  }

  showError(message) {
    const container = document.getElementById("stories-container")
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Oops! Terjadi Kesalahan</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-primary">
          <i class="fas fa-refresh"></i> Coba Lagi
        </button>
      </div>
    `
  }
}
