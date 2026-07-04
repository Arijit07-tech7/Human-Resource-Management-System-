/**
 * PeopleCore HRMS — Main Application Controller & Router
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentUser: null,
    currentPage: null,
    sidebarOpen: false
  };

  // DOM Elements
  const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarNav: document.getElementById('sidebar-nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    menuToggle: document.getElementById('menu-toggle'),
    pageContent: document.getElementById('page-content'),
    searchInput: document.getElementById('search-input'),
    notificationBtn: document.getElementById('notification-btn'),
    notificationBadge: document.getElementById('notification-badge'),
    userProfile: document.getElementById('user-profile'),
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    modalOverlay: document.getElementById('modal-overlay'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalClose: document.getElementById('modal-close'),
    modalBody: document.getElementById('modal-body'),
    toastContainer: document.getElementById('toast-container')
  };

  // Add mobile sidebar backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);
  elements.sidebarBackdrop = backdrop;

  // Initialize App
  async function init() {
    setupEventListeners();
    const authenticated = await checkAuth();
    if (authenticated) {
      setupSocket();
      handleRouting();
      loadNotifications();
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Navigation routing
    elements.sidebarNav.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (!link) return;

      const page = link.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        window.location.hash = page;
        closeSidebar();
      }
    });

    // Mobile menu toggle
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Modal Close
    elements.modalClose.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) hideModal();
    });

    // Hash change router
    window.addEventListener('hashchange', handleRouting);

    // Search bar handler
    elements.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      // Dispatch custom search event that pages can listen to
      const event = new CustomEvent('globalSearch', { detail: query });
      window.dispatchEvent(event);
    });

    // Profile menu handler
    elements.userProfile.addEventListener('click', () => {
      window.location.hash = 'settings';
    });

    // Notification click
    elements.notificationBtn.addEventListener('click', async () => {
      try {
        await window.API.markNotificationsAsRead();
        elements.notificationBadge.style.display = 'none';
        showToast('Notifications marked as read', 'success');
      } catch (err) {
        console.error(err);
      }
    });

    // Logout handling
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        showToast('Logged out successfully', 'info');
        checkAuth();
      });
    }
  }

  // Sidebar controls
  function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    if (state.sidebarOpen) {
      elements.sidebar.classList.add('open');
      elements.sidebarBackdrop.classList.add('show');
    } else {
      closeSidebar();
    }
  }

  function closeSidebar() {
    state.sidebarOpen = false;
    elements.sidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.remove('show');
  }

  // Auth check
  async function checkAuth() {
    const token = localStorage.getItem('token');
    const loginLayout = document.getElementById('login-layout');
    const appLayout = document.getElementById('app-layout');

    if (!token) {
      if (appLayout) appLayout.style.display = 'none';
      if (loginLayout) {
        loginLayout.style.display = 'flex';
        setupLoginForm();
      }
      return false;
    }
    
    try {
      const user = await window.API.getProfile();
      state.currentUser = user;
      updateUserProfileUI(user);
      if (loginLayout) loginLayout.style.display = 'none';
      if (appLayout) appLayout.style.display = 'flex';
      return true;
    } catch (err) {
      console.error('Authentication check failed:', err);
      // Only clear token if it's a real auth error (not a mock token)
      const isMockToken = (token || '').startsWith('mock-jwt-token');
      if (!isMockToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('mockUser');
      } else {
        // Mock token - try mock mode directly
        try {
          const mockUser = JSON.parse(localStorage.getItem('mockUser') || 'null');
          if (mockUser) {
            state.currentUser = mockUser;
            updateUserProfileUI(mockUser);
            if (loginLayout) loginLayout.style.display = 'none';
            if (appLayout) appLayout.style.display = 'flex';
            return true;
          }
        } catch (e) {}
      }
      localStorage.removeItem('token');
      localStorage.removeItem('mockUser');
      if (appLayout) appLayout.style.display = 'none';
      if (loginLayout) {
        loginLayout.style.display = 'flex';
        setupLoginForm();
      }
      return false;
    }
  }

  function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = document.getElementById('login-submit-btn');

      if (!email || !password) {
        showToast('Please fill out all fields', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        const data = await window.API.login(email, password);
        if (data && data.token) {
          localStorage.setItem('token', data.token);
        }
        showToast('Logged in successfully', 'success');
        // Reload page to enter app
        window.location.reload();
      } catch (err) {
        showToast(err.message || 'Login failed', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
      }
    });

    // Register form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm && !registerForm.dataset.bound) {
      registerForm.dataset.bound = 'true';
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('register-submit-btn');
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const department = document.getElementById('reg-department').value;
        const position = document.getElementById('reg-position').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();

        if (!name || !email || !password || !department || !position) {
          showToast('Please fill in all required fields', 'error');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
          const data = await window.API.register({ name, email, password, department, position, phone, role: 'employee' });
          if (data && data.token) {
            localStorage.setItem('token', data.token);
          }
          showToast('Account created successfully! Welcome to PeopleCore!', 'success');
          window.location.reload();
        } catch (err) {
          showToast(err.message || 'Registration failed', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
      });
    }
  }

  function updateUserProfileUI(user) {
    if (elements.userName) elements.userName.textContent = user.name;
    if (elements.userAvatar) {
      elements.userAvatar.innerHTML = `<span>${user.name.charAt(0).toUpperCase()}</span>`;
    }
  }

  // Load notifications
  async function loadNotifications() {
    try {
      const { notifications, unreadCount } = await window.API.getNotifications();
      if (unreadCount > 0) {
        elements.notificationBadge.textContent = unreadCount;
        elements.notificationBadge.style.display = 'flex';
      } else {
        elements.notificationBadge.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Routing Handler
  async function handleRouting() {
    const authenticated = await checkAuth();
    if (!authenticated) return;
    
    const hash = window.location.hash.substring(1) || 'dashboard'; // Defaults to dashboard
    
    // Update active nav link
    elements.navLinks.forEach(link => {
      if (link.getAttribute('data-page') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    state.currentPage = hash;
    elements.pageContent.innerHTML = '<div class="skeleton" style="height: 400px; width: 100%;"></div>';

    // Clear search bar when navigating to new page
    elements.searchInput.value = '';

    // Load and render page script dynamically
    try {
      let pageModule;
      switch (hash) {
        case 'dashboard':
          pageModule = window.DashboardPage;
          break;
        case 'analytics':
          pageModule = window.AnalyticsPage;
          break;
        case 'directory':
          pageModule = window.DirectoryPage;
          break;
        case 'leave':
          pageModule = window.LeavePage;
          break;
        case 'attendance':
          pageModule = window.AttendancePage;
          break;
        case 'payroll':
          pageModule = window.PayrollPage;
          break;
        case 'recruitment':
          pageModule = window.RecruitmentPage;
          break;
        case 'settings':
          pageModule = window.SettingsPage;
          break;
        default:
          pageModule = window.DashboardPage;
      }

      if (pageModule) {
        elements.pageContent.className = 'page-content page-enter';
        await pageModule.render(elements.pageContent);
      } else {
        // Fallback: Lazy load script if not loaded
        await loadScript(`js/pages/${hash}.js`);
        const reloadedModule = window[hash.charAt(0).toUpperCase() + hash.slice(1) + 'Page'];
        if (reloadedModule) {
          elements.pageContent.className = 'page-content page-enter';
          await reloadedModule.render(elements.pageContent);
        } else {
          elements.pageContent.innerHTML = `<h2>Page "${hash}" not found.</h2>`;
        }
      }
    } catch (err) {
      console.error(`Failed to load page: ${hash}`, err);
      elements.pageContent.innerHTML = `
        <div style="text-align: center; padding: var(--space-10);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 class="mt-4">Error Loading Page</h3>
          <p class="text-muted">Something went wrong while rendering this page.</p>
          <button class="btn btn-primary mt-4" onclick="window.location.reload()">Reload Application</button>
        </div>
      `;
    }
  }

  // Script Loader Helper
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // --- Modal Utilities ---
  function showModal(title, bodyHtml, footerHtml = '') {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = bodyHtml;
    
    // Check if footer exists or create it
    let footer = elements.modal.querySelector('.modal-footer');
    if (footer) footer.remove();

    if (footerHtml) {
      const footerDiv = document.createElement('div');
      footerDiv.className = 'modal-footer';
      footerDiv.innerHTML = footerHtml;
      elements.modal.appendChild(footerDiv);
    }

    elements.modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    elements.modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // --- Toast Utilities ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3500);
  }

  // Socket.io Connection
  function setupSocket() {
    if (typeof io === 'undefined') return;
    const socket = io();
    socket.on('connect', () => {
      console.log('⚡ Socket connected to server');
    });
    socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      showToast(`🔔 ${data.title}: ${data.message}`, 'info');
      // Refresh global notifications count
      loadNotifications();
      // Re-fetch active page data
      if (state.currentPage === 'dashboard' && window.DashboardPage) {
        window.DashboardPage.fetchData();
      } else if (state.currentPage === 'leave' && window.LeavePage) {
        window.LeavePage.fetchData();
      } else if (state.currentPage === 'attendance' && window.AttendancePage) {
        window.AttendancePage.fetchData();
      } else if (state.currentPage === 'payroll' && window.PayrollPage) {
        window.PayrollPage.fetchData();
      }
    });
  }

  // Expose global utilities
  window.PeopleCore = {
    showModal,
    hideModal,
    showToast,
    refreshState: async () => {
      await checkAuth();
      await loadNotifications();
    }
  };

  // Start Application
  init();
});
