import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState } from '../utils/state.js';

export const DashboardPage = {
  render() {
    const state = getState();

    // Compute basic statistics
    const totalAssets = state.assets.length;
    const activeBookings = state.bookings.filter(b => b.status === 'UPCOMING').length;
    const pendingMaintenance = state.maintenance.filter(m => m.status === 'PENDING').length;
    const activeAudits = state.audits.filter(a => a.status === 'IN_PROGRESS').length;

    // Load recent assets (last 5)
    const recentAssets = state.assets.slice(-5).reverse();

    // Load pending maintenance tickets
    const pendingTickets = state.maintenance.filter(m => m.status === 'PENDING').slice(0, 3);

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
          <a href="/assets" class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-link>
            <span class="material-symbols-outlined fs-5">add</span>
            <span>Register Asset</span>
          </a>
        </div>
      </div>

      <!-- KPI Metrics Row -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card card-shadow border-light-subtle rounded-3 p-3 h-100 hover-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted fw-bold text-uppercase small" style="font-size: 11px;">Total Assets</span>
              <span class="material-symbols-outlined text-primary fs-3">inventory_2</span>
            </div>
            <h2 class="display-6 fw-bold m-0 text-primary">${totalAssets}</h2>
            <small class="text-success fw-semibold mt-2 d-inline-block">System fully configured</small>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card card-shadow border-light-subtle rounded-3 p-3 h-100 hover-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted fw-bold text-uppercase small" style="font-size: 11px;">Active Bookings</span>
              <span class="material-symbols-outlined text-success fs-3">event_available</span>
            </div>
            <h2 class="display-6 fw-bold m-0 text-success">${activeBookings}</h2>
            <small class="text-muted mt-2 d-inline-block">Scheduled operational slots</small>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card card-shadow border-light-subtle rounded-3 p-3 h-100 hover-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted fw-bold text-uppercase small" style="font-size: 11px;">Pending Maintenance</span>
              <span class="material-symbols-outlined text-warning fs-3">build</span>
            </div>
            <h2 class="display-6 fw-bold m-0 text-warning">${pendingMaintenance}</h2>
            <small class="text-muted mt-2 d-inline-block">Awaiting validation checks</small>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card card-shadow border-light-subtle rounded-3 p-3 h-100 hover-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted fw-bold text-uppercase small" style="font-size: 11px;">Active Audits</span>
              <span class="material-symbols-outlined text-info fs-3">fact_check</span>
            </div>
            <h2 class="display-6 fw-bold m-0 text-info">${activeAudits}</h2>
            <small class="text-muted mt-2 d-inline-block">Current active cycles</small>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Recent Assets Directory Table -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 h-100 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Recently Registered Assets</h4>
              <a href="/assets" class="text-primary text-decoration-none fw-semibold small" data-link>View All Directory &rarr;</a>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th scope="col" class="py-2.5">Asset Tag</th>
                    <th scope="col" class="py-2.5">Asset Name</th>
                    <th scope="col" class="py-2.5">Location</th>
                    <th scope="col" class="py-2.5">Condition</th>
                    <th scope="col" class="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">
                  ${recentAssets.map(asset => {
                    let statusBadge = 'bg-secondary';
                    if (asset.status === 'AVAILABLE') statusBadge = 'bg-success';
                    else if (asset.status === 'ALLOCATED') statusBadge = 'bg-primary';
                    else if (asset.status === 'UNDER_MAINTENANCE') statusBadge = 'bg-warning text-dark';
                    else if (asset.status === 'LOST') statusBadge = 'bg-danger';

                    return `
                      <tr>
                        <td class="fw-semibold text-primary py-3">${asset.tag}</td>
                        <td>${asset.name}</td>
                        <td>
                          <div class="d-flex align-items-center gap-1.5">
                            <span class="material-symbols-outlined fs-6 text-muted">location_on</span>
                            <span>${asset.location || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span class="badge border border-light-subtle text-dark bg-light rounded-pill px-2.5">${asset.condition}</span>
                        </td>
                        <td>
                          <span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${asset.status}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Side: Action Items Panel -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 h-100 bg-white">
            <h4 class="h5 fw-bold mb-3 text-dark">Action Required</h4>
            
            <div class="d-flex flex-column gap-3">
              <!-- Audits quick status -->
              <div class="border rounded p-3 bg-light bg-opacity-50">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge text-bg-info rounded">Audit Alert</span>
                  <small class="text-muted">Ongoing</small>
                </div>
                <h6 class="fw-bold mb-1 text-dark">IT Assets Audit Q3 2026</h6>
                <p class="text-muted small mb-2">Verify allocated hardware models before the compliance cycle closes.</p>
                <a href="/audit" class="btn btn-sm btn-outline-primary w-100 rounded-pill" data-link>Open Audit Checklists</a>
              </div>

              <!-- Pending Maintenance alerts -->
              <div class="border rounded p-3">
                <h6 class="fw-bold mb-2 text-dark">Pending Repairs (${pendingTickets.length})</h6>
                ${pendingTickets.length === 0 ? `
                  <p class="text-muted small mb-0">No active maintenance tickets pending validation.</p>
                ` : `
                  <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                    ${pendingTickets.map(t => `
                      <li class="small d-flex justify-content-between align-items-start border-bottom pb-2 last-border-none">
                        <div>
                          <strong class="text-dark d-block">Asset ID: ${t.assetId}</strong>
                          <span class="text-muted">${t.issue}</span>
                        </div>
                        <span class="badge text-bg-warning text-dark">${t.priority}</span>
                      </li>
                    `).join('')}
                  </ul>
                  <a href="/maintenance" class="btn btn-sm btn-light w-100 mt-2 border" data-link>View Ticket Logs</a>
                `}
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
  }
};
