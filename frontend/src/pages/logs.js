import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState } from '../utils/state.js';

export const LogsPage = {
  render() {
    const state = getState();
    const logs = state.logs;

    // Filter categories count for status metrics
    const systemLogs = logs.filter(l => l.type === 'SYSTEM' || l.type === 'DATABASE');
    const userLogs = logs.filter(l => l.type !== 'SYSTEM' && l.type !== 'DATABASE');

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Activity Logs & Alerts</h2>
          <p class="text-muted m-0 small">Audit trail of configuration updates and user operational actions.</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: Activity Log Stream -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Audit Trail Logs</h4>
            
            <div class="list-group list-group-flush" id="logs-stream-container">
              ${logs.length === 0 ? `
                <div class="text-center py-5 text-muted">No activities recorded.</div>
              ` : logs.map(l => {
                let icon = 'info';
                let badgeClass = 'text-bg-light';
                if (l.type === 'SYSTEM') {
                  icon = 'dns';
                  badgeClass = 'bg-primary text-white';
                } else if (l.type === 'DATABASE') {
                  icon = 'database';
                  badgeClass = 'bg-dark text-white';
                } else if (l.type === 'ASSET') {
                  icon = 'inventory_2';
                  badgeClass = 'bg-secondary text-white';
                } else if (l.type === 'BOOKING') {
                  icon = 'event_available';
                  badgeClass = 'bg-success text-white';
                } else if (l.type === 'MAINTENANCE') {
                  icon = 'build';
                  badgeClass = 'bg-warning text-dark';
                } else if (l.type === 'AUDIT') {
                  icon = 'fact_check';
                  badgeClass = 'bg-info text-dark';
                }

                return `
                  <div class="list-group-item px-0 py-3 border-bottom fade-in-el last-border-none">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <div class="d-flex align-items-center gap-2">
                        <span class="material-symbols-outlined text-muted fs-5">${icon}</span>
                        <strong class="text-dark" style="font-size: 14px;">${l.message}</strong>
                      </div>
                      <span class="badge ${badgeClass} small" style="font-size: 9px; font-weight: bold;">${l.type}</span>
                    </div>
                    <small class="text-muted d-block ps-4" style="font-size: 11px;">
                      <span class="material-symbols-outlined fs-6" style="vertical-align: text-bottom;">schedule</span>
                      ${new Date(l.time).toLocaleString('en-IN')}
                    </small>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Notifications Alert Panel -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Console Alerts</h4>
            
            <div class="d-flex flex-column gap-3" id="alerts-container">
              <!-- Mock alert 1 -->
              <div class="alert alert-warning border-0 card-shadow p-3 d-flex align-items-start gap-2 rounded-3" id="alert-1">
                <span class="material-symbols-outlined text-warning fs-4">warning</span>
                <div class="flex-grow-1">
                  <strong class="text-dark d-block small mb-1">Overdue Asset Allocation</strong>
                  <p class="text-muted mb-2" style="font-size: 12px;">Asset tag **AF-0001** (Dell Latitude Laptop) assigned to Raj Singh was expected to be returned by 2026-07-01.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <a href="/allocation" class="text-decoration-none text-warning fw-bold small" style="font-size: 11px;" data-link>View Allocation</a>
                    <button class="btn btn-sm text-muted p-0 hover-danger" style="font-size: 11px;" onclick="document.getElementById('alert-1').remove();">Dismiss</button>
                  </div>
                </div>
              </div>

              <!-- Mock alert 2 -->
              <div class="alert alert-info border-0 card-shadow p-3 d-flex align-items-start gap-2 rounded-3" id="alert-2">
                <span class="material-symbols-outlined text-info fs-4">info</span>
                <div class="flex-grow-1">
                  <strong class="text-dark d-block small mb-1">Audit verification pending</strong>
                  <p class="text-muted mb-2" style="font-size: 12px;">Verification checklist pending for IT Department audit cycle. 5 assets awaiting inspector check.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <a href="/audit" class="text-decoration-none text-info fw-bold small" style="font-size: 11px;" data-link>Open Audit Workspace</a>
                    <button class="btn btn-sm text-muted p-0 hover-danger" style="font-size: 11px;" onclick="document.getElementById('alert-2').remove();">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/logs');
  },

  onMount(router) {
    bindLayoutEvents(router);
  }
};
