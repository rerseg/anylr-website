// ── SHARED NAV ────────────────────────────────────────────
function injectNav(activePage) {
  const pages = [
    { href: 'about.html',      label: 'About' },
    { href: 'services.html',   label: 'Services' },
    { href: 'case-studies.html', label: 'Case Studies' },
    { href: 'team.html',       label: 'Team' },
    { href: 'faq.html',        label: 'FAQ' },
  ];
  const links = pages.map(p =>
    `<li><a href="${p.href}" ${p.href === activePage ? 'class="active"' : ''}>${p.label}</a></li>`
  ).join('');
  document.getElementById('navPlaceholder').innerHTML = `
  <nav id="navbar" class="solid">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-icon"><span class="nav-logo-a">A</span></div>
        <div class="nav-logo-text">
          <span class="nav-logo-name">All Your Needs</span>
          <span class="nav-logo-tag">aynlr.com</span>
        </div>
      </a>
      <ul class="nav-links" id="navLinks">${links}
        <li><a href="contact.html" class="nav-cta ${activePage === 'contact.html' ? 'active' : ''}">Get In Touch</a></li>
      </ul>
      <div class="nav-mobile-toggle" id="mobileToggle">
        <span></span><span></span><span></span>
      </div>
    </div>
  </nav>`;

  // Mobile toggle
  document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('mobile-open');
  });
  document.querySelectorAll('#navLinks a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('mobile-open'));
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
}

// ── SHARED FOOTER ─────────────────────────────────────────
function injectFooter() {
  document.getElementById('footerPlaceholder').innerHTML = `
  <footer>
    <div class="footer-inner">
      <div class="footer-top">
        <div>
          <div class="footer-brand-name">All Your Needs</div>
          <span class="footer-brand-tag">Where Necessity Meets Innovation</span>
          <p class="footer-brand-desc">Liberia's premier multi-service professional firm. Incorporated 2021 under the laws of the Republic of Liberia.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.25);border-radius:4px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--gold);font-family:var(--font-label);letter-spacing:0.5px;">Licensed Customs Broker</span>
            <span style="background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.25);border-radius:4px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--gold);font-family:var(--font-label);letter-spacing:0.5px;">Licensed Gold Broker</span>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Services</div>
          <ul class="footer-links">
            <li><a href="services.html#survey">Survey &amp; Data</a></li>
            <li><a href="services.html#gis">GIS &amp; Mapping</a></li>
            <li><a href="services.html#resettlement">Resettlement Data</a></li>
            <li><a href="services.html#customs">Customs Brokerage</a></li>
            <li><a href="services.html#gold">Gold Brokerage</a></li>
            <li><a href="services.html#consulting">Consulting</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Company</div>
          <ul class="footer-links">
            <li><a href="about.html">About Us</a></li>
            <li><a href="team.html">Our Team</a></li>
            <li><a href="case-studies.html">Case Studies</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Contact</div>
          <ul class="footer-links">
            <li><a href="tel:+231777969916">+231 777 969 916</a></li>
            <li><a href="mailto:info@aynlr.com">info@aynlr.com</a></li>
            <li><a href="mailto:rerii@aynlr.com">rerii@aynlr.com</a></li>
            <li><a href="https://www.aynlr.com">www.aynlr.com</a></li>
            <li><a href="contact.html">Monrovia, Liberia</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copy">&copy; 2025 All Your Needs. All rights reserved. Incorporated in the Republic of Liberia.</div>
        <div class="footer-bottom-links">
          <a href="privacy.html">Privacy Policy</a>
          <a href="privacy.html#terms">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
}
