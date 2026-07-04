/**
 * PeopleCore HRMS — API Service & Mock Data Layer
 * Provides seamless integration with backend APIs while falling back to mock data
 * if the backend is not running or not fully configured.
 */

const API_BASE_URL = '/api/v1';

// Generate mock attendance records for the last 30 days
function _genAttendance() {
  const employees = [
    { id: 'emp-admin', name: 'Admin User', employeeId: 'EMP-0001', department: 'hr' },
    { id: '2', name: 'Alex Rivera', employeeId: 'EMP-0002', department: 'design' },
    { id: '3', name: 'Sarah Chen', employeeId: 'EMP-0003', department: 'design' },
    { id: '4', name: 'Marcus Thorne', employeeId: 'EMP-0004', department: 'engineering' },
    { id: '5', name: 'Elena Rostova', employeeId: 'EMP-0005', department: 'engineering' },
    { id: '6', name: 'David Kim', employeeId: 'EMP-0006', department: 'marketing' }
  ];
  const records = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    employees.forEach(emp => {
      const r = Math.random();
      let status = 'present';
      if (r < 0.05) status = 'absent';
      else if (r < 0.15) status = 'late';
      if (status === 'absent') {
        records.push({ id: `att-${d}-${emp.id}`, employee: emp, date: date.toISOString(), status, checkIn: null, checkOut: null });
      } else {
        const hour = status === 'late' ? 10 : 9;
        const checkIn = new Date(date); checkIn.setHours(hour, Math.floor(Math.random() * 30), 0);
        const checkOut = new Date(date); checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
        records.push({ id: `att-${d}-${emp.id}`, employee: emp, date: date.toISOString(), status, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() });
      }
    });
  }
  return records;
}

// Generate mock payroll records
function _genPayroll() {
  const employees = [
    { id: '1', name: 'Admin User', employeeId: 'EMP-0001', department: 'hr', position: 'HR Director' },
    { id: '2', name: 'Alex Rivera', employeeId: 'EMP-0002', department: 'design', position: 'Senior Product Designer' },
    { id: '3', name: 'Sarah Chen', employeeId: 'EMP-0003', department: 'design', position: 'UX Researcher' },
    { id: '4', name: 'Marcus Thorne', employeeId: 'EMP-0004', department: 'engineering', position: 'Frontend Lead' },
    { id: '5', name: 'Elena Rostova', employeeId: 'EMP-0005', department: 'engineering', position: 'Staff Engineer' },
    { id: '6', name: 'David Kim', employeeId: 'EMP-0006', department: 'marketing', position: 'Marketing Manager' },
    { id: '7', name: 'Sophia Martinez', employeeId: 'EMP-0007', department: 'operations', position: 'Operations Lead' },
    { id: '8', name: 'James Wilson', employeeId: 'EMP-0008', department: 'support', position: 'Customer Success' }
  ];
  const salaries = [8500, 7200, 5800, 9500, 10200, 7800, 6900, 5500];
  const statuses = ['paid', 'paid', 'processed', 'paid', 'paid', 'pending', 'processed', 'pending'];
  const now = new Date();
  return employees.map((emp, i) => {
    const basic = salaries[i];
    const hra = Math.round(basic * 0.2);
    const transport = 300;
    const medical = 200;
    const tax = Math.round(basic * 0.1);
    const insurance = 150;
    const pf = Math.round(basic * 0.05);
    const totalAllow = hra + transport + medical;
    const totalDeduct = tax + insurance + pf;
    const net = basic + totalAllow - totalDeduct;
    return {
      id: `pay-${i+1}`, _id: `pay-${i+1}`,
      employee: emp,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      basicSalary: basic,
      allowances: { hra, transport, medical, other: 0 },
      deductions: { tax, insurance, providentFund: pf, other: 0 },
      totalAllowances: totalAllow,
      totalDeductions: totalDeduct,
      netSalary: net,
      status: statuses[i],
      paidDate: statuses[i] === 'paid' ? new Date(now.getFullYear(), now.getMonth(), 25).toISOString() : null
    };
  });
}

