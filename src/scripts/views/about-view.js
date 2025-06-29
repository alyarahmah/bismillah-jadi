export default class AboutView {
  async render() {
    return `
      <section class="about-section">
        <div class="container">
          <div class="about-header">
            <h1><i class="fas fa-info-circle" aria-hidden="true"></i> Tentang StoryShare</h1>
            <p class="about-subtitle">Platform berbagi cerita untuk menginspirasi dunia</p>
          </div>
          
          <div class="about-content">
            <div class="about-card">
              <div class="about-icon">
                <i class="fas fa-heart"></i>
              </div>
              <h3>Misi Kami</h3>
              <p>Menghubungkan orang-orang melalui cerita-cerita inspiratif dan membangun komunitas yang saling mendukung.</p>
            </div>
            
            <div class="about-card">
              <div class="about-icon">
                <i class="fas fa-users"></i>
              </div>
              <h3>Komunitas</h3>
              <p>Bergabunglah dengan ribuan pencerita dari seluruh dunia yang berbagi pengalaman dan inspirasi.</p>
            </div>
            
            <div class="about-card">
              <div class="about-icon">
                <i class="fas fa-globe"></i>
              </div>
              <h3>Jangkauan Global</h3>
              <p>Cerita Anda dapat menginspirasi orang di seluruh dunia dan menciptakan dampak positif.</p>
            </div>
          </div>
          
          <div class="features-section">
            <h2>Fitur Unggulan</h2>
            <ul class="features-list">
              <li><i class="fas fa-camera" aria-hidden="true"></i> Ambil foto langsung dengan kamera</li>
              <li><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Tandai lokasi cerita di peta</li>
              <li><i class="fas fa-mobile-alt" aria-hidden="true"></i> Responsif di semua perangkat</li>
              <li><i class="fas fa-universal-access" aria-hidden="true"></i> Aksesibilitas untuk semua pengguna</li>
            </ul>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {}
}
