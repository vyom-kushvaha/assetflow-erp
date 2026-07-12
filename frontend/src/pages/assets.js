import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const AssetsPage = {
  render() {
    const state = getState();
    const assets = state.assets;
    const categories = state.categories;

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Asset Directory</h2>
          <p class="text-muted m-0 small">Central registry of physical and digital infrastructure items.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-register-asset">
          <span class="material-symbols-outlined fs-5">add</span>
          <span>Register New Asset</span>
        </button>
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
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select border-light-subtle" id="filter-status">
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
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
                <th scope="col">Location</th>
                <th scope="col">Condition</th>
                <th scope="col">Status</th>
                <th scope="col">Bookable</th>
              </tr>
            </thead>
            <tbody style="font-size: 14px;" id="assets-table-body">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Register Asset Modal -->
      <div class="modal fade" id="modal-register-asset" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold" id="modalLabel">Register New Enterprise Asset</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-register-asset" class="needs-validation" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-tag">Asset Tag ID *</label>
                    <input type="text" class="form-control" id="asset-tag" placeholder="AF-0010" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-name">Asset Name *</label>
                    <input type="text" class="form-control" id="asset-name" placeholder="Dell Latitude Laptop" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-category">Category *</label>
                    <select class="form-select" id="asset-category" required>
                      <option value="" disabled selected>Select Category</option>
                      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-serial">Serial Number</label>
                    <input type="text" class="form-control" id="asset-serial" placeholder="SN-12345">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-location">Storage Location *</label>
                    <input type="text" class="form-control" id="asset-location" placeholder="Floor 2, Wing A" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-cost">Acquisition Cost (INR)</label>
                    <input type="number" class="form-control" id="asset-cost" placeholder="25000">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-condition">Condition</label>
                    <select class="form-select" id="asset-condition">
                      <option value="NEW">New</option>
                      <option value="GOOD" selected>Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="asset-status">Initial Status</label>
                    <select class="form-select" id="asset-status">
                      <option value="AVAILABLE" selected>Available</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>

                  <!-- Booking Flag -->
                  <div class="col-12">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="asset-bookable">
                      <label class="form-check-label fw-semibold" for="asset-bookable">Make asset bookable/reservable by employees (e.g. Space or Vehicles)</label>
                    </div>
                  </div>

                  <!-- Dynamically inserted fields based on selected category -->
                  <div class="col-12 d-none" id="category-specific-fields-container">
                    <div class="border rounded p-3 bg-light bg-opacity-50">
                      <h6 class="fw-bold mb-3 text-dark small text-uppercase" style="letter-spacing: 0.05em;">Category Specific Fields</h6>
                      <div class="row g-3" id="category-specific-fields-inputs"></div>
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
    `;

    return renderLayout(contentHTML, '/assets');
  },

  onMount(router) {
    bindLayoutEvents(router);
    const self = this;

    // Render Table helper
    function renderAssetsTable() {
      const state = getState();
      const assets = state.assets;
      const categories = state.categories;

      const searchVal = document.getElementById('search-assets').value.toLowerCase().trim();
      const catVal = document.getElementById('filter-category').value;
      const statusVal = document.getElementById('filter-status').value;

      const filtered = assets.filter(asset => {
        // Search filter
        const matchesSearch = 
          asset.name.toLowerCase().includes(searchVal) ||
          asset.tag.toLowerCase().includes(searchVal) ||
          (asset.serial && asset.serial.toLowerCase().includes(searchVal));

        // Category filter
        const matchesCat = catVal === 'ALL' || asset.categoryId === parseInt(catVal, 10);

        // Status filter
        const matchesStatus = statusVal === 'ALL' || asset.status === statusVal;

        return matchesSearch && matchesCat && matchesStatus;
      });

      const tableBody = document.getElementById('assets-table-body');
      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">No assets found matching filters.</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = filtered.map(asset => {
        const cat = categories.find(c => c.id === asset.categoryId);
        const catName = cat ? cat.name : 'Unknown';

        let statusBadge = 'bg-secondary';
        if (asset.status === 'AVAILABLE') statusBadge = 'bg-success';
        else if (asset.status === 'ALLOCATED') statusBadge = 'bg-primary';
        else if (asset.status === 'UNDER_MAINTENANCE') statusBadge = 'bg-warning text-dark';
        else if (asset.status === 'LOST') statusBadge = 'bg-danger';

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${asset.tag}</td>
            <td class="fw-bold text-dark">${asset.name}</td>
            <td>${catName}</td>
            <td>
              <div class="d-flex align-items-center gap-1">
                <span class="material-symbols-outlined fs-6 text-muted">location_on</span>
                <span>${asset.location || 'N/A'}</span>
              </div>
            </td>
            <td><span class="badge border border-light-subtle text-dark bg-light rounded-pill px-2.5">${asset.condition}</span></td>
            <td><span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${asset.status}</span></td>
            <td>
              ${asset.bookable 
                ? '<span class="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined fs-6">check</span> Yes</span>'
                : '<span class="badge bg-light text-muted px-2.5 py-1.5 rounded-pill">No</span>'
              }
            </td>
          </tr>
        `;
      }).join('');
    }

    // Bind filters
    const searchAssets = document.getElementById('search-assets');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const btnResetFilters = document.getElementById('btn-reset-filters');

    if (searchAssets) searchAssets.addEventListener('input', renderAssetsTable);
    if (filterCategory) filterCategory.addEventListener('change', renderAssetsTable);
    if (filterStatus) filterStatus.addEventListener('change', renderAssetsTable);
    
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        searchAssets.value = '';
        filterCategory.value = 'ALL';
        filterStatus.value = 'ALL';
        renderAssetsTable();
      });
    }

    // Dynamic field generation inside modal
    const assetCategorySelect = document.getElementById('asset-category');
    const categorySpecificContainer = document.getElementById('category-specific-fields-container');
    const categorySpecificInputs = document.getElementById('category-specific-fields-inputs');

    if (assetCategorySelect) {
      assetCategorySelect.addEventListener('change', (e) => {
        const state = getState();
        const catId = parseInt(e.target.value, 10);
        const cat = state.categories.find(c => c.id === catId);

        categorySpecificInputs.innerHTML = '';
        if (cat && cat.fields) {
          categorySpecificContainer.classList.remove('d-none');
          const schemaFields = JSON.parse(cat.fields);
          
          Object.keys(schemaFields).forEach(field => {
            const type = schemaFields[field];
            const displayLabel = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            const col = document.createElement('div');
            col.className = 'col-md-6';
            
            if (type === 'number') {
              col.innerHTML = `
                <label class="form-label fw-semibold text-muted" style="font-size: 13px;" for="field-${field}">${displayLabel}</label>
                <input type="number" class="form-control" id="field-${field}" placeholder="Enter number...">
              `;
            } else {
              col.innerHTML = `
                <label class="form-label fw-semibold text-muted" style="font-size: 13px;" for="field-${field}">${displayLabel}</label>
                <input type="text" class="form-control" id="field-${field}" placeholder="Enter text...">
              `;
            }
            categorySpecificInputs.appendChild(col);
          });
        } else {
          categorySpecificContainer.classList.add('d-none');
        }
      });
    }

    // Handle Form Submit
    const formRegisterAsset = document.getElementById('form-register-asset');
    if (formRegisterAsset) {
      formRegisterAsset.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tag = document.getElementById('asset-tag').value.trim();
        const name = document.getElementById('asset-name').value.trim();
        const categoryId = parseInt(document.getElementById('asset-category').value, 10);
        const serial = document.getElementById('asset-serial').value.trim();
        const location = document.getElementById('asset-location').value.trim();
        const cost = parseFloat(document.getElementById('asset-cost').value) || 0;
        const condition = document.getElementById('asset-condition').value;
        const status = document.getElementById('asset-status').value;
        const bookable = document.getElementById('asset-bookable').checked;

        if (!tag || !name || isNaN(categoryId) || !location) {
          alert('Please fill out all required fields.');
          return;
        }

        const state = getState();

        // Check duplicate Tag
        if (state.assets.some(a => a.tag === tag)) {
          alert(`Asset Tag ID "${tag}" already exists in the registry.`);
          return;
        }

        // Collect custom category fields values
        const cat = state.categories.find(c => c.id === categoryId);
        const customValues = {};
        if (cat && cat.fields) {
          const schemaFields = JSON.parse(cat.fields);
          Object.keys(schemaFields).forEach(field => {
            const el = document.getElementById(`field-${field}`);
            if (el) {
              customValues[field] = el.value;
            }
          });
        }

        // Add to state
        const newAsset = {
          id: state.assets.length + 1,
          tag,
          name,
          categoryId,
          serial: serial || null,
          cost,
          condition,
          location,
          departmentId: null, // Initial empty department
          status,
          bookable,
          customFields: customValues
        };

        state.assets.push(newAsset);
        saveState(state);
        logActivity(`Registered new asset: ${tag} (${name})`, 'ASSET');

        // Reset form and modal
        formRegisterAsset.reset();
        categorySpecificContainer.classList.add('d-none');
        
        // Close bootstrap modal programmatically
        const modalEl = document.getElementById('modal-register-asset');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        // Reload data
        renderAssetsTable();
        alert('Asset registered successfully!');
      });
    }

    // Initial render
    renderAssetsTable();
  }
};
