const swRegister = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported in the browser")
    return
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js")
    console.log("Service Worker registered successfully")
    return registration
  } catch (error) {
    console.log("Failed to register service worker", error)
  }
}

export default swRegister
