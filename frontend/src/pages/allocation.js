import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const AllocationPage = {
  render() {
    const state = getState();
    
    // Get available assets (AVAILABLE status) for the selector
    const availableAssets = state.assets.filter(a => a.status === 'AVAILABLE');
    const employees = state.employees;
    const departments = state.departments;

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Allocations & Transfers</h2>
          <p class="text-muted m-0 small">Track physical asset ownership, handovers, and transfer requests.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-allocate-asset">
          <span class="material-symbols-outlined fs-5">assignment_ind</span>
          <span>Allocate Asset</span>
        </button>
      </div>

      <div class="row g-4">
        <!-- Left: Allocations Table -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Active Allocations</h4>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th scope="col">Asset Tag</th>
                    <th scope="col">Asset Name</th>
                    <th scope="col">Assigned To</th>
                    <th scope="col">Allocation Date</th>
                    <th scope="col">Expected Return</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;" id="allocations-table-body">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Transfer Requests -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Handovers / Transfers</h4>
              <button class="btn btn-sm btn-outline-secondary rounded-pill" data-bs-toggle="modal" data-bs-target="#modal-request-transfer">New Request</button>
            </div>
            
            <div class="d-flex flex-column gap-3" id="transfers-container">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>

      <!-- Allocate Asset Modal -->
      <div class="modal fade" id="modal-allocate-asset" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Allocate Asset</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-allocate-asset">
                <div class="mb-3">
                  <label class="form-label fw-semibold" for="alloc-asset">Select Asset *</label>
                  <select class="form-select" id="alloc-asset" required>
                    <option value="" disabled selected>Select Available Asset</option>
                    ${availableAssets.map(a => `<option value="${a.id}">${a.tag} - ${a.name}</option>`).join('')}
                  </select>
                  <div class="form-text text-success d-flex align-items-center gap-1 mt-1">
                    <span class="material-symbols-outlined fs-6">lock_open</span>
                    <span>Constraint checked: Only unallocated assets are listed.</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Allocation Target *</label>
                  <div class="d-flex gap-4 mb-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="alloc-target-type" id="target-user" value="USER" checked>
                      <label class="form-check-label" for="target-user">Employee</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="alloc-target-type" id="target-dept" value="DEPT">
                      <label class="form-check-label" for="target-dept">Department</label>
                    </div>
                  </div>

                  <!-- Select User -->
                  <div id="alloc-target-user-container">
                    <select class="form-select" id="alloc-target-user">
                      <option value="" disabled selected>Select Employee</option>
                      ${employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('')}
                    </select>
                  </div>

                  <!-- Select Department (Hidden initially) -->
                  <div id="alloc-target-dept-container" class="d-none">
                    <select class="form-select" id="alloc-target-dept">
                      <option value="" disabled selected>Select Department</option>
                      ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="alloc-return-date">Expected Return Date</label>
                  <input type="date" class="form-control" id="alloc-return-date">
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Allocate Asset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Transfer Modal -->
      <div class="modal fade" id="modal-request-transfer" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-secondary text-white">
              <h5 class="modal-title fw-bold">Request Handover / Transfer</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-request-transfer">
                <div class="mb-3">
                  <label class="form-label fw-semibold" for="trans-asset">Select Allocated Asset *</label>
                  <select class="form-select" id="trans-asset" required>
                    <option value="" disabled selected>Select Asset</option>
                    <!-- Populated dynamically via JS -->
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Transfer Target *</label>
                  <select class="form-select" id="trans-target-user" required>
                    <option value="" disabled selected>Select Employee</option>
                    ${employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('')}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="trans-reason">Reason for Transfer *</label>
                  <textarea class="form-control" id="trans-reason" rows="3" placeholder="Explain why the asset needs transfer..." required></textarea>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-secondary bg-secondary px-4">Request Transfer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/allocation');
  },

  onMount(router) {
    bindLayoutEvents(router);

    // Toggle target selection in allocation modal
    const radioUser = document.getElementById('target-user');
    const radioDept = document.getElementById('target-dept');
    const targetUserContainer = document.getElementById('alloc-target-user-container');
    const targetDeptContainer = document.getElementById('alloc-target-dept-container');

    if (radioUser && radioDept) {
      const toggleContainers = () => {
        if (radioUser.checked) {
          targetUserContainer.classList.remove('d-none');
          targetDeptContainer.classList.add('d-none');
        } else {
          targetUserContainer.classList.add('d-none');
          targetDeptContainer.classList.remove('d-none');
        }
      };
      radioUser.addEventListener('change', toggleContainers);
      radioDept.addEventListener('change', toggleContainers);
    }

    // Dynamic rendering functions
    function renderAllocations() {
      const state = getState();
      const allocations = state.allocations.filter(al => al.status === 'ACTIVE');
      const assets = state.assets;
      const employees = state.employees;
      const departments = state.departments;

      const tbody = document.getElementById('allocations-table-body');
      if (allocations.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4 text-muted">No active allocations found in the ERP system.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = allocations.map(al => {
        const asset = assets.find(a => a.id === al.assetId);
        const assetName = asset ? asset.name : 'Unknown';
        const assetTag = asset ? asset.tag : 'N/A';

        let assignedTo = 'N/A';
        if (al.toUserId) {
          const emp = employees.find(e => e.id === al.toUserId);
          assignedTo = emp ? emp.name : `Employee ID: ${al.toUserId}`;
        } else if (al.toDeptId) {
          const dept = departments.find(d => d.id === al.toDeptId);
          assignedTo = dept ? `${dept.name} (Dept)` : `Dept ID: ${al.toDeptId}`;
        }

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${assetTag}</td>
            <td class="fw-bold text-dark">${assetName}</td>
            <td>${assignedTo}</td>
            <td>${al.date}</td>
            <td>${al.expectedReturn || '<span class="text-muted small">No deadline</span>'}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger btn-return-asset" data-id="${al.id}" data-asset-id="${al.assetId}">Return</button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind return buttons
      const returnButtons = document.querySelectorAll('.btn-return-asset');
      returnButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const allocId = parseInt(e.target.getAttribute('data-id'), 10);
          const assetId = parseInt(e.target.getAttribute('data-asset-id'), 10);
          
          if (confirm('Verify asset has been returned back to location warehouse?')) {
            const state = getState();
            
            // Mark allocation returned
            const alloc = state.allocations.find(al => al.id === allocId);
            if (alloc) {
              alloc.status = 'RETURNED';
              alloc.actualReturn = new Date().toISOString().split('T')[0];
            }

            // Set asset status to AVAILABLE
            const asset = state.assets.find(a => a.id === assetId);
            if (asset) {
              asset.status = 'AVAILABLE';
              asset.departmentId = null;
            }

            saveState(state);
            logActivity(`Returned asset: ${asset ? asset.tag : 'ID ' + assetId}`, 'ASSET');
            
            // Reload components
            router.navigateTo('/allocation');
          }
        });
      });
    }

    function renderTransfers() {
      const state = getState();
      const transfers = state.transfers;
      const assets = state.assets;
      const employees = state.employees;

      const container = document.getElementById('transfers-container');
      const pendingTrans = transfers.filter(t => t.status === 'REQUESTED');

      if (pendingTrans.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4 text-muted small">No pending handover transfer requests.</div>
        `;
        return;
      }

      container.innerHTML = pendingTrans.map(t => {
        const asset = assets.find(a => a.id === t.assetId);
        const assetTag = asset ? asset.tag : 'N/A';
        const assetName = asset ? asset.name : 'Unknown';
        
        const requester = employees.find(e => e.id === t.requestedBy);
        const requesterName = requester ? requester.name : 'User';

        const target = employees.find(e => e.id === t.requestedToUserId);
        const targetName = target ? target.name : 'User';

        return `
          <div class="border rounded p-3 fade-in-el bg-light bg-opacity-25">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge text-bg-warning text-dark small" style="font-size: 10px;">Pending Transfer</span>
              <span class="text-muted small" style="font-size: 11px;">#T-${t.id}</span>
            </div>
            <strong class="text-dark d-block" style="font-size: 14px;">${assetTag} - ${assetName}</strong>
            <p class="text-muted small mb-2 mt-1">
              Handover from <strong>${requesterName}</strong> to <strong>${targetName}</strong>.<br>
              <span class="fst-italic">" ${t.reason} "</span>
            </p>
            <div class="d-flex gap-2">
              <button class="btn btn-xs btn-primary py-1 px-3 fs-7 btn-approve-transfer" data-id="${t.id}">Approve</button>
              <button class="btn btn-xs btn-outline-danger py-1 px-3 fs-7 btn-reject-transfer" data-id="${t.id}">Reject</button>
            </div>
          </div>
        `;
      }).join('');

      // Bind action buttons
      document.querySelectorAll('.btn-approve-transfer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const transId = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('Approve asset handover and update active allocation record?')) {
            const state = getState();
            const transfer = state.transfers.find(t => t.id === transId);
            if (transfer) {
              transfer.status = 'COMPLETED';

              // Terminate old allocation
              const oldAlloc = state.allocations.find(al => al.id === transfer.fromAllocationId);
              if (oldAlloc) {
                oldAlloc.status = 'TRANSFERRED';
                oldAlloc.actualReturn = new Date().toISOString().split('T')[0];
              }

              // Create new allocation
              const newAlloc = {
                id: state.allocations.length + 1,
                assetId: transfer.assetId,
                toUserId: transfer.requestedToUserId,
                toDeptId: null,
                allocatedBy: 1, // Admin default
                date: new Date().toISOString().split('T')[0],
                expectedReturn: null,
                actualReturn: null,
                status: 'ACTIVE'
              };
              state.allocations.push(newAlloc);

              // Update asset details
              const asset = state.assets.find(a => a.id === transfer.assetId);
              if (asset) {
                const targetEmp = state.employees.find(e => e.id === transfer.requestedToUserId);
                asset.departmentId = targetEmp ? targetEmp.departmentId : null;
              }

              saveState(state);
              logActivity(`Approved handover of asset: ${asset ? asset.tag : 'ID ' + transfer.assetId}`, 'ASSET');
              router.navigateTo('/allocation');
            }
          }
        });
      });

      document.querySelectorAll('.btn-reject-transfer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const transId = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('Reject this handover request?')) {
            const state = getState();
            const transfer = state.transfers.find(t => t.id === transId);
            if (transfer) {
              transfer.status = 'REJECTED';
              saveState(state);
              logActivity(`Rejected handover request #T-${transId}`, 'ASSET');
              router.navigateTo('/allocation');
            }
          }
        });
      });
    }

    // Populate active assets selection for transfer modal
    function populateTransferAssetSelect() {
      const state = getState();
      const select = document.getElementById('trans-asset');
      if (!select) return;

      // Find assets allocated to the current user (e.g. James Henderson default, or filter allocated assets)
      const allocatedAssets = state.assets.filter(a => a.status === 'ALLOCATED');
      select.innerHTML = '<option value="" disabled selected>Select Allocated Asset</option>' +
        allocatedAssets.map(a => `<option value="${a.id}">${a.tag} - ${a.name}</option>`).join('');
    }

    // Bind Forms Submission
    const formAllocate = document.getElementById('form-allocate-asset');
    if (formAllocate) {
      formAllocate.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const assetId = parseInt(document.getElementById('alloc-asset').value, 10);
        const returnDate = document.getElementById('alloc-return-date').value;
        const targetType = document.querySelector('input[name="alloc-target-type"]:checked').value;

        let toUserId = null;
        let toDeptId = null;

        if (targetType === 'USER') {
          toUserId = parseInt(document.getElementById('alloc-target-user').value, 10);
          if (isNaN(toUserId)) {
            alert('Please select an employee.');
            return;
          }
        } else {
          toDeptId = parseInt(document.getElementById('alloc-target-dept').value, 10);
          if (isNaN(toDeptId)) {
            alert('Please select a department.');
            return;
          }
        }

        if (isNaN(assetId)) {
          alert('Please select an asset.');
          return;
        }

        const state = getState();

        // Safety double-allocation rule verification
        const asset = state.assets.find(a => a.id === assetId);
        if (!asset || asset.status !== 'AVAILABLE') {
          alert('Validation Error: This asset is currently not available for allocation.');
          return;
        }

        // Create new active allocation
        const newAlloc = {
          id: state.allocations.length + 1,
          assetId,
          toUserId,
          toDeptId,
          allocatedBy: 1, // Admin default
          date: new Date().toISOString().split('T')[0],
          expectedReturn: returnDate || null,
          actualReturn: null,
          status: 'ACTIVE'
        };

        // Update asset status
        asset.status = 'ALLOCATED';
        if (toUserId) {
          const emp = state.employees.find(e => e.id === toUserId);
          asset.departmentId = emp ? emp.departmentId : null;
        } else {
          asset.departmentId = toDeptId;
        }

        state.allocations.push(newAlloc);
        saveState(state);
        logActivity(`Allocated asset: ${asset.tag} to ${toUserId ? 'Employee' : 'Department'}`, 'ASSET');

        // Reset and close
        formAllocate.reset();
        const modalEl = document.getElementById('modal-allocate-asset');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        router.navigateTo('/allocation');
        alert('Asset allocated successfully!');
      });
    }

    const formTransfer = document.getElementById('form-request-transfer');
    if (formTransfer) {
      formTransfer.addEventListener('submit', (e) => {
        e.preventDefault();

        const assetId = parseInt(document.getElementById('trans-asset').value, 10);
        const targetUserId = parseInt(document.getElementById('trans-target-user').value, 10);
        const reason = document.getElementById('trans-reason').value.trim();

        if (isNaN(assetId) || isNaN(targetUserId) || !reason) {
          alert('Please fill out all required fields.');
          return;
        }

        const state = getState();

        // Get matching active allocation
        const activeAlloc = state.allocations.find(al => al.assetId === assetId && al.status === 'ACTIVE');
        if (!activeAlloc) {
          alert('Could not locate active allocation records for this asset.');
          return;
        }

        const newTransfer = {
          id: state.transfers.length + 1,
          assetId,
          fromAllocationId: activeAlloc.id,
          requestedBy: activeAlloc.toUserId || 1, // Current holder or admin
          requestedToUserId: targetUserId,
          requestedToDeptId: null,
          status: 'REQUESTED',
          reason
        };

        state.transfers.push(newTransfer);
        saveState(state);
        logActivity(`Requested asset transfer for asset ID: ${assetId}`, 'ASSET');

        // Reset and close
        formTransfer.reset();
        const modalEl = document.getElementById('modal-request-transfer');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        router.navigateTo('/allocation');
        alert('Handover request logged successfully!');
      });
    }

    // Initial renders
    renderAllocations();
    renderTransfers();
    populateTransferAssetSelect();
  }
};
