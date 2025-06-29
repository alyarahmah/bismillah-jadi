const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
}

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
}

export async function getStories(token = null) {
  try {
    const headers = {}

    // Jika ada token, tambahkan ke header
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(ENDPOINTS.STORIES, {
      headers: headers,
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching stories:", error)
    throw error
  }
}

export async function addStory(formData, token) {
  try {
    if (!token) {
      throw new Error("Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.")
    }

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error adding story:", error)
    throw error
  }
}
