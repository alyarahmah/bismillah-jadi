const IndexedDBHelper = {
  dbName: "StoryBeginDB",
  version: 1,
  objectStoreName: "stories",

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          const objectStore = db.createObjectStore(this.objectStoreName, {
            keyPath: "id",
          })
          objectStore.createIndex("createdAt", "createdAt", { unique: false })
        }
      }
    })
  },

  async addStory(story) {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(this.objectStoreName)

      const storyWithTimestamp = {
        ...story,
        savedAt: new Date().toISOString(),
      }

      // Gunakan put() untuk menangani duplicate entries
      await objectStore.put(storyWithTimestamp)
      console.log("Story saved to IndexedDB:", story.id)
      return true
    } catch (error) {
      console.error("Failed to save story to IndexedDB:", error)
      return false
    }
  },

  async getAllStories() {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.objectStoreName], "readonly")
      const objectStore = transaction.objectStore(this.objectStoreName)

      return new Promise((resolve, reject) => {
        const request = objectStore.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Failed to get stories from IndexedDB:", error)
      return []
    }
  },

  async getStory(id) {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.objectStoreName], "readonly")
      const objectStore = transaction.objectStore(this.objectStoreName)

      return new Promise((resolve, reject) => {
        const request = objectStore.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Failed to get story ${id} from IndexedDB:`, error)
      return null
    }
  },

  async deleteStory(id) {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(this.objectStoreName)

      await objectStore.delete(id)
      console.log("Story deleted from IndexedDB:", id)
      return true
    } catch (error) {
      console.error("Failed to delete story from IndexedDB:", error)
      return false
    }
  },

  async clearAllStories() {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(this.objectStoreName)

      await objectStore.clear()
      console.log("All stories cleared from IndexedDB")
      return true
    } catch (error) {
      console.error("Failed to clear stories from IndexedDB:", error)
      return false
    }
  },
}

export default IndexedDBHelper
