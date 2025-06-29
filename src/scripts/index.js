// CSS imports
import "../styles/styles.css"

import App from "./pages/app"
import swRegister from "./utils/sw-register"

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  })

  await app.renderPage()

  window.addEventListener("hashchange", async () => {
    await app.renderPage()
  })

  // Register service worker
  await swRegister()
})
