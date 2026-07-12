import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const ReportsPage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Reports & Analytics</h2>
          <p class="text-muted m-0 small">Operational metrics summaries, audit discrepancy logs, and accounting valuations.</p>
        </div>
      </div>

      <!-- Tabs Navigation (Prevents wrapping, enables horizontal scroll on mobile) -->
      <ul class="nav nav-tabs mb-4 border-bottom flex-nowrap" id="reportTabs" role="tablist" style="overflow-x: auto; overflow-y: hidden; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 2px;">
        <li class="nav-item" style="flex-shrink: 0;">
          <button class="nav-link active fw-bold text-dark px-2.5 py-2 d-flex align-items-center gap-1.5" style="white-space: nowrap; font-size: 13px;" id="utilization-tab" data-bs-toggle="tab" data-bs-target="#utilization-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">donut_large</span>
            <span>Asset Status & Utilization</span>
          </button>
        </li>
        <li class="nav-item" style="flex-shrink: 0;">
          <button class="nav-link fw-bold text-dark px-2.5 py-2 d-flex align-items-center gap-1.5" style="white-space: nowrap; font-size: 13px;" id="allocations-tab" data-bs-toggle="tab" data-bs-target="#allocations-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">corporate_fare</span>
            <span>Departments Allocations</span>
          </button>
        </li>
        <li class="nav-item" style="flex-shrink: 0;">
          <button class="nav-link fw-bold text-dark px-2.5 py-2 d-flex align-items-center gap-1.5" style="white-space: nowrap; font-size: 13px;" id="discrepancies-tab" data-bs-toggle="tab" data-bs-target="#discrepancies-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">gpp_maybe</span>
            <span>Audit Discrepancies & Retirement</span>
          </button>
        </li>
        <li class="nav-item" style="flex-shrink: 0;">
          <button class="nav-link fw-bold text-dark px-2.5 py-2 d-flex align-items-center gap-1.5" style="white-space: nowrap; font-size: 13px;" id="frequencies-tab" data-bs-toggle="tab" data-bs-target="#frequencies-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">query_stats</span>
            <span>Usage & Repairs Frequency</span>
          </button>
        </li>
      </ul>

      <div class="tab-content" id="reportTabsContent">
        
        <!-- 1. Asset Status Panel -->
        <div class="tab-pane show active fade" id="utilization-panel" role="tabpanel">
          <div class="row g-4">
            <!-- Visual Chart Card -->
            <div class="col-lg-5">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h5 class="fw-bold mb-3 text-dark">Status Distribution</h5>
                <div id="chart-utilization-container" class="d-flex align-items-center justify-content-center py-2" style="min-height: 250px;">
                  <div class="text-center text-muted small">Loading chart...</div>
                </div>
              </div>
            </div>
            <!-- Data Table Card -->
            <div class="col-lg-7">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="h5 fw-bold m-0 text-dark">Overall Status Breakdown</h4>
                  <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" id="btn-export-utilization">
                    <span class="material-symbols-outlined fs-6">download</span> Export CSV
                  </button>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                        <th>Asset Status</th>
                        <th>Asset Count</th>
                        <th>Allocation Percentage</th>
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-utilization-body">
                      <tr><td colspan="3" class="text-center py-3 text-muted">Loading metrics...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Department Allocation Panel -->
        <div class="tab-pane fade" id="allocations-panel" role="tabpanel">
          <div class="row g-4">
            <!-- Visual Chart Card -->
            <div class="col-lg-5">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h5 class="fw-bold mb-3 text-dark">Department Share Chart</h5>
                <div id="chart-department-container" class="py-2" style="min-height: 250px; display: flex; align-items: center;">
                  <div class="text-center text-muted small">Loading chart...</div>
                </div>
              </div>
            </div>
            <!-- Data Table Card -->
            <div class="col-lg-7">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="h5 fw-bold m-0 text-dark">Valuations & Counts by Department</h4>
                  <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" id="btn-export-dept">
                    <span class="material-symbols-outlined fs-6">download</span> Export CSV
                  </button>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                        <th>Department Name</th>
                        <th>Active Allocated Count</th>
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-department-body">
                      <tr><td colspan="2" class="text-center py-3 text-muted">Loading metrics...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Audit Discrepancies Panel -->
        <div class="tab-pane fade" id="discrepancies-panel" role="tabpanel">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h4 class="h5 fw-bold mb-3 text-dark">Audit Discrepancies (Missing / Damaged)</h4>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                      <tr style="font-size: 10px;" class="text-muted uppercase fw-bold">
                        <th>Cycle</th>
                        <th>Asset</th>
                        <th>Finding</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody id="table-discrepancies-body">
                      <tr><td colspan="4" class="text-center py-3 text-muted">Loading...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h4 class="h5 fw-bold mb-3 text-dark">Assets Nearing Retirement (Age > 3 Years)</h4>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                      <tr style="font-size: 10px;" class="text-muted uppercase fw-bold">
                        <th>Tag</th>
                        <th>Asset Name</th>
                        <th>Acquired Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody id="table-retirement-body">
                      <tr><td colspan="4" class="text-center py-3 text-muted">Loading...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Usage Frequency & Repair Logs -->
        <div class="tab-pane fade" id="frequencies-panel" role="tabpanel">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h4 class="h5 fw-bold mb-3 text-dark">Resource Booking Usage Chart</h4>
                <div id="chart-usage-container" class="mb-3" style="min-height: 200px; display: flex; align-items: center;">
                  <div class="text-center text-muted small">Loading chart...</div>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                      <tr style="font-size: 10px;" class="text-muted uppercase fw-bold">
                        <th>Tag</th>
                        <th>Resource</th>
                        <th>Reservations Count</th>
                      </tr>
                    </thead>
                    <tbody id="table-usage-frequency-body">
                      <tr><td colspan="3" class="text-center py-3 text-muted">Loading...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
                <h4 class="h5 fw-bold mb-3 text-dark">Maintenance Requests Frequency</h4>
                <div id="chart-maintenance-container" class="mb-3" style="min-height: 200px; display: flex; align-items: center;">
                  <div class="text-center text-muted small">Loading chart...</div>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" style="font-size: 13px;">
                    <thead class="table-light">
                      <tr style="font-size: 10px;" class="text-muted uppercase fw-bold">
                        <th>Tag</th>
                        <th>Asset Name</th>
                        <th>Repairs Count</th>
                      </tr>
                    </thead>
                    <tbody id="table-maintenance-frequency-body">
                      <tr><td colspan="3" class="text-center py-3 text-muted">Loading...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    return renderLayout(contentHTML, '/reports');
  },

  onMount(router) {
    bindLayoutEvents(router);

    let reportData = {};

    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          reportData = await res.json();
          renderUtilization();
          renderDepartments();
          renderDiscrepancies();
          renderUsageFrequency();
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Helper: Draw Donut Chart
    function drawDonutChart(data) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      if (total === 0) return `<div class="text-center text-muted small py-5">No status metrics logged in database.</div>`;

      const radius = 50;
      const circumference = 2 * Math.PI * radius; // ~314.16
      let accumulatedAngle = -90; // Start at 12 o'clock

      const circles = data.map(item => {
        const percent = item.value / total;
        const strokeLength = circumference * percent;
        const currentAngle = accumulatedAngle;
        accumulatedAngle += percent * 360;

        return `
          <circle r="${radius}" cx="80" cy="80" fill="transparent"
                  stroke="${item.color}" stroke-width="18"
                  stroke-dasharray="${strokeLength} ${circumference}"
                  stroke-dashoffset="0"
                  transform="rotate(${currentAngle} 80 80)" />
        `;
      }).join('');

      const legends = data.map(item => `
        <div class="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-light" style="font-size: 12.5px;">
          <div class="d-flex align-items-center gap-2">
            <span class="d-inline-block rounded-circle" style="width: 10px; height: 10px; background-color: ${item.color};"></span>
            <span class="text-muted text-uppercase fw-semibold" style="font-size: 11px;">${item.label}</span>
          </div>
          <strong class="text-dark">${item.value} (${Math.round((item.value / total) * 100)}%)</strong>
        </div>
      `).join('');

      return `
        <div class="row w-100 align-items-center g-3">
          <div class="col-sm-5 text-center">
            <svg width="150" height="150" viewBox="0 0 160 160" class="mx-auto">
              ${circles}
              <circle r="38" cx="80" cy="80" fill="#ffffff" />
              <text x="80" y="76" text-anchor="middle" font-size="10" fill="#888" font-weight="bold">TOTAL</text>
              <text x="80" y="94" text-anchor="middle" font-size="18" fill="#212529" font-weight="bold">${total}</text>
            </svg>
          </div>
          <div class="col-sm-7">
            <div class="d-flex flex-column h-100 justify-content-center">
              ${legends}
            </div>
          </div>
        </div>
      `;
    }

    // Helper: Draw Horizontal Bar Chart
    function drawHorizontalBarChart(data) {
      if (data.length === 0) return `<div class="text-center text-muted small py-4">No data logged.</div>`;
      const maxValue = Math.max(...data.map(item => item.value), 1);

      return `
        <div class="d-flex flex-column gap-3.5">
          ${data.map(item => {
            const percent = Math.round((item.value / maxValue) * 100);
            return `
              <div>
                <div class="d-flex justify-content-between mb-1" style="font-size: 12.5px;">
                  <span class="text-muted fw-semibold text-truncate" style="max-width: 220px;">${item.label}</span>
                  <strong class="text-dark">${item.value}</strong>
                </div>
                <div class="progress" style="height: 8px; background-color: #f1f3f5; border-radius: 4px;">
                  <div class="progress-bar" role="progressbar" 
                       style="width: ${percent}%; background-color: ${item.color || '#002046'}; border-radius: 4px; transition: width 0.6s ease;" 
                       aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderUtilization() {
      const tbody = document.getElementById('table-utilization-body');
      const chartContainer = document.getElementById('chart-utilization-container');
      if (!tbody || !reportData.utilization) return;

      tbody.innerHTML = reportData.utilization.map(row => {
        let badgeColor = 'bg-secondary';
        if (row.status === 'AVAILABLE') badgeColor = 'bg-success';
        else if (row.status === 'ALLOCATED') badgeColor = 'bg-primary';
        else if (row.status === 'UNDER_MAINTENANCE') badgeColor = 'bg-warning text-dark';
        else if (row.status === 'LOST') badgeColor = 'bg-danger';

        return `
          <tr class="fade-in-el">
            <td><span class="badge ${badgeColor} px-2.5 py-1.5 rounded">${row.status}</span></td>
            <td class="fw-semibold text-dark">${row.count}</td>
            <td class="fw-bold text-primary">${row.percentage}%</td>
          </tr>
        `;
      }).join('');

      // Map dynamic status colors
      const colorMap = {
        AVAILABLE: '#198754',
        ALLOCATED: '#0d6efd',
        UNDER_MAINTENANCE: '#ffc107',
        LOST: '#dc3545'
      };

      const chartData = reportData.utilization.map(row => ({
        label: row.status,
        value: row.count,
        color: colorMap[row.status] || '#6c757d'
      }));

      if (chartContainer) {
        chartContainer.innerHTML = drawDonutChart(chartData);
      }
    }

    function renderDepartments() {
      const tbody = document.getElementById('table-department-body');
      const chartContainer = document.getElementById('chart-department-container');
      if (!tbody || !reportData.departmentAllocation) return;

      tbody.innerHTML = reportData.departmentAllocation.map(row => `
        <tr class="fade-in-el">
          <td class="fw-bold text-dark">${row.department_name}</td>
          <td class="fw-semibold text-primary">${row.asset_count}</td>
        </tr>
      `).join('');

      const chartData = reportData.departmentAllocation.map(row => ({
        label: row.department_name,
        value: row.asset_count,
        color: '#0d6efd'
      }));

      if (chartContainer) {
        chartContainer.innerHTML = drawHorizontalBarChart(chartData);
      }
    }

    function renderDiscrepancies() {
      const tableDisc = document.getElementById('table-discrepancies-body');
      const tableRetire = document.getElementById('table-retirement-body');

      if (tableDisc && reportData.auditDiscrepancies) {
        if (reportData.auditDiscrepancies.length === 0) {
          tableDisc.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted">No closed audit cycle discrepancies found.</td></tr>`;
        } else {
          tableDisc.innerHTML = reportData.auditDiscrepancies.map(row => {
            const labelColor = row.result === 'DAMAGED' ? 'text-bg-warning' : 'text-bg-danger';
            return `
              <tr class="fade-in-el">
                <td><small class="text-muted text-truncate d-block" style="max-width: 100px;">${row.cycle_name}</small></td>
                <td><strong>${row.asset_tag}</strong><br><span class="text-muted small">${row.asset_name}</span></td>
                <td><span class="badge ${labelColor}">${row.result}</span></td>
                <td style="max-width: 120px;" class="text-truncate">${row.notes || '-'}</td>
              </tr>
            `;
          }).join('');
        }
      }

      if (tableRetire && reportData.retirement) {
        if (reportData.retirement.length === 0) {
          tableRetire.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted">No older hardware assets matching criteria.</td></tr>`;
        } else {
          tableRetire.innerHTML = reportData.retirement.map(row => `
            <tr class="fade-in-el">
              <td class="fw-semibold text-primary">${row.asset_tag}</td>
              <td class="fw-bold text-dark">${row.asset_name}</td>
              <td>${row.acquisition_date}</td>
              <td><span class="badge text-bg-light border">${row.status}</span></td>
            </tr>
          `).join('');
        }
      }
    }

    function renderUsageFrequency() {
      const tableUse = document.getElementById('table-usage-frequency-body');
      const tableMaint = document.getElementById('table-maintenance-frequency-body');
      const chartUsageContainer = document.getElementById('chart-usage-container');
      const chartMaintContainer = document.getElementById('chart-maintenance-container');

      if (tableUse && reportData.mostUsed) {
        if (reportData.mostUsed.length === 0) {
          tableUse.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted">No booking logs registered.</td></tr>`;
        } else {
          tableUse.innerHTML = reportData.mostUsed.map(row => `
            <tr class="fade-in-el">
              <td class="fw-semibold text-primary">${row.asset_tag}</td>
              <td class="fw-bold text-dark">${row.asset_name}</td>
              <td class="fw-bold text-success">${row.booking_count} times</td>
            </tr>
          `).join('');
        }

        const chartData = reportData.mostUsed.map(row => ({
          label: `${row.asset_tag} - ${row.asset_name}`,
          value: row.booking_count,
          color: '#198754'
        }));
        if (chartUsageContainer) {
          chartUsageContainer.innerHTML = drawHorizontalBarChart(chartData);
        }
      }

      if (tableMaint && reportData.maintenanceFrequency) {
        if (reportData.maintenanceFrequency.length === 0) {
          tableMaint.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted">No maintenance repair tickets logged.</td></tr>`;
        } else {
          tableMaint.innerHTML = reportData.maintenanceFrequency.map(row => `
            <tr class="fade-in-el">
              <td class="fw-semibold text-primary">${row.asset_tag}</td>
              <td class="fw-bold text-dark">${row.asset_name}</td>
              <td class="fw-bold text-danger">${row.request_count} tickets</td>
            </tr>
          `).join('');
        }

        const chartData = reportData.maintenanceFrequency.map(row => ({
          label: `${row.asset_tag} - ${row.asset_name}`,
          value: row.request_count,
          color: '#dc3545'
        }));
        if (chartMaintContainer) {
          chartMaintContainer.innerHTML = drawHorizontalBarChart(chartData);
        }
      }
    }

    // CSV Downloads
    function downloadCSV(filename, csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Export Utilization
    const btnExpUtil = document.getElementById('btn-export-utilization');
    if (btnExpUtil) {
      btnExpUtil.addEventListener('click', () => {
        if (!reportData.utilization) return;
        const csvRows = ['Status,Count,Percentage'];
        reportData.utilization.forEach(r => {
          csvRows.push(`"${r.status}",${r.count},${r.percentage}%`);
        });
        downloadCSV('assetflow_status_utilization.csv', csvRows.join('\n'));
      });
    }

    // Export Department summary
    const btnExpDept = document.getElementById('btn-export-dept');
    if (btnExpDept) {
      btnExpDept.addEventListener('click', () => {
        if (!reportData.departmentAllocation) return;
        const csvRows = ['Department,Active Allocated Count'];
        reportData.departmentAllocation.forEach(r => {
          csvRows.push(`"${r.department_name}",${r.asset_count}`);
        });
        downloadCSV('assetflow_department_allocations.csv', csvRows.join('\n'));
      });
    }

    loadReports();
  }
};
