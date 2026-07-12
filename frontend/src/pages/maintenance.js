import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const MaintenancePage = {
  render() {
    const state = getState();
    const assets = state.assets;
    const employees = state.employees;

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody style="font-size: 14px;" id="maintenance-table-body">
              <!-- Dynamically populated -->
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
                    ${assets.map(a => `<option value="${a.id}">${a.tag} - ${a.name} [Cond: ${a.condition}]</option>`).join('')}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="ticket-user">Reported By *</label>
                  <select class="form-select" id="ticket-user" required>
                    <option value="" disabled selected>Select Employee Profile</option>
                    ${employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('')}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="ticket-priority">Priority *</label>
                  <select class="form-select" id="ticket-priority" required>
                    <option value="LOW">LOW - Non critical wear</option>
                    <option value="MEDIUM" selected>MEDIUM - Impeded operations</option>
                    <option value="HIGH">HIGH - Total failure</option>
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

    function renderMaintenanceList() {
      const state = getState();
      const logs = state.maintenance;
      const assets = state.assets;

      const tbody = document.getElementById('maintenance-table-body');
      if (logs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">No maintenance logs found.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = logs.map(l => {
        const asset = assets.find(a => a.id === l.assetId);
        const assetTag = asset ? asset.tag : 'N/A';
        const assetName = asset ? asset.name : 'Unknown';

        let priorityBadge = 'text-bg-light';
        if (l.priority === 'HIGH') priorityBadge = 'bg-danger-subtle text-danger';
        else if (l.priority === 'MEDIUM') priorityBadge = 'bg-warning-subtle text-warning-emphasis';

        let statusBadge = 'bg-secondary';
        if (l.status === 'PENDING') statusBadge = 'bg-info text-dark';
        else if (l.status === 'APPROVED') statusBadge = 'bg-primary text-white';
        else if (l.status === 'COMPLETED') statusBadge = 'bg-success text-white';
        else if (l.status === 'REJECTED') statusBadge = 'bg-danger text-white';

        let actionHtml = '-';
        if (l.status === 'PENDING') {
          actionHtml = `
            <div class="d-flex gap-1">
              <button class="btn btn-xs btn-primary px-2 py-1 fs-7 btn-approve-ticket" data-id="${l.id}" data-asset-id="${l.assetId}">Approve</button>
              <button class="btn btn-xs btn-outline-danger px-2 py-1 fs-7 btn-reject-ticket" data-id="${l.id}">Reject</button>
            </div>
          `;
        } else if (l.status === 'APPROVED') {
          actionHtml = `
            <button class="btn btn-xs btn-success px-2 py-1 fs-7 btn-complete-ticket" data-id="${l.id}" data-asset-id="${l.assetId}">Mark Completed</button>
          `;
        }

        return `
          <tr class="fade-in-el">
            <td>#TCK-${l.id}</td>
            <td class="fw-semibold text-primary">${assetTag}</td>
            <td class="fw-bold text-dark">${assetName}</td>
            <td><span class="badge ${priorityBadge} px-2.5 py-1">${l.priority}</span></td>
            <td>${l.issue}</td>
            <td><span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${l.status}</span></td>
            <td>${actionHtml}</td>
          </tr>
        `;
      }).join('');

      // Bind actions
      document.querySelectorAll('.btn-approve-ticket').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ticketId = parseInt(e.target.getAttribute('data-id'), 10);
          const assetId = parseInt(e.target.getAttribute('data-asset-id'), 10);

          if (confirm('Approve maintenance schedule? This will set the asset status to UNDER_MAINTENANCE.')) {
            const state = getState();
            
            // Set ticket status
            const ticket = state.maintenance.find(m => m.id === ticketId);
            if (ticket) {
              ticket.status = 'APPROVED';
              ticket.approvedBy = 1; // Default Admin
            }

            // Set asset status to UNDER_MAINTENANCE
            const asset = state.assets.find(a => a.id === assetId);
            if (asset) {
              asset.status = 'UNDER_MAINTENANCE';
            }

            saveState(state);
            logActivity(`Approved maintenance ticket #TCK-${ticketId} for asset: ${asset ? asset.tag : 'ID ' + assetId}`, 'MAINTENANCE');
            router.navigateTo('/maintenance');
          }
        });
      });

      document.querySelectorAll('.btn-reject-ticket').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ticketId = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('Reject this repair ticket?')) {
            const state = getState();
            const ticket = state.maintenance.find(m => m.id === ticketId);
            if (ticket) {
              ticket.status = 'REJECTED';
              saveState(state);
              logActivity(`Rejected maintenance ticket #TCK-${ticketId}`, 'MAINTENANCE');
              router.navigateTo('/maintenance');
            }
          }
        });
      });

      document.querySelectorAll('.btn-complete-ticket').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ticketId = parseInt(e.target.getAttribute('data-id'), 10);
          const assetId = parseInt(e.target.getAttribute('data-asset-id'), 10);

          const costStr = prompt('Enter repair cost logged (INR):', '500');
          if (costStr !== null) {
            const cost = parseFloat(costStr) || 0;
            const state = getState();
            
            // Complete ticket
            const ticket = state.maintenance.find(m => m.id === ticketId);
            if (ticket) {
              ticket.status = 'COMPLETED';
              ticket.cost = cost;
            }

            // Revert asset status back to AVAILABLE
            const asset = state.assets.find(a => a.id === assetId);
            if (asset) {
              asset.status = 'AVAILABLE';
            }

            saveState(state);
            logActivity(`Completed repairs on asset ${asset ? asset.tag : 'ID ' + assetId} (Cost: INR ${cost})`, 'MAINTENANCE');
            router.navigateTo('/maintenance');
            alert('Repairs registered and asset set back to Available status!');
          }
        });
      });
    }

    // Handle Form Submit
    const formRaiseTicket = document.getElementById('form-raise-ticket');
    if (formRaiseTicket) {
      formRaiseTicket.addEventListener('submit', (e) => {
        e.preventDefault();

        const assetId = parseInt(document.getElementById('ticket-asset').value, 10);
        const raisedBy = parseInt(document.getElementById('ticket-user').value, 10);
        const priority = document.getElementById('ticket-priority').value;
        const issue = document.getElementById('ticket-issue').value.trim();

        if (isNaN(assetId) || isNaN(raisedBy) || !priority || !issue) {
          alert('Please fill out all required fields.');
          return;
        }

        const state = getState();
        const newTicket = {
          id: state.maintenance.length + 1,
          assetId,
          raisedBy,
          issue,
          priority,
          status: 'PENDING',
          approvedBy: null
        };

        state.maintenance.push(newTicket);
        saveState(state);
        logActivity(`Logged repair ticket for asset ID: ${assetId} (${priority})`, 'MAINTENANCE');

        // Reset and close
        formRaiseTicket.reset();
        const modalEl = document.getElementById('modal-raise-ticket');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        router.navigateTo('/maintenance');
        alert('Repair ticket raised successfully!');
      });
    }

    renderMaintenanceList();
  }
};
