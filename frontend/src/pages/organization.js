import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const OrganizationPage = {
  render() {
    const state = getState();
    const departments = state.departments;
    const employees = state.employees;
    const categories = state.categories;

    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Organization Setup</h2>
          <p class="text-muted m-0 small">Manage organizational units, categories, employee permissions, and system access.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-tabs mb-4 border-bottom" id="orgTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="depts-tab" data-bs-toggle="tab" data-bs-target="#depts-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">corporate_fare</span>
            <span>Departments</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="employees-tab" data-bs-toggle="tab" data-bs-target="#employees-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">group</span>
            <span>Employee Directory</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">category</span>
            <span>Asset Categories</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="roles-tab" data-bs-toggle="tab" data-bs-target="#roles-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">admin_panel_settings</span>
            <span>Role Assignment</span>
          </button>
        </li>
      </ul>

      <div class="tab-content" id="orgTabsContent">
        <!-- 1. Departments Panel -->
        <div class="tab-pane fade show active" id="depts-panel" role="tabpanel" aria-labelledby="depts-tab">
          <div class="row g-4">
            <!-- Left: Add Dept Form -->
            <div class="col-lg-4">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Create New Department</h4>
                <form id="form-create-dept">
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="dept-name">Department Name *</label>
                    <input type="text" class="form-control" id="dept-name" placeholder="Engineering" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="dept-head">Department Head *</label>
                    <select class="form-select" id="dept-head" required>
                      <option value="" disabled selected>Select Department Head</option>
                      ${employees.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="dept-parent">Parent Department</label>
                    <select class="form-select" id="dept-parent">
                      <option value="">None (Top Level)</option>
                      ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Save Department</button>
                </form>
              </div>
            </div>
            <!-- Right: Depts List -->
            <div class="col-lg-8">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Departments List</h4>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                        <th>ID</th>
                        <th>Department Name</th>
                        <th>Manager / Head</th>
                        <th>Parent Dept</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-depts-body">
                      <!-- Populated dynamically -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Employee Directory Panel -->
        <div class="tab-pane fade" id="employees-panel" role="tabpanel" aria-labelledby="employees-tab">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
            <h4 class="h5 fw-bold mb-3 text-dark">Employee Directory</h4>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>System Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">
                  ${employees.map(e => {
                    const dept = departments.find(d => d.id === e.departmentId);
                    const deptName = dept ? dept.name : 'Unknown';

                    let roleBadge = 'text-bg-light';
                    if (e.role === 'ADMIN') roleBadge = 'bg-primary text-white';
                    else if (e.role === 'ASSET_MANAGER') roleBadge = 'bg-secondary text-white';
                    else if (e.role === 'DEPT_HEAD') roleBadge = 'bg-info text-dark';

                    return `
                      <tr>
                        <td>#${e.id}</td>
                        <td class="fw-bold text-dark">${e.name}</td>
                        <td>${e.email}</td>
                        <td>${deptName}</td>
                        <td><span class="badge ${roleBadge} px-2.5 py-1.5 rounded">${e.role}</span></td>
                        <td>
                          <span class="badge rounded-pill ${e.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2.5 py-1">
                            ${e.status}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. Asset Categories Panel -->
        <div class="tab-pane fade" id="categories-panel" role="tabpanel" aria-labelledby="categories-tab">
          <div class="row g-4">
            <!-- Left: Add Category -->
            <div class="col-lg-4">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Create Asset Category</h4>
                <form id="form-create-category">
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="cat-name">Category Name *</label>
                    <input type="text" class="form-control" id="cat-name" placeholder="Hardware Servers" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="cat-fields">Custom Schema Descriptor (JSON format)</label>
                    <textarea class="form-control text-monospace small" id="cat-fields" rows="4" placeholder='{"processor_cores": "number", "rack_unit": "string"}'></textarea>
                    <div class="form-text small">Add category specific details that you want dynamic form inputs for.</div>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Save Category</button>
                </form>
              </div>
            </div>
            <!-- Right: Categories List -->
            <div class="col-lg-8">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Categories Registry</h4>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Custom Schema Configuration</th>
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-categories-body">
                      <!-- Populated dynamically -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Role Assignment Panel -->
        <div class="tab-pane fade" id="roles-panel" role="tabpanel" aria-labelledby="roles-tab">
          <div class="row g-4">
            <div class="col-lg-5 mx-auto">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Promote User / Edit Permissions</h4>
                <p class="text-muted small">Update system permissions, user roles, and deactivate access profiles.</p>
                
                <form id="form-role-assignment">
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="role-user">Select Employee *</label>
                    <select class="form-select" id="role-user" required>
                      <option value="" disabled selected>Select Employee Profile</option>
                      ${employees.map(e => `<option value="${e.id}">${e.name} (${e.email}) [Current: ${e.role}]</option>`).join('')}
                    </select>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="role-select">Target System Role *</label>
                    <select class="form-select" id="role-select" required>
                      <option value="EMPLOYEE">EMPLOYEE (Default user)</option>
                      <option value="DEPT_HEAD">DEPT_HEAD (Department supervisor)</option>
                      <option value="ASSET_MANAGER">ASSET_MANAGER (Inventory authority)</option>
                      <option value="ADMIN">ADMIN (System configurations)</option>
                    </select>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold" for="status-select">Account Status *</label>
                    <select class="form-select" id="status-select" required>
                      <option value="ACTIVE">ACTIVE (Grants session login)</option>
                      <option value="INACTIVE">INACTIVE (Deactivates console access)</option>
                    </select>
                  </div>

                  <button type="submit" class="btn btn-secondary bg-secondary w-100 py-2 fw-semibold">Update Account Settings</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/organization');
  },

  onMount(router) {
    bindLayoutEvents(router);

    // Render Departments
    function renderDepts() {
      const state = getState();
      const tbody = document.getElementById('table-depts-body');
      
      tbody.innerHTML = state.departments.map(d => {
        let parentName = '<span class="text-muted">None (Top Level)</span>';
        if (d.parent) {
          const parent = state.departments.find(p => p.id === d.parent);
          if (parent) parentName = parent.name;
        }

        return `
          <tr class="fade-in-el">
            <td>#${d.id}</td>
            <td class="fw-bold text-dark">${d.name}</td>
            <td>${d.head || '<span class="text-muted">No manager</span>'}</td>
            <td>${parentName}</td>
            <td><span class="badge text-bg-success px-2 py-1 rounded">${d.status}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Render Categories
    function renderCategories() {
      const state = getState();
      const tbody = document.getElementById('table-categories-body');

      tbody.innerHTML = state.categories.map(c => {
        const schema = c.fields ? `<code class="small text-danger">${c.fields}</code>` : '<span class="text-muted small">None (Simple asset fields)</span>';
        return `
          <tr class="fade-in-el">
            <td>#${c.id}</td>
            <td class="fw-bold text-dark">${c.name}</td>
            <td>${schema}</td>
          </tr>
        `;
      }).join('');
    }

    // Create Department submission
    const formCreateDept = document.getElementById('form-create-dept');
    if (formCreateDept) {
      formCreateDept.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('dept-name').value.trim();
        const head = document.getElementById('dept-head').value;
        const parentId = document.getElementById('dept-parent').value;

        if (!name || !head) {
          alert('Name and head are required fields.');
          return;
        }

        const state = getState();

        // Check duplicate name
        if (state.departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
          alert(`Department "${name}" already exists.`);
          return;
        }

        const newDept = {
          id: state.departments.length + 1,
          name,
          head,
          parent: parentId ? parseInt(parentId, 10) : null,
          status: 'ACTIVE'
        };

        state.departments.push(newDept);
        saveState(state);
        logActivity(`Created new organizational unit: ${name}`, 'ORGANIZATION');

        // Reset
        formCreateDept.reset();
        router.navigateTo('/organization');
        alert('Department saved successfully!');
      });
    }

    // Create Category submission
    const formCreateCat = document.getElementById('form-create-category');
    if (formCreateCat) {
      formCreateCat.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('cat-name').value.trim();
        const fields = document.getElementById('cat-fields').value.trim();

        if (!name) {
          alert('Category name is required.');
          return;
        }

        let fieldsJson = null;
        if (fields) {
          try {
            fieldsJson = JSON.stringify(JSON.parse(fields));
          } catch (err) {
            alert('Schema fields descriptor must be in valid JSON format.');
            return;
          }
        }

        const state = getState();
        if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          alert(`Category "${name}" already exists.`);
          return;
        }

        const newCat = {
          id: state.categories.length + 1,
          name,
          fields: fieldsJson
        };

        state.categories.push(newCat);
        saveState(state);
        logActivity(`Created new asset category: ${name}`, 'ORGANIZATION');

        formCreateCat.reset();
        router.navigateTo('/organization');
        alert('Asset category saved successfully!');
      });
    }

    // Promote Role / Edit access submission
    const formRoleAssignment = document.getElementById('form-role-assignment');
    if (formRoleAssignment) {
      formRoleAssignment.addEventListener('submit', (e) => {
        e.preventDefault();

        const employeeId = parseInt(document.getElementById('role-user').value, 10);
        const role = document.getElementById('role-select').value;
        const status = document.getElementById('status-select').value;

        if (isNaN(employeeId) || !role || !status) {
          alert('All fields are required.');
          return;
        }

        const state = getState();
        const emp = state.employees.find(e => e.id === employeeId);
        if (emp) {
          const oldRole = emp.role;
          const oldStatus = emp.status;

          emp.role = role;
          emp.status = status;
          saveState(state);
          logActivity(`Updated user #ID-${employeeId} profile (Role: ${oldRole} -> ${role}, Status: ${oldStatus} -> ${status})`, 'ORGANIZATION');
          
          formRoleAssignment.reset();
          router.navigateTo('/organization');
          alert('User profile settings updated successfully!');
        }
      });
    }

    // Initial load renders
    renderDepts();
    renderCategories();
  }
};
