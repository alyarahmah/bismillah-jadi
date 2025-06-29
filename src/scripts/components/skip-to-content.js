class SkipToContent {
  constructor() {
    this.skipLink = null
    this.mainContent = null
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    // Tunggu DOM ready jika belum
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this._setup()
      })
    } else {
      this._setup()
    }
  }

  _setup() {
    this.mainContent = document.querySelector("#main-content")
    this.skipLink = document.querySelector(".skip-link")

    if (!this.skipLink || !this.mainContent) {
      console.warn("Skip to content elements not found")
      return
    }

    // Pastikan main content bisa di-focus
    if (!this.mainContent.hasAttribute("tabindex")) {
      this.mainContent.setAttribute("tabindex", "-1")
    }

    // Remove existing listener jika ada
    this.skipLink.removeEventListener("click", this._handleSkipToContent)

    // Add event listener dengan proper binding
    this._handleSkipToContent = this._handleSkipToContent.bind(this)
    this.skipLink.addEventListener("click", this._handleSkipToContent)

    this.isInitialized = true
  }

  _handleSkipToContent(event) {
    event.preventDefault()

    if (!this.mainContent) {
      console.warn("Main content not found")
      return
    }

    try {
      // Hilangkan fokus dari skip link
      this.skipLink.blur()

      // Fokus ke main content
      this.mainContent.focus()

      // Scroll ke main content dengan smooth behavior
      this.mainContent.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      // Announce ke screen reader (optional)
      this._announceToScreenReader("Navigated to main content")
    } catch (error) {
      console.error("Error in skip to content:", error)

      // Fallback: scroll manual jika focus gagal
      window.scrollTo({
        top: this.mainContent.offsetTop,
        behavior: "smooth",
      })
    }
  }

  _announceToScreenReader(message) {
    // Buat elemen tersembunyi untuk announce ke screen reader
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Hapus setelah announce
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 1000)
  }

  // Method untuk refresh setelah page change
  refresh() {
    this._setup()
  }

  // Method untuk cleanup
  destroy() {
    if (this.skipLink) {
      this.skipLink.removeEventListener("click", this._handleSkipToContent)
    }
    this.isInitialized = false
  }
}

export default SkipToContent
