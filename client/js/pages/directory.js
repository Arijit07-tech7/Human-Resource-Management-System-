/**
 * PeopleCore HRMS — Employee Directory & Performance Leaderboard Page Module
 */

const DirectoryPage = {
  filters: {
    search: '',
    department: '',
    status: ''
  },
  activeTab: 'directory', // 'directory' or 'leaderboard'

  render: async (container) => {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Employee Directory</h1>
          <p>Search, filter, and track performance scores of all employees.</p>
        </div>
        <button class="btn btn-primary" id="add-employee-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <span>Add Employee</span>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="settings-nav" style="margin-bottom: 24px; display: flex; width: 100%;">
        <div class="settings-nav-item active" id="tab-btn-directory" style="cursor: pointer; padding: 12px 24px; font-weight:600;">Employee Roster</div>
        <div class="settings-nav-item" id="tab-btn-leaderboard" style="cursor: pointer; padding: 12px 24px; font-weight:600;">🏆 Performance Leaderboard</div>
      </div>

      <!-- Directory View -->
      <div id="directory-view-container">
        <div class="directory-toolbar">
          <div class="directory-filters">
            <select class="filter-select" id="dept-filter">
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="hr">Human Resources</option>
              <option value="operations">Operations</option>
              <option value="support">Customer Success</option>
            </select>
            <select class="filter-select" id="status-filter">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        <div class="employee-grid" id="employee-grid">
          <!-- Employee cards rendered here -->
        </div>
      </div>

      <!-- Leaderboard View -->
      <div id="leaderboard-view-container" style="display: none;">
        <div class="card" style="padding: 24px;">
          <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 700; color: var(--color-primary);">Top Performing Employees</h3>
          <div class="leaderboard-list" id="leaderboard-list">
            <!-- Leaderboard entries -->
          </div>
        </div>
      </div>
    `;

    DirectoryPage.setupEvents();
    if (DirectoryPage.activeTab === 'directory') {
      await DirectoryPage.fetchData();
    } else {
      await DirectoryPage.fetchLeaderboard();
    }

    // Bind search event
    window.addEventListener('globalSearch', DirectoryPage.handleSearch);
  },

  fetchData: async () => {
    try {
      const { employees } = await window.API.getEmployees(DirectoryPage.filters);
      DirectoryPage.drawGrid(employees);
    } catch (err) {
      console.error(err);
    }
  },

  fetchLeaderboard: async () => {
    try {
      // Fetch leaderboard from API
      let leaderboard = [];
      try {
        const res = await window.API.getEmployees({});
        leaderboard = res.employees || [];
      } catch (err) {
        leaderboard = [];
      }
      
      // Sort in-memory fallback just in case
      leaderboard.sort((a, b) => (b.performanceScore || 80) - (a.performanceScore || 80));
      DirectoryPage.drawLeaderboard(leaderboard);
    } catch (err) {
      console.error(err);
    }
  },

  drawGrid: (employees) => {
    const grid = document.getElementById('employee-grid');
    if (!grid) return;

    if (employees.length === 0) {
      grid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">No employees match your search criteria.</p>';
      return;
    }

    grid.innerHTML = employees.map(emp => {
      const code = emp.name.charCodeAt(0) % 5;
      const gradients = [
        'linear-gradient(135deg, #6c5ce7, #a29bfe)',
        'linear-gradient(135deg, #00b894, #55efc4)',
        'linear-gradient(135deg, #ff7675, #ff8787)',
        'linear-gradient(135deg, #0984e3, #74b9ff)',
        'linear-gradient(135deg, #e17055, #ff7675)'
      ];

      return `
        <div class="employee-card card">
          <div class="employee-avatar" style="background: ${gradients[code]}">
            <span>${emp.name.charAt(0).toUpperCase()}</span>
          </div>
          <h4>${emp.name}</h4>
          <p class="position">${emp.position}</p>
          <div class="mb-4">
            <span class="department-badge">${emp.department.toUpperCase()}</span>
          </div>
          <div class="mb-2" style="font-size:12px; font-weight:600; color:var(--color-primary); display:flex; justify-content:center; gap:6px;">
            <span>Performance:</span>
            <span>${emp.performanceScore || 80}/100</span>
          </div>
          <div class="flex items-center justify-between" style="border-top: 1px solid rgba(0,0,0,0.04); padding-top: 12px; margin-top: 12px;">
            <span class="text-muted" style="font-size: 11px;">${emp.employeeId}</span>
            <span style="font-size: 12px; font-weight: 500;">
              <span class="status-dot ${emp.status}"></span>
              ${emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  drawLeaderboard: (leaderboard) => {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;

    if (leaderboard.length === 0) {
      list.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">No performance stats found.</p>';
      return;
    }

    list.innerHTML = leaderboard.map((emp, i) => {
      const score = emp.performanceScore || 80;
      let barColor = 'var(--color-success)';
      if (score < 80) barColor = 'var(--color-warning)';
      else if (score < 90) barColor = 'var(--color-accent)';

      // Award rank icons for top 3
      let rankDisplay = `<span style="font-size:16px; font-weight:800; color:var(--color-text-secondary); width: 28px; text-align:center;">#${i + 1}</span>`;
      if (i === 0) rankDisplay = `<span style="font-size:24px; width: 28px; text-align:center;">🥇</span>`;
      else if (i === 1) rankDisplay = `<span style="font-size:24px; width: 28px; text-align:center;">🥈</span>`;
      else if (i === 2) rankDisplay = `<span style="font-size:24px; width: 28px; text-align:center;">🥉</span>`;

      return `
        <div style="display:flex; align-items:center; gap:16px; padding:16px; border-bottom:1px solid rgba(0,0,0,0.04); background: ${i < 3 ? 'rgba(41,98,255,0.02)' : 'transparent'}; border-radius: 8px;">
          ${rankDisplay}
          <div style="width:40px; height:40px; border-radius:50%; background:var(--color-primary-light); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">
            ${emp.name.charAt(0).toUpperCase()}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; color:var(--color-text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${emp.name}</div>
            <div style="font-size:12px; color:var(--color-text-secondary); text-transform:uppercase;">${emp.position} • ${emp.department}</div>
          </div>
          <div style="width:240px; display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
            <div style="display:flex; justify-content:between; font-size:12px; font-weight:700;">
              <span style="flex:1; color:var(--color-text-secondary);">Score</span>
              <span style="color:${barColor};">${score}%</span>
            </div>
            <div style="width:100%; height:6px; background:var(--color-background); border-radius:3px; overflow:hidden;">
              <div style="width:${score}%; height:100%; background:${barColor}; border-radius:3px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  setupEvents: () => {
    const tabDir = document.getElementById('tab-btn-directory');
    const tabLead = document.getElementById('tab-btn-leaderboard');
    const viewDir = document.getElementById('directory-view-container');
    const viewLead = document.getElementById('leaderboard-view-container');

    tabDir.addEventListener('click', () => {
      tabDir.classList.add('active');
      tabLead.classList.remove('active');
      viewDir.style.display = 'block';
      viewLead.style.display = 'none';
      DirectoryPage.activeTab = 'directory';
      DirectoryPage.fetchData();
    });

    tabLead.addEventListener('click', () => {
      tabLead.classList.add('active');
      tabDir.classList.remove('active');
      viewDir.style.display = 'none';
      viewLead.style.display = 'block';
      DirectoryPage.activeTab = 'leaderboard';
      DirectoryPage.fetchLeaderboard();
    });

    // Dept filter change
    document.getElementById('dept-filter')?.addEventListener('change', (e) => {
      DirectoryPage.filters.department = e.target.value;
      DirectoryPage.fetchData();
    });

    // Status filter change
    document.getElementById('status-filter')?.addEventListener('change', (e) => {
      DirectoryPage.filters.status = e.target.value;
      DirectoryPage.fetchData();
    });

    // Add employee click
    document.getElementById('add-employee-btn')?.addEventListener('click', DirectoryPage.showAddModal);
  },

  handleSearch: (e) => {
    DirectoryPage.filters.search = e.detail;
    if (DirectoryPage.activeTab === 'directory') {
      DirectoryPage.fetchData();
    }
  },

  showAddModal: () => {
    const bodyHtml = `
      <form id="add-employee-form">
        <div class="form-group">
          <label class="form-label" for="emp-name">Full Name</label>
          <input type="text" class="form-input" id="emp-name" placeholder="John Doe" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-email">Email Address</label>
          <input type="email" class="form-input" id="emp-email" placeholder="john.doe@company.com" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-dept">Department</label>
          <select class="form-input" id="emp-dept" required>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="hr">Human Resources</option>
            <option value="operations">Operations</option>
            <option value="support">Customer Success</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-pos">Position</label>
          <input type="text" class="form-input" id="emp-pos" placeholder="e.g. Lead Developer" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-score">Initial Performance Score (0-100)</label>
          <input type="number" class="form-input" id="emp-score" value="80" min="0" max="100">
        </div>
        <div class="form-group">
          <label class="form-label" for="emp-phone">Phone Number</label>
          <input type="tel" class="form-input" id="emp-phone" placeholder="+1 (555) 000-0000">
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Cancel</button>
      <button class="btn btn-primary" id="save-emp-btn">Add Employee</button>
    `;

    window.PeopleCore.showModal('Add New Employee', bodyHtml, footerHtml);

    // Save click
    document.getElementById('save-emp-btn').addEventListener('click', async () => {
      const form = document.getElementById('add-employee-form');
      if (!form.reportValidity()) return;

      const employeeData = {
        name: document.getElementById('emp-name').value,
        email: document.getElementById('emp-email').value,
        department: document.getElementById('emp-dept').value,
        position: document.getElementById('emp-pos').value,
        performanceScore: parseInt(document.getElementById('emp-score').value) || 80,
        phone: document.getElementById('emp-phone').value,
        password: 'Password123'
      };

      try {
        await window.API.addEmployee(employeeData);
        window.PeopleCore.hideModal();
        window.PeopleCore.showToast('Employee successfully added!', 'success');
        if (DirectoryPage.activeTab === 'directory') {
          await DirectoryPage.fetchData();
        } else {
          await DirectoryPage.fetchLeaderboard();
        }
      } catch (err) {
        window.PeopleCore.showToast(err.message, 'error');
      }
    });
  }
};

window.DirectoryPage = DirectoryPage;
