/**
 * PeopleCore HRMS — Dashboard Page Module
 */

const DashboardPage = {
  render: async (container) => {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Dashboard</h1>
          <p>Real-time analytics and employee overview.</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" id="stats-grid">
        <div class="skeleton" style="height: 100px;"></div>
        <div class="skeleton" style="height: 100px;"></div>
        <div class="skeleton" style="height: 100px;"></div>
        <div class="skeleton" style="height: 100px;"></div>
      </div>

      <!-- Charts & Activities Grid -->
      <div class="dashboard-grid">
        <!-- Weekly Attendance Chart -->
        <div class="chart-card card">
          <div class="card-header">
            <h3 class="card-title">Weekly Attendance Rate</h3>
          </div>
          <div class="card-body">
            <div class="mini-chart">
              <div class="chart-bar" style="height: 90%;"><span class="chart-bar-label">Mon</span></div>
              <div class="chart-bar" style="height: 85%;"><span class="chart-bar-label">Tue</span></div>
              <div class="chart-bar" style="height: 92%;"><span class="chart-bar-label">Wed</span></div>
              <div class="chart-bar" style="height: 88%;"><span class="chart-bar-label">Thu</span></div>
              <div class="chart-bar" style="height: 94%;"><span class="chart-bar-label">Fri</span></div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="chart-card card">
          <div class="card-header">
            <h3 class="card-title">Recent Activity</h3>
          </div>
          <div class="card-body">
            <div class="activity-list" id="activity-list">
              <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 40px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    await DashboardPage.fetchData();
  },

  fetchData: async () => {
    try {
      const stats = await window.API.getDashboardStats();
      DashboardPage.drawStats(stats);
      
      const { notifications } = await window.API.getNotifications();
      DashboardPage.drawActivities(notifications);
    } catch (err) {
      console.error(err);
    }
  },

  drawStats: (stats) => {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="stat-card card">
        <div class="stat-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-content">
          <h3>${stats.totalEmployees}</h3>
          <p>Total Roster</p>
          <span class="stat-trend up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
            <span>+4%</span>
          </span>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-content">
          <h3>${stats.attendanceRate}%</h3>
          <p>Attendance Rate</p>
          <span class="stat-trend up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
            <span>+0.8%</span>
          </span>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon yellow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="stat-content">
          <h3>${stats.pendingLeaves}</h3>
          <p>Pending Leaves</p>
          <span class="stat-trend down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
            <span>-2 active</span>
          </span>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        </div>
        <div class="stat-content">
          <h3>${stats.activeJobs}</h3>
          <p>Active Job Roles</p>
          <span class="stat-trend up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
            <span>+1 post</span>
          </span>
        </div>
      </div>
    `;
  },

  drawActivities: (activities) => {
    const container = document.getElementById('activity-list');
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML = '<p class="text-muted">No recent activities.</p>';
      return;
    }

    container.innerHTML = activities.slice(0, 4).map(act => {
      let colorClass = 'blue';
      if (act.type === 'leave') colorClass = 'yellow';
      if (act.type === 'recruitment') colorClass = 'green';
      if (act.type === 'attendance') colorClass = 'red';

      return `
        <div class="activity-item">
          <div class="activity-dot ${colorClass}"></div>
          <div class="activity-content">
            <div class="activity-text"><strong>${act.title}:</strong> ${act.message}</div>
            <div class="activity-time">${act.timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.DashboardPage = DashboardPage;
