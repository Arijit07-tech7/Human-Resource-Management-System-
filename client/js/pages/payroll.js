/**
 * PeopleCore HRMS — Payroll Page Module
 * Full payroll management with records, breakdown, processing, and export
 */

const PayrollPage = {
  records: [],
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),

  render: async (container) => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonthName = months[PayrollPage.currentMonth - 1];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Payroll</h1>
          <p>Manage salary records, process payments, and generate payslips.</p>
        </div>
        <div style="display:flex; gap: 10px;">
          <button class="btn btn-outline" id="export-payroll-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
          <button class="btn btn-primary" id="create-payroll-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Create Payroll</span>
          </button>
        </div>
      </div>

      <!-- Payroll Summary Cards -->
      <div class="payroll-summary-grid" id="payroll-summary-grid">
        <div class="payroll-summary-card accent">
          <div class="ps-label">Total Payroll (${currentMonthName})</div>
          <div class="ps-value" id="ps-total">—</div>
          <div class="ps-sub" id="ps-total-sub">Loading...</div>
        </div>
        <div class="payroll-summary-card green">
          <div class="ps-label">Total Paid</div>
          <div class="ps-value" id="ps-paid">—</div>
          <div class="ps-sub" id="ps-paid-count">— employees paid</div>
        </div>
        <div class="payroll-summary-card yellow">
          <div class="ps-label">Pending</div>
          <div class="ps-value" id="ps-pending">—</div>
          <div class="ps-sub" id="ps-pending-count">— awaiting payment</div>
        </div>
        <div class="payroll-summary-card blue">
          <div class="ps-label">Avg. Salary</div>
          <div class="ps-value" id="ps-avg">—</div>
          <div class="ps-sub">per employee</div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="section-header" style="margin-bottom: 16px; margin-top: 24px;">
        <h3 style="margin:0; font-size: 16px; font-weight: 600;">Payroll Records</h3>
        <div style="display:flex; gap: 10px; align-items: center;">
          <select class="filter-select" id="payroll-month-filter">
            ${months.map((m, i) => `<option value="${i + 1}" ${i + 1 === PayrollPage.currentMonth ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
          <select class="filter-select" id="payroll-year-filter">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select class="filter-select" id="payroll-status-filter">
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
          </select>
        </div>
      </div>

      <!-- Payroll Table -->
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="payroll-table-body">
            <tr><td colspan="8" style="text-align:center;padding:40px;">
              <div class="skeleton" style="height:40px;margin-bottom:8px;"></div>
              <div class="skeleton" style="height:40px;margin-bottom:8px;"></div>
              <div class="skeleton" style="height:40px;"></div>
            </td></tr>
          </tbody>
        </table>
      </div>

      <!-- Salary Breakdown Chart -->
      <div class="payroll-breakdown-grid" style="margin-top:24px;">
        <div class="card" style="padding:24px;">
          <h3 style="margin:0 0 20px;font-size:15px;font-weight:600;">Department Salary Distribution</h3>
          <div id="dept-chart" style="display:flex;flex-direction:column;gap:12px;"></div>
        </div>
        <div class="card" style="padding:24px;">
          <h3 style="margin:0 0 20px;font-size:15px;font-weight:600;">Payment Status Breakdown</h3>
          <div id="status-donut" style="display:flex;flex-direction:column;gap:16px;align-items:center;"></div>
        </div>
      </div>
    `;

    PayrollPage.setupEvents();
    await PayrollPage.fetchData();
  },

  fetchData: async () => {
    try {
      const data = await window.API.getPayroll(PayrollPage.currentMonth, PayrollPage.currentYear);
      PayrollPage.records = data.records || data;
      PayrollPage.drawTable(PayrollPage.records);
      PayrollPage.drawSummary(PayrollPage.records);
      PayrollPage.drawDeptChart(PayrollPage.records);
      PayrollPage.drawStatusDonut(PayrollPage.records);
    } catch (err) {
      console.error('Payroll fetch error:', err);
      const tbody = document.getElementById('payroll-table-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--color-text-secondary);">No payroll records found for this period.</td></tr>';
      }
    }
  },

  drawSummary: (records) => {
    const total = records.reduce((s, r) => s + (r.netSalary || r.net_salary || 0), 0);
    const paid = records.filter(r => r.status === 'paid');
    const pending = records.filter(r => r.status === 'pending');
    const avg = records.length > 0 ? total / records.length : 0;

    const fmt = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('ps-total', fmt(total));
    set('ps-total-sub', `${records.length} employees this month`);
    set('ps-paid', fmt(paid.reduce((s, r) => s + (r.netSalary || 0), 0)));
    set('ps-paid-count', `${paid.length} employees paid`);
    set('ps-pending', fmt(pending.reduce((s, r) => s + (r.netSalary || 0), 0)));
    set('ps-pending-count', `${pending.length} awaiting payment`);
    set('ps-avg', fmt(avg));
  },

  drawTable: (records) => {
    const tbody = document.getElementById('payroll-table-body');
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--color-text-secondary);">No payroll records found. Create payroll entries first.</td></tr>';
      return;
    }

    const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const statusMap = { paid: 'approved', pending: 'pending', processed: 'info' };

    tbody.innerHTML = records.map(r => {
      const emp = r.employee || {};
      const empName = emp.name || r.employeeName || 'Unknown';
      const dept = (emp.department || r.department || '—').toUpperCase();
      const badge = statusMap[r.status] || 'pending';

      return `
        <tr data-id="${r._id || r.id}">
          <td>
            <div style="font-weight:600;">${empName}</div>
            <div style="font-size:11px;color:var(--color-text-secondary);">${emp.employeeId || ''} • ${emp.position || ''}</div>
          </td>
          <td><span class="department-badge">${dept}</span></td>
          <td style="font-weight:500;">${fmt(r.basicSalary)}</td>
          <td style="color:var(--color-success);">+${fmt(r.totalAllowances)}</td>
          <td style="color:var(--color-danger);">-${fmt(r.totalDeductions)}</td>
          <td style="font-weight:700;color:var(--color-primary);font-size:15px;">${fmt(r.netSalary)}</td>
          <td><span class="status-badge ${badge}">${(r.status || 'pending').toUpperCase()}</span></td>
          <td>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${r.status === 'pending' ? `<button class="btn btn-outline" style="padding:4px 10px;font-size:11px;" onclick="PayrollPage.processPayroll('${r._id || r.id}')">Process</button>` : ''}
              ${r.status === 'processed' ? `<button class="btn btn-primary" style="padding:4px 10px;font-size:11px;" onclick="PayrollPage.markAsPaid('${r._id || r.id}')">Mark Paid</button>` : ''}
              <button class="btn btn-secondary" style="padding:4px 10px;font-size:11px;" onclick="PayrollPage.viewSlip('${r._id || r.id}')">Payslip</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  drawDeptChart: (records) => {
    const chart = document.getElementById('dept-chart');
    if (!chart) return;

    const deptTotals = {};
    records.forEach(r => {
      const dept = r.employee?.department || 'Other';
      deptTotals[dept] = (deptTotals[dept] || 0) + (r.netSalary || 0);
    });

    const sorted = Object.entries(deptTotals).sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] || 1;

    const colors = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-danger)'];

    chart.innerHTML = sorted.map(([dept, total], i) => `
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="min-width:80px;font-size:12px;font-weight:500;color:var(--color-text-secondary);text-transform:capitalize;">${dept}</div>
        <div style="flex:1;background:var(--color-background);border-radius:4px;height:8px;">
          <div style="width:${(total / max * 100).toFixed(1)}%;background:${colors[i % colors.length]};height:100%;border-radius:4px;transition:width 0.6s ease;"></div>
        </div>
        <div style="min-width:60px;font-size:12px;font-weight:700;text-align:right;">$${total.toLocaleString()}</div>
      </div>
    `).join('') || '<div style="color:var(--color-text-secondary);font-size:13px;">No data available</div>';
  },

  drawStatusDonut: (records) => {
    const donut = document.getElementById('status-donut');
    if (!donut) return;

    const paid = records.filter(r => r.status === 'paid').length;
    const pending = records.filter(r => r.status === 'pending').length;
    const processed = records.filter(r => r.status === 'processed').length;
    const total = records.length || 1;

    const items = [
      { label: 'Paid', count: paid, color: 'var(--color-success)' },
      { label: 'Pending', count: pending, color: 'var(--color-warning)' },
      { label: 'Processed', count: processed, color: 'var(--color-accent)' }
    ];

    donut.innerHTML = items.map(item => `
      <div style="width:100%;display:flex;align-items:center;gap:16px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${item.color};flex-shrink:0;"></div>
        <div style="flex:1;font-size:13px;color:var(--color-text-primary);">${item.label}</div>
        <div style="font-weight:700;font-size:14px;">${item.count}</div>
        <div style="font-size:12px;color:var(--color-text-secondary);min-width:36px;text-align:right;">${Math.round(item.count / total * 100)}%</div>
      </div>
    `).join('');
  },

  processPayroll: async (id) => {
    try {
      await window.API.updatePayrollStatus(id, 'processed');
      window.PeopleCore.showToast('Payroll marked as processed!', 'success');
      await PayrollPage.fetchData();
    } catch (err) {
      window.PeopleCore.showToast(err.message || 'Failed to process', 'error');
    }
  },

  markAsPaid: async (id) => {
    try {
      await window.API.updatePayrollStatus(id, 'paid');
      window.PeopleCore.showToast('Payment confirmed!', 'success');
      await PayrollPage.fetchData();
    } catch (err) {
      window.PeopleCore.showToast(err.message || 'Failed to mark as paid', 'error');
    }
  },

  viewSlip: (id) => {
    const record = PayrollPage.records.find(r => (r._id || r.id) === id);
    if (!record) return;

    const emp = record.employee || {};
    const fmt = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const bodyHtml = `
      <div style="font-family: 'Inter', sans-serif;">
        <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <div style="font-size:20px;font-weight:700;">PeopleCore HRMS</div>
          <div style="opacity:0.8;font-size:13px;">Pay Slip — ${months[(record.month || 1) - 1]} ${record.year || new Date().getFullYear()}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div><span style="font-size:11px;color:var(--color-text-secondary);">EMPLOYEE</span><div style="font-weight:600;margin-top:4px;">${emp.name || 'N/A'}</div></div>
          <div><span style="font-size:11px;color:var(--color-text-secondary);">EMPLOYEE ID</span><div style="font-weight:600;margin-top:4px;">${emp.employeeId || 'N/A'}</div></div>
          <div><span style="font-size:11px;color:var(--color-text-secondary);">DEPARTMENT</span><div style="font-weight:600;margin-top:4px;text-transform:capitalize;">${emp.department || 'N/A'}</div></div>
          <div><span style="font-size:11px;color:var(--color-text-secondary);">POSITION</span><div style="font-weight:600;margin-top:4px;">${emp.position || 'N/A'}</div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="background:var(--color-background);"><td style="padding:10px;font-weight:600;" colspan="2">EARNINGS</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;">Basic Salary</td><td style="padding:8px 10px;text-align:right;font-weight:500;">${fmt(record.basicSalary)}</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;">HRA</td><td style="padding:8px 10px;text-align:right;">${fmt(record.allowances?.hra)}</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;">Transport</td><td style="padding:8px 10px;text-align:right;">${fmt(record.allowances?.transport)}</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;color:var(--color-success);font-weight:600;">Total Earnings</td><td style="padding:8px 10px;text-align:right;color:var(--color-success);font-weight:600;">${fmt((record.basicSalary || 0) + (record.totalAllowances || 0))}</td></tr>
          <tr style="background:var(--color-background);"><td style="padding:10px;font-weight:600;" colspan="2">DEDUCTIONS</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;">Income Tax</td><td style="padding:8px 10px;text-align:right;">${fmt(record.deductions?.tax)}</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;">Insurance</td><td style="padding:8px 10px;text-align:right;">${fmt(record.deductions?.insurance)}</td></tr>
          <tr style="border-bottom:1px solid var(--color-background);"><td style="padding:8px 10px;color:var(--color-danger);font-weight:600;">Total Deductions</td><td style="padding:8px 10px;text-align:right;color:var(--color-danger);font-weight:600;">${fmt(record.totalDeductions)}</td></tr>
          <tr style="background:linear-gradient(135deg, var(--color-primary), var(--color-primary-light));color:white;">
            <td style="padding:14px 10px;font-size:16px;font-weight:700;">NET SALARY</td>
            <td style="padding:14px 10px;text-align:right;font-size:18px;font-weight:700;">${fmt(record.netSalary)}</td>
          </tr>
        </table>
        <div style="margin-top:16px;padding:12px;background:var(--color-background);border-radius:8px;font-size:12px;color:var(--color-text-secondary);text-align:center;">
          Payment Status: <strong style="color:${record.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)'};">${(record.status || '').toUpperCase()}</strong>
          ${record.paidDate ? ` • Paid on ${new Date(record.paidDate).toLocaleDateString()}` : ''}
        </div>
      </div>
    `;

    window.PeopleCore.showModal('Pay Slip', bodyHtml, `<button class="btn btn-primary" onclick="window.print()">Print</button><button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Close</button>`);
  },

  showCreateModal: () => {
    const bodyHtml = `
      <form id="create-payroll-form">
        <div class="form-group">
          <label class="form-label">Employee ID</label>
          <select class="form-input" id="pr-employee" required>
            <option value="">Select Employee</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Month</label>
            <select class="form-input" id="pr-month">
              ${['January','February','March','April','May','June','July','August','September','October','November','December']
                .map((m, i) => `<option value="${i+1}" ${i+1===PayrollPage.currentMonth?'selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Year</label>
            <input type="number" class="form-input" id="pr-year" value="${PayrollPage.currentYear}" min="2020" max="2030">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Basic Salary ($)</label>
          <input type="number" class="form-input" id="pr-salary" placeholder="e.g. 5000" min="0" step="0.01" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">HRA ($)</label>
            <input type="number" class="form-input" id="pr-hra" value="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Transport ($)</label>
            <input type="number" class="form-input" id="pr-transport" value="0" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tax ($)</label>
            <input type="number" class="form-input" id="pr-tax" value="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Insurance ($)</label>
            <input type="number" class="form-input" id="pr-insurance" value="0" min="0">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Cancel</button>
      <button class="btn btn-primary" id="submit-payroll-btn">Create Payroll</button>
    `;

    window.PeopleCore.showModal('Create Payroll Entry', bodyHtml, footerHtml);

    // Populate employees dropdown from mock data
    window.API.getEmployees({}).then(data => {
      const select = document.getElementById('pr-employee');
      if (select && data.employees) {
        data.employees.forEach(emp => {
          const opt = document.createElement('option');
          opt.value = emp.id || emp._id;
          opt.textContent = `${emp.name} (${emp.employeeId})`;
          select.appendChild(opt);
        });
      }
    });

    document.getElementById('submit-payroll-btn')?.addEventListener('click', async () => {
      const form = document.getElementById('create-payroll-form');
      if (!form.reportValidity()) return;

      const payrollData = {
        employee: document.getElementById('pr-employee').value,
        month: parseInt(document.getElementById('pr-month').value),
        year: parseInt(document.getElementById('pr-year').value),
        basicSalary: parseFloat(document.getElementById('pr-salary').value),
        allowances: {
          hra: parseFloat(document.getElementById('pr-hra').value) || 0,
          transport: parseFloat(document.getElementById('pr-transport').value) || 0
        },
        deductions: {
          tax: parseFloat(document.getElementById('pr-tax').value) || 0,
          insurance: parseFloat(document.getElementById('pr-insurance').value) || 0
        }
      };

      try {
        await window.API.createPayroll(payrollData);
        window.PeopleCore.hideModal();
        window.PeopleCore.showToast('Payroll created successfully!', 'success');
        await PayrollPage.fetchData();
      } catch (err) {
        window.PeopleCore.showToast(err.message || 'Failed to create payroll', 'error');
      }
    });
  },

  setupEvents: () => {
    document.getElementById('create-payroll-btn')?.addEventListener('click', PayrollPage.showCreateModal);

    document.getElementById('export-payroll-btn')?.addEventListener('click', () => {
      const rows = [['Employee', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status']];
      PayrollPage.records.forEach(r => {
        rows.push([
          r.employee?.name || 'Unknown',
          r.employee?.department || '',
          r.basicSalary || 0,
          r.totalAllowances || 0,
          r.totalDeductions || 0,
          r.netSalary || 0,
          r.status
        ]);
      });
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `payroll_${PayrollPage.currentYear}_${PayrollPage.currentMonth}.csv`;
      a.click();
      window.PeopleCore.showToast('Payroll report exported!', 'success');
    });

    document.getElementById('payroll-month-filter')?.addEventListener('change', (e) => {
      PayrollPage.currentMonth = parseInt(e.target.value);
      PayrollPage.fetchData();
    });

    document.getElementById('payroll-year-filter')?.addEventListener('change', (e) => {
      PayrollPage.currentYear = parseInt(e.target.value);
      PayrollPage.fetchData();
    });

    document.getElementById('payroll-status-filter')?.addEventListener('change', (e) => {
      const filtered = e.target.value
        ? PayrollPage.records.filter(r => r.status === e.target.value)
        : PayrollPage.records;
      PayrollPage.drawTable(filtered);
    });
  }
};

window.PayrollPage = PayrollPage;
