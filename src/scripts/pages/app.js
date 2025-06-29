import routes from "../routes/routes"
import { getActiveRoute } from "../routes/url-parser"
import * as AuthModel from "../models/auth-model"
import Navbar from "../components/navbar"
import SkipToContent from "../components/skip-to-content"

class App {
  #content = null
  #currentPage = null
  #navbar = null
  #skipToContent = null

  constructor({ content }) {
    this.#content = content
    this.#navbar = new Navbar()
    this.#skipToContent = new SkipToContent()

    this._initialize()
  }

  async _initialize() {
    // Initialize components
    await this.#navbar.init()
    this.#skipToContent.init()

    // Initial page render
    await this.renderPage()

    // Setup hash change listener
    window.addEventListener("hashchange", async () => {
      await this.renderPage()
    })
  }

  async renderPage() {
    const url = getActiveRoute()
    let page = routes[url]

    // Cleanup previous page
    if (this.#currentPage && typeof this.#currentPage.cleanup === "function") {
      this.#currentPage.cleanup()
    }

    // Update navigation
    this.#navbar.updateNavigation()

    // Check authentication for protected routes
    if (url === "/add-story" && !AuthModel.isAuthenticated()) {
      window.location.hash = "#/login"
      return
    }

    if (url === "/saved-stories" && !AuthModel.isAuthenticated()) {
      window.location.hash = "#/login"
      return
    }

    // Handle 404
    if (!page) {
      page = routes["/404"]
    }

    this.#currentPage = page

    // Render page with transition
    if ("startViewTransition" in document) {
      document.startViewTransition(async () => {
        await this._renderPageContent(page)
      })
    } else {
      await this._renderPageContentWithFallback(page)
    }
  }

  async _renderPageContent(page) {
    this.#content.innerHTML = await page.render()
    await page.afterRender()
    this.#skipToContent.refresh()
  }

  async _renderPageContentWithFallback(page) {
    this.#content.style.opacity = "0"

    setTimeout(async () => {
      this.#content.innerHTML = await page.render()
      await page.afterRender()
      this.#content.style.opacity = "1"
      this.#skipToContent.refresh()
    }, 150)
  }

  // Public methods for external access
  updateNavigation() {
    this.#navbar.updateNavigation()
  }

  async refreshPushNotificationStatus() {
    await this.#navbar.refreshPushNotificationStatus()
  }

  // Cleanup method
  destroy() {
    this.#navbar.destroy()
    this.#skipToContent.destroy()

    if (this.#currentPage && typeof this.#currentPage.cleanup === "function") {
      this.#currentPage.cleanup()
    }
  }
}

export default App
