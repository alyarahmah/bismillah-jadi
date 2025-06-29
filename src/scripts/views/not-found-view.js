export default class NotFoundView {
  async render() {
    return `
      <section class="not-found-section">
        <div class="container">
          <div class="not-found-content">
            <div class="not-found-icon">
              <i class="fas fa-exclamation-triangle fa-5x"></i>
            </div>
            <h1 class="not-found-title">404</h1>
            <h2 class="not-found-subtitle">Halaman Tidak Ditemukan</h2>
            <p class="not-found-description">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. 
              Mungkin halaman tersebut telah dipindahkan atau tidak pernah ada.
            </p>
            <div class="not-found-actions">
              <a href="#/" class="btn btn-primary">
                <i class="fas fa-home"></i> Kembali ke Beranda
              </a>
              <button onclick="history.back()" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Halaman Sebelumnya
              </button>
            </div>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    // No specific logic needed for 404 page
  }
}
