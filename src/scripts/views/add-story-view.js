import StoryPresenter from "../presenters/story-presenter"
import * as StoryModel from "../models/story-model"
import * as AuthModel from "../models/auth-model"

export default class AddStoryView {
  constructor() {
    this.presenter = new StoryPresenter(this, StoryModel, AuthModel)
    this.map = null
    this.marker = null
    this.selectedLocation = null
    this.camera = null
    this.video = null
    this.canvas = null
    this.selectedPhoto = null
  }

  async render() {
    // cek otentikasi
    if (!AuthModel.isAuthenticated()) {
      return `
        <section class="auth-required-section">
          <div class="container">
            <div class="auth-required">
              <i class="fas fa-lock fa-4x"></i>
              <h2>Login Diperlukan</h2>
              <p>Anda harus login terlebih dahulu untuk menambahkan cerita.</p>
              <a href="#/login" class="btn btn-primary">
                <i class="fas fa-sign-in-alt"></i> Login Sekarang
              </a>
            </div>
          </div>
        </section>
      `
    }

    return `
      <section class="add-story-section">
        <div class="container">
          <div class="page-header">
            <h1><i class="fas fa-plus-circle" aria-hidden="true"></i> Tambah Cerita Baru</h1>
            <p>Bagikan momen spesial Anda dengan dunia</p>
          </div>
          
          <form id="add-story-form" class="story-form" novalidate>
            <div class="form-group">
              <label for="story-description" class="form-label">
                <i class="fas fa-pen" aria-hidden="true"></i>
                Cerita Anda *
              </label>
              <textarea 
                id="story-description" 
                name="description" 
                class="form-control" 
                placeholder="Ceritakan pengalaman menarik Anda..."
                required
                aria-describedby="description-help"
                rows="4"
              ></textarea>
              <small id="description-help" class="form-help">Minimal 10 karakter</small>
              <div class="error-message" id="description-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-camera" aria-hidden="true"></i>
                Foto Cerita *
              </label>
              <div class="photo-input-container">
                <div class="photo-options">
                  <button type="button" id="camera-btn" class="btn btn-secondary">
                    <i class="fas fa-camera"></i> Ambil Foto
                  </button>
                  <button type="button" id="gallery-btn" class="btn btn-secondary">
                    <i class="fas fa-images"></i> Pilih dari Galeri
                  </button>
                </div>
                
                <input 
                  type="file" 
                  id="photo-input" 
                  name="photo" 
                  accept="image/*" 
                  class="hidden"
                  aria-describedby="photo-help"
                />
                
                <div id="camera-container" class="camera-container hidden">
                  <video id="camera-video" class="camera-video" autoplay playsinline aria-label="Preview kamera"></video>
                  <div class="camera-controls">
                    <button type="button" id="capture-btn" class="btn btn-primary">
                      <i class="fas fa-camera"></i> Ambil Foto
                    </button>
                    <button type="button" id="close-camera-btn" class="btn btn-secondary">
                      <i class="fas fa-times"></i> Tutup
                    </button>
                  </div>
                </div>
                
                <div id="photo-preview" class="photo-preview hidden">
                  <img id="preview-image" alt="Preview foto yang dipilih" />
                  <button type="button" id="remove-photo-btn" class="btn btn-danger btn-sm" aria-label="Hapus foto">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <canvas id="photo-canvas" class="hidden"></canvas>
              </div>
              <small id="photo-help" class="form-help">Format: JPG, PNG. Maksimal 5MB</small>
              <div class="error-message" id="photo-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                Lokasi Cerita *
              </label>
              <div class="location-input-container">
                <div id="location-map" class="location-map"></div>
                <div class="location-info">
                  <p id="location-status" class="location-status">
                    <i class="fas fa-info-circle"></i>
                    Klik pada peta untuk memilih lokasi
                  </p>
                  <div id="selected-location" class="selected-location hidden">
                    <strong>Koordinat Terpilih:</strong><br>
                    Latitude: <span id="selected-lat">-</span><br>
                    Longitude: <span id="selected-lon">-</span>
                  </div>
                </div>
              </div>
              <div class="error-message" id="location-error"></div>
            </div>

            <div class="form-actions">
              <button type="button" id="cancel-btn" class="btn btn-secondary">
                <i class="fas fa-times"></i> Batal
              </button>
              <button type="submit" id="submit-btn" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i> Bagikan Cerita
              </button>
            </div>
          </form>
        </div>
      </section>
    `
  }

  async afterRender() {
    if (!AuthModel.isAuthenticated()) {
      return
    }

    this.initializeMap()
    this.initializeCamera()
    this.initializeForm()
  }

  // Tambahkan method cleanup untuk membersihkan kamera
  cleanup() {
    if (this.camera) {
      this.camera.getTracks().forEach((track) => track.stop())
      this.camera = null
    }

    // Cleanup map jika ada
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  }

