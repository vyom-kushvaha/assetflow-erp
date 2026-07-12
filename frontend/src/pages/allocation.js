import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import * as bootstrap from 'bootstrap';

export const AllocationPage = {
  render() {
    // Read authenticated user details to check authorizations
    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error(e);
    }

    const canApprove = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER' || user.role === 'DEPT_HEAD';
    const canAllocate = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER';

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Allocations & Transfers</h2>
          <p class="text-muted m-0 small">Track physical asset ownership, handovers, and transfer requests.</p>
        </div>
        ${canAllocate ? `
          <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-allocate-asset">
            <span class="material-symbols-outlined fs-5">assignment_ind</span>
            <span>Allocate Asset</span>
          </button>
        ` : ''}
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
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">Loading allocations logs...</td>
                  </tr>
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
              <div class="text-center py-4 text-muted small">Loading transfer requests...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Full History -->
      <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white mt-4">
        <h4 class="h5 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span>
          <span>Full Allocations & Handover History</span>
        </h4>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr style="font-size: 11px;" class="text-muted uppercase fw-bold">
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Assigned To</th>
                <th>Allocation Date</th>
                <th>Return / Handover Date</th>
                <th>Status</th>
                <th>Return Condition Notes</th>
              </tr>
            </thead>
            <tbody style="font-size: 13.5px;" id="allocations-history-table-body">
              <tr>
                <td colspan="7" class="text-center py-4 text-muted">Loading history...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Allocate Asset Modal -->
      ${canAllocate ? `
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
                    <!-- Populated dynamically -->
                  </select>
                  <div class="form-text text-success d-flex align-items-center gap-1 mt-1">
                    <span class="material-symbols-outlined fs-6">lock_open</span>
                    <span>Constraint checked: Only AVAILABLE assets can be allocated.</span>
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
                      <!-- Populated dynamically -->
                    </select>
                  </div>

                  <!-- Select Department (Hidden initially) -->
                  <div id="alloc-target-dept-container" class="d-none">
                    <select class="form-select" id="alloc-target-dept">
                      <option value="" disabled selected>Select Department</option>
                      <!-- Populated dynamically -->
                    </select>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="alloc-return-date">Expected Return Date</label>
                  <input type="date" class="form-control" id="alloc-return-date">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="alloc-notes">Allocation Notes</label>
                  <textarea class="form-control" id="alloc-notes" rows="2" placeholder="e.g. Allocated for client presentation assignment."></textarea>
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
      ` : ''}

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
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Transfer Target *</label>
                  <select class="form-select" id="trans-target-user" required>
                    <option value="" disabled selected>Select Employee</option>
                    <!-- Populated dynamically -->
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

      <!-- Return Asset Dialog Modal -->
      <div class="modal fade" id="modal-return-asset" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title fw-bold">Return Asset to Warehouse</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-return-asset">
                <input type="hidden" id="return-alloc-id" />
                <input type="hidden" id="return-asset-id" />
                
                <div class="mb-3">
                  <p class="text-muted" id="return-confirm-text">Are you sure you want to close this allocation and return the asset?</p>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="return-condition-notes">Asset Condition Wear / Return Notes</label>
                  <textarea class="form-control" id="return-condition-notes" rows="3" placeholder="Returned in good shape. Normal wear." required></textarea>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-danger px-4">Confirm Return</button>
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

    // Move modals to body to prevent stacking context backdrop overlay bugs
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
      document.body.style.paddingRight = '';
    }

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

    let assets = [];
    let employees = [];
    let departments = [];
    let allocations = [];
    let transfers = [];

    async function loadData() {
      try {
        // Fetch Assets
        const resAssets = await fetch('/api/assets');
        if (resAssets.ok) {
          const data = await resAssets.json();
          assets = data.assets || [];
        }

        // Fetch Employees
        const resEmp = await fetch('/api/org/employees');
        if (resEmp.ok) {
          const data = await resEmp.json();
          employees = data.employees || [];
        }

        // Fetch Departments
        const resDepts = await fetch('/api/org/departments');
        if (resDepts.ok) {
          const data = await resDepts.json();
          departments = data.departments || [];
        }

        // Fetch Allocations
        const resAllocs = await fetch('/api/allocations');
        if (resAllocs.ok) {
          const data = await resAllocs.json();
          allocations = data.allocations || [];
        }

        // Fetch Transfers
        const resTrans = await fetch('/api/transfers');
        if (resTrans.ok) {
          const data = await resTrans.json();
          transfers = data.transfers || [];
        }

        populateSelectors();
        renderAllocationsTable();
        renderTransfersList();
        renderAllocationsHistoryTable();
      } catch (err) {
        console.error('Failed to load allocations data', err);
      }
    }

    function populateSelectors() {
      // 1. Available Assets for allocation
      const allocAssetSelect = document.getElementById('alloc-asset');
      if (allocAssetSelect) {
        const available = assets.filter(a => a.status === 'AVAILABLE');
        allocAssetSelect.innerHTML = '<option value="" disabled selected>Select Available Asset</option>' +
          available.map(a => `<option value="${a.id}">${a.asset_tag} - ${a.name}</option>`).join('');
      }

      // 2. Employees target selector
      const allocTargetUserSelect = document.getElementById('alloc-target-user');
      if (allocTargetUserSelect) {
        allocTargetUserSelect.innerHTML = '<option value="" disabled selected>Select Employee</option>' +
          employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('');
      }

      const transTargetUserSelect = document.getElementById('trans-target-user');
      if (transTargetUserSelect) {
        transTargetUserSelect.innerHTML = '<option value="" disabled selected>Select Employee</option>' +
          employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('');
      }

      // 3. Departments target selector
      const allocTargetDeptSelect = document.getElementById('alloc-target-dept');
      if (allocTargetDeptSelect) {
        allocTargetDeptSelect.innerHTML = '<option value="" disabled selected>Select Department</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }

      // 4. Allocated Assets for transfers
      const transAssetSelect = document.getElementById('trans-asset');
      if (transAssetSelect) {
        const allocated = assets.filter(a => a.status === 'ALLOCATED');
        transAssetSelect.innerHTML = '<option value="" disabled selected>Select Asset</option>' +
          allocated.map(a => `<option value="${a.id}">${a.asset_tag} - ${a.name}</option>`).join('');
      }
    }

    function renderAllocationsTable() {
      const tbody = document.getElementById('allocations-table-body');
      if (!tbody) return;

      const activeAllocs = allocations.filter(al => al.status === 'ACTIVE');

      if (activeAllocs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No active allocations found in the ERP system.</td></tr>`;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tbody.innerHTML = activeAllocs.map(al => {
        const assignedTo = al.user_name || `${al.department_name} (Dept)` || 'N/A';
        
        let returnDisplay = al.expected_return_date || '<span class="text-muted small">No deadline</span>';
        
        // Overdue detection: expected_return_date < Today
        if (al.expected_return_date) {
          const expected = new Date(al.expected_return_date);
          if (expected < today) {
            returnDisplay = `<span class="text-danger fw-bold d-flex align-items-center gap-1">
              <span>${al.expected_return_date}</span>
              <span class="badge bg-danger rounded-pill px-2.5" style="font-size: 10px;">OVERDUE</span>
            </span>`;
          }
        }

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${al.asset_tag}</td>
            <td class="fw-bold text-dark">${al.asset_name}</td>
            <td>${assignedTo}</td>
            <td>${al.allocation_date}</td>
            <td>${returnDisplay}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger btn-return-trigger" data-id="${al.id}" data-asset-id="${al.asset_id}" data-tag="${al.asset_tag}" data-name="${al.asset_name}">Return</button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind return triggers
      document.querySelectorAll('.btn-return-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
          const allocId = btn.getAttribute('data-id');
          const assetId = btn.getAttribute('data-asset-id');
          const tag = btn.getAttribute('data-tag');
          const name = btn.getAttribute('data-name');

          document.getElementById('return-alloc-id').value = allocId;
          document.getElementById('return-asset-id').value = assetId;
          document.getElementById('return-confirm-text').innerHTML = `Are you sure you want to close allocation for asset <strong>${tag} - ${name}</strong> and return it back to storage?`;
          document.getElementById('return-condition-notes').value = '';

          const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-return-asset'));
          modal.show();
        });
      });
    }

    function renderAllocationsHistoryTable() {
      const tbody = document.getElementById('allocations-history-table-body');
      if (!tbody) return;

      if (allocations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No allocation history found.</td></tr>`;
        return;
      }

      tbody.innerHTML = allocations.map(al => {
        const assignedTo = al.user_name || (al.department_name ? `${al.department_name} (Dept)` : '') || 'N/A';
        
        let statusBadge = 'bg-secondary';
        let returnDateText = al.actual_return_date || '-';

        if (al.status === 'ACTIVE') {
          statusBadge = 'bg-primary';
        } else if (al.status === 'RETURNED') {
          statusBadge = 'bg-success';
        } else if (al.status === 'TRANSFERRED') {
          statusBadge = 'bg-info text-dark';
          returnDateText = 'Transferred';
        }

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${al.asset_tag}</td>
            <td class="fw-bold text-dark">${al.asset_name}</td>
            <td>${assignedTo}</td>
            <td>${al.allocation_date}</td>
            <td>${returnDateText}</td>
            <td><span class="badge ${statusBadge} px-2 py-1 rounded">${al.status}</span></td>
            <td><span class="text-muted small">${al.return_condition_notes || '-'}</span></td>
          </tr>
        `;
      }).join('');
    }

    function renderTransfersList() {
      const container = document.getElementById('transfers-container');
      if (!container) return;

      const pendingTrans = transfers.filter(t => t.status === 'REQUESTED');

      if (pendingTrans.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted small">No pending handover transfer requests.</div>`;
        return;
      }

      // Check current user role to show approve/reject permissions
      let user = { role: 'EMPLOYEE' };
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) user = JSON.parse(savedUser);
      } catch (e) {}

      const canApprove = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER' || user.role === 'DEPT_HEAD';

      container.innerHTML = pendingTrans.map(t => {
        const targetHolder = t.target_user_name || `${t.target_department_name} (Dept)` || 'N/A';
        return `
          <div class="border rounded p-3 fade-in-el bg-light bg-opacity-25 shadow-xs">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge text-bg-warning text-dark small" style="font-size: 10px;">Pending Transfer</span>
              <span class="text-muted small" style="font-size: 11px;">#T-${t.id}</span>
            </div>
            <strong class="text-dark d-block" style="font-size: 14px;">${t.asset_tag} - ${t.asset_name}</strong>
            <p class="text-muted small mb-2 mt-1" style="font-size: 13px;">
              Handover from <strong>${t.requester_name}</strong> to <strong>${targetHolder}</strong>.<br>
              <span class="fst-italic text-secondary">" ${t.reason} "</span>
            </p>
            ${canApprove ? `
              <div class="d-flex gap-2">
                <button class="btn btn-xs btn-primary py-1 px-3 fs-7 btn-approve-transfer" data-id="${t.id}">Approve</button>
                <button class="btn btn-xs btn-outline-danger py-1 px-3 fs-7 btn-reject-transfer" data-id="${t.id}">Reject</button>
              </div>
            ` : `
              <span class="text-muted fs-8 fst-italic">Waiting for approval.</span>
            `}
          </div>
        `;
      }).join('');

      // Bind approve/reject buttons
      document.querySelectorAll('.btn-approve-transfer').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Approve asset handover and update active allocation record?')) {
            try {
              const res = await fetch(`/api/transfers/${id}/approve`, { method: 'POST' });
              if (res.ok) {
                alert('Transfer approved successfully!');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Approval failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection error');
            }
          }
        });
      });

      document.querySelectorAll('.btn-reject-transfer').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Reject this handover request?')) {
            try {
              const res = await fetch(`/api/transfers/${id}/reject`, { method: 'POST' });
              if (res.ok) {
                alert('Transfer request rejected.');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Rejection failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection error');
            }
          }
        });
      });
    }

    // Bind Forms Submission
    // 1. Allocate Asset
    const formAllocate = document.getElementById('form-allocate-asset');
    if (formAllocate) {
      formAllocate.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const assetId = document.getElementById('alloc-asset').value;
        const returnDate = document.getElementById('alloc-return-date').value;
        const targetType = document.querySelector('input[name="alloc-target-type"]:checked').value;
        const notes = document.getElementById('alloc-notes').value.trim();

        let allocatedToUserId = null;
        let allocatedToDepartmentId = null;

        if (targetType === 'USER') {
          allocatedToUserId = document.getElementById('alloc-target-user').value;
          if (!allocatedToUserId) {
            alert('Please select an employee.');
            return;
          }
        } else {
          allocatedToDepartmentId = document.getElementById('alloc-target-dept').value;
          if (!allocatedToDepartmentId) {
            alert('Please select a department.');
            return;
          }
        }

        try {
          const res = await fetch('/api/allocations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId,
              allocatedToUserId: allocatedToUserId || null,
              allocatedToDepartmentId: allocatedToDepartmentId || null,
              expectedReturnDate: returnDate || null,
              notes: notes || null
            })
          });

          const data = await res.json();

          if (res.ok) {
            alert('Asset allocated successfully!');
            formAllocate.reset();

            dismissModal('modal-allocate-asset');

            loadData();
          } else {
            // Handle double allocation block: offer transfer request choice
            if (res.status === 400 && data.error.message.includes('Double Allocation Blocked')) {
              if (confirm(`${data.error.message}\n\nWould you like to open the Transfer Request form instead?`)) {
                // Dismiss Allocation Modal
                dismissModal('modal-allocate-asset');

                // Open Transfer Modal with prepopulated Asset
                setTimeout(() => {
                  const transSelect = document.getElementById('trans-asset');
                  if (transSelect) transSelect.value = assetId;

                  const transModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-request-transfer'));
                  transModal.show();
                }, 400);
              }
            } else {
              alert(data.error ? data.error.message : 'Allocation failed.');
            }
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // 2. Request Transfer
    const formTransfer = document.getElementById('form-request-transfer');
    if (formTransfer) {
      formTransfer.addEventListener('submit', async (e) => {
        e.preventDefault();

        const assetId = document.getElementById('trans-asset').value;
        const targetUserId = document.getElementById('trans-target-user').value;
        const reason = document.getElementById('trans-reason').value.trim();

        if (!assetId || !targetUserId || !reason) {
          alert('Please fill out all required fields.');
          return;
        }

        try {
          const res = await fetch('/api/transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId,
              requestedToUserId: targetUserId,
              reason
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Handover transfer request logged successfully!');
            formTransfer.reset();

            dismissModal('modal-request-transfer');

            loadData();
          } else {
            alert(data.error ? data.error.message : 'Handover request failed.');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // 3. Confirm Asset Return
    const formReturn = document.getElementById('form-return-asset');
    if (formReturn) {
      formReturn.addEventListener('submit', async (e) => {
        e.preventDefault();

        const allocId = document.getElementById('return-alloc-id').value;
        const notes = document.getElementById('return-condition-notes').value.trim();

        try {
          const res = await fetch(`/api/allocations/${allocId}/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              returnConditionNotes: notes
            })
          });

          if (res.ok) {
            alert('Asset returned successfully!');
            
            dismissModal('modal-return-asset');

            loadData();
          } else {
            const data = await res.json();
            alert(data.error ? data.error.message : 'Return closeout failed.');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    loadData();
  }
};
