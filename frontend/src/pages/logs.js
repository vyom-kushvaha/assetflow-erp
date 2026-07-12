import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const LogsPage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">System Activity Logs</h2>
          <p class="text-muted m-0 small">Audit trail of configuration updates and user operational actions.</p>
        </div>
      </div>

      <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white mb-4">
        <!-- Filters Row -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label fw-semibold small text-muted">Filter by User</label>
            <input type="text" class="form-control" id="log-filter-user" placeholder="Search user name or email..." />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold small text-muted">Entity Type</label>
            <select class="form-select" id="log-filter-entity">
              <option value="">All Entities</option>
              <option value="assets">Assets</option>
              <option value="allocations">Allocations</option>
              <option value="bookings">Bookings</option>
              <option value="maintenance_requests">Maintenance</option>
              <option value="transfer_requests">Transfers</option>
              <option value="departments">Departments</option>
              <option value="users">Users</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold small text-muted">Created Since</label>
            <input type="date" class="form-control" id="log-filter-date" />
          </div>
          <div class="col-md-2 d-grid align-items-end">
            <button class="btn btn-outline-secondary border-light-subtle" id="btn-reset-log-filters">Reset Filters</button>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 13.5px;">
            <thead class="table-light">
              <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                <th>Log ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Metadata / Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody id="logs-table-body">
              <tr>
                <td colspan="6" class="text-center py-4 text-muted">Loading activity trail...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/logs');
  },

  onMount(router) {
    bindLayoutEvents(router);

    let logs = [];

    async function loadLogs() {
      try {
        const userFilter = document.getElementById('log-filter-user').value.trim();
        const entityFilter = document.getElementById('log-filter-entity').value;
        const startDate = document.getElementById('log-filter-date').value;

        // Build query string
        const queryParams = new URLSearchParams();
        if (userFilter) queryParams.append('userFilter', userFilter);
        if (entityFilter) queryParams.append('entityFilter', entityFilter);
        if (startDate) queryParams.append('startDate', startDate);

        const res = await fetch(`/api/logs?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          logs = data.logs || [];
          renderLogsTable();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function renderLogsTable() {
      const tbody = document.getElementById('logs-table-body');
      if (!tbody) return;

      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No activity logs match the selected filter query parameters.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map(l => {
        const dateStr = l.created_at.replace('T', ' ').substring(0, 16);
        let detailText = l.details ? l.details : '-';
        if (l.details && l.details.startsWith('{')) {
          try {
            const parsed = JSON.parse(l.details);
            detailText = Object.entries(parsed).map(([key, val]) => `<code style="font-size: 11px;" class="text-secondary">${key}: ${val}</code>`).join(', ');
          } catch (e) {}
        }

        return `
          <tr class="fade-in-el">
            <td class="text-muted">#LOG-${l.id}</td>
            <td>
              <div>
                <strong>${l.user_name || 'System / Guest'}</strong>
                <span class="text-muted small d-block" style="font-size: 11px;">${l.user_email || ''}</span>
              </div>
            </td>
            <td><span class="badge border border-light-subtle text-dark bg-light px-2 py-1">${l.action}</span></td>
            <td><code class="text-primary">${l.entity_type || 'N/A'} (ID:${l.entity_id || '-'})</code></td>
            <td style="max-width: 260px;" class="text-truncate">${detailText}</td>
            <td class="text-muted">${dateStr}</td>
          </tr>
        `;
      }).join('');
    }

    // Bind filters
    const filterUser = document.getElementById('log-filter-user');
    const filterEntity = document.getElementById('log-filter-entity');
    const filterDate = document.getElementById('log-filter-date');
    const btnReset = document.getElementById('btn-reset-log-filters');

    if (filterUser) filterUser.addEventListener('input', loadLogs);
    if (filterEntity) filterEntity.addEventListener('change', loadLogs);
    if (filterDate) filterDate.addEventListener('change', loadLogs);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        filterUser.value = '';
        filterEntity.value = '';
        filterDate.value = '';
        loadLogs();
      });
    }

    loadLogs();
  }
};
