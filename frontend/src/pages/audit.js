import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const AuditPage = {
  render() {
    const state = getState();
    const audits = state.audits;
    const departments = state.departments;

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Asset Audit</h2>
          <p class="text-muted m-0 small">Schedule validation cycles, verify hardware conditions, and update asset compliance logs.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-create-audit">
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
              <span class="badge bg-primary px-3 py-1.5 rounded" id="workspace-audit-badge">Loading...</span>
            </div>
            
            <div id="audit-workspace-placeholder" class="text-center py-5 text-muted d-none">
              <span class="material-symbols-outlined display-3 mb-2">assignment_turned_in</span>
              <p>No active audit cycle selected. Start a new cycle or select one from the history panel.</p>
            </div>

            <div id="audit-workspace-content">
              <div class="alert alert-info py-2 text-sm d-flex align-items-center gap-2 mb-3">
                <span class="material-symbols-outlined fs-5">info</span>
                <span>Select status, check condition, and record verified state for each item.</span>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                      <th>Tag</th>
                      <th>Asset Name</th>
                      <th>Location</th>
                      <th>Audit Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody style="font-size: 13px;" id="table-audit-assets-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
              
              <div class="d-flex justify-content-end mt-4 pt-3 border-top">
                <button class="btn btn-success rounded-pill px-4 shadow-sm" id="btn-complete-audit-cycle">Complete Audit Cycle</button>
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

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="audit-scope">Scope Department *</label>
                  <select class="form-select" id="audit-scope" required>
                    <option value="" disabled selected>Select Scope...</option>
                    ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="audit-date">Audit Scheduled Date *</label>
                  <input type="date" class="form-control" id="audit-date" required>
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

    let activeCycle = null;

    function renderAuditHistory() {
      const state = getState();
      const list = document.getElementById('audit-cycles-list');
      
      if (state.audits.length === 0) {
        list.innerHTML = `<div class="text-center py-4 text-muted small">No audit history.</div>`;
        return;
      }

      list.innerHTML = state.audits.map(a => {
        let badgeColor = 'bg-secondary';
        if (a.status === 'IN_PROGRESS') {
          badgeColor = 'bg-primary';
          activeCycle = a;
        } else if (a.status === 'COMPLETED') {
          badgeColor = 'bg-success';
        }

        return `
          <div class="border rounded p-3 fade-in-el bg-light bg-opacity-25 shadow-xs">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge ${badgeColor} rounded" style="font-size: 10px;">${a.status}</span>
              <small class="text-muted" style="font-size: 11px;">${a.date}</small>
            </div>
            <strong class="text-dark d-block text-truncate" style="font-size: 14px;">${a.name}</strong>
            <small class="text-muted">Scope: ${a.scope}</small>
            ${a.status === 'IN_PROGRESS' 
              ? `<div class="mt-2"><button class="btn btn-xs btn-outline-primary py-0.5 px-3 fs-7 btn-select-audit d-none" data-id="${a.id}">Select</button></div>` 
              : ''
            }
          </div>
        `;
      }).join('');
    }

    function renderWorkspace() {
      const state = getState();
      const workspacePlaceholder = document.getElementById('audit-workspace-placeholder');
      const workspaceContent = document.getElementById('audit-workspace-content');
      const badge = document.getElementById('workspace-audit-badge');

      if (!activeCycle) {
        workspacePlaceholder.classList.remove('d-none');
        workspaceContent.classList.add('d-none');
        badge.innerText = 'No Active Audit';
        badge.className = 'badge bg-secondary px-3 py-1.5 rounded';
        return;
      }

      workspacePlaceholder.classList.add('d-none');
      workspaceContent.classList.remove('d-none');
      badge.innerText = `Active: ${activeCycle.scope}`;
      badge.className = 'badge bg-primary px-3 py-1.5 rounded';

      // Load assets matching the audit scope
      // We will match the scope string to the department name
      const targetDept = state.departments.find(d => d.name === activeCycle.scope);
      const targetDeptId = targetDept ? targetDept.id : -1;
      
      const scopedAssets = state.assets.filter(a => a.departmentId === targetDeptId);
      const tbody = document.getElementById('table-audit-assets-body');

      if (scopedAssets.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">No assets found in the scoped department "${activeCycle.scope}".</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = scopedAssets.map(asset => {
        // Check if verified already in activeCycle.findings
        const isVerified = activeCycle.findings && activeCycle.findings.includes(asset.id);

        return `
          <tr class="${isVerified ? 'table-success opacity-75' : ''} fade-in-el">
            <td class="fw-semibold text-primary py-3">${asset.tag}</td>
            <td class="fw-bold text-dark">${asset.name}</td>
            <td>${asset.location || 'N/A'}</td>
            <td>
              ${isVerified ? `
                <span class="text-success fw-bold d-flex align-items-center gap-1">
                  <span class="material-symbols-outlined fs-5">check_circle</span> Verified
                </span>
              ` : `
                <div class="row g-2">
                  <div class="col-6">
                    <select class="form-select form-select-sm border-light-subtle" id="verify-cond-${asset.id}">
                      <option value="NEW" ${asset.condition === 'NEW' ? 'selected' : ''}>New</option>
                      <option value="GOOD" ${asset.condition === 'GOOD' ? 'selected' : ''}>Good</option>
                      <option value="FAIR" ${asset.condition === 'FAIR' ? 'selected' : ''}>Fair</option>
                      <option value="POOR" ${asset.condition === 'POOR' ? 'selected' : ''}>Poor</option>
                      <option value="DAMAGED" ${asset.condition === 'DAMAGED' ? 'selected' : ''}>Damaged</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <select class="form-select form-select-sm border-light-subtle" id="verify-status-${asset.id}">
                      <option value="AVAILABLE" ${asset.status === 'AVAILABLE' ? 'selected' : ''}>Available</option>
                      <option value="ALLOCATED" ${asset.status === 'ALLOCATED' ? 'selected' : ''}>Allocated</option>
                      <option value="LOST" ${asset.status === 'LOST' ? 'selected' : ''}>Lost</option>
                    </select>
                  </div>
                </div>
              `}
            </td>
            <td>
              ${isVerified 
                ? '<span class="text-muted small">-</span>' 
                : `<button class="btn btn-sm btn-primary px-3 py-1 btn-verify-asset" data-id="${asset.id}">Verify</button>`
              }
            </td>
          </tr>
        `;
      }).join('');

      // Bind verify actions
      document.querySelectorAll('.btn-verify-asset').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const assetId = parseInt(e.target.getAttribute('data-id'), 10);
          const condition = document.getElementById(`verify-cond-${assetId}`).value;
          const status = document.getElementById(`verify-status-${assetId}`).value;

          const state = getState();
          
          // Add finding
          const audit = state.audits.find(a => a.id === activeCycle.id);
          if (audit) {
            if (!audit.findings) audit.findings = [];
            if (!audit.findings.includes(assetId)) {
              audit.findings.push(assetId);
            }
          }

          // Update asset status/condition
          const asset = state.assets.find(a => a.id === assetId);
          if (asset) {
            asset.condition = condition;
            asset.status = status;
          }

          saveState(state);
          logActivity(`Audited and verified asset condition: ${asset ? asset.tag : 'ID ' + assetId}`, 'AUDIT');
          
          // Re-render
          activeCycle = state.audits.find(a => a.id === activeCycle.id);
          renderWorkspace();
        });
      });
    }

    // Complete audit cycle action
    const btnCompleteCycle = document.getElementById('btn-complete-audit-cycle');
    if (btnCompleteCycle) {
      btnCompleteCycle.addEventListener('click', () => {
        if (!activeCycle) return;
        if (confirm('Complete compliance audit cycle? This will lock all verified findings.')) {
          const state = getState();
          const audit = state.audits.find(a => a.id === activeCycle.id);
          if (audit) {
            audit.status = 'COMPLETED';
            saveState(state);
            logActivity(`Compliance audit cycle locked & completed: ${audit.name}`, 'AUDIT');
            activeCycle = null;
            router.navigateTo('/audit');
            alert('Audit cycle completed successfully!');
          }
        }
      });
    }

    // Create Audit Form Submit
    const formAudit = document.getElementById('form-create-audit');
    if (formAudit) {
      formAudit.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('audit-name').value.trim();
        const scopeId = parseInt(document.getElementById('audit-scope').value, 10);
        const date = document.getElementById('audit-date').value;

        if (!name || isNaN(scopeId) || !date) {
          alert('Please fill out all required fields.');
          return;
        }

        const state = getState();

        // Enforce only one active cycle at a time
        if (state.audits.some(a => a.status === 'IN_PROGRESS')) {
          alert('Initiation Blocked: A compliance audit cycle is currently active. Complete it before starting a new one.');
          return;
        }

        const dept = state.departments.find(d => d.id === scopeId);
        const scope = dept ? dept.name : 'Unknown';

        const newAudit = {
          id: state.audits.length + 1,
          name,
          scope,
          date,
          status: 'IN_PROGRESS',
          findings: []
        };

        state.audits.push(newAudit);
        saveState(state);
        logActivity(`Initiated compliance audit cycle: ${name}`, 'AUDIT');

        // Reset
        formAudit.reset();
        const modalEl = document.getElementById('modal-create-audit');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        router.navigateTo('/audit');
        alert('Audit cycle initiated successfully!');
      });
    }

    // Initial renders
    renderAuditHistory();
    renderWorkspace();
  }
};
