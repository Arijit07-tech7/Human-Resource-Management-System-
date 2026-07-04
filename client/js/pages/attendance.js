/**
 * PeopleCore HRMS — Attendance Page Module
 * Full attendance tracking with check-in/out, history, heatmap, and QR Code
 */

const AttendancePage = {
  currentDate: new Date(),
  records: [],

  render: async (container) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Attendance</h1>
          <p>Track daily attendance, check-in/out times, and view history.</p>
        </div>
        <div style="display:flex; gap: 12px; align-items: center;">
          <div style="text-align:right;">
            <div style="font-size: 13px; color: var(--color-text-secondary);">${today}</div>
            <div style="font-size: 22px; font-weight: 700; color: var(--color-primary);" id="live-clock">${timeStr}</div>
          </div>
        </div>
      </div>

      <!-- Check-in/out Card -->
      <div class="attendance-checkin-card card" id="checkin-card" style="margin-bottom: 24px;">
        <div class="checkin-info">
          <div class="checkin-status" id="checkin-status">
            <div class="status-indicator idle" id="status-indicator"></div>
            <div>
              <div class="checkin-title" id="checkin-title">Not Checked In</div>
              <div class="checkin-sub" id="checkin-sub">Start your work day</div>
            </div>
          </div>
          <div class="checkin-times" id="checkin-times" style="display:none;">
            <div class="time-box">
              <span class="time-label">Check In</span>
              <span class="time-value" id="display-checkin">—</span>
            </div>
            <div class="time-divider">→</div>
            <div class="time-box">
              <span class="time-label">Check Out</span>
              <span class="time-value" id="display-checkout">—</span>
            </div>
            <div class="time-box">
              <span class="time-label">Hours</span>
              <span class="time-value" id="display-hours">—</span>
            </div>
          </div>
        </div>
        <div class="checkin-actions">
          <button class="btn btn-primary btn-checkin" id="checkin-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Check In
          </button>
          <button class="btn btn-secondary btn-checkout" id="checkout-btn" style="display:none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Check Out
          </button>
        </div>
      </div>

      <!-- Advanced Features Row -->
      <div class="payroll-breakdown-grid" style="margin-bottom: 24px;">
        <!-- Heatmap -->
        <div class="card" style="padding: 24px;">
          <h3 style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: var(--color-text-primary);">30-Day Attendance Heatmap</h3>
          <div id="attendance-heatmap" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px;"></div>
          <div style="display: flex; gap: 12px; margin-top: 16px; font-size: 11px; color: var(--color-text-secondary); justify-content: flex-end;">
            <div style="display:flex; align-items:center; gap:4px;"><div style="width:10px; height:10px; background:#10b981; border-radius:2px;"></div>Present</div>
            <div style="display:flex; align-items:center; gap:4px;"><div style="width:10px; height:10px; background:#f59e0b; border-radius:2px;"></div>Late</div>
            <div style="display:flex; align-items:center; gap:4px;"><div style="width:10px; height:10px; background:#ef4444; border-radius:2px;"></div>Absent</div>
            <div style="display:flex; align-items:center; gap:4px;"><div style="width:10px; height:10px; background:#e8ebf3; border-radius:2px;"></div>Off</div>
          </div>
        </div>

        <!-- QR Code Attendance Card -->
        <div class="card" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: var(--color-text-primary); width:100%; text-align:left;">QR Code Attendance</h3>
          <div id="qrcode-container" style="padding: 12px; background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: var(--radius-md); margin-bottom: 12px; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;">
            <canvas id="qrcode-canvas" style="width:120px; height:120px;"></canvas>
          </div>
          <button class="btn btn-outline" id="scan-qr-btn" style="padding: 8px 16px; font-size: 13px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px; margin-right:6px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan QR Code
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="attendance-stats" id="attendance-stats" style="margin-bottom:24px;">
        <div class="att-stat-card">
          <div class="att-stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value" id="stat-present">—</div>
            <div class="att-stat-label">Present Days</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value" id="stat-absent">—</div>
            <div class="att-stat-label">Absent Days</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value" id="stat-late">—</div>
            <div class="att-stat-label">Late Arrivals</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value" id="stat-rate">—</div>
            <div class="att-stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="section-header" style="margin-bottom: 16px;">
        <h3 style="margin:0; font-size: 16px; font-weight: 600;">Attendance History</h3>
        <div style="display:flex; gap: 10px; align-items: center;">
          <select class="filter-select" id="att-month-filter">
            <option value="">This Month</option>
            <option value="prev">Last Month</option>
            <option value="all">All Records</option>
          </select>
          <select class="filter-select" id="att-status-filter">
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
          <button class="btn btn-outline" id="export-att-btn" style="padding: 8px 14px; font-size: 13px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody id="att-table-body">
            <tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--color-text-secondary);">
              <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 40px;"></div>
            </td></tr>
          </tbody>
        </table>
      </div>

      <!-- Weekly Bar Chart -->
      <div class="card" style="margin-top: 20px; padding: 24px;">
        <h3 style="margin: 0 0 20px; font-size: 15px; font-weight: 600; color: var(--color-text-primary);">This Week's Attendance Overview</h3>
        <div class="weekly-chart" id="weekly-chart"></div>
      </div>
    `;

    AttendancePage.startClock();
    AttendancePage.setupEvents();
    await AttendancePage.fetchData();
    AttendancePage.loadTodayStatus();
  },

  startClock: () => {
    const update = () => {
      const el = document.getElementById('live-clock');
      if (el) {
        el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        clearInterval(AttendancePage._clockInterval);
      }
    };
    AttendancePage._clockInterval = setInterval(update, 1000);
  },

  fetchData: async () => {
    try {
      const data = await window.API.getAttendance();
      AttendancePage.records = data.records || data;
      AttendancePage.drawTable(AttendancePage.records);
      AttendancePage.drawStats(AttendancePage.records);
      AttendancePage.drawWeeklyChart(AttendancePage.records);
      AttendancePage.drawHeatmap(AttendancePage.records);
      AttendancePage.drawQRCode();
    } catch (err) {
      console.error('Attendance fetch error:', err);
      const tbody = document.getElementById('att-table-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--color-text-secondary);">Unable to load attendance records.</td></tr>';
      }
    }
  },

  loadTodayStatus: () => {
    const todayRecord = AttendancePage.records.find(r => {
      const d = new Date(r.date);
      const today = new Date();
      return d.toDateString() === today.toDateString() && r.employee?.id === 'emp-admin';
    }) || AttendancePage.records.find(r => {
      const d = new Date(r.date);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });

    if (todayRecord && todayRecord.checkIn) {
      AttendancePage.setCheckedInUI(todayRecord);
    }
  },

  setCheckedInUI: (record) => {
    const btn = document.getElementById('checkin-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const indicator = document.getElementById('status-indicator');
    const title = document.getElementById('checkin-title');
    const sub = document.getElementById('checkin-sub');
    const times = document.getElementById('checkin-times');
    const ciDisplay = document.getElementById('display-checkin');
    const coDisplay = document.getElementById('display-checkout');
    const hrDisplay = document.getElementById('display-hours');

    if (btn) btn.style.display = 'none';
    if (checkoutBtn && !record.checkOut) checkoutBtn.style.display = 'flex';
    if (indicator) { indicator.classList.remove('idle'); indicator.classList.add('active'); }
    if (title) title.textContent = record.checkOut ? 'Work Day Complete' : 'Checked In';
    if (sub) sub.textContent = record.checkOut ? 'Have a great rest of your day!' : 'You are currently checked in';
    if (times) times.style.display = 'flex';

    if (ciDisplay && record.checkIn) {
      ciDisplay.textContent = new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (coDisplay) {
      coDisplay.textContent = record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'In Progress';
    }
    if (hrDisplay && record.checkIn) {
      const end = record.checkOut ? new Date(record.checkOut) : new Date();
      const diff = (end - new Date(record.checkIn)) / (1000 * 60 * 60);
      hrDisplay.textContent = `${diff.toFixed(1)}h`;
    }
  },

  drawStats: (records) => {
    const thisMonth = records.filter(r => {
      const d = new Date(r.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const present = thisMonth.filter(r => r.status === 'present').length;
    const late = thisMonth.filter(r => r.status === 'late').length;
    const absent = thisMonth.filter(r => r.status === 'absent').length;
    const total = thisMonth.length || 1;
    const rate = Math.round(((present + late) / total) * 100);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-present', present);
    set('stat-absent', absent);
    set('stat-late', late);
    set('stat-rate', `${rate}%`);
  },

  drawTable: (records) => {
    const tbody = document.getElementById('att-table-body');
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--color-text-secondary);">No attendance records found.</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(r => {
      const date = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const checkIn = r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
      const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

      let hours = '—';
      if (r.checkIn && r.checkOut) {
        const diff = (new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60);
        hours = `${diff.toFixed(1)}h`;
      }

      const statusMap = { present: 'approved', late: 'pending', absent: 'rejected' };
      const badge = statusMap[r.status] || 'pending';
      const empName = r.employee?.name || r.employeeName || 'Unknown';
      const empId = r.employee?.employeeId || '';

      return `
        <tr>
          <td style="font-weight:500;">${date}</td>
          <td>
            <div style="font-weight:600;">${empName}</div>
            <div style="font-size:11px;color:var(--color-text-secondary);">${empId}</div>
          </td>
          <td style="color: var(--color-success); font-weight: 500;">${checkIn}</td>
          <td style="color: var(--color-text-secondary);">${checkOut}</td>
          <td style="font-weight: 600;">${hours}</td>
          <td><span class="status-badge ${badge}">${(r.status || 'present').toUpperCase()}</span></td>
          <td style="font-size:12px;color:var(--color-text-secondary);">${r.note || '—'}</td>
        </tr>
      `;
    }).join('');
  },

  drawWeeklyChart: (records) => {
    const chart = document.getElementById('weekly-chart');
    if (!chart) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    const weekData = days.map((day, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + 1 + i);
      const dayRecords = records.filter(r => new Date(r.date).toDateString() === d.toDateString());
      const presentCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      return { day, count: presentCount, total: Math.max(dayRecords.length, 1) };
    });

    const maxVal = Math.max(...weekData.map(d => d.count), 1);

    chart.innerHTML = `
      <div style="display:flex; align-items: flex-end; gap: 20px; height: 120px; padding: 0 10px;">
        ${weekData.map(d => {
          const pct = (d.count / maxVal) * 100;
          const isToday = d.day === ['Mon','Tue','Wed','Thu','Fri'][today.getDay() - 1];
          return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
              <div style="font-size:12px;font-weight:600;color:${isToday ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${d.count}</div>
              <div style="width:100%; background: var(--color-background); border-radius: 6px 6px 0 0; height: 90px; display:flex; align-items:flex-end;">
                <div style="width:100%; height:${Math.max(pct, 4)}%; background: ${isToday ? 'var(--color-accent)' : 'linear-gradient(to top, var(--color-primary), var(--color-primary-lighter))'}; border-radius:6px 6px 0 0; transition: height 0.6s ease; min-height: 4px;"></div>
              </div>
              <div style="font-size:12px;font-weight:${isToday ? '700' : '400'};color:${isToday ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${d.day}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  drawHeatmap: (records) => {
    const container = document.getElementById('attendance-heatmap');
    if (!container) return;

    // Generate last 30 calendar days
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    container.innerHTML = days.map(day => {
      // Check if we have an attendance record for Admin User (or fallback to any record) for this specific day
      const record = records.find(r => new Date(r.date).toDateString() === day.toDateString() && (r.employee?.id === 'emp-admin' || !r.employee));

      let color = '#e8ebf3'; // Default off color
      let border = 'none';
      let tooltip = `${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Rest Day`;

      if (record) {
        if (record.status === 'present') {
          color = '#10b981';
          tooltip = `${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Present`;
        } else if (record.status === 'late') {
          color = '#f59e0b';
          tooltip = `${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Late Arrival`;
        } else if (record.status === 'absent') {
          color = '#ef4444';
          tooltip = `${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Absent`;
        }
      } else if (day.getDay() !== 0 && day.getDay() !== 6) {
        // Weekday with no check-in
        color = '#f3f4f6';
        border = '1px dashed var(--color-text-muted)';
        tooltip = `${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Absent / No Record`;
      }

      return `
        <div style="background:${color}; border:${border}; height: 28px; border-radius: 4px; display:flex; align-items:center; justify-content:center; color:${color === '#e8ebf3' ? 'var(--color-text-secondary)' : 'white'}; font-size:10px; font-weight:700; position:relative; cursor:pointer;" title="${tooltip}">
          ${day.getDate()}
        </div>
      `;
    }).join('');
  },

  drawQRCode: () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvas, JSON.stringify({ employeeId: 'EMP-0001', action: 'attendance-check' }), {
        width: 120,
        margin: 1,
        color: {
          dark: '#1a237e',
          light: '#ffffff'
        }
      }, function (error) {
        if (error) console.error(error);
      });
    }
  },

  showScannerModal: () => {
    const bodyHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:16px;">
        <div class="scanner-window" style="width:260px; height:200px; border:3px solid var(--color-accent); border-radius:12px; position:relative; overflow:hidden; background:#000; margin-bottom:16px;">
          <!-- Simulated Camera Scan Background -->
          <div style="position:absolute; inset:0; opacity:0.15; background: radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%); background-size: 8px 8px; animation: static-snow 0.5s steps(4) infinite;"></div>
          <!-- Animated Laser Beam -->
          <div style="position:absolute; left:0; width:100%; height:4px; background:var(--color-success); top:0; animation: scan-line 2s linear infinite; box-shadow: 0 0 12px var(--color-success);"></div>
          <!-- Target Overlay Frame -->
          <div style="position:absolute; top:50%; left:50%; width:100px; height:100px; border:2px dashed rgba(255,255,255,0.6); transform:translate(-50%, -50%); border-radius:8px;"></div>
        </div>
        <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:20px;">Align the QR code within the target area to check in automatically.</p>
        <button class="btn btn-primary" id="simulate-scan-trigger-btn" style="width:100%; padding:12px; font-weight:600;">Simulate QR Code Scan</button>
      </div>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Cancel</button>
    `;
    window.PeopleCore.showModal('Scan Attendance QR', bodyHtml, footerHtml);

    // Simulate Scan button listener
    document.getElementById('simulate-scan-trigger-btn').addEventListener('click', async () => {
      const btn = document.getElementById('simulate-scan-trigger-btn');
      btn.disabled = true;
      btn.textContent = 'Simulating scan...';
      
      setTimeout(async () => {
        try {
          const record = await window.API.checkIn();
          window.PeopleCore.hideModal();
          window.PeopleCore.showToast('✅ Checked in successfully via QR Scan!', 'success');
          await AttendancePage.fetchData();
          AttendancePage.loadTodayStatus();
        } catch (err) {
          window.PeopleCore.showToast(err.message || 'QR Scan simulation failed', 'error');
          window.PeopleCore.hideModal();
        }
      }, 1200);
    });
  },

  setupEvents: () => {
    const checkinBtn = document.getElementById('checkin-btn');
    if (checkinBtn) {
      checkinBtn.addEventListener('click', async () => {
        checkinBtn.disabled = true;
        checkinBtn.textContent = 'Checking in...';
        try {
          const record = await window.API.checkIn();
          window.PeopleCore.showToast('✅ Checked in successfully!', 'success');
          AttendancePage.setCheckedInUI(record);
          await AttendancePage.fetchData();
        } catch (err) {
          window.PeopleCore.showToast(err.message || 'Check-in failed', 'error');
        } finally {
          checkinBtn.disabled = false;
          checkinBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Check In`;
        }
      });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async () => {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Checking out...';
        try {
          const record = await window.API.checkOut();
          window.PeopleCore.showToast('✅ Checked out successfully!', 'success');
          AttendancePage.setCheckedInUI(record);
          await AttendancePage.fetchData();
        } catch (err) {
          window.PeopleCore.showToast(err.message || 'Check-out failed', 'error');
        } finally {
          checkoutBtn.disabled = false;
        }
      });
    }

    document.getElementById('scan-qr-btn')?.addEventListener('click', AttendancePage.showScannerModal);

    const statusFilter = document.getElementById('att-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        const filtered = e.target.value
          ? AttendancePage.records.filter(r => r.status === e.target.value)
          : AttendancePage.records;
        AttendancePage.drawTable(filtered);
      });
    }

    const exportBtn = document.getElementById('export-att-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const rows = [['Date', 'Employee', 'Check In', 'Check Out', 'Status']];
        AttendancePage.records.forEach(r => {
          rows.push([
            new Date(r.date).toLocaleDateString(),
            r.employee?.name || 'Unknown',
            r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-',
            r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-',
            r.status
          ]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance.csv';
        a.click();
        window.PeopleCore.showToast('Attendance data exported!', 'success');
      });
    }
  }
};

window.AttendancePage = AttendancePage;
