import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import * as bootstrap from 'bootstrap';

export const MaintenancePage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Maintenance Management</h2>
          <p class="text-muted m-0 small">Schedule repairs, track hardware faults, and log maintenance events.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-raise-ticket">
          <span class="material-symbols-outlined fs-5">build_circle</span>
          <span>Raise Repair Ticket</span>
        </button>
      </div>

      <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white mb-4">
        <h4 class="h5 fw-bold mb-3 text-dark">Active Maintenance Logs</h4>
        
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                <th>Ticket ID</th>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Priority</th>
                <th>Reported Fault</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody style="font-size: 14px;" id="maintenance-table-body">
              <tr>
                <td colspan="8" class="text-center py-4 text-muted">Loading active maintenance logs...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Raise Ticket Modal -->
      <div class="modal fade" id="modal-raise-ticket" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Raise Repair Ticket</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-raise-ticket">
                <div class="mb-3">
                  <label class="form-label fw-semibold" for="ticket-asset">Select Asset *</label>
                  <select class="form-select" id="ticket-asset" required>
                    <option value="" disabled selected>Select Asset...</option>
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="ticket-priority">Priority *</label>
                  <select class="form-select" id="ticket-priority" required>
                    <option value="LOW">LOW - Non critical wear</option>
                    <option value="MEDIUM" selected>MEDIUM - Impeded operations</option>
                    <option value="HIGH">HIGH - Total failure</option>
                    <option value="CRITICAL">CRITICAL - Business block</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="ticket-issue">Fault Description *</label>
                  <textarea class="form-control" id="ticket-issue" rows="3" placeholder="Describe the flickering bulb, screen crack, paper jams..." required></textarea>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Raise Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/maintenance');
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

    let assets = [];
    let requests = [];

    async function loadData() {
      try {
        // Fetch Assets
        const resAssets = await fetch('/api/assets');
        if (resAssets.ok) {
          const data = await resAssets.json();
          assets = data.assets || [];
        }

        // Fetch Maintenance Requests
        const resReq = await fetch('/api/maintenance');
        if (resReq.ok) {
          const data = await resReq.json();
          requests = data.requests || [];
        }

        populateSelectors();
        renderMaintenanceList();
      } catch (err) {
        console.error('Failed to load maintenance data', err);
      }
    }

    function populateSelectors() {
      // Allow raising tickets on any registered asset
      const ticketAssetSelect = document.getElementById('ticket-asset');
      if (ticketAssetSelect) {
        ticketAssetSelect.innerHTML = '<option value="" disabled selected>Select Asset...</option>' +
          assets.map(a => `<option value="${a.id}">${a.asset_tag} - ${a.name} [Cond: ${a.condition}]</option>`).join('');
      }
    }

    function renderMaintenanceList() {
      const tbody = document.getElementById('maintenance-table-body');
      if (!tbody) return;

      if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No maintenance logs found.</td></tr>`;
        return;
      }

      let user = { role: 'EMPLOYEE' };
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) user = JSON.parse(savedUser);
      } catch (e) {}

      const canManage = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER';

      tbody.innerHTML = requests.map(l => {
        let priorityBadge = 'text-bg-light';
        if (l.priority === 'HIGH' || l.priority === 'CRITICAL') priorityBadge = 'bg-danger-subtle text-danger';
        else if (l.priority === 'MEDIUM') priorityBadge = 'bg-warning-subtle text-warning-emphasis';

        let statusBadge = 'bg-secondary';
        if (l.status === 'PENDING') statusBadge = 'bg-info text-dark';
        else if (l.status === 'APPROVED') statusBadge = 'bg-primary text-white';
        else if (l.status === 'TECHNICIAN_ASSIGNED') statusBadge = 'bg-warning text-dark';
        else if (l.status === 'RESOLVED') statusBadge = 'bg-success text-white';
        else if (l.status === 'REJECTED') statusBadge = 'bg-danger text-white';

        let actionHtml = '-';

        if (canManage) {
          if (l.status === 'PENDING') {
            actionHtml = `
              <div class="d-flex gap-1">
                <button class="btn btn-xs btn-primary px-2 py-1 fs-7 btn-approve-ticket" data-id="${l.id}">Approve</button>
                <button class="btn btn-xs btn-outline-danger px-2 py-1 fs-7 btn-reject-ticket" data-id="${l.id}">Reject</button>
              </div>
            `;
          } else if (l.status === 'APPROVED') {
            actionHtml = `
              <button class="btn btn-xs btn-warning px-2 py-1 fs-7 btn-assign-tech" data-id="${l.id}">Assign Technician</button>
            `;
          } else if (l.status === 'TECHNICIAN_ASSIGNED') {
            actionHtml = `
              <button class="btn btn-xs btn-success px-2 py-1 fs-7 btn-resolve-ticket" data-id="${l.id}">Resolve Ticket</button>
            `;
          }
        } else {
          actionHtml = `<span class="text-muted small">Access restricted</span>`;
        }

        return `
          <tr class="fade-in-el">
            <td>#TCK-${l.id}</td>
            <td class="fw-semibold text-primary">${l.asset_tag}</td>
            <td class="fw-bold text-dark">${l.asset_name}</td>
            <td><span class="badge ${priorityBadge} px-2.5 py-1">${l.priority}</span></td>
            <td>${l.issue_description}</td>
            <td><span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${l.status}</span></td>
            <td><strong>${l.technician_name || '-'}</strong></td>
            <td>${actionHtml}</td>
          </tr>
        `;
      }).join('');

      // Bind Action handlers
      // 1. Approve
      document.querySelectorAll('.btn-approve-ticket').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Approve maintenance ticket? This sets the asset status to UNDER_MAINTENANCE.')) {
            try {
              const res = await fetch(`/api/maintenance/${id}/approve`, { method: 'POST' });
              if (res.ok) {
                alert('Request approved successfully!');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Approval failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });

      // 2. Reject
      document.querySelectorAll('.btn-reject-ticket').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const reason = prompt('Enter rejection reason:');
          if (reason !== null) {
            try {
              const res = await fetch(`/api/maintenance/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
              });
              if (res.ok) {
                alert('Request rejected.');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Rejection failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });

      // 3. Assign Tech
      document.querySelectorAll('.btn-assign-tech').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const technicianName = prompt('Enter technician name assigned to repairs:');
          if (technicianName) {
            try {
              const res = await fetch(`/api/maintenance/${id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ technicianName })
              });
              if (res.ok) {
                alert('Technician assigned successfully!');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Assignment failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });

      // 4. Resolve Ticket
      document.querySelectorAll('.btn-resolve-ticket').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const resolutionNotes = prompt('Enter repair closeout resolution notes:');
          if (resolutionNotes) {
            try {
              const res = await fetch(`/api/maintenance/${id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolutionNotes })
              });
              if (res.ok) {
                alert('Ticket resolved successfully! Asset status set back to Available.');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Resolution failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });
    }

    // Handle Form Submit
    const formRaiseTicket = document.getElementById('form-raise-ticket');
    if (formRaiseTicket) {
      formRaiseTicket.addEventListener('submit', async (e) => {
        e.preventDefault();

        const assetId = document.getElementById('ticket-asset').value;
        const priority = document.getElementById('ticket-priority').value;
        const issueDescription = document.getElementById('ticket-issue').value.trim();

        if (!assetId || !priority || !issueDescription) {
          alert('Please fill out all required fields.');
          return;
        }

        try {
          const res = await fetch('/api/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId,
              priority,
              issueDescription
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Repair ticket raised successfully!');
            formRaiseTicket.reset();

            dismissModal('modal-raise-ticket');
            loadData();
          } else {
            alert(data.error ? data.error.message : 'Failed to raise ticket.');
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
