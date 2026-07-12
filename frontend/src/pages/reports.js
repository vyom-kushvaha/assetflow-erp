import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState } from '../utils/state.js';

export const ReportsPage = {
  render() {
    const state = getState();
    const assets = state.assets;
    const categories = state.categories;
    const departments = state.departments;
    const maintenance = state.maintenance;

    // Report 1: Compute counts by Category and Status
    const summaryData = categories.map(cat => {
      const catAssets = assets.filter(a => a.categoryId === cat.id);
      return {
        category: cat.name,
        total: catAssets.length,
        available: catAssets.filter(a => a.status === 'AVAILABLE').length,
        allocated: catAssets.filter(a => a.status === 'ALLOCATED').length,
        maintenance: catAssets.filter(a => a.status === 'UNDER_MAINTENANCE').length,
        lost: catAssets.filter(a => a.status === 'LOST').length
      };
    });

    // Report 2: Compute Cost Distribution by Department
    const costData = departments.map(dept => {
      const deptAssets = assets.filter(a => a.departmentId === dept.id);
      const totalCost = deptAssets.reduce((sum, a) => sum + (a.cost || 0), 0);
      return {
        department: dept.name,
        assetsCount: deptAssets.length,
        totalValue: totalCost,
        formattedValue: `INR ${totalCost.toLocaleString('en-IN')}`
      };
    });

    // Report 3: Completed Maintenance Cost logs
    const completedTickets = maintenance.filter(m => m.status === 'COMPLETED');

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Reports & Analytics</h2>
          <p class="text-muted m-0 small">Operational metrics summaries and accounting valuations.</p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs mb-4 border-bottom" id="reportTabs" role="tablist">
        <li class="nav-item">
          <button class="nav-link active fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="inventory-tab" data-bs-toggle="tab" data-bs-target="#inventory-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">inventory</span>
            <span>Inventory Summary</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="cost-tab" data-bs-toggle="tab" data-bs-target="#cost-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">account_balance_wallet</span>
            <span>Cost Distribution</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="maint-cost-tab" data-bs-toggle="tab" data-bs-target="#maint-cost-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">payments</span>
            <span>Maintenance Expenses</span>
          </button>
        </li>
      </ul>

      <div class="tab-content" id="reportTabsContent">
        <!-- 1. Inventory Summary Panel -->
        <div class="tab-pane fade show active" id="inventory-panel" role="tabpanel">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Category Status Metrics</h4>
              <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" id="btn-export-inventory">
                <span class="material-symbols-outlined fs-6">download</span> Export CSV
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th>Category</th>
                    <th>Total Count</th>
                    <th>Available</th>
                    <th>Allocated</th>
                    <th>Under Maintenance</th>
                    <th>Lost / Retired</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">
                  ${summaryData.map(d => `
                    <tr>
                      <td class="fw-bold text-dark">${d.category}</td>
                      <td class="fw-semibold text-primary">${d.total}</td>
                      <td><span class="text-success fw-semibold">${d.available}</span></td>
                      <td><span class="text-primary fw-semibold">${d.allocated}</span></td>
                      <td><span class="text-warning fw-semibold">${d.maintenance}</span></td>
                      <td><span class="text-danger fw-semibold">${d.lost}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 2. Cost Distribution Panel -->
        <div class="tab-pane fade" id="cost-panel" role="tabpanel">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Valuations by Department</h4>
              <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" id="btn-export-cost">
                <span class="material-symbols-outlined fs-6">download</span> Export CSV
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th>Department Name</th>
                    <th>Assets Count</th>
                    <th>Total Accounting Cost</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">
                  ${costData.map(c => `
                    <tr>
                      <td class="fw-bold text-dark">${c.department}</td>
                      <td>${c.assetsCount}</td>
                      <td class="fw-semibold text-primary">${c.formattedValue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. Maintenance Cost Panel -->
        <div class="tab-pane fade" id="maint-cost-panel" role="tabpanel">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Logged Repair Costs</h4>
              <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" id="btn-export-maint">
                <span class="material-symbols-outlined fs-6">download</span> Export CSV
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th>Ticket ID</th>
                    <th>Asset Tag</th>
                    <th>Asset Name</th>
                    <th>Logged Fault</th>
                    <th>Logged Cost</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">
                  ${completedTickets.length === 0 ? `
                    <tr>
                      <td colspan="5" class="text-center py-4 text-muted">No completed maintenance cost logs found.</td>
                    </tr>
                  ` : completedTickets.map(t => {
                    const asset = assets.find(a => a.id === t.assetId);
                    const tag = asset ? asset.tag : 'N/A';
                    const name = asset ? asset.name : 'Unknown';
                    const costVal = t.cost ? `INR ${t.cost.toLocaleString('en-IN')}` : 'INR 0';

                    return `
                      <tr>
                        <td>#TCK-${t.id}</td>
                        <td class="fw-semibold text-primary">${tag}</td>
                        <td class="fw-bold text-dark">${name}</td>
                        <td>${t.issue}</td>
                        <td class="fw-bold text-success">${costVal}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/reports');
  },

  onMount(router) {
    bindLayoutEvents(router);

    // CSV Download Helper
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

    // Bind CSV Exports
    const btnExpInventory = document.getElementById('btn-export-inventory');
    if (btnExpInventory) {
      btnExpInventory.addEventListener('click', () => {
        const state = getState();
        const csvRows = ['Category,Total,Available,Allocated,Under Maintenance,Lost'];
        
        state.categories.forEach(cat => {
          const catAssets = state.assets.filter(a => a.categoryId === cat.id);
          const total = catAssets.length;
          const av = catAssets.filter(a => a.status === 'AVAILABLE').length;
          const al = catAssets.filter(a => a.status === 'ALLOCATED').length;
          const mn = catAssets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
          const ls = catAssets.filter(a => a.status === 'LOST').length;
          csvRows.push(`"${cat.name}",${total},${av},${al},${mn},${ls}`);
        });

        downloadCSV('assetflow_inventory_summary.csv', csvRows.join('\n'));
      });
    }

    const btnExpCost = document.getElementById('btn-export-cost');
    if (btnExpCost) {
      btnExpCost.addEventListener('click', () => {
        const state = getState();
        const csvRows = ['Department,Assets Count,Total Cost (INR)'];

        state.departments.forEach(dept => {
          const deptAssets = state.assets.filter(a => a.departmentId === dept.id);
          const cost = deptAssets.reduce((sum, a) => sum + (a.cost || 0), 0);
          csvRows.push(`"${dept.name}",${deptAssets.length},${cost}`);
        });

        downloadCSV('assetflow_cost_distribution.csv', csvRows.join('\n'));
      });
    }

    const btnExpMaint = document.getElementById('btn-export-maint');
    if (btnExpMaint) {
      btnExpMaint.addEventListener('click', () => {
        const state = getState();
        const csvRows = ['Ticket ID,Asset Tag,Asset Name,Fault,Cost (INR)'];

        state.maintenance.filter(m => m.status === 'COMPLETED').forEach(t => {
          const asset = state.assets.find(a => a.id === t.assetId);
          const tag = asset ? asset.tag : 'N/A';
          const name = asset ? asset.name : 'Unknown';
          csvRows.push(`#TCK-${t.id},${tag},"${name}","${t.issue}",${t.cost || 0}`);
        });

        downloadCSV('assetflow_maintenance_expenses.csv', csvRows.join('\n'));
      });
    }
  }
};
