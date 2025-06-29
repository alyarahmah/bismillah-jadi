const SavedStoriesHelper = {
  storageKey: "savedStories",

  getSavedStories() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Failed to get saved stories:", error)
      return []
    }
  },

  saveStory(story) {
    try {
      const savedStories = this.getSavedStories()
      const isAlreadySaved = savedStories.some((s) => s.id === story.id)

      if (!isAlreadySaved) {
        const storyToSave = {
          ...story,
          savedAt: new Date().toISOString(),
        }
        savedStories.push(storyToSave)
        localStorage.setItem(this.storageKey, JSON.stringify(savedStories))
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to save story:", error)
      return false
    }
  },

  removeSavedStory(storyId) {
    try {
      const savedStories = this.getSavedStories()
      const filteredStories = savedStories.filter((s) => s.id !== storyId)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredStories))
      return true
    } catch (error) {
      console.error("Failed to remove saved story:", error)
      return false
    }
  },

  isStorySaved(storyId) {
    const savedStories = this.getSavedStories()
    return savedStories.some((s) => s.id === storyId)
  },

  clearAllSavedStories() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error("Failed to clear saved stories:", error)
      return false
    }
  },
}

export default SavedStoriesHelper
