import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const DashboardPage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Overview</h2>
          <p class="text-muted m-0 small">Real-time status of your enterprise assets & resources.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary border-light-subtle d-flex align-items-center gap-1.5 text-dark bg-white shadow-sm" id="btn-dashboard-period">
            <span class="material-symbols-outlined fs-5">calendar_today</span>
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Cards Row (Live SQLite Counts) -->
      <div class="row g-3 mb-4" id="kpi-cards-row">
        <!-- Loading State -->
        <div class="col-12 py-5 text-center text-muted">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 small">Loading live ERP dashboard metrics...</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: Recent Activities & Upcoming Returns -->
        <div class="col-xl-8">
          <div class="d-flex flex-column gap-4">
            
            <!-- Recent Activity stream -->
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <h4 class="h5 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                <span class="material-symbols-outlined text-primary">history</span>
                <span>Recent System Activities</span>
              </h4>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
                  <thead class="table-light">
                    <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity ID</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody id="recent-activities-body">
                    <tr><td colspan="4" class="text-center py-3 text-muted">Loading activities...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Upcoming Returns -->
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <h4 class="h5 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                <span class="material-symbols-outlined text-primary">assignment_return</span>
                <span>Upcoming Returns Schedule</span>
              </h4>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
                  <thead class="table-light">
                    <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                      <th>Asset</th>
                      <th>Employee</th>
                      <th>Expected Return</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="upcoming-returns-body">
                    <tr><td colspan="4" class="text-center py-3 text-muted">Loading returns...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Side: Quick Actions & Notifications Feed -->
        <div class="col-xl-4">
          <div class="d-flex flex-column gap-4">
            
            <!-- Quick Actions Panel -->
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <h4 class="h5 fw-bold mb-3 text-dark">Quick ERP Actions</h4>
              <div class="row g-2">
                <div class="col-6">
                  <a href="/assets" class="btn btn-outline-primary w-100 py-3 rounded d-flex flex-column align-items-center gap-2 text-decoration-none shadow-sm bg-white" data-link>
                    <span class="material-symbols-outlined fs-2">add_box</span>
                    <span class="small fw-semibold">Register Asset</span>
                  </a>
                </div>
                <div class="col-6">
                  <a href="/allocation" class="btn btn-outline-primary w-100 py-3 rounded d-flex flex-column align-items-center gap-2 text-decoration-none shadow-sm bg-white" data-link>
                    <span class="material-symbols-outlined fs-2">assignment_ind</span>
                    <span class="small fw-semibold">Allocate Asset</span>
                  </a>
                </div>
                <div class="col-6">
                  <a href="/booking" class="btn btn-outline-primary w-100 py-3 rounded d-flex flex-column align-items-center gap-2 text-decoration-none shadow-sm bg-white" data-link>
                    <span class="material-symbols-outlined fs-2">calendar_today</span>
                    <span class="small fw-semibold">Book Resource</span>
                  </a>
                </div>
                <div class="col-6">
                  <a href="/maintenance" class="btn btn-outline-primary w-100 py-3 rounded d-flex flex-column align-items-center gap-2 text-decoration-none shadow-sm bg-white" data-link>
                    <span class="material-symbols-outlined fs-2">build_circle</span>
                    <span class="small fw-semibold">Raise Repair</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Notifications Feed -->
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="h5 fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <span class="material-symbols-outlined text-primary">notifications</span>
                  <span>Alerts Feed</span>
                </h4>
                <button class="btn btn-xs btn-link text-decoration-none p-0 fw-semibold" id="btn-read-all-dashboard">Mark all read</button>
              </div>
              <div class="d-flex flex-column gap-2" style="max-height: 240px; overflow-y: auto;" id="dashboard-notifications-list">
                <div class="text-center py-4 text-muted small">Loading notifications...</div>
              </div>
              <div class="border-top pt-2 mt-2 text-center">
                <a href="/notifications" class="small text-primary text-decoration-none fw-semibold" data-link>View Full Alerts Center &rarr;</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/dashboard');
  },

  onMount(router) {
    bindLayoutEvents(router);

    // Period selection click stub
    const btnPeriod = document.getElementById('btn-dashboard-period');
    if (btnPeriod) {
      btnPeriod.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Dashboard analytics filtering is set to default (Last 30 Days).');
      });
    }

    async function loadDashboardData() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        const data = await res.json();

        renderKpiCards(data.stats);
        renderActivities(data.activities);
        renderUpcomingReturns(data.upcomingReturns);
        loadNotifications();
      } catch (err) {
        console.error(err);
      }
    }

    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          renderNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    function renderKpiCards(stats) {
      const row = document.getElementById('kpi-cards-row');
      if (!row) return;

      const cards = [
        { title: 'Assets Available', value: stats.available, icon: 'check_circle', color: 'text-success', bg: 'bg-success' },
        { title: 'Assets Allocated', value: stats.allocated, icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary' },
        { title: 'Under Maintenance', value: stats.maintenance, icon: 'build_circle', color: 'text-warning', bg: 'bg-warning' },
        { title: 'Lost Assets', value: stats.lost, icon: 'cancel', color: 'text-danger', bg: 'bg-danger' },
        { title: 'Active Bookings', value: stats.bookings, icon: 'event_available', color: 'text-success', bg: 'bg-success' },
        { title: 'Pending Transfers', value: stats.transfers, icon: 'swap_horiz', color: 'text-info', bg: 'bg-info' },
        { title: 'Upcoming Returns', value: stats.upcoming, icon: 'assignment_return', color: 'text-secondary', bg: 'bg-secondary' },
        { title: 'Overdue Returns', value: stats.overdue, icon: 'gpp_maybe', color: 'text-danger', bg: 'bg-danger' }
      ];

      row.innerHTML = cards.map(c => `
        <div class="col-6 col-md-3">
          <div class="card card-shadow border-light-subtle rounded-3 p-3 h-100 hover-card bg-white">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted fw-bold text-uppercase small" style="font-size: 10px; letter-spacing: 0.05em;">${c.title}</span>
              <span class="material-symbols-outlined ${c.color} fs-4">${c.icon}</span>
            </div>
            <h2 class="display-6 fw-bold m-0 ${c.color}">${c.value}</h2>
          </div>
        </div>
      `).join('');
    }

    function renderActivities(list) {
      const tbody = document.getElementById('recent-activities-body');
      if (!tbody) return;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted small">No audit actions logged in system activity trails.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(l => {
        const dateStr = l.created_at.replace('T', ' ').substring(0, 16);
        return `
          <tr>
            <td>
              <div class="d-flex align-items-center gap-2">
                <span class="material-symbols-outlined fs-6 text-muted">account_circle</span>
                <strong>${l.user_name || 'System'}</strong>
              </div>
            </td>
            <td><span class="badge border border-light-subtle text-dark bg-light px-2 py-1">${l.action}</span></td>
            <td><code class="text-secondary">${l.entity_type || 'N/A'} (ID:${l.entity_id || '-'})</code></td>
            <td class="text-muted small">${dateStr}</td>
          </tr>
        `;
      }).join('');
    }

    function renderUpcomingReturns(list) {
      const tbody = document.getElementById('upcoming-returns-body');
      if (!tbody) return;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted small">No assets return deadlines scheduled.</td></tr>`;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tbody.innerHTML = list.map(al => {
        let returnDateDisplay = al.expected_return_date;
        const expected = new Date(al.expected_return_date);
        
        let statusBadge = `<span class="badge bg-success-subtle text-success">Scheduled</span>`;

        if (expected < today) {
          statusBadge = `<span class="badge bg-danger rounded-pill px-2.5">OVERDUE</span>`;
          returnDateDisplay = `<span class="text-danger fw-bold">${al.expected_return_date}</span>`;
        }

        return `
          <tr>
            <td class="fw-semibold text-primary py-3">${al.asset_tag} - ${al.asset_name}</td>
            <td><strong>${al.user_name || 'Department Pool'}</strong></td>
            <td>${returnDateDisplay}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    function renderNotifications(list) {
      const container = document.getElementById('dashboard-notifications-list');
      if (!container) return;

      const unreads = list.filter(n => n.is_read === 0).slice(0, 5);

      if (unreads.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted small">Zero unread alerts in inbox.</div>`;
        return;
      }

      container.innerHTML = unreads.map(n => `
        <div class="border rounded p-2.5 d-flex align-items-start gap-2.5 bg-light bg-opacity-25 fade-in-el position-relative">
          <span class="material-symbols-outlined text-warning fs-5 mt-0.5">warning</span>
          <div class="flex-grow-1">
            <p class="mb-0 text-dark small" style="line-height: 1.3;">${n.message}</p>
            <span class="text-muted text-uppercase" style="font-size: 9px;">${n.type}</span>
          </div>
          <button class="btn btn-xs btn-outline-secondary border-0 p-0 text-primary fw-bold btn-read-alert-dash" data-id="${n.id}" title="Mark Read">✓</button>
        </div>
      `).join('');

      // Bind individual reads
      document.querySelectorAll('.btn-read-alert-dash').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            loadNotifications();
          } catch (e) {
            console.error(e);
          }
        });
      });
    }

    // Mark all read button
    const btnReadAll = document.getElementById('btn-read-all-dashboard');
    if (btnReadAll) {
      btnReadAll.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/notifications/read-all', { method: 'POST' });
          if (res.ok) {
            loadNotifications();
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    loadDashboardData();
  }
};
