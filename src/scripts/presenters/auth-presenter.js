class AuthPresenter {
  constructor(view, authModel) {
    this.view = view
    this.authModel = authModel
  }

  async handleLogin(credentials) {
    try {
      this.view.showLoading()
      const response = await this.authModel.login(credentials)

      if (response.error === false) {
        this.view.showSuccess("Login berhasil! Mengalihkan...")
        setTimeout(() => {
          this.view.redirectToHome()
        }, 1500)
      } else {
        this.view.showError(response.message || "Login gagal")
      }
    } catch (error) {
      this.view.showError("Terjadi kesalahan saat login")
    } finally {
      this.view.hideLoading()
    }
  }

  async handleRegister(userData) {
    try {
      this.view.showLoading()
      const response = await this.authModel.register(userData)

      if (response.error === false) {
        this.view.showSuccess("Registrasi berhasil! Silakan login.")
        setTimeout(() => {
          this.view.redirectToLogin()
        }, 2000)
      } else {
        this.view.showError(response.message || "Registrasi gagal")
      }
    } catch (error) {
      this.view.showError("Terjadi kesalahan saat registrasi")
    } finally {
      this.view.hideLoading()
    }
  }

  handleLogout() {
    if (confirm("Yakin ingin logout?")) {
      this.authModel.logout()
    }
  }

  isAuthenticated() {
    return this.authModel.isAuthenticated()
  }

  getUserName() {
    return this.authModel.getUserName()
  }
}

export default AuthPresenter
