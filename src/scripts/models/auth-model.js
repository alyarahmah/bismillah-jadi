const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
}

const AUTH_ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
}

export async function register(userData) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error registering:", error)
    throw error
  }
}

export async function login(credentials) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    const data = await response.json()

    if (data.error === false && data.loginResult?.token) {
      // Simpan token ke localStorage
      localStorage.setItem("authToken", data.loginResult.token)
      localStorage.setItem("userName", data.loginResult.name)
    }

    return data
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

export function logout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("userName")
  window.location.hash = "#/"
}

export function getAuthToken() {
  return localStorage.getItem("authToken")
}

export function getUserName() {
  return localStorage.getItem("userName")
}

export function isAuthenticated() {
  return !!getAuthToken()
}
