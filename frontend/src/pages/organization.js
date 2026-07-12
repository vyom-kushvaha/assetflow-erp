import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const OrganizationPage = {
  render() {
    // Read authenticated user details to check if they are ADMIN
    let user = { role: 'EMPLOYEE' };
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error(e);
    }

    const isAdmin = user.role === 'ADMIN';

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
        ${isAdmin ? `
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold text-dark px-3 py-2 d-flex align-items-center gap-2" id="roles-tab" data-bs-toggle="tab" data-bs-target="#roles-panel" type="button" role="tab">
            <span class="material-symbols-outlined fs-5">admin_panel_settings</span>
            <span>Role Assignment</span>
          </button>
        </li>
        ` : ''}
      </ul>

      <div class="tab-content" id="orgTabsContent">
        <!-- 1. Departments Panel -->
        <div class="tab-pane fade show active" id="depts-panel" role="tabpanel" aria-labelledby="depts-tab">
          <div class="row g-4">
            <!-- Left: Add Dept Form (Admin-Only restriction) -->
            <div class="col-lg-4">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Create New Department</h4>
                ${isAdmin ? `
                  <form id="form-create-dept">
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="dept-name">Department Name *</label>
                      <input type="text" class="form-control" id="dept-name" placeholder="Engineering" required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="dept-head">Department Head</label>
                      <select class="form-select" id="dept-head">
                        <option value="">No Manager / Head</option>
                        <!-- Populated dynamically via JS -->
                      </select>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="dept-parent">Parent Department</label>
                      <select class="form-select" id="dept-parent">
                        <option value="">None (Top Level)</option>
                        <!-- Populated dynamically via JS -->
                      </select>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Save Department</button>
                  </form>
                ` : `
                  <div class="alert alert-warning py-3 text-center mb-0">
                    <span class="material-symbols-outlined fs-3 d-block mb-1">lock</span>
                    <span class="small fw-semibold">Only administrators can create departments.</span>
                  </div>
                `}
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
                        ${isAdmin ? '<th>Action</th>' : ''}
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-depts-body">
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">Loading departments...</td>
                      </tr>
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
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="h5 fw-bold m-0 text-dark">Employee Directory</h4>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm border-light-subtle w-auto" id="filter-emp-dept">
                  <option value="ALL">All Departments</option>
                  <!-- Populated dynamically -->
                </select>
                <select class="form-select form-select-sm border-light-subtle w-auto" id="filter-emp-role">
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ASSET_MANAGER">ASSET_MANAGER</option>
                  <option value="DEPT_HEAD">DEPT_HEAD</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>
            </div>
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
                <tbody style="font-size: 14px;" id="table-employees-body">
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">Loading employees...</td>
                  </tr>
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
                ${isAdmin ? `
                  <form id="form-create-category">
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="cat-name">Category Name *</label>
                      <input type="text" class="form-control" id="cat-name" placeholder="Hardware Servers" required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="cat-desc">Description</label>
                      <input type="text" class="form-control" id="cat-desc" placeholder="Physical data infrastructure">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold" for="cat-fields">Custom Schema (JSON format)</label>
                      <textarea class="form-control text-monospace small" id="cat-fields" rows="4" placeholder='{"processor_cores": "number", "rack_unit": "string"}'></textarea>
                      <div class="form-text small">Add category specific details that you want dynamic form inputs for.</div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Save Category</button>
                  </form>
                ` : `
                  <div class="alert alert-warning py-3 text-center mb-0">
                    <span class="material-symbols-outlined fs-3 d-block mb-1">lock</span>
                    <span class="small fw-semibold">Only administrators can create asset categories.</span>
                  </div>
                `}
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
                        <th>Description</th>
                        <th>Custom Schema Configuration</th>
                        <th>Status</th>
                        ${isAdmin ? '<th>Action</th>' : ''}
                      </tr>
                    </thead>
                    <tbody style="font-size: 14px;" id="table-categories-body">
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">Loading categories...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Role Assignment Panel (Admin Only) -->
        ${isAdmin ? `
        <div class="tab-pane fade" id="roles-panel" role="tabpanel" aria-labelledby="roles-tab">
          <div class="row g-4">
            <div class="col-lg-5 mx-auto">
              <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white">
                <h4 class="h5 fw-bold mb-3 text-dark">Promote User / Edit Permissions</h4>
                <p class="text-muted small">Update system permissions, user roles, assign departments, and deactivate access profiles.</p>
                
                <form id="form-role-assignment">
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="role-user">Select Employee *</label>
                    <select class="form-select" id="role-user" required>
                      <option value="" disabled selected>Select Employee Profile</option>
                      <!-- Populated dynamically -->
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

                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="role-dept">Assign Department</label>
                    <select class="form-select" id="role-dept">
                      <option value="">No Department</option>
                      <!-- Populated dynamically -->
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
        ` : ''}
      </div>
    `;

    return renderLayout(contentHTML, '/organization');
  },

  onMount(router) {
    bindLayoutEvents(router);

    let departments = [];
    let categories = [];
    let employees = [];

    // Helper functions to populate selectors
    function populateSelectors() {
      // 1. Parent Dept Select
      const parentSelect = document.getElementById('dept-parent');
      if (parentSelect) {
        parentSelect.innerHTML = '<option value="">None (Top Level)</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }

      // 2. Head User Select
      const headSelect = document.getElementById('dept-head');
      if (headSelect) {
        headSelect.innerHTML = '<option value="">No Manager / Head</option>' +
          employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('');
      }

      // 3. Filter employee departments select
      const empDeptFilter = document.getElementById('filter-emp-dept');
      if (empDeptFilter) {
        empDeptFilter.innerHTML = '<option value="ALL">All Departments</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }

      // 4. Role assign selectors (user and dept)
      const roleUserSelect = document.getElementById('role-user');
      if (roleUserSelect) {
        roleUserSelect.innerHTML = '<option value="" disabled selected>Select Employee Profile</option>' +
          employees.map(e => `<option value="${e.id}">${e.name} (${e.email}) [Current: ${e.role}]</option>`).join('');
      }

      const roleDeptSelect = document.getElementById('role-dept');
      if (roleDeptSelect) {
        roleDeptSelect.innerHTML = '<option value="">No Department</option>' +
          departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      }
    }

    // Load all data from API
    async function loadAllData() {
      try {
        // Fetch departments
        const resDepts = await fetch('/api/org/departments');
        if (resDepts.ok) {
          const data = await resDepts.json();
          departments = data.departments || [];
        }

        // Fetch categories
        const resCats = await fetch('/api/org/categories');
        if (resCats.ok) {
          const data = await resCats.json();
          categories = data.categories || [];
        }

        // Fetch employees
        const resEmps = await fetch('/api/org/employees');
        if (resEmps.ok) {
          const data = await resEmps.json();
          employees = data.employees || [];
        }

        populateSelectors();
        renderDepts();
        renderCategories();
        renderEmployees();
      } catch (err) {
        console.error('Failed to load organization data', err);
      }
    }

    // Render Departments Table
    function renderDepts() {
      const tbody = document.getElementById('table-depts-body');
      if (!tbody) return;

      if (departments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No departments found.</td></tr>`;
        return;
      }

      const isAdmin = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'ADMIN';

      tbody.innerHTML = departments.map(d => {
        const parentName = d.parent_department_name || '<span class="text-muted">None (Top Level)</span>';
        const headName = d.head_user_name || '<span class="text-muted">No Manager</span>';
        
        let statusBadge = 'bg-success-subtle text-success';
        if (d.status === 'INACTIVE') statusBadge = 'bg-danger-subtle text-danger';

        return `
          <tr class="fade-in-el">
            <td>#${d.id}</td>
            <td class="fw-bold text-dark">${d.name}</td>
            <td>${headName}</td>
            <td>${parentName}</td>
            <td><span class="badge rounded-pill ${statusBadge} px-2.5 py-1">${d.status}</span></td>
            ${isAdmin ? `
              <td>
                <button class="btn btn-sm btn-outline-secondary py-0.5 px-2 btn-toggle-dept" data-id="${d.id}" data-status="${d.status}" data-name="${d.name}" data-head="${d.head_user_id || ''}" data-parent="${d.parent_department_id || ''}">
                  ${d.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            ` : ''}
          </tr>
        `;
      }).join('');

      // Bind toggle status buttons
      document.querySelectorAll('.btn-toggle-dept').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const currentStatus = e.target.getAttribute('data-status');
          const name = e.target.getAttribute('data-name');
          const headUserId = e.target.getAttribute('data-head');
          const parentDeptId = e.target.getAttribute('data-parent');
          const targetStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

          if (confirm(`Change department "${name}" status to ${targetStatus}?`)) {
            try {
              const res = await fetch(`/api/org/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  headUserId: headUserId || null,
                  parentDepartmentId: parentDeptId || null,
                  status: targetStatus
                })
              });

              if (res.ok) {
                alert('Department status updated successfully.');
                loadAllData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Update failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });
    }

    // Render Categories Table
    function renderCategories() {
      const tbody = document.getElementById('table-categories-body');
      if (!tbody) return;

      if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No categories found.</td></tr>`;
        return;
      }

      const isAdmin = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'ADMIN';

      tbody.innerHTML = categories.map(c => {
        const schemaText = c.fields ? `<code class="small text-danger">${JSON.stringify(c.fields)}</code>` : '<span class="text-muted small">None</span>';
        let statusBadge = 'bg-success-subtle text-success';
        if (c.status === 'INACTIVE') statusBadge = 'bg-danger-subtle text-danger';

        return `
          <tr class="fade-in-el">
            <td>#${c.id}</td>
            <td class="fw-bold text-dark">${c.name}</td>
            <td>${c.description || '<span class="text-muted">-</span>'}</td>
            <td>${schemaText}</td>
            <td><span class="badge rounded-pill ${statusBadge} px-2.5 py-1">${c.status || 'ACTIVE'}</span></td>
            ${isAdmin ? `
              <td>
                <button class="btn btn-sm btn-outline-secondary py-0.5 px-2 btn-toggle-cat" data-id="${c.id}" data-status="${c.status || 'ACTIVE'}" data-name="${c.name}" data-desc="${c.description || ''}" data-fields='${JSON.stringify(c.fields || {})}'>
                  ${c.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                </button>
              </td>
            ` : ''}
          </tr>
        `;
      }).join('');

      // Bind toggle status buttons for category
      document.querySelectorAll('.btn-toggle-cat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const currentStatus = e.target.getAttribute('data-status');
          const name = e.target.getAttribute('data-name');
          const description = e.target.getAttribute('data-desc');
          const fields = JSON.parse(e.target.getAttribute('data-fields'));
          const targetStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

          if (confirm(`Change category "${name}" status to ${targetStatus}?`)) {
            try {
              const res = await fetch(`/api/org/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  description,
                  status: targetStatus,
                  fields
                })
              });

              if (res.ok) {
                alert('Category status updated successfully.');
                loadAllData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Update failed');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });
    }

    // Render Employees List with Filter mappings
    function renderEmployees() {
      const tbody = document.getElementById('table-employees-body');
      if (!tbody) return;

      const deptFilterVal = document.getElementById('filter-emp-dept').value;
      const roleFilterVal = document.getElementById('filter-emp-role').value;

      const filtered = employees.filter(e => {
        const matchesDept = deptFilterVal === 'ALL' || e.department_id === parseInt(deptFilterVal, 10);
        const matchesRole = roleFilterVal === 'ALL' || e.role === roleFilterVal;
        return matchesDept && matchesRole;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No employees found matching filters.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(e => {
        const deptName = e.department_name || '<span class="text-muted">Unassigned</span>';
        
        let roleBadge = 'text-bg-light';
        if (e.role === 'ADMIN') roleBadge = 'bg-primary text-white';
        else if (e.role === 'ASSET_MANAGER') roleBadge = 'bg-secondary text-white';
        else if (e.role === 'DEPT_HEAD') roleBadge = 'bg-info text-dark';

        let statusBadge = 'bg-success-subtle text-success';
        if (e.status === 'INACTIVE') statusBadge = 'bg-danger-subtle text-danger';

        return `
          <tr class="fade-in-el">
            <td>#${e.id}</td>
            <td class="fw-bold text-dark">${e.name}</td>
            <td>${e.email}</td>
            <td>${deptName}</td>
            <td><span class="badge ${roleBadge} px-2.5 py-1.5 rounded">${e.role}</span></td>
            <td><span class="badge rounded-pill ${statusBadge} px-2.5 py-1">${e.status}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Bind Filter inputs
    const filterDept = document.getElementById('filter-emp-dept');
    if (filterDept) filterDept.addEventListener('change', renderEmployees);

    const filterRole = document.getElementById('filter-emp-role');
    if (filterRole) filterRole.addEventListener('change', renderEmployees);

    // Form Submit department
    const formCreateDept = document.getElementById('form-create-dept');
    if (formCreateDept) {
      formCreateDept.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('dept-name').value.trim();
        const headUserId = document.getElementById('dept-head').value;
        const parentDepartmentId = document.getElementById('dept-parent').value;

        if (!name) return;

        try {
          const res = await fetch('/api/org/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              headUserId: headUserId || null,
              parentDepartmentId: parentDepartmentId || null
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Department created successfully!');
            formCreateDept.reset();
            loadAllData();
          } else {
            alert(data.error ? data.error.message : 'Failed to create department');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // Form Submit category
    const formCreateCat = document.getElementById('form-create-category');
    if (formCreateCat) {
      formCreateCat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value.trim();
        const description = document.getElementById('cat-desc').value.trim();
        const fieldsRaw = document.getElementById('cat-fields').value.trim();

        if (!name) return;

        let fields = {};
        if (fieldsRaw) {
          try {
            fields = JSON.parse(fieldsRaw);
          } catch (err) {
            alert('Custom schema fields must be in valid JSON format.');
            return;
          }
        }

        try {
          const res = await fetch('/api/org/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description,
              status: 'ACTIVE',
              fields
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Category created successfully!');
            formCreateCat.reset();
            loadAllData();
          } else {
            alert(data.error ? data.error.message : 'Failed to create category');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // Form Submit role assignment
    const formRoleAssignment = document.getElementById('form-role-assignment');
    if (formRoleAssignment) {
      formRoleAssignment.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeId = document.getElementById('role-user').value;
        const role = document.getElementById('role-select').value;
        const departmentId = document.getElementById('role-dept').value;
        const status = document.getElementById('status-select').value;

        if (!employeeId || !role || !status) return;

        try {
          const res = await fetch(`/api/org/employees/${employeeId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role,
              status,
              departmentId: departmentId || null
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Employee profile updated successfully!');
            formRoleAssignment.reset();
            loadAllData();
          } else {
            alert(data.error ? data.error.message : 'Failed to update employee profile');
          }
        } catch (err) {
          console.error(err);
          alert('Connection failed');
        }
      });
    }

    // Trigger Initial Load
    loadAllData();
  }
};
