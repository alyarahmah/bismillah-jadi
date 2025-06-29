import * as AuthModel from "../models/auth-model"
import PushNotification from "../utils/push-notification"
import NotificationHelper from "../utils/notification-helper"

class Navbar {
  constructor() {
    this.drawerButton = null
    this.navigationDrawer = null
    this.pushSubscribed = false
    this.isInitialized = false
  }

  async init() {
    if (this.isInitialized) return

    this.drawerButton = document.querySelector("#drawer-button")
    this.navigationDrawer = document.querySelector("#navigation-drawer")

    if (!this.drawerButton || !this.navigationDrawer) {
      console.warn("Navbar elements not found")
      return
    }

    this._setupDrawer()
    await this._initializePushNotification()
    this.updateNavigation()
    this.isInitialized = true
  }

  async _initializePushNotification() {
    try {
      const subscription = await PushNotification.getSubscription()
      this.pushSubscribed = !!subscription
    } catch (error) {
      console.error("Failed to initialize push notification:", error)
    }
  }

  _setupDrawer() {
    // Toggle drawer
    this.drawerButton.addEventListener("click", () => {
      const isOpen = this.navigationDrawer.classList.contains("open")
      this.navigationDrawer.classList.toggle("open")
      this.drawerButton.setAttribute("aria-expanded", !isOpen)
    })

    // Close drawer when clicking outside
    document.body.addEventListener("click", (event) => {
      if (!this.navigationDrawer.contains(event.target) && !this.drawerButton.contains(event.target)) {
        this.closeDrawer()
      }

      // Close drawer when clicking nav links
      this.navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.closeDrawer()
        }
      })
    })
  }

  closeDrawer() {
    this.navigationDrawer.classList.remove("open")
    this.drawerButton.setAttribute("aria-expanded", "false")
  }

  updateNavigation() {
    const navList = document.getElementById("nav-list")
    if (!navList) return

    const authenticated = AuthModel.isAuthenticated()
    const userName = AuthModel.getUserName()

    if (authenticated) {
      navList.innerHTML = this._getAuthenticatedNavHTML(userName)
      this._attachAuthenticatedEventListeners()
    } else {
      navList.innerHTML = this._getGuestNavHTML()
    }
  }

  _getAuthenticatedNavHTML(userName) {
    return `
      <li><a href="#/"><i class="fas fa-home" aria-hidden="true"></i> Beranda</a></li>
      <li><a href="#/add-story"><i class="fas fa-plus-circle" aria-hidden="true"></i> Tambah Cerita</a></li>
      <li><a href="#/saved-stories"><i class="fas fa-bookmark" aria-hidden="true"></i> Cerita Disimpan</a></li>
      <li><a href="#/about"><i class="fas fa-info-circle" aria-hidden="true"></i> Tentang</a></li>
      <li class="nav-user">
        <span class="user-info">
          <i class="fas fa-user" aria-hidden="true"></i>
          ${userName || "User"}
        </span>
      </li>
      <li>
        <button id="push-notification-btn" class="notification-btn ${this.pushSubscribed ? "subscribed" : ""}" 
                title="${this.pushSubscribed ? "Matikan notifikasi" : "Aktifkan notifikasi"}">
          <i class="fas ${this.pushSubscribed ? "fa-bell" : "fa-bell-slash"}" aria-hidden="true"></i>
          ${this.pushSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
        </button>
      </li>
      <li><button id="logout-btn" class="logout-btn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout</button></li>
    `
  }

  _getGuestNavHTML() {
    return `
      <li><a href="#/"><i class="fas fa-home" aria-hidden="true"></i> Beranda</a></li>
      <li><a href="#/about"><i class="fas fa-info-circle" aria-hidden="true"></i> Tentang</a></li>
      <li><a href="#/login"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a></li>
      <li><a href="#/register"><i class="fas fa-user-plus" aria-hidden="true"></i> Daftar</a></li>
    `
  }

  _attachAuthenticatedEventListeners() {
    const logoutBtn = document.getElementById("logout-btn")
    const pushBtn = document.getElementById("push-notification-btn")

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this._handleLogout()
      })
    }

    if (pushBtn) {
      pushBtn.addEventListener("click", () => {
        this._handlePushNotificationToggle()
      })
    }
  }

  _handleLogout() {
    if (confirm("Yakin ingin logout?")) {
      AuthModel.logout()
    }
  }

  async _handlePushNotificationToggle() {
    try {
      if (this.pushSubscribed) {
        // Unsubscribe
        const success = await PushNotification.unsubscribe()
        if (success) {
          this.pushSubscribed = false
          this.updateNavigation()
          await NotificationHelper.sendNotification({
            title: "Notifikasi Dimatikan",
            options: {
              body: "Anda tidak akan menerima notifikasi cerita baru lagi.",
              icon: "/images/icon-192x192.png",
            },
          })
        }
      } else {
        // Subscribe
        const subscription = await PushNotification.subscribe()
        if (subscription) {
          this.pushSubscribed = true
          this.updateNavigation()
          await NotificationHelper.sendNotification({
            title: "Notifikasi Diaktifkan",
            options: {
              body: "Anda akan menerima notifikasi ketika ada cerita baru!",
              icon: "/images/icon-192x192.png",
            },
          })
        }
      }
    } catch (error) {
      console.error("Failed to toggle push notification:", error)
      alert("Gagal mengubah pengaturan notifikasi. Pastikan browser Anda mendukung notifikasi.")
    }
  }

  // Method untuk update dari luar component
  async refreshPushNotificationStatus() {
    await this._initializePushNotification()
    this.updateNavigation()
  }

  // Method untuk cleanup
  destroy() {
    if (this.drawerButton) {
      this.drawerButton.removeEventListener("click", this._handleDrawerToggle)
    }
    this.isInitialized = false
  }
}

export default Navbar