  initializeMap() {
    if (!window.L) {
      console.error("Leaflet not loaded")
      return
    }

    this.map = window.L.map("location-map").setView([-2.5489, 118.0149], 5)

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    this.map.on("click", (e) => {
      this.selectLocation(e.latlng.lat, e.latlng.lng)
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          this.map.setView([lat, lng], 13)
        },
        (error) => {
          console.log("Geolocation error:", error)
        },
      )
    }
  }

  selectLocation(lat, lng) {
    if (!window.L) return

    if (this.marker) {
      this.map.removeLayer(this.marker)
    }

    this.marker = window.L.marker([lat, lng]).addTo(this.map)
    this.selectedLocation = { lat, lng }

    document.getElementById("selected-lat").textContent = lat.toFixed(6)
    document.getElementById("selected-lon").textContent = lng.toFixed(6)
    document.getElementById("selected-location").classList.remove("hidden")
    document.getElementById("location-status").innerHTML = `
      <i class="fas fa-check-circle"></i>
      Lokasi berhasil dipilih
    `
    document.getElementById("location-error").textContent = ""
  }

  initializeCamera() {
    const cameraBtn = document.getElementById("camera-btn")
    const galleryBtn = document.getElementById("gallery-btn")
    const photoInput = document.getElementById("photo-input")
    const cameraContainer = document.getElementById("camera-container")
    const captureBtn = document.getElementById("capture-btn")
    const closeCameraBtn = document.getElementById("close-camera-btn")
    const removePhotoBtn = document.getElementById("remove-photo-btn")

    this.video = document.getElementById("camera-video")
    this.canvas = document.getElementById("photo-canvas")

    cameraBtn.addEventListener("click", () => this.openCamera())
    galleryBtn.addEventListener("click", () => photoInput.click())
    photoInput.addEventListener("change", (e) => this.handleFileSelect(e))
    captureBtn.addEventListener("click", () => this.capturePhoto())
    closeCameraBtn.addEventListener("click", () => this.closeCamera())
    removePhotoBtn.addEventListener("click", () => this.removePhoto())
  }

  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      this.camera = stream
      this.video.srcObject = stream
      document.getElementById("camera-container").classList.remove("hidden")
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.")
    }
  }

  closeCamera() {
    if (this.camera) {
      this.camera.getTracks().forEach((track) => track.stop())
      this.camera = null
    }
    document.getElementById("camera-container").classList.add("hidden")
  }

  capturePhoto() {
    const context = this.canvas.getContext("2d")
    this.canvas.width = this.video.videoWidth
    this.canvas.height = this.video.videoHeight
    context.drawImage(this.video, 0, 0)

    this.canvas.toBlob(
      (blob) => {
        this.selectedPhoto = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
        this.showPhotoPreview(URL.createObjectURL(blob))
        this.closeCamera()
      },
      "image/jpeg",
      0.8,
    )
  }

  handleFileSelect(event) {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        document.getElementById("photo-error").textContent = "Ukuran file terlalu besar. Maksimal 5MB."
        return
      }
      this.selectedPhoto = file
      this.showPhotoPreview(URL.createObjectURL(file))
    }
  }

  showPhotoPreview(src) {
    const preview = document.getElementById("photo-preview")
    const image = document.getElementById("preview-image")
    image.src = src
    image.style.display = "block"
    preview.classList.remove("hidden")
    document.getElementById("photo-error").textContent = ""
  }

  removePhoto() {
    this.selectedPhoto = null
    const preview = document.getElementById("photo-preview")
    const image = document.getElementById("preview-image")
    image.src = ""
    image.style.display = "none"
    preview.classList.add("hidden")
    document.getElementById("photo-input").value = ""
  }

  initializeForm() {
    const form = document.getElementById("add-story-form")
    const cancelBtn = document.getElementById("cancel-btn")

    form.addEventListener("submit", (e) => this.handleSubmit(e))
    cancelBtn.addEventListener("click", () => {
      if (confirm("Yakin ingin membatalkan? Data yang sudah diisi akan hilang.")) {
        window.location.hash = "#/"
      }
    })
  }

  async handleSubmit(event) {
    event.preventDefault()

    if (!this.validateForm()) {
      return
    }

    const description = document.getElementById("story-description").value
    const storyData = {
      description,
      photo: this.selectedPhoto,
      lat: this.selectedLocation.lat,
      lon: this.selectedLocation.lng,
    }

    const success = await this.presenter.submitStory(storyData)
    if (success) {
      setTimeout(() => {
        window.location.hash = "#/"
      }, 2000)
    }
  }

  validateForm() {
    let isValid = true

    // validasi deskripsi
    const description = document.getElementById("story-description").value.trim()
    if (description.length < 10) {
      document.getElementById("description-error").textContent = "Cerita minimal 10 karakter"
      isValid = false
    } else {
      document.getElementById("description-error").textContent = ""
    }

    // Validasi photo
    if (!this.selectedPhoto) {
      document.getElementById("photo-error").textContent = "Foto wajib dipilih"
      isValid = false
    } else {
      document.getElementById("photo-error").textContent = ""
    }

    // Validate lokasi
    if (!this.selectedLocation) {
      document.getElementById("location-error").textContent = "Lokasi wajib dipilih"
      isValid = false
    } else {
      document.getElementById("location-error").textContent = ""
    }

    return isValid
  }

  showLoading() {
    document.getElementById("loading").style.display = "flex"
    const submitBtn = document.getElementById("submit-btn")
    if (submitBtn) {
      submitBtn.disabled = true
    }
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none"
    const submitBtn = document.getElementById("submit-btn")
    if (submitBtn) {
      submitBtn.disabled = false
    }
  }

  showSuccess(message) {
    // buat notif berhasil
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
    // buat notif error
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
