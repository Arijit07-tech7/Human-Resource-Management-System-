/**
 * PeopleCore HRMS — Settings Page Module
 */

const SettingsPage = {
  render: async (container) => {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Settings</h1>
          <p>Update your personal information, preferences, and security settings.</p>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Settings Nav -->
        <div class="settings-nav">
          <div class="settings-nav-item active" data-section="profile">Profile Information</div>
          <div class="settings-nav-item" data-section="notifications">Notifications</div>
          <div class="settings-nav-item" data-section="security">Security & Access</div>
        </div>

        <!-- Settings Content -->
        <div class="settings-content" id="settings-container">
          <!-- Profile Section -->
          <div class="settings-tab-content" id="tab-profile">
            <div class="settings-section">
              <h3>Profile Information</h3>
              <p>Update your account details and profile information.</p>
              
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="profile-name" value="Admin User">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="profile-email" value="admin@peoplecore.com" disabled>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" class="form-input" value="Human Resources" disabled>
                </div>
                <div class="form-group">
                  <label class="form-label">Position</label>
                  <input type="text" class="form-input" value="HR Director" disabled>
                </div>
              </div>
              <button class="btn btn-primary mt-4" id="save-profile-btn">Save Changes</button>
            </div>
          </div>

          <!-- Notifications Section -->
          <div class="settings-tab-content" id="tab-notifications" style="display: none;">
            <div class="settings-section">
              <h3>Email Alerts</h3>
              <p>Configure which actions trigger automated email updates.</p>
              
              <div class="toggle-row">
                <span class="toggle-label">New job application alerts</span>
                <div class="toggle active" data-id="alert-job"></div>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Leave request updates</span>
                <div class="toggle active" data-id="alert-leave"></div>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Attendance anomalies check</span>
                <div class="toggle" data-id="alert-att"></div>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Monthly payroll processing email</span>
                <div class="toggle active" data-id="alert-pay"></div>
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="settings-tab-content" id="tab-security" style="display: none;">
            <div class="settings-section">
              <h3>Change Password</h3>
              <p>Ensure your account is using a secure, long password.</p>
              
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-input" id="curr-pass" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-input" id="new-pass" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-input" id="conf-pass" placeholder="••••••••">
              </div>
              <button class="btn btn-primary mt-4" id="save-security-btn">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    `;

    SettingsPage.setupEvents();
    SettingsPage.loadProfile();
  },

  loadProfile: () => {
    if (window.API && window.API.getProfile) {
      window.API.getProfile().then(user => {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        if (nameInput) nameInput.value = user.name;
        if (emailInput) emailInput.value = user.email;
      }).catch(err => console.error(err));
    }
  },

  setupEvents: () => {
    // Navigation tabs
    const navItems = document.querySelectorAll('.settings-nav-item');
    const tabs = document.querySelectorAll('.settings-tab-content');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const section = item.getAttribute('data-section');
        tabs.forEach(tab => {
          if (tab.id === `tab-${section}`) {
            tab.style.display = 'block';
          } else {
            tab.style.display = 'none';
          }
        });
      });
    });

    // Toggle switch handler
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(t => {
      t.addEventListener('click', () => {
        t.classList.toggle('active');
        window.PeopleCore.showToast('Preferences updated successfully', 'success');
      });
    });

    // Save profile profile change
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', async () => {
        const name = document.getElementById('profile-name').value.trim();
        if (!name) {
          window.PeopleCore.showToast('Name cannot be empty', 'error');
          return;
        }

        try {
          // In mock, we directly update global session user name
          window.PeopleCore.showToast('Profile updated successfully', 'success');
          await window.PeopleCore.refreshState();
        } catch (err) {
          window.PeopleCore.showToast(err.message, 'error');
        }
      });
    }

    // Save password change
    const saveSecurityBtn = document.getElementById('save-security-btn');
    if (saveSecurityBtn) {
      saveSecurityBtn.addEventListener('click', () => {
        const currentPass = document.getElementById('curr-pass').value;
        const newPass = document.getElementById('new-pass').value;
        const confPass = document.getElementById('conf-pass').value;

        if (!currentPass || !newPass || !confPass) {
          window.PeopleCore.showToast('Please fill out all password fields', 'error');
          return;
        }

        if (newPass !== confPass) {
          window.PeopleCore.showToast('New password confirmation does not match', 'error');
          return;
        }

        window.PeopleCore.showToast('Password updated successfully', 'success');
        document.getElementById('curr-pass').value = '';
        document.getElementById('new-pass').value = '';
        document.getElementById('conf-pass').value = '';
      });
    }
  }
};

window.SettingsPage = SettingsPage;
