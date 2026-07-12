import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import * as bootstrap from 'bootstrap';

export const AuditPage = {
  render() {
    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {}

    const isEmployee = user.role === 'EMPLOYEE';

    if (isEmployee) {
      const accessDeniedHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center py-5 text-center min-vh-50">
          <span class="material-symbols-outlined display-1 text-danger mb-3">gpp_bad</span>
          <h3 class="fw-bold text-dark">Access Denied</h3>
          <p class="text-muted max-width-md">Only Administrators, Asset Managers, and assigned Auditors can access the compliance workspace.</p>
        </div>
      `;
      return renderLayout(accessDeniedHTML, '/audit');
    }

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Asset Audit</h2>
          <p class="text-muted m-0 small">Schedule validation cycles, verify hardware conditions, and update asset compliance logs.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-create-audit" id="btn-initiate-audit-modal">
          <span class="material-symbols-outlined fs-5">fact_check</span>
          <span>Initiate Audit Cycle</span>
        </button>
      </div>

      <div class="row g-4">
        <!-- Left: Active Audit Workspace -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Ongoing Verification Workspace</h4>
              <span class="badge bg-secondary px-3 py-1.5 rounded" id="workspace-audit-badge">Select a Cycle</span>
            </div>
            
            <div id="audit-workspace-placeholder" class="text-center py-5 text-muted">
              <span class="material-symbols-outlined display-3 mb-2 text-secondary">assignment_turned_in</span>
              <p>No active audit cycle selected. Start a planned cycle or select one from the history panel.</p>
            </div>

            <div id="audit-workspace-content" class="d-none">
              <div class="alert alert-info py-2 text-sm d-flex align-items-center gap-2 mb-3">
                <span class="material-symbols-outlined fs-5">info</span>
                <span>Assigned auditors should select finding state, record conditions notes, and click Save.</span>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                      <th>Tag</th>
                      <th>Asset Name</th>
                      <th>Location</th>
                      <th>Result</th>
                      <th>Verification Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody style="font-size: 13px;" id="table-audit-assets-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
              
              <div class="d-flex justify-content-end mt-4 pt-3 border-top" id="workspace-close-container">
                <button class="btn btn-success rounded-pill px-4 shadow-sm" id="btn-complete-audit-cycle">Close Audit Cycle</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Audit Cycle History -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Compliance Logs History</h4>
            
            <div class="d-flex flex-column gap-3" id="audit-cycles-list">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>

      <!-- Initiate Audit Modal -->
      <div class="modal fade" id="modal-create-audit" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Initiate Compliance Audit</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-create-audit">
                <div class="mb-3">
                  <label class="form-label fw-semibold" for="audit-name">Audit Cycle Title *</label>
                  <input type="text" class="form-control" id="audit-name" placeholder="IT Assets Audit Q3 2026" required>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="audit-scope-dept">Scope Department</label>
                    <select class="form-select" id="audit-scope-dept">
                      <option value="" selected>All Departments</option>
                      <!-- Populated dynamically -->
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="audit-scope-loc">Scope Location Filter</label>
                    <input type="text" class="form-control" id="audit-scope-loc" placeholder="e.g. Floor 2">
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="audit-start">Start Date *</label>
                    <input type="date" class="form-control" id="audit-start" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="audit-end">End Date *</label>
                    <input type="date" class="form-control" id="audit-end" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="audit-auditors">Assign Auditor *</label>
                  <select class="form-select" id="audit-auditors" multiple required style="height: 100px;">
                    <!-- Populated dynamically -->
                  </select>
                  <small class="text-muted">Hold Ctrl (Cmd) to select multiple auditors.</small>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Initiate Audit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/audit');
  },

  onMount(router) {
    bindLayoutEvents(router);

    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {}

    if (user.role === 'EMPLOYEE') return;

    // Move modals to body
    const pageModals = document.querySelectorAll('.modal');
    pageModals.forEach(modal => {
      document.body.appendChild(modal);
    });

    function dismissModal(modalId) {
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }

    let cycles = [];
    let departments = [];
    let employees = [];
    let selectedCycle = null;
    let selectedFindings = [];

    const isManager = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER';

    // Hide initiate audit button if not manager
    const initiateBtn = document.getElementById('btn-initiate-audit-modal');
    if (initiateBtn && !isManager) {
      initiateBtn.classList.add('d-none');
    }

    async function loadData() {
      try {
        // Fetch Departments
        const resDept = await fetch('/api/org/departments');
        if (resDept.ok) {
          const data = await resDept.json();
          departments = data.departments || [];
        }

        // Fetch Employees
        const resEmp = await fetch('/api/org/employees');
        if (resEmp.ok) {
          const data = await resEmp.json();
          employees = data.employees || [];
        }

        // Fetch Audit Cycles
        const resCycles = await fetch('/api/audit/cycles');
        if (resCycles.ok) {
          const data = await resCycles.json();
          cycles = data.cycles || [];
        }

        populateSelectors();
        renderAuditHistory();
      } catch (err) {
        console.error(err);
      }
    }

    function populateSelectors() {
      // Dept selector
      const deptSelect = document.getElementById('audit-scope-dept');
      if (deptSelect) {
        deptSelect.innerHTML = '<option value="" selected>All Departments</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }

      // Auditors selector
      const auditorsSelect = document.getElementById('audit-auditors');
      if (auditorsSelect) {
        auditorsSelect.innerHTML = employees.map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join('');
      }
    }

    function renderAuditHistory() {
      const list = document.getElementById('audit-cycles-list');
      if (!list) return;

      if (cycles.length === 0) {
        list.innerHTML = `<div class="text-center py-4 text-muted small">No audit history recorded.</div>`;
        return;
      }

      list.innerHTML = cycles.map(a => {
        let badgeColor = 'bg-secondary';
        if (a.status === 'IN_PROGRESS') badgeColor = 'bg-primary';
        else if (a.status === 'CLOSED') badgeColor = 'bg-success';
        else if (a.status === 'PLANNED') badgeColor = 'bg-warning text-dark';

        const total = a.total_assets || 0;
        const verified = a.verified_assets || 0;
        const progress = total > 0 ? Math.round((verified / total) * 100) : 0;

        return `
          <div class="border rounded p-3 fade-in-el bg-light bg-opacity-25 shadow-xs cursor-pointer btn-select-cycle" data-id="${a.id}">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge ${badgeColor} rounded" style="font-size: 10px;">${a.status}</span>
              <small class="text-muted" style="font-size: 11px;">${a.start_date}</small>
            </div>
            <strong class="text-dark d-block text-truncate" style="font-size: 14px;">${a.name}</strong>
            <small class="text-muted d-block small">Scope: ${a.department_name || 'All'} / ${a.scope_location || 'Global'}</small>
            
            <div class="mt-2.5">
              <div class="d-flex justify-content-between text-muted fs-8 mb-1">
                <span>Progress</span>
                <span>${verified}/${total} (${progress}%)</span>
              </div>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${progress}%;"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Bind history items clicks
      document.querySelectorAll('.btn-select-cycle').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          loadCycleDetails(id);
        });
      });
    }

    async function loadCycleDetails(id) {
      try {
        const res = await fetch(`/api/audit/cycles/${id}`);
        if (res.ok) {
          const data = await res.json();
          selectedCycle = data.cycle;
          selectedFindings = data.findings || [];
          renderWorkspace();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function renderWorkspace() {
      const workspacePlaceholder = document.getElementById('audit-workspace-placeholder');
      const workspaceContent = document.getElementById('audit-workspace-content');
      const badge = document.getElementById('workspace-audit-badge');
      const tbody = document.getElementById('table-audit-assets-body');

      if (!selectedCycle) {
        workspacePlaceholder.classList.remove('d-none');
        workspaceContent.classList.add('d-none');
        badge.innerText = 'Select a Cycle';
        badge.className = 'badge bg-secondary px-3 py-1.5 rounded';
        return;
      }

      workspacePlaceholder.classList.add('d-none');
      workspaceContent.classList.remove('d-none');
      badge.innerText = `${selectedCycle.status}: ${selectedCycle.name}`;
      
      let badgeColor = 'bg-secondary';
      if (selectedCycle.status === 'IN_PROGRESS') badgeColor = 'bg-primary';
      else if (selectedCycle.status === 'CLOSED') badgeColor = 'bg-success';
      else if (selectedCycle.status === 'PLANNED') badgeColor = 'bg-warning text-dark';
      badge.className = `badge ${badgeColor} px-3 py-1.5 rounded`;

      // Render workspace close container controls
      const closeContainer = document.getElementById('workspace-close-container');
      if (closeContainer) {
        if (selectedCycle.status === 'PLANNED' && isManager) {
          closeContainer.innerHTML = `<button class="btn btn-primary rounded-pill px-4 shadow-sm" id="btn-start-audit-cycle">Start Audit Cycle</button>`;
          // Bind start
          document.getElementById('btn-start-audit-cycle').addEventListener('click', startAuditCycle);
        } else if (selectedCycle.status === 'IN_PROGRESS' && isManager) {
          closeContainer.innerHTML = `<button class="btn btn-success rounded-pill px-4 shadow-sm" id="btn-complete-audit-cycle">Close Audit Cycle</button>`;
          // Bind close
          document.getElementById('btn-complete-audit-cycle').addEventListener('click', closeAuditCycle);
        } else {
          closeContainer.innerHTML = ``;
        }
      }

      if (selectedFindings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No scoped assets in this cycle.</td></tr>`;
        return;
      }

      const isClosed = selectedCycle.status === 'CLOSED';

      tbody.innerHTML = selectedFindings.map(f => {
        const hasResult = f.result !== null;
        let resultBadge = '-';
        if (f.result === 'VERIFIED') resultBadge = '<span class="badge bg-success">Verified</span>';
        else if (f.result === 'DAMAGED') resultBadge = '<span class="badge bg-warning text-dark">Damaged</span>';
        else if (f.result === 'MISSING') resultBadge = '<span class="badge bg-danger">Missing</span>';

        return `
          <tr class="${hasResult ? 'table-light opacity-85' : ''} fade-in-el">
            <td class="fw-semibold text-primary py-3">${f.asset_tag}</td>
            <td class="fw-bold text-dark">${f.asset_name}</td>
            <td><small class="text-muted">${f.asset_location || 'Storage Pool'}</small></td>
            <td>
              ${isClosed || hasResult ? resultBadge : `
                <select class="form-select form-select-sm" id="verify-result-${f.id}">
                  <option value="" disabled selected>Select Result...</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="MISSING">MISSING</option>
                </select>
              `}
            </td>
            <td>
              ${isClosed || hasResult ? `<span>${f.notes || ''}</span>` : `
                <input type="text" class="form-control form-control-sm" id="verify-notes-${f.id}" placeholder="Condition notes..." />
              `}
            </td>
            <td>
              ${isClosed || hasResult ? `
                <small class="text-muted">Checked by: ${f.auditor_name || 'System'}</small>
              ` : `
                <button class="btn btn-sm btn-primary px-3 py-1 btn-verify-asset" data-id="${f.id}">Save</button>
              `}
            </td>
          </tr>
        `;
      }).join('');

      // Bind verify save button
      document.querySelectorAll('.btn-verify-asset').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const result = document.getElementById(`verify-result-${id}`).value;
          const notes = document.getElementById(`verify-notes-${id}`).value.trim();

          if (!result) {
            alert('Please select a result before saving.');
            return;
          }

          try {
            const res = await fetch(`/api/audit/findings/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ result, notes })
            });

            if (res.ok) {
              alert('Finding saved!');
              loadCycleDetails(selectedCycle.id);
            } else {
              const data = await res.json();
              alert(data.error ? data.error.message : 'Failed to save finding.');
            }
          } catch (e) {
            console.error(e);
          }
        });
      });
    }

    async function startAuditCycle() {
      if (!selectedCycle) return;
      try {
        const res = await fetch(`/api/audit/cycles/${selectedCycle.id}/start`, { method: 'POST' });
        if (res.ok) {
          alert('Audit cycle started! Auditors notified.');
          loadData();
          loadCycleDetails(selectedCycle.id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function closeAuditCycle() {
      if (!selectedCycle) return;
      if (confirm('Complete and close compliance audit cycle? This locks all findings and updates asset status in directory.')) {
        try {
          const res = await fetch(`/api/audit/cycles/${selectedCycle.id}/close`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            alert(`Audit Closed successfully! Discrepancy Summary:\n- Verified: ${data.summary.verified}\n- Damaged: ${data.summary.damaged}\n- Missing: ${data.summary.missing}`);
            loadData();
            loadCycleDetails(selectedCycle.id);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Create Audit Form Submit
    const formAudit = document.getElementById('form-create-audit');
    if (formAudit) {
      formAudit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('audit-name').value.trim();
        const scopeDepartmentId = document.getElementById('audit-scope-dept').value;
        const scopeLocation = document.getElementById('audit-scope-loc').value.trim();
        const startDate = document.getElementById('audit-start').value;
        const endDate = document.getElementById('audit-end').value;
        
        // Handle multi-select auditors
        const auditorsSelect = document.getElementById('audit-auditors');
        const auditorIds = Array.from(auditorsSelect.selectedOptions).map(o => o.value);

        if (!name || !startDate || !endDate || auditorIds.length === 0) {
          alert('Please fill out all required fields.');
          return;
        }

        try {
          const res = await fetch('/api/audit/cycles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              scopeDepartmentId,
              scopeLocation,
              startDate,
              endDate,
              auditorIds
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert(`Audit initiated! ${data.scopedAssets} assets added to cycle scope.`);
            formAudit.reset();
            dismissModal('modal-create-audit');
            loadData();
          } else {
            alert(data.error ? data.error.message : 'Failed to initiate audit.');
          }
        } catch (err) {
          console.error(err);
        }
      });
    }

    loadData();
  }
};
