// Admin Authentication & Session Management Module

const AdminAuth = {
  getToken() {
    return localStorage.getItem('va_admin_token');
  },

  setToken(token) {
    localStorage.setItem('va_admin_token', token);
  },

  removeToken() {
    localStorage.removeItem('va_admin_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async checkAuthOrRedirect() {
    const token = this.getToken();
    if (!token) {
      window.location.href = '/admin/login.html';
      return false;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        this.removeToken();
        window.location.href = '/admin/login.html';
        return false;
      }
      return true;
    } catch (err) {
      this.removeToken();
      window.location.href = '/admin/login.html';
      return false;
    }
  },

  logout() {
    this.removeToken();
    window.location.href = '/admin/login.html';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const errorMsg = document.getElementById('login-error');

      if (errorMsg) errorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput.value.trim(),
            password: passwordInput.value
          })
        });

        const data = await res.json();

        if (res.ok) {
          AdminAuth.setToken(data.token);
          window.location.href = '/admin/dashboard.html';
        } else {
          if (errorMsg) {
            errorMsg.textContent = data.error || 'Invalid credentials.';
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = 'Server connection failed.';
          errorMsg.style.display = 'block';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AdminAuth.logout();
    });
  }

  // Live Site Branding & Custom Logo Loader for Admin
  async function loadSiteBranding() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings;
        if (s.theme_palette) {
          document.body.classList.remove('theme-emerald', 'theme-sapphire', 'theme-rose');
          if (s.theme_palette !== 'gold') {
            document.body.classList.add(`theme-${s.theme_palette}`);
          }
        }

        const brandLogoLink = document.querySelector('.brand-logo');
        if (brandLogoLink) {
          const brandText = s.brand_name || 'VINTAGE AVENUE';
          const adminTag = ' <small style="font-size: 0.8rem; color: var(--color-text-muted);">[ADMIN]</small>';

          if (s.site_logo_url) {
            brandLogoLink.innerHTML = `<img src="${s.site_logo_url}" alt="${brandText}" class="brand-logo-img"> <span>${brandText}${adminTag}</span>`;
          } else {
            const iconClass = s.logo_icon || 'fa-gem';
            brandLogoLink.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${brandText}${adminTag}</span>`;
          }
        }
      }
    } catch (err) {
      console.error('Failed loading admin branding settings:', err);
    }
  }

  loadSiteBranding();
});
