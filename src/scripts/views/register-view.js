import AuthPresenter from "../presenters/auth-presenter"
import * as AuthModel from "../models/auth-model"

export default class RegisterView {
  constructor() {
    
    this.presenter = new AuthPresenter(this, AuthModel)
  }

  async render() {
    return `
      <section class="auth-section">
        <div class="container">
          <div class="auth-container">
            <div class="auth-header">
              <h1><i class="fas fa-user-plus" aria-hidden="true"></i> Daftar ke StoryShare</h1>
              <p>Buat akun untuk mulai berbagi cerita</p>
            </div>
            
            <form id="register-form" class="auth-form" novalidate>
              <div class="form-group">
                <label for="name" class="form-label">
                  <i class="fas fa-user" aria-hidden="true"></i>
                  Nama Lengkap *
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  class="form-control" 
                  placeholder="Nama lengkap Anda"
                  required
                  aria-describedby="name-help"
                />
                <small id="name-help" class="form-help">Minimal 3 karakter</small>
                <div class="error-message" id="name-error"></div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">
                  <i class="fas fa-envelope" aria-hidden="true"></i>
                  Email *
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-control" 
                  placeholder="nama@email.com"
                  required
                  aria-describedby="email-help"
                />
                <small id="email-help" class="form-help">Masukkan email yang valid</small>
                <div class="error-message" id="email-error"></div>
              </div>

              <div class="form-group">
                <label for="password" class="form-label">
                  <i class="fas fa-lock" aria-hidden="true"></i>
                  Password *
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-control" 
                  placeholder="Minimal 8 karakter"
                  required
                  aria-describedby="password-help"
                />
                <small id="password-help" class="form-help">Minimal 8 karakter</small>
                <div class="error-message" id="password-error"></div>
              </div>

              <div class="form-actions">
                <button type="submit" id="register-btn" class="btn btn-primary btn-full">
                  <i class="fas fa-user-plus"></i> Daftar
                </button>
              </div>
            </form>
            
            <div class="auth-footer">
              <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    this.initializeForm()
  }

  initializeForm() {
    const form = document.getElementById("register-form")
    form.addEventListener("submit", (e) => this.handleSubmit(e))
  }

  async handleSubmit(event) {
    event.preventDefault()

    if (!this.validateForm()) {
      return
    }

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    
    await this.presenter.handleRegister({ name, email, password })
  }

  validateForm() {
    let isValid = true

    const name = document.getElementById("name").value.trim()
    if (name.length < 3) {
      document.getElementById("name-error").textContent = "Nama minimal 3 karakter"
      isValid = false
    } else {
      document.getElementById("name-error").textContent = ""
    }

    const email = document.getElementById("email").value.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      document.getElementById("email-error").textContent = "Format email tidak valid"
      isValid = false
    } else {
      document.getElementById("email-error").textContent = ""
    }

    const password = document.getElementById("password").value
    if (password.length < 8) {
      document.getElementById("password-error").textContent = "Password minimal 8 karakter"
      isValid = false
    } else {
      document.getElementById("password-error").textContent = ""
    }

    return isValid
  }

  // Methods yang dipanggil oleh presenter
  showLoading() {
    document.getElementById("loading").style.display = "flex"
    document.getElementById("register-btn").disabled = true
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none"
    document.getElementById("register-btn").disabled = false
  }

  showSuccess(message) {
    const notification = document.createElement("div")
    notification.className = "notification success"
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  showError(message) {
    const notification = document.createElement("div")
    notification.className = "notification error"
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  redirectToHome() {
    window.location.hash = "#/"
  }

  redirectToLogin() {
    window.location.hash = "#/login"
  }
}
