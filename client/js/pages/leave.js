/**
 * PeopleCore HRMS — Leave Management Page Module
 */

const LeavePage = {
  render: async (container) => {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Leave Management</h1>
          <p>Request leaves, review history, and track balances.</p>
        </div>
        <button class="btn btn-primary" id="apply-leave-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Apply For Leave</span>
        </button>
      </div>

      <!-- Leave Stats Cards -->
      <div class="leave-stats">
        <div class="leave-stat-card">
          <h2>18</h2>
          <p>Annual Days Allowed</p>
        </div>
        <div class="leave-stat-card">
          <h2>12</h2>
          <p>Sick Days Allowed</p>
        </div>
        <div class="leave-stat-card">
          <h2 style="color: var(--color-success);">6.5</h2>
          <p>Available Balance</p>
        </div>
        <div class="leave-stat-card">
          <h2 style="color: var(--color-accent);">1.5</h2>
          <p>Pending Approval</p>
        </div>
      </div>

      <!-- Leaves History Table -->
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Period</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="leaves-table-body">
            <!-- Leave entries rendered here -->
          </tbody>
        </table>
      </div>
    `;

    LeavePage.setupEvents();
    await LeavePage.fetchData();
  },

  fetchData: async () => {
    try {
      const { leaves } = await window.API.getLeaves();
      LeavePage.drawTable(leaves);
    } catch (err) {
      console.error(err);
    }
  },

  drawTable: (leaves) => {
    const tbody = document.getElementById('leaves-table-body');
    if (!tbody) return;

    if (leaves.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 24px; color: var(--color-text-secondary);">No leave history found.</td></tr>';
      return;
    }

    tbody.innerHTML = leaves.map(l => {
      // Date formatting
      const start = new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Badges
      let badgeClass = 'pending';
      if (l.status === 'approved') badgeClass = 'approved';
      if (l.status === 'rejected') badgeClass = 'rejected';

      return `
        <tr data-id="${l.id}">
          <td>
            <div style="font-weight: 600;">${l.employee.name}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">${l.employee.employeeId} • ${l.employee.position}</div>
          </td>
          <td style="text-transform: capitalize; font-weight: 500;">${l.leaveType}</td>
          <td>${start} - ${end}</td>
          <td style="font-weight: 600;">${l.totalDays} days</td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l.reason}</td>
          <td>
            <span class="status-badge ${badgeClass}">${l.status.toUpperCase()}</span>
          </td>
          <td>
            ${l.status === 'pending' ? `
              <div class="flex gap-2">
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="LeavePage.handleAction('${l.id}', 'approved')">Approve</button>
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px; color: var(--color-danger); border-color: rgba(239, 68, 68, 0.2);" onclick="LeavePage.handleAction('${l.id}', 'rejected')">Reject</button>
              </div>
            ` : `<span class="text-muted" style="font-size: 12px;">No Actions</span>`}
          </td>
        </tr>
      `;
    }).join('');
  },

  handleAction: async (id, status) => {
    try {
      await window.API.updateLeaveStatus(id, status);
      window.PeopleCore.showToast(`Leave request ${status}`, 'success');
      await LeavePage.fetchData();
      await window.PeopleCore.refreshState();
    } catch (err) {
      window.PeopleCore.showToast(err.message, 'error');
    }
  },

  setupEvents: () => {
    document.getElementById('apply-leave-btn').addEventListener('click', LeavePage.showApplyModal);
  },

  showApplyModal: () => {
    const bodyHtml = `
      <form id="apply-leave-form">
        <div class="form-group">
          <label class="form-label" for="leave-type">Leave Type</label>
          <select class="form-input" id="leave-type" required>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="start-date">Start Date</label>
            <input type="date" class="form-input" id="start-date" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="end-date">End Date</label>
            <input type="date" class="form-input" id="end-date" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="leave-reason">Reason</label>
          <textarea class="form-textarea" id="leave-reason" placeholder="Please state the reason for leave..." required></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Cancel</button>
      <button class="btn btn-primary" id="submit-leave-btn">Apply</button>
    `;

    window.PeopleCore.showModal('Apply for Leave', bodyHtml, footerHtml);

    // Date validator
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    
    startInput.addEventListener('change', () => {
      endInput.min = startInput.value;
    });

    // Form submit
    document.getElementById('submit-leave-btn').addEventListener('click', async () => {
      const form = document.getElementById('apply-leave-form');
      if (!form.reportValidity()) return;

      const leaveData = {
        leaveType: document.getElementById('leave-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        reason: document.getElementById('leave-reason').value
      };

      try {
        await window.API.applyLeave(leaveData);
        window.PeopleCore.hideModal();
        window.PeopleCore.showToast('Leave request submitted successfully!', 'success');
        await LeavePage.fetchData();
        await window.PeopleCore.refreshState();
      } catch (err) {
        window.PeopleCore.showToast(err.message, 'error');
      }
    });
  }
};

window.LeavePage = LeavePage;