// In-memory mock data storage
const MOCK_DATA = {
  user: {
    id: 'emp-admin',
    employeeId: 'EMP-0001',
    name: 'Admin User',
    email: 'admin@peoplecore.com',
    role: 'admin',
    department: 'hr',
    position: 'HR Director',
    avatar: ''
  },
  stats: {
    totalEmployees: 24,
    totalDepartments: 6,
    pendingLeaves: 3,
    activeJobs: 5,
    presentToday: 22,
    attendanceRate: 92,
    monthlyPayroll: 142000
  },
  employees: [
    { id: '1', employeeId: 'EMP-0001', name: 'Admin User', email: 'admin@peoplecore.com', role: 'admin', department: 'hr', position: 'HR Director', phone: '+1 (555) 019-2834', status: 'active', joinDate: '2024-01-15', salary: 8500 },
    { id: '2', employeeId: 'EMP-0002', name: 'Alex Rivera', email: 'alex.rivera@peoplecore.com', role: 'employee', department: 'design', position: 'Senior Product Designer', phone: '+1 (555) 019-2835', status: 'active', joinDate: '2024-03-10', salary: 7200 },
    { id: '3', employeeId: 'EMP-0003', name: 'Sarah Chen', email: 'sarah.chen@peoplecore.com', role: 'employee', department: 'design', position: 'UX Researcher', phone: '+1 (555) 019-2836', status: 'active', joinDate: '2024-05-12', salary: 5800 },
    { id: '4', employeeId: 'EMP-0004', name: 'Marcus Thorne', email: 'marcus.thorne@peoplecore.com', role: 'employee', department: 'engineering', position: 'Frontend Lead', phone: '+1 (555) 019-2837', status: 'active', joinDate: '2023-11-01', salary: 9500 },
    { id: '5', employeeId: 'EMP-0005', name: 'Elena Rostova', email: 'elena.rostova@peoplecore.com', role: 'employee', department: 'engineering', position: 'Staff Engineer', phone: '+1 (555) 019-2838', status: 'active', joinDate: '2023-08-20', salary: 10200 },
    { id: '6', employeeId: 'EMP-0006', name: 'David Kim', email: 'david.kim@peoplecore.com', role: 'employee', department: 'marketing', position: 'Marketing Manager', phone: '+1 (555) 019-2839', status: 'active', joinDate: '2025-02-15', salary: 7800 },
    { id: '7', employeeId: 'EMP-0007', name: 'Sophia Martinez', email: 'sophia.martinez@peoplecore.com', role: 'employee', department: 'operations', position: 'Operations Lead', phone: '+1 (555) 019-2840', status: 'on-leave', joinDate: '2024-07-19', salary: 6900 },
    { id: '8', employeeId: 'EMP-0008', name: 'James Wilson', email: 'james.wilson@peoplecore.com', role: 'employee', department: 'support', position: 'Customer Success', phone: '+1 (555) 019-2841', status: 'active', joinDate: '2024-10-05', salary: 5500 }
  ],
  leaves: [
    { id: 'l1', employee: { name: 'Sophia Martinez', employeeId: 'EMP-0007', department: 'operations', position: 'Operations Lead' }, leaveType: 'annual', startDate: '2026-07-06', endDate: '2026-07-10', totalDays: 5, reason: 'Family vacation', status: 'pending', appliedDate: '2026-07-01' },
    { id: 'l2', employee: { name: 'Alex Rivera', employeeId: 'EMP-0002', department: 'design', position: 'Senior Product Designer' }, leaveType: 'sick', startDate: '2026-07-03', endDate: '2026-07-04', totalDays: 2, reason: 'Fever and flu', status: 'approved', appliedDate: '2026-07-02' },
    { id: 'l3', employee: { name: 'David Kim', employeeId: 'EMP-0006', department: 'marketing', position: 'Marketing Manager' }, leaveType: 'casual', startDate: '2026-07-15', endDate: '2026-07-16', totalDays: 2, reason: 'Personal work', status: 'pending', appliedDate: '2026-07-03' },
    { id: 'l4', employee: { name: 'Sarah Chen', employeeId: 'EMP-0003', department: 'design', position: 'UX Researcher' }, leaveType: 'sick', startDate: '2026-06-20', endDate: '2026-06-21', totalDays: 2, reason: 'Medical appointment', status: 'approved', appliedDate: '2026-06-19' },
    { id: 'l5', employee: { name: 'James Wilson', employeeId: 'EMP-0008', department: 'support', position: 'Customer Success' }, leaveType: 'annual', startDate: '2026-07-20', endDate: '2026-07-25', totalDays: 6, reason: 'Summer vacation', status: 'pending', appliedDate: '2026-07-04' }
  ],
  attendance: _genAttendance(),
  todayRecord: null, // tracks today's check-in/out
  payroll: _genPayroll(),
  recruitment: {
    stats: { totalPipelines: 24, totalCandidates: 18, newApplicants: 142 },
    jobs: [
      { id: 'j1', title: 'Senior Product Designer', department: 'design', applicantsCount: 42, daysLeft: 5, status: 'active' },
      { id: 'j2', title: 'Frontend Developer', department: 'engineering', applicantsCount: 18, daysLeft: 12, status: 'active' },
      { id: 'j3', title: 'Marketing Manager', department: 'marketing', applicantsCount: 56, daysLeft: 2, status: 'active' },
      { id: 'j4', title: 'Staff Data Scientist', department: 'engineering', applicantsCount: 2, daysLeft: 28, status: 'active' },
      { id: 'j5', title: 'Customer Success', department: 'support', applicantsCount: 112, daysLeft: 1, status: 'active' }
    ],
    candidates: [
      { id: 'c1', name: 'Alex Rivera', position: 'Senior Product Designer', rating: 4.8, source: 'LinkedIn', stage: 'applied', timeAgo: '2d ago', appliedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: 'c2', name: 'Sarah Chen', position: 'UX Researcher', rating: 4.2, source: 'Referral', stage: 'applied', timeAgo: '5h ago', appliedDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString() },
      { id: 'c3', name: 'Marcus Thorne', position: 'Frontend Lead', rating: 4.5, source: 'Hired.com', stage: 'phone-screen', timeAgo: '1d ago', appliedDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { id: 'c4', name: 'Elena Rostova', position: 'Staff Engineer', rating: 4.9, source: 'LinkedIn', stage: 'interview', timeAgo: '3d ago', appliedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
      { id: 'c5', name: 'David Kim', position: 'Marketing Lead', rating: 4.0, source: 'Indeed', stage: 'interview', timeAgo: '4d ago', appliedDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
      { id: 'c6', name: 'Sophia Martinez', position: 'Operations Lead', rating: 4.7, source: 'Referral', stage: 'offer', timeAgo: '6d ago', appliedDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() }
    ]
  },
  notifications: [
    { id: 'n1', title: 'New Application', message: 'Sarah Chen applied for UX Researcher position', type: 'recruitment', isRead: false, timeAgo: '5h ago' },
    { id: 'n2', title: 'Leave Request', message: 'Sophia Martinez requested Annual Leave for 5 days', type: 'leave', isRead: false, timeAgo: '1d ago' },
    { id: 'n3', title: 'Check-in Warning', message: 'David Kim checked in late today', type: 'attendance', isRead: true, timeAgo: '2d ago' },
    { id: 'n4', title: 'Payroll Processed', message: 'July payroll processing complete for 6 employees', type: 'payroll', isRead: false, timeAgo: '3h ago' }
  ]
};

let useMock = true;

async function checkServerConnection() {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      useMock = false;
      console.log('✅ Connected to backend API');
    } else {
      useMock = true;
      console.warn('⚠️ Backend API returned error. Running in Mock Data mode.');
    }
  } catch (err) {
    useMock = true;
    console.warn('⚠️ Backend API unreachable. Running in Mock Data mode.');
  }
}

checkServerConnection();

async function apiCall(endpoint, options = {}, mockHandler) {
  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try { resolve(mockHandler()); }
        catch (e) { reject(e); }
      }, 200);
    });
  }

  const token = localStorage.getItem('token');
  // If token is a mock token, use mock handler even when useMock=false
  if (token && token.startsWith('mock-jwt-token')) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try { resolve(mockHandler()); }
        catch (e) { reject(e); }
      }, 200);
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      // If unauthorized (401), switch to mock mode
      if (res.status === 401) {
        console.warn(`401 on ${endpoint}, switching to mock mode`);
        useMock = true;
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try { resolve(mockHandler()); }
            catch (e) { reject(e); }
          }, 200);
        });
      }
      throw new Error(data.message || 'Something went wrong');
    }
    return data.data;
  } catch (err) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      useMock = true;
      console.warn('Network error, switching to mock mode');
    }
    console.error(`API Error on ${endpoint}:`, err.message);
    try {
      return mockHandler();
    } catch (mockErr) {
      throw err;
    }
  }
}

