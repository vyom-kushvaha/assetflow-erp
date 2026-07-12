import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import * as bootstrap from 'bootstrap';

export const AssetsPage = {
  render() {
    // Read authenticated user details to check write permissions
    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error(e);
    }

    const canWrite = user.role === 'ADMIN' || user.role === 'ASSET_MANAGER';

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Asset Directory</h2>
          <p class="text-muted m-0 small">Central registry of physical and digital infrastructure items.</p>
        </div>
        ${canWrite ? `
          <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-register-asset">
            <span class="material-symbols-outlined fs-5">add</span>
            <span>Register New Asset</span>
          </button>
        ` : ''}
      </div>

      <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white mb-4">
        <!-- Search and Filter Controls -->
        <div class="row g-3 mb-4">
          <div class="col-md-5">
            <div class="position-relative w-100">
              <span class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">search</span>
              <input class="form-control ps-5 border-light-subtle" type="text" id="search-assets" placeholder="Search by name, tag, serial number..." />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select border-light-subtle" id="filter-category">
              <option value="ALL">All Categories</option>
              <!-- Populated dynamically -->
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select border-light-subtle" id="filter-status">
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="RESERVED">Reserved</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="LOST">Lost</option>
              <option value="RETIRED">Retired</option>
              <option value="DISPOSED">Disposed</option>
            </select>
          </div>
          <div class="col-md-1 d-grid">
            <button class="btn btn-outline-secondary border-light-subtle" id="btn-reset-filters" title="Reset Filters">
              <span class="material-symbols-outlined fs-5">filter_alt_off</span>
            </button>
          </div>
        </div>

        <!-- Directory Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                <th scope="col">Tag</th>
                <th scope="col">Asset Name</th>
                <th scope="col">Category</th>
                <th scope="col">Department</th>
                <th scope="col">Location</th>
                <th scope="col">Condition</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody style="font-size: 14px;" id="assets-table-body">
              <tr>
                <td colspan="8" class="text-center py-4 text-muted">Loading assets directory...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Register Asset Modal (Admin/Manager Only) -->
      ${canWrite ? `
      <div class="modal fade" id="modal-register-asset" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Register New Enterprise Asset</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-register-asset" class="needs-validation" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-name">Asset Name *</label>
                    <input type="text" class="form-control" id="asset-name" placeholder="Dell Latitude Laptop" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-category">Category *</label>
                    <select class="form-select" id="asset-category" required>
                      <option value="" disabled selected>Select Category</option>
                      <!-- Populated dynamically -->
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-serial">Serial Number</label>
                    <input type="text" class="form-control" id="asset-serial" placeholder="SN-12345">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-qr">QR Code</label>
                    <input type="text" class="form-control" id="asset-qr" placeholder="QR-99881">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-location">Storage Location</label>
                    <input type="text" class="form-control" id="asset-location" placeholder="Floor 2, Wing A">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-cost">Acquisition Cost (INR)</label>
                    <input type="number" class="form-control" id="asset-cost" placeholder="25000">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-date">Acquisition Date</label>
                    <input type="date" class="form-control" id="asset-date">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-dept">Assign Department</label>
                    <select class="form-select" id="asset-dept">
                      <option value="">No Department (Available Pool)</option>
                      <!-- Populated dynamically -->
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-condition">Condition *</label>
                    <select class="form-select" id="asset-condition" required>
                      <option value="NEW">New</option>
                      <option value="GOOD" selected>Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="asset-bookable">
                      <label class="form-check-label fw-semibold" for="asset-bookable">Make asset bookable/reservable by employees (e.g. Space or Vehicles)</label>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Register Asset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Edit Asset Modal (Admin/Manager Only) -->
      ${canWrite ? `
      <div class="modal fade" id="modal-edit-asset" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-secondary text-white">
              <h5 class="modal-title fw-bold">Edit Enterprise Asset details</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-edit-asset">
                <input type="hidden" id="edit-asset-id">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-name">Asset Name *</label>
                    <input type="text" class="form-control" id="edit-asset-name" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-category">Category *</label>
                    <select class="form-select" id="edit-asset-category" required>
                      <!-- Populated dynamically -->
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-serial">Serial Number</label>
                    <input type="text" class="form-control" id="edit-asset-serial">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-qr">QR Code</label>
                    <input type="text" class="form-control" id="edit-asset-qr">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-location">Storage Location</label>
                    <input type="text" class="form-control" id="edit-asset-location">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-cost">Acquisition Cost (INR)</label>
                    <input type="number" class="form-control" id="edit-asset-cost">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-date">Acquisition Date</label>
                    <input type="date" class="form-control" id="edit-asset-date">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-dept">Assign Department</label>
                    <select class="form-select" id="edit-asset-dept">
                      <option value="">No Department (Available Pool)</option>
                      <!-- Populated dynamically -->
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-condition">Condition *</label>
                    <select class="form-select" id="edit-asset-condition" required>
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="edit-asset-status">Status *</label>
                    <select class="form-select" id="edit-asset-status" required>
                      <option value="AVAILABLE">Available</option>
                      <option value="ALLOCATED">Allocated</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      <option value="LOST">Lost</option>
                      <option value="RETIRED">Retired</option>
                      <option value="DISPOSED">Disposed</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="edit-asset-bookable">
                      <label class="form-check-label fw-semibold" for="edit-asset-bookable">Make asset bookable/reservable by employees</label>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-secondary bg-secondary px-4">Update Asset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Asset Details Modal (All Authenticated users) -->
      <div class="modal fade" id="modal-asset-details" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold" id="details-asset-tag">Asset Details</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4" id="details-modal-body">
              <!-- Dynamically populated via JS -->
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/assets');
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
    let categories = [];
    let departments = [];

    // Fetch lists
    async function loadData() {
      try {
        // Fetch Categories
        const resCats = await fetch('/api/org/categories');
        if (resCats.ok) {
          const data = await resCats.json();
          categories = data.categories || [];
        }

        // Fetch Departments
        const resDepts = await fetch('/api/org/departments');
        if (resDepts.ok) {
          const data = await resDepts.json();
          departments = data.departments || [];
        }

        // Fetch Assets
        const resAssets = await fetch('/api/assets');
        if (resAssets.ok) {
          const data = await resAssets.json();
          assets = data.assets || [];
        }

        populateFiltersAndSelectors();
        renderAssetsTable();
      } catch (err) {
        console.error('Failed to load assets data', err);
      }
    }

    function populateFiltersAndSelectors() {
      // Filters
      const filterCat = document.getElementById('filter-category');
      if (filterCat) {
        filterCat.innerHTML = '<option value="ALL">All Categories</option>' +
          categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      // Add asset Category
      const addCatSelect = document.getElementById('asset-category');
      if (addCatSelect) {
        addCatSelect.innerHTML = '<option value="" disabled selected>Select Category</option>' +
          categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      // Edit asset Category
      const editCatSelect = document.getElementById('edit-asset-category');
      if (editCatSelect) {
        editCatSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      // Add asset Department
      const addDeptSelect = document.getElementById('asset-dept');
      if (addDeptSelect) {
        addDeptSelect.innerHTML = '<option value="">No Department (Available Pool)</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }

      // Edit asset Department
      const editDeptSelect = document.getElementById('edit-asset-dept');
      if (editDeptSelect) {
        editDeptSelect.innerHTML = '<option value="">No Department (Available Pool)</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }
    }

    function renderAssetsTable() {
      const tbody = document.getElementById('assets-table-body');
      if (!tbody) return;

      const searchVal = document.getElementById('search-assets').value.toLowerCase().trim();
      const catVal = document.getElementById('filter-category').value;
      const statusVal = document.getElementById('filter-status').value;

      const filtered = assets.filter(a => {
        const matchesSearch =
          a.name.toLowerCase().includes(searchVal) ||
          a.asset_tag.toLowerCase().includes(searchVal) ||
          (a.serial_number && a.serial_number.toLowerCase().includes(searchVal));

        const matchesCat = catVal === 'ALL' || a.category_id === parseInt(catVal, 10);
        const matchesStatus = statusVal === 'ALL' || a.status === statusVal;

        return matchesSearch && matchesCat && matchesStatus;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No assets found matching filters.</td></tr>`;
        return;
      }

      const userRole = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role;
      const canEdit = userRole === 'ADMIN' || userRole === 'ASSET_MANAGER';

      tbody.innerHTML = filtered.map(a => {
        let statusBadge = 'bg-secondary';
        if (a.status === 'AVAILABLE') statusBadge = 'bg-success';
        else if (a.status === 'ALLOCATED') statusBadge = 'bg-primary';
        else if (a.status === 'RESERVED') statusBadge = 'bg-info text-dark';
        else if (a.status === 'UNDER_MAINTENANCE') statusBadge = 'bg-warning text-dark';
        else if (a.status === 'LOST') statusBadge = 'bg-danger';

        const deptName = a.department_name || '<span class="text-muted small">Available Pool</span>';

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${a.asset_tag}</td>
            <td class="fw-bold text-dark">${a.name}</td>
            <td>${a.category_name}</td>
            <td>${deptName}</td>
            <td>
              <div class="d-flex align-items-center gap-1.5">
                <span class="material-symbols-outlined fs-6 text-muted">location_on</span>
                <span>${a.location || 'N/A'}</span>
              </div>
            </td>
            <td><span class="badge border border-light-subtle text-dark bg-light rounded-pill px-2.5">${a.condition}</span></td>
            <td><span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${a.status}</span></td>
            <td>
              <div class="d-flex gap-1">
                <button class="btn btn-xs btn-outline-primary px-2 py-1 fs-7 btn-view-details" data-id="${a.id}">Details</button>
                ${canEdit ? `
                  <button class="btn btn-xs btn-outline-secondary px-2 py-1 fs-7 btn-edit-asset" data-id="${a.id}">Edit</button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Bind Details buttons
      document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          openDetailsModal(id);
        });
      });

      // Bind Edit buttons
      document.querySelectorAll('.btn-edit-asset').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          openEditModal(id);
        });
      });
    }

    // Load detailed record for details modal
    async function openDetailsModal(id) {
      const detailsModalBody = document.getElementById('details-modal-body');
      const detailsTagTitle = document.getElementById('details-asset-tag');
      
      detailsTagTitle.innerText = 'Loading...';
      detailsModalBody.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

      // Open Modal
      const modalEl = document.getElementById('modal-asset-details');
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();

      try {
        const res = await fetch(`/api/assets/${id}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        const asset = data.asset;

        detailsTagTitle.innerText = `${asset.asset_tag} — ${asset.name}`;

        let statusBadge = 'bg-secondary';
        if (asset.status === 'AVAILABLE') statusBadge = 'bg-success';
        else if (asset.status === 'ALLOCATED') statusBadge = 'bg-primary';
        else if (asset.status === 'RESERVED') statusBadge = 'bg-info text-dark';
        else if (asset.status === 'UNDER_MAINTENANCE') statusBadge = 'bg-warning text-dark';
        else if (asset.status === 'LOST') statusBadge = 'bg-danger';

        const formattedCost = asset.acquisition_cost ? `INR ${asset.acquisition_cost.toLocaleString('en-IN')}` : 'N/A';

        detailsModalBody.innerHTML = `
          <div class="row g-4">
            <!-- Left Info column -->
            <div class="col-lg-6">
              <div class="border rounded p-4 bg-light bg-opacity-25 h-100">
                <h6 class="fw-bold mb-3 text-dark text-uppercase small" style="letter-spacing: 0.05em;">General Information</h6>
                <table class="table table-sm table-borderless mb-0 align-middle">
                  <tbody>
                    <tr><td class="text-muted fw-semibold py-2">Category:</td><td class="text-dark">${asset.category_name}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Serial Number:</td><td class="text-dark">${asset.serial_number || 'N/A'}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">QR Code:</td><td class="text-dark">${asset.qr_code || 'N/A'}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Acquisition Date:</td><td class="text-dark">${asset.acquisition_date || 'N/A'}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Acquisition Cost:</td><td class="text-dark">${formattedCost}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Current Condition:</td><td><span class="badge border text-dark bg-white px-2 py-1">${asset.condition}</span></td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Assigned Dept:</td><td class="text-dark">${asset.department_name || 'Available Pool'}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Storage Location:</td><td class="text-dark">${asset.location || 'N/A'}</td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Current Status:</td><td><span class="badge ${statusBadge} px-2.5 py-1">${asset.status}</span></td></tr>
                    <tr><td class="text-muted fw-semibold py-2">Reservable/Shared:</td><td>${asset.is_bookable === 1 ? '<span class="text-success fw-bold">Yes</span>' : '<span class="text-muted">No</span>'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right Attachments & Upload Section -->
            <div class="col-lg-6">
              <div class="border rounded p-4 bg-light bg-opacity-25 h-100 d-flex flex-column">
                <h6 class="fw-bold mb-3 text-dark text-uppercase small" style="letter-spacing: 0.05em;">Photo & Document Attachments</h6>
                
                <div class="flex-grow-1 overflow-auto mb-3" style="max-height: 220px;" id="details-documents-list">
                  ${asset.documents.length === 0 ? `
                    <div class="text-center py-4 text-muted small">No attachments uploaded for this asset.</div>
                  ` : asset.documents.map(doc => `
                    <div class="border rounded p-2.5 mb-2 bg-white d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center gap-2">
                        <span class="material-symbols-outlined fs-5 text-muted">description</span>
                        <span class="small text-truncate" style="max-width: 260px;">${doc.file_path.split('/').pop()}</span>
                      </div>
                      <a href="${doc.file_path}" download class="btn btn-xs btn-outline-primary" style="font-size: 11px;">Download</a>
                    </div>
                  `).join('')}
                </div>

                <!-- Attachment Upload form inside details -->
                <form id="form-upload-attachment" class="mt-auto border-top pt-3">
                  <div class="input-group">
                    <input type="text" class="form-control form-control-sm border-light-subtle" id="upload-file-path" placeholder="/uploads/hp_invoice.pdf" required>
                    <select class="form-select form-select-sm border-light-subtle w-auto" id="upload-file-type">
                      <option value="pdf">PDF Invoice</option>
                      <option value="image">Photo / PNG</option>
                    </select>
                    <button class="btn btn-sm btn-outline-primary" type="submit">Upload</button>
                  </div>
                  <div class="form-text small">Log attachment files paths to this asset registry.</div>
                </form>
              </div>
            </div>

            <!-- Allocation & Maintenance Histories tabs -->
            <div class="col-12 mt-4">
              <div class="card border border-light-subtle shadow-xs">
                <div class="card-header bg-light">
                  <ul class="nav nav-pills card-header-pills" id="historyTab" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active py-1.5 px-3 fs-7" id="alloc-history-tab" data-bs-toggle="pill" data-bs-target="#alloc-history-pane" type="button">Allocation History</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link py-1.5 px-3 fs-7" id="maint-history-tab" data-bs-toggle="pill" data-bs-target="#maint-history-pane" type="button">Maintenance History</button>
                    </li>
                  </ul>
                </div>
                <div class="card-body tab-content p-3">
                  <!-- Allocation History panel -->
                  <div class="tab-pane fade show active" id="alloc-history-pane" role="tabpanel">
                    <div class="table-responsive">
                      <table class="table table-sm table-hover align-middle mb-0" style="font-size: 13px;">
                        <thead class="table-light">
                          <tr>
                            <th>Holder</th>
                            <th>Allocation Date</th>
                            <th>Expected Return</th>
                            <th>Actual Return</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${asset.allocations.length === 0 ? `
                            <tr><td colspan="5" class="text-center py-3 text-muted">No historical allocations logged for this asset.</td></tr>
                          ` : asset.allocations.map(al => {
                            const holder = al.user_name || `${al.department_name} (Dept)`;
                            return `
                              <tr>
                                <td class="fw-bold">${holder}</td>
                                <td>${al.allocation_date}</td>
                                <td>${al.expected_return_date || '-'}</td>
                                <td>${al.actual_return_date || '<span class="text-warning small">Active</span>'}</td>
                                <td><span class="badge ${al.status === 'ACTIVE' ? 'bg-primary' : 'bg-secondary'}">${al.status}</span></td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Maintenance History panel -->
                  <div class="tab-pane fade" id="maint-history-pane" role="tabpanel">
                    <div class="table-responsive">
                      <table class="table table-sm table-hover align-middle mb-0" style="font-size: 13px;">
                        <thead class="table-light">
                          <tr>
                            <th>Ticket ID</th>
                            <th>Reported Issue</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Resolution Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${asset.maintenance.length === 0 ? `
                            <tr><td colspan="5" class="text-center py-3 text-muted">No historical repairs logged for this asset.</td></tr>
                          ` : asset.maintenance.map(ma => `
                            <tr>
                              <td class="fw-semibold">#TCK-${ma.id}</td>
                              <td>${ma.issue_description}</td>
                              <td><span class="badge ${ma.priority === 'CRITICAL' || ma.priority === 'HIGH' ? 'bg-danger' : 'bg-warning text-dark'}">${ma.priority}</span></td>
                              <td><span class="badge bg-secondary">${ma.status}</span></td>
                              <td>${ma.resolution_notes || '<span class="text-muted">-</span>'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        // Bind attachment upload submission
        const formUpload = document.getElementById('form-upload-attachment');
        if (formUpload) {
          formUpload.addEventListener('submit', async (e) => {
            e.preventDefault();
            const filePath = document.getElementById('upload-file-path').value.trim();
            const fileType = document.getElementById('upload-file-type').value;

            if (!filePath) return;

            try {
              const uploadRes = await fetch(`/api/assets/${id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath, fileType })
              });

              if (uploadRes.ok) {
                 alert('Attachment saved successfully!');
                 dismissModal('modal-asset-details');
                 openDetailsModal(id); // Reload modal details
              } else {
                const data = await uploadRes.json();
                alert(data.error ? data.error.message : 'Upload failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          });
        }

      } catch (err) {
        console.error(err);
        detailsModalBody.innerHTML = '<div class="alert alert-danger py-2">Failed to load detailed asset registry details.</div>';
      }
    }

    // Populate Edit modal form fields
    async function openEditModal(id) {
      try {
        const res = await fetch(`/api/assets/${id}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const asset = data.asset;

        document.getElementById('edit-asset-id').value = asset.id;
        document.getElementById('edit-asset-name').value = asset.name;
        document.getElementById('edit-asset-category').value = asset.category_id;
        document.getElementById('edit-asset-serial').value = asset.serial_number || '';
        document.getElementById('edit-asset-qr').value = asset.qr_code || '';
        document.getElementById('edit-asset-location').value = asset.location || '';
        document.getElementById('edit-asset-cost').value = asset.acquisition_cost || '';
        document.getElementById('edit-asset-date').value = asset.acquisition_date || '';
        document.getElementById('edit-asset-dept').value = asset.department_id || '';
        document.getElementById('edit-asset-condition').value = asset.condition;
        document.getElementById('edit-asset-status').value = asset.status;
        document.getElementById('edit-asset-bookable').checked = asset.is_bookable === 1;

        const editModal = new bootstrap.Modal(document.getElementById('modal-edit-asset'));
        editModal.show();
      } catch (err) {
        console.error(err);
        alert('Failed to load asset details for editing.');
      }
    }

    // Bind filters
    const searchAssets = document.getElementById('search-assets');
    const filterCat = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const btnReset = document.getElementById('btn-reset-filters');

    if (searchAssets) searchAssets.addEventListener('input', renderAssetsTable);
    if (filterCat) filterCat.addEventListener('change', renderAssetsTable);
    if (filterStatus) filterStatus.addEventListener('change', renderAssetsTable);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        searchAssets.value = '';
        filterCat.value = 'ALL';
        filterStatus.value = 'ALL';
        renderAssetsTable();
      });
    }

    // Form Submit register
    const formRegister = document.getElementById('form-register-asset');
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('asset-name').value.trim();
        const categoryId = document.getElementById('asset-category').value;
        const serialNumber = document.getElementById('asset-serial').value.trim();
        const qrCode = document.getElementById('asset-qr').value.trim();
        const location = document.getElementById('asset-location').value.trim();
        const acquisitionCost = document.getElementById('asset-cost').value;
        const acquisitionDate = document.getElementById('asset-date').value;
        const departmentId = document.getElementById('asset-dept').value;
        const condition = document.getElementById('asset-condition').value;
        const isBookable = document.getElementById('asset-bookable').checked ? 1 : 0;

        if (!name || !categoryId || !condition) {
          alert('Please fill out all required fields.');
          return;
        }

        try {
          const res = await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              categoryId,
              serialNumber: serialNumber || null,
              qrCode: qrCode || null,
              acquisitionDate: acquisitionDate || null,
              acquisitionCost: acquisitionCost || null,
              condition,
              location: location || null,
              departmentId: departmentId || null,
              isBookable
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Asset registered successfully!');
            formRegister.reset();
            // Dismiss bootstrap modal
            dismissModal('modal-register-asset');

            loadData();
          } else {
            alert(data.error ? data.error.message : 'Registration failed');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // Form Submit edit
    const formEdit = document.getElementById('form-edit-asset');
    if (formEdit) {
      formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-asset-id').value;
        const name = document.getElementById('edit-asset-name').value.trim();
        const categoryId = document.getElementById('edit-asset-category').value;
        const serialNumber = document.getElementById('edit-asset-serial').value.trim();
        const qrCode = document.getElementById('edit-asset-qr').value.trim();
        const location = document.getElementById('edit-asset-location').value.trim();
        const acquisitionCost = document.getElementById('edit-asset-cost').value;
        const acquisitionDate = document.getElementById('edit-asset-date').value;
        const departmentId = document.getElementById('edit-asset-dept').value;
        const condition = document.getElementById('edit-asset-condition').value;
        const status = document.getElementById('edit-asset-status').value;
        const isBookable = document.getElementById('edit-asset-bookable').checked ? 1 : 0;

        if (!name || !categoryId || !condition || !status) {
          alert('Required fields must be completed.');
          return;
        }

        try {
          const res = await fetch(`/api/assets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              categoryId,
              serialNumber: serialNumber || null,
              qrCode: qrCode || null,
              acquisitionDate: acquisitionDate || null,
              acquisitionCost: acquisitionCost || null,
              condition,
              location: location || null,
              departmentId: departmentId || null,
              status,
              isBookable
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Asset details updated successfully!');
            dismissModal('modal-edit-asset');

            loadData();
          } else {
            alert(data.error ? data.error.message : 'Update failed');
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
