// CSS imports
import "../styles/styles.css"

import App from "./pages/app"
import swRegister from "./utils/sw-register"

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
  })

  // Register service worker
  await swRegister()

  // Make app globally accessible for debugging (optional)
  window.storyBeginApp = app
})