const API = {
  // Authentication
  login: async (email, password) => {
    // Re-check server connection before attempting real login
    await checkServerConnection();
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, () => {
      if (email === 'admin@peoplecore.com' && password === 'admin123') {
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('mockUser', JSON.stringify(MOCK_DATA.user));
        return { employee: MOCK_DATA.user, token: 'mock-jwt-token' };
      }
      throw new Error('Invalid email or password.');
    });
  },

  register: async (userData) => {
    await checkServerConnection();
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, () => {
      const newEmp = {
        id: String(MOCK_DATA.employees.length + 1),
        employeeId: `EMP-${String(MOCK_DATA.employees.length + 1).padStart(4, '0')}`,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        ...userData
      };
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('mockUser', JSON.stringify(newEmp));
      MOCK_DATA.employees.unshift(newEmp);
      MOCK_DATA.user = newEmp;
      MOCK_DATA.stats.totalEmployees++;
      return { employee: newEmp, token };
    });
  },

  getProfile: async () => {
    return apiCall('/auth/me', {}, () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authorized');
      // In mock mode, return stored user data (set during login)
      const stored = localStorage.getItem('mockUser');
      if (stored) return JSON.parse(stored);
      return MOCK_DATA.user;
    });
  },

  // Dashboard stats
  getDashboardStats: async () => {
    return apiCall('/dashboard/stats', {}, () => {
      const presentToday = MOCK_DATA.attendance.filter(r => {
        const d = new Date(r.date);
        return d.toDateString() === new Date().toDateString() && r.status !== 'absent';
      }).length;
      return {
        ...MOCK_DATA.stats,
        presentToday,
        pendingLeaves: MOCK_DATA.leaves.filter(l => l.status === 'pending').length,
        monthlyPayroll: MOCK_DATA.payroll.reduce((s, r) => s + r.netSalary, 0)
      };
    });
  },

  // Employees Directory
  getEmployees: async (filters = {}) => {
    return apiCall(`/employees?search=${filters.search || ''}&department=${filters.department || ''}&status=${filters.status || ''}`, {}, () => {
      let filtered = [...MOCK_DATA.employees];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q) || e.position.toLowerCase().includes(q));
      }
      if (filters.department) filtered = filtered.filter(e => e.department === filters.department);
      if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
      return { employees: filtered, total: filtered.length };
    });
  },

  addEmployee: async (employeeData) => {
    return apiCall('/auth/register', { method: 'POST', body: JSON.stringify(employeeData) }, () => {
      const newEmp = {
        id: String(MOCK_DATA.employees.length + 1),
        employeeId: `EMP-00${String(MOCK_DATA.employees.length + 1).padStart(2,'0')}`,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        ...employeeData
      };
      MOCK_DATA.employees.unshift(newEmp);
      MOCK_DATA.stats.totalEmployees++;
      return newEmp;
    });
  },

  updateEmployee: async (id, data) => {
    return apiCall(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => {
      const idx = MOCK_DATA.employees.findIndex(e => e.id === id);
      if (idx !== -1) Object.assign(MOCK_DATA.employees[idx], data);
      return MOCK_DATA.employees[idx];
    });
  },

  deleteEmployee: async (id) => {
    return apiCall(`/employees/${id}`, { method: 'DELETE' }, () => {
      const idx = MOCK_DATA.employees.findIndex(e => e.id === id);
      if (idx !== -1) MOCK_DATA.employees.splice(idx, 1);
      MOCK_DATA.stats.totalEmployees = Math.max(0, MOCK_DATA.stats.totalEmployees - 1);
      return null;
    });
  },

  // Leaves
  getLeaves: async (filters = {}) => {
    return apiCall('/leaves', {}, () => {
      let leaves = [...MOCK_DATA.leaves];
      if (filters.status) leaves = leaves.filter(l => l.status === filters.status);
      return { leaves, total: leaves.length };
    });
  },

  applyLeave: async (leaveData) => {
    return apiCall('/leaves', { method: 'POST', body: JSON.stringify(leaveData) }, () => {
      const newLeave = {
        id: `leave-${Date.now()}`,
        employee: { name: MOCK_DATA.user.name, employeeId: MOCK_DATA.user.employeeId, department: MOCK_DATA.user.department, position: MOCK_DATA.user.position },
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason,
        totalDays: Math.ceil((new Date(leaveData.endDate) - new Date(leaveData.startDate)) / (1000 * 60 * 60 * 24)) + 1,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0]
      };
      MOCK_DATA.leaves.unshift(newLeave);
      MOCK_DATA.stats.pendingLeaves++;
      return newLeave;
    });
  },

  updateLeaveStatus: async (leaveId, status) => {
    return apiCall(`/leaves/${leaveId}`, { method: 'PUT', body: JSON.stringify({ status }) }, () => {
      const leave = MOCK_DATA.leaves.find(l => l.id === leaveId);
      if (leave) {
        const wasPending = leave.status === 'pending';
        leave.status = status;
        if (wasPending && status !== 'pending') MOCK_DATA.stats.pendingLeaves = Math.max(0, MOCK_DATA.stats.pendingLeaves - 1);
      }
      return leave;
    });
  },

  deleteLeave: async (leaveId) => {
    return apiCall(`/leaves/${leaveId}`, { method: 'DELETE' }, () => {
      const idx = MOCK_DATA.leaves.findIndex(l => l.id === leaveId);
      if (idx !== -1) MOCK_DATA.leaves.splice(idx, 1);
      return null;
    });
  },

  // Attendance
  getAttendance: async (filters = {}) => {
    return apiCall('/attendance', {}, () => {
      let records = [...MOCK_DATA.attendance];
      if (filters.status) records = records.filter(r => r.status === filters.status);
      records.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { records, total: records.length };
    });
  },

  checkIn: async () => {
    return apiCall('/attendance/check-in', { method: 'POST' }, () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = MOCK_DATA.attendance.find(r => {
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && r.employee?.id === 'emp-admin';
      });
      if (existing && existing.checkIn) throw new Error('Already checked in today');
      const now = new Date();
      const record = {
        id: `att-today-admin`,
        employee: { id: 'emp-admin', name: 'Admin User', employeeId: 'EMP-0001' },
        date: today.toISOString(),
        checkIn: now.toISOString(),
        checkOut: null,
        status: now.getHours() >= 10 ? 'late' : 'present'
      };
      MOCK_DATA.attendance.unshift(record);
      MOCK_DATA.todayRecord = record;
      MOCK_DATA.stats.presentToday++;
      return record;
    });
  },

  checkOut: async () => {
    return apiCall('/attendance/check-out', { method: 'PUT' }, () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = MOCK_DATA.attendance.find(r => {
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && r.employee?.id === 'emp-admin';
      });
      if (!record) throw new Error('Not checked in today');
      if (record.checkOut) throw new Error('Already checked out today');
      record.checkOut = new Date().toISOString();
      MOCK_DATA.todayRecord = record;
      return record;
    });
  },

  // Payroll
  getPayroll: async (month, year, filters = {}) => {
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    return apiCall(`/payroll?month=${m}&year=${y}`, {}, () => {
      let records = MOCK_DATA.payroll.filter(r => r.month === m && r.year === y);
      if (filters.status) records = records.filter(r => r.status === filters.status);
      return { records, total: records.length };
    });
  },

  createPayroll: async (payrollData) => {
    return apiCall('/payroll', { method: 'POST', body: JSON.stringify(payrollData) }, () => {
      const allowances = payrollData.allowances || {};
      const deductions = payrollData.deductions || {};
      const totalAllow = (allowances.hra || 0) + (allowances.transport || 0) + (allowances.medical || 0) + (allowances.other || 0);
      const totalDeduct = (deductions.tax || 0) + (deductions.insurance || 0) + (deductions.providentFund || 0) + (deductions.other || 0);
      const emp = MOCK_DATA.employees.find(e => e.id === payrollData.employee) || {};
      const newRecord = {
        id: `pay-${Date.now()}`,
        _id: `pay-${Date.now()}`,
        employee: emp,
        month: payrollData.month,
        year: payrollData.year,
        basicSalary: payrollData.basicSalary,
        allowances: payrollData.allowances || {},
        deductions: payrollData.deductions || {},
        totalAllowances: totalAllow,
        totalDeductions: totalDeduct,
        netSalary: payrollData.basicSalary + totalAllow - totalDeduct,
        status: 'pending',
        paidDate: null
      };
      MOCK_DATA.payroll.unshift(newRecord);
      return newRecord;
    });
  },

  updatePayrollStatus: async (id, status) => {
    return apiCall(`/payroll/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }, () => {
      const record = MOCK_DATA.payroll.find(r => (r.id || r._id) === id);
      if (record) {
        record.status = status;
        if (status === 'paid') record.paidDate = new Date().toISOString();
      }
      return record;
    });
  },

  // Recruitment Pipeline
  getRecruitmentPipeline: async () => {
    return apiCall('/recruitment/pipeline', {}, () => {
      const pipeline = { applied: [], 'phone-screen': [], interview: [], offer: [], hired: [] };
      MOCK_DATA.recruitment.candidates.forEach(c => {
        if (pipeline[c.stage]) pipeline[c.stage].push(c);
      });
      return { pipeline, stats: MOCK_DATA.recruitment.stats };
    });
  },

  getActiveJobs: async () => {
    return apiCall('/recruitment/jobs?status=active', {}, () => MOCK_DATA.recruitment.jobs);
  },

  postJob: async (jobData) => {
    return apiCall('/recruitment/jobs', { method: 'POST', body: JSON.stringify(jobData) }, () => {
      const newJob = { id: `job-${Date.now()}`, applicantsCount: 0, daysLeft: 30, status: 'active', ...jobData };
      MOCK_DATA.recruitment.jobs.unshift(newJob);
      MOCK_DATA.stats.activeJobs++;
      MOCK_DATA.recruitment.stats.totalPipelines++;
      return newJob;
    });
  },

  addCandidate: async (jobId, candidateData) => {
    return apiCall(`/recruitment/jobs/${jobId}/candidates`, { method: 'POST', body: JSON.stringify(candidateData) }, () => {
      const newCand = { id: `cand-${Date.now()}`, rating: 4.0, timeAgo: 'Just now', appliedDate: new Date().toISOString(), stage: 'applied', ...candidateData };
      MOCK_DATA.recruitment.candidates.unshift(newCand);
      const job = MOCK_DATA.recruitment.jobs.find(j => j.id === jobId);
      if (job) job.applicantsCount++;
      MOCK_DATA.recruitment.stats.totalCandidates++;
      MOCK_DATA.recruitment.stats.newApplicants++;
      return newCand;
    });
  },

  updateCandidateStage: async (jobId, candidateId, stage) => {
    return apiCall(`/recruitment/jobs/${jobId}/candidates/${candidateId}`, { method: 'PUT', body: JSON.stringify({ stage }) }, () => {
      const cand = MOCK_DATA.recruitment.candidates.find(c => c.id === candidateId);
      if (cand) {
        const oldStage = cand.stage;
        cand.stage = stage;
        if (stage === 'hired' && oldStage !== 'hired') {
          API.addEmployee({ name: cand.name, email: `${cand.name.toLowerCase().replace(' ', '.')}@peoplecore.com`, role: 'employee', department: 'engineering', position: cand.position, phone: '+1 (555) 000-0000', password: 'Password123' });
        }
      }
      return cand;
    });
  },

  // Notifications
  getNotifications: async () => {
    return apiCall('/notifications', {}, () => {
      const unreadCount = MOCK_DATA.notifications.filter(n => !n.isRead).length;
      return { notifications: MOCK_DATA.notifications, unreadCount };
    });
  },

  markNotificationsAsRead: async () => {
    return apiCall('/notifications/read-all', { method: 'PUT' }, () => {
      MOCK_DATA.notifications.forEach(n => n.isRead = true);
      return null;
    });
  },

  getLeaderboard: async () => {
    return apiCall('/employees/leaderboard', {}, () => {
      return MOCK_DATA.employees
        .filter(e => e.status === 'active')
        .map((e, i) => ({ ...e, performanceScore: Math.max(50, 98 - i * 7) }))
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 10);
    });
  }
};

window.API = API;
window.checkServerConnection = checkServerConnection;
