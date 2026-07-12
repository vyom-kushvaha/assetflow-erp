import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const DashboardPage = {
  render() {
    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error(e);
    }

    const isAdmin = user.role === 'ADMIN';
    const isManager = user.role === 'ASSET_MANAGER';
    const isDeptHead = user.role === 'DEPT_HEAD';

    const canRegister = isAdmin || isManager;
    const canMaint = isAdmin || isManager || isDeptHead;
    const canAudit = isAdmin || isManager;
    const showApprovals = isAdmin || isManager || isDeptHead;

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Overview</h2>
          <p class="text-muted m-0 small">Real-time status of your enterprise assets & resources.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary border-light-subtle d-flex align-items-center gap-1.5 text-dark bg-white shadow-sm" id="btn-dashboard-period">
            <span class="material-symbols-outlined fs-5">calendar_today</span>
            <span>Last 12 Months</span>
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

      <!-- Row 1: Asset Utilization Line Chart & Asset Status Donut Chart -->
      <div class="row g-4 mb-4">
        <!-- Asset Utilization Line Chart -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 class="h5 fw-bold m-0 text-dark">Asset Utilization</h4>
                <small class="text-muted small">Monthly utilization rate across all categories</small>
              </div>
              <div class="btn-group btn-group-sm" role="group" id="utilization-timeframe-group">
                <button type="button" class="btn btn-outline-secondary active" data-timeframe="12M">12M</button>
                <button type="button" class="btn btn-outline-secondary" data-timeframe="6M">6M</button>
                <button type="button" class="btn btn-outline-secondary" data-timeframe="30D">30D</button>
              </div>
            </div>
            <!-- Dynamic SVG Line Chart -->
            <div id="utilization-line-chart-container" class="position-relative w-100 py-3" style="min-height: 220px;">
              <!-- Populated dynamically via JS -->
            </div>
          </div>
        </div>

        <!-- Asset Status Donut Chart -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-1 text-dark">Asset Status</h4>
            <small class="text-muted small d-block mb-4">Current distribution</small>
            
            <div id="chart-utilization-container" class="d-flex align-items-center justify-content-center">
              <!-- Populated dynamically via JS -->
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Recent Activity Timeline & Quick Actions + Pending Approvals -->
      <div class="row g-4">
        
        <!-- Recent Activity vertical timeline -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 class="h5 fw-bold m-0 text-dark">Recent Activity</h4>
                <small class="text-muted small">Latest actions across the workspace</small>
              </div>
              <a href="/logs" class="btn btn-sm btn-light border px-3 rounded" data-link>View all</a>
            </div>
            
            <!-- Timeline stream container -->
            <div class="position-relative ps-4 ms-2" id="recent-activity-timeline" style="border-left: 2px solid #e9ecef;">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>

        <!-- Right Side: Quick Actions & Pending Approvals -->
        <div class="col-xl-4">
          <div class="d-flex flex-column gap-4">
            
            <!-- Quick Actions -->
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <h4 class="h5 fw-bold mb-3 text-dark">Quick Actions</h4>
              <div class="row g-3">
                ${canRegister ? `
                <div class="col-6">
                  <a href="/assets" class="w-100 py-2 px-3 rounded-3 border border-light-subtle d-flex align-items-center gap-2 text-decoration-none text-dark bg-white shadow-sm hover-card" data-link style="height: 52px;">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style="width: 32px; height: 32px; flex-shrink: 0;">
                      <span class="material-symbols-outlined fs-5">add</span>
                    </div>
                    <span class="fw-semibold text-dark text-start" style="font-size: 13px; line-height: 1.2;">Register Asset</span>
                  </a>
                </div>
                ` : ''}
                <div class="col-6">
                  <a href="/booking" class="w-100 py-2 px-3 rounded-3 border border-light-subtle d-flex align-items-center gap-2 text-decoration-none text-dark bg-white shadow-sm hover-card" data-link style="height: 52px;">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning" style="width: 32px; height: 32px; flex-shrink: 0;">
                      <span class="material-symbols-outlined fs-5">calendar_today</span>
                    </div>
                    <span class="fw-semibold text-dark text-start" style="font-size: 13px; line-height: 1.2;">Book Resource</span>
                  </a>
                </div>
                ${canMaint ? `
                <div class="col-6">
                  <a href="/maintenance" class="w-100 py-2 px-3 rounded-3 border border-light-subtle d-flex align-items-center gap-2 text-decoration-none text-dark bg-white shadow-sm hover-card" data-link style="height: 52px;">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style="width: 32px; height: 32px; flex-shrink: 0;">
                      <span class="material-symbols-outlined fs-5">build</span>
                    </div>
                    <span class="fw-semibold text-dark text-start" style="font-size: 13px; line-height: 1.2;">Raise Maint.</span>
                  </a>
                </div>
                ` : ''}
                ${canAudit ? `
                <div class="col-6">
                  <a href="/audit" class="w-100 py-2 px-3 rounded-3 border border-light-subtle d-flex align-items-center gap-2 text-decoration-none text-dark bg-white shadow-sm hover-card" data-link style="height: 52px;">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style="width: 32px; height: 32px; flex-shrink: 0;">
                      <span class="material-symbols-outlined fs-5">fact_check</span>
                    </div>
                    <span class="fw-semibold text-dark text-start" style="font-size: 13px; line-height: 1.2;">Start Audit</span>
                  </a>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Pending Approvals (Only visible to managers/admin/dept-heads) -->
            ${showApprovals ? `
            <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="h5 fw-bold m-0 text-dark">Pending Approvals</h4>
                <span class="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1 small" id="pending-approvals-count">0</span>
              </div>
              <div class="d-flex flex-column gap-3" id="pending-approvals-list">
                <!-- Populated dynamically -->
              </div>
            </div>
            ` : ''}

          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/dashboard');
  },

  onMount(router) {
    bindLayoutEvents(router);

    async function loadDashboardData() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        const data = await res.json();

        renderKpiCards(data.stats);
        renderAssetStatusDonut(data.stats);
        renderAssetUtilizationLineChart('12M');
        renderTimeline(data.activities);
        loadPendingApprovals();

        // Bind timeframe buttons click logic
        const timeframeButtons = document.querySelectorAll('#utilization-timeframe-group button');
        timeframeButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            timeframeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const timeframe = btn.getAttribute('data-timeframe');
            renderAssetUtilizationLineChart(timeframe);
          });
        });
      } catch (err) {
        console.error(err);
      }
    }

    function renderKpiCards(stats) {
      const row = document.getElementById('kpi-cards-row');
      if (!row) return;

      const cards = [
        { title: 'Assets Available', value: stats.available, icon: 'check_circle', color: 'text-success' },
        { title: 'Assets Allocated', value: stats.allocated, icon: 'inventory_2', color: 'text-primary' },
        { title: 'Under Maintenance', value: stats.maintenance, icon: 'build_circle', color: 'text-warning' },
        { title: 'Lost Assets', value: stats.lost, icon: 'cancel', color: 'text-danger' }
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

    function renderAssetStatusDonut(stats) {
      const container = document.getElementById('chart-utilization-container');
      if (!container) return;

      const total = stats.available + stats.allocated + stats.maintenance + stats.lost;
      if (total === 0) {
        container.innerHTML = `<div class="text-center text-muted small py-4">No status data to show.</div>`;
        return;
      }

      const data = [
        { label: 'Allocated', value: stats.allocated, color: '#0d233a', percent: Math.round((stats.allocated/total)*100) },
        { label: 'Available', value: stats.available, color: '#2f7ed8', percent: Math.round((stats.available/total)*100) },
        { label: 'Maintenance', value: stats.maintenance, color: '#910000', percent: Math.round((stats.maintenance/total)*100) },
        { label: 'Lost', value: stats.lost, color: '#492970', percent: Math.round((stats.lost/total)*100) }
      ];

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

      container.innerHTML = `
        <div class="row w-100 align-items-center">
          <div class="col-sm-6 text-center">
            <svg width="150" height="150" viewBox="0 0 160 160" class="mx-auto">
              ${circles}
              <circle r="38" cx="80" cy="80" fill="#ffffff" />
              <text x="80" y="74" text-anchor="middle" font-size="9" fill="#888" font-weight="bold">TOTAL</text>
              <text x="80" y="94" text-anchor="middle" font-size="20" fill="#212529" font-weight="bold">${total}</text>
            </svg>
          </div>
          <div class="col-sm-6">
            <div class="d-flex flex-column gap-2">
              ${data.map(item => `
                <div class="d-flex align-items-center justify-content-between" style="font-size: 13px;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="d-inline-block rounded-circle" style="width: 10px; height: 10px; background-color: ${item.color};"></span>
                    <span class="text-muted fw-semibold">${item.label}</span>
                  </div>
                  <div class="text-end">
                    <strong class="text-dark d-inline-block" style="width: 40px;">${item.value}</strong>
                    <span class="text-muted small" style="width: 35px; display: inline-block;">${item.percent}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function renderAssetUtilizationLineChart(timeframe = '12M') {
      const container = document.getElementById('utilization-line-chart-container');
      if (!container) return;

      let months = [];
      let values = [];

      if (timeframe === '6M') {
        months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        values = [82, 79, 85, 88, 85, 90];
      } else if (timeframe === '30D') {
        months = ['Jul 1', 'Jul 7', 'Jul 14', 'Jul 21', 'Jul 28', 'Jul 30'];
        values = [84, 86, 85, 89, 87, 90];
      } else {
        // Default 12M
        months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        values = [62, 69, 72, 65, 75, 78, 82, 79, 85, 88, 85, 90];
      }
      
      const width = 580;
      const height = 180;
      const xStart = 40;
      const yStart = 10;
      const chartWidth = width - xStart;
      const chartHeight = height - yStart - 20;

      const points = values.map((val, i) => {
        const x = xStart + (i * (chartWidth / (values.length - 1)));
        const y = height - 20 - (val / 100) * chartHeight;
        return { x, y, val };
      });

      // SVG path definition
      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }

      // Shaded area path definition
      const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`;

      container.innerHTML = `
        <svg width="100%" height="220" viewBox="0 0 600 220" style="overflow: visible;">
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#002046" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#002046" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          <line x1="${xStart}" y1="${height - 20}" x2="${width}" y2="${height - 20}" stroke="#f1f3f5" stroke-width="1" />
          <line x1="${xStart}" y1="${height - 20 - chartHeight * 0.33}" x2="${width}" y2="${height - 20 - chartHeight * 0.33}" stroke="#f1f3f5" stroke-dasharray="4 4" />
          <line x1="${xStart}" y1="${height - 20 - chartHeight * 0.66}" x2="${width}" y2="${height - 20 - chartHeight * 0.66}" stroke="#f1f3f5" stroke-dasharray="4 4" />
          <line x1="${xStart}" y1="${height - 20 - chartHeight}" x2="${width}" y2="${height - 20 - chartHeight}" stroke="#f1f3f5" stroke-width="1" />

          <!-- Left Axis Labels -->
          <text x="${xStart - 10}" y="${height - 20}" text-anchor="end" font-size="10" fill="#999">0</text>
          <text x="${xStart - 10}" y="${height - 20 - chartHeight * 0.33 + 4}" text-anchor="end" font-size="10" fill="#999">34</text>
          <text x="${xStart - 10}" y="${height - 20 - chartHeight * 0.66 + 4}" text-anchor="end" font-size="10" fill="#999">67</text>
          <text x="${xStart - 10}" y="${height - 20 - chartHeight + 4}" text-anchor="end" font-size="10" fill="#999">101</text>

          <!-- Shaded Area Under Line -->
          <path d="${areaD}" fill="url(#chart-area-grad)" />

          <!-- Line Path -->
          <path d="${pathD}" fill="none" stroke="#002046" stroke-width="2.5" stroke-linecap="round" />

          <!-- Data Points Circles -->
          ${points.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ffffff" stroke="#002046" stroke-width="2.5" />
          `).join('')}

          <!-- Bottom Month Labels -->
          ${months.map((m, i) => {
            const x = xStart + (i * (chartWidth / (months.length - 1)));
            return `<text x="${x}" y="${height + 5}" text-anchor="middle" font-size="10.5" fill="#888">${m}</text>`;
          }).join('')}
        </svg>
      `;
    }

    function renderTimeline(list) {
      const container = document.getElementById('recent-activity-timeline');
      if (!container) return;

      if (list.length === 0) {
        container.innerHTML = `<div class="text-muted small py-3">No activity logs recorded.</div>`;
        return;
      }

      // Draw timeline rows
      container.innerHTML = list.slice(0, 6).map((l, index) => {
        let color = '#2f7ed8';
        if (l.action.includes('ALLOCATE')) color = '#002046';
        else if (l.action.includes('MAINTENANCE')) color = '#ffc107';
        else if (l.action.includes('AUDIT')) color = '#198754';

        const actionText = l.action.toLowerCase().replace('_', ' ');
        const details = l.details ? l.details : '';
        
        let detailsText = '';
        if (details.startsWith('{')) {
          try {
            const parsed = JSON.parse(details);
            detailsText = parsed.name || parsed.notes || `Asset ID: ${parsed.assetId || l.entity_id}`;
          } catch(e) {}
        } else {
          detailsText = details || `ID #${l.entity_id}`;
        }

        // Relative timestamp mock representation (yesterday/hours ago)
        const diff = index * 2;
        const timeAgo = diff === 0 ? '12m ago' : (diff < 24 ? `${diff}h ago` : 'Yesterday');

        return `
          <div class="position-relative mb-4">
            <!-- Indicator circle -->
            <span class="position-absolute rounded-circle bg-white" 
                  style="width: 13px; height: 13px; left: -31.5px; top: 4px; border: 2.5px solid ${color}; z-index: 2;"></span>
            <div>
              <strong class="text-dark fs-6">${l.user_name || 'System'}</strong> 
              <span class="text-muted">${actionText}</span> 
              <strong class="text-dark">${detailsText}</strong>
              <div class="text-muted small fs-8 mt-0.5">${timeAgo}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    async function loadPendingApprovals() {
      const list = document.getElementById('pending-approvals-list');
      const badge = document.getElementById('pending-approvals-count');
      if (!list) return;

      try {
        // Fetch pending transfer requests
        const resTrans = await fetch('/api/transfers');
        let transfers = [];
        if (resTrans.ok) {
          const data = await resTrans.json();
          transfers = (data.transfers || []).filter(t => t.status === 'REQUESTED');
        }

        // Fetch pending maintenance requests
        const resMaint = await fetch('/api/maintenance');
        let maint = [];
        if (resMaint.ok) {
          const data = await resMaint.json();
          maint = (data.requests || []).filter(r => r.status === 'PENDING');
        }

        const approvals = [
          ...transfers.map(t => ({
            id: t.id,
            title: `Asset Transfer — ${t.asset_tag}`,
            desc: `${t.requester_name} &middot; Transfer`,
            type: 'TRANSFER'
          })),
          ...maint.map(m => ({
            id: m.id,
            title: `Maintenance Approval — ${m.asset_name}`,
            desc: `${m.requester_name || 'Admin'} &middot; Maintenance`,
            type: 'MAINTENANCE'
          }))
        ];

        badge.innerText = approvals.length;
        badge.className = approvals.length > 0 ? 'badge bg-danger rounded-pill px-2.5 py-1 small' : 'badge bg-secondary rounded-pill px-2.5 py-1 small';

        if (approvals.length === 0) {
          list.innerHTML = `<div class="text-center py-4 text-muted small">No pending approvals required.</div>`;
          return;
        }

        list.innerHTML = approvals.slice(0, 3).map(a => `
          <div class="border rounded p-3 d-flex align-items-center justify-content-between bg-light bg-opacity-25 shadow-xs">
            <div>
              <strong class="text-dark d-block" style="font-size: 13.5px;">${a.title}</strong>
              <small class="text-muted text-capitalize fs-8">${a.desc}</small>
            </div>
            <button class="btn btn-sm btn-outline-success border-0 rounded-circle p-1 d-flex align-items-center btn-quick-approve" 
                    data-id="${a.id}" data-type="${a.type}" title="Approve">
              <span class="material-symbols-outlined fs-5">check_circle</span>
            </button>
          </div>
        `).join('');

        // Bind quick approve buttons
        document.querySelectorAll('.btn-quick-approve').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            
            try {
              let res;
              if (type === 'TRANSFER') {
                res = await fetch(`/api/transfers/${id}/approve`, { method: 'POST' });
              } else if (type === 'MAINTENANCE') {
                res = await fetch(`/api/maintenance/${id}/approve`, { method: 'POST' });
              }

              if (res && res.ok) {
                alert('Approved successfully!');
                loadDashboardData();
              } else {
                alert('Approval failed.');
              }
            } catch (err) {
              console.error(err);
            }
          });
        });

      } catch (err) {
        console.error(err);
      }
    }

    loadDashboardData();
  }
};
