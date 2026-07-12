/**
 * Shared layout component wrapper providing sidebar navigation and header bar.
 */
export function renderLayout(contentHTML, activeLink = '/dashboard') {
  // Read authenticated user details from localStorage if saved
  let user = { name: 'James Henderson', role: 'ADMIN' };
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('Failed to parse user session info', e);
  }

  return `
    <div class="d-flex min-vh-100 flex-column flex-md-row">
      <!-- Sidebar Navigation -->
      <aside class="bg-primary text-white p-3 flex-shrink-0 d-flex flex-column" 
             style="width: 260px; z-index: 1030; position: fixed; left: 0; top: 0; bottom: 0;">
        
        <div class="px-2 mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h4 fw-bold m-0 text-white headline-font tracking-tight">AssetFlow</h1>
            <small class="text-white-50 small" style="font-size: 11px;">Enterprise Resource</small>
          </div>
        </div>

        <nav class="nav flex-column flex-grow-1 gap-1">
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/dashboard' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/dashboard" data-link>
            <span class="material-symbols-outlined fs-5">dashboard</span> 
            <span>Dashboard</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/assets' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/assets" data-link>
            <span class="material-symbols-outlined fs-5">inventory_2</span> 
            <span>Asset Directory</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/allocation' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/allocation" data-link>
            <span class="material-symbols-outlined fs-5">assignment_turned_in</span> 
            <span>Allocations & Transfers</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/organization' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/organization" data-link>
            <span class="material-symbols-outlined fs-5">corporate_fare</span> 
            <span>Organization Setup</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/booking' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/booking" data-link>
            <span class="material-symbols-outlined fs-5">event_available</span> 
            <span>Resource Booking</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/maintenance' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/maintenance" data-link>
            <span class="material-symbols-outlined fs-5">build</span> 
            <span>Maintenance</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/audit' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/audit" data-link>
            <span class="material-symbols-outlined fs-5">fact_check</span> 
            <span>Asset Audit</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/reports' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/reports" data-link>
            <span class="material-symbols-outlined fs-5">analytics</span> 
            <span>Reports & Analytics</span>
          </a>
          <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/logs' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/logs" data-link>
            <span class="material-symbols-outlined fs-5">history</span> 
            <span>Activity Logs</span>
          </a>
        </nav>

        <div class="mt-auto border-top border-white-10 pt-3">
          <div class="d-flex align-items-center justify-content-between mb-3 px-2">
            <div class="d-flex align-items-center gap-2 overflow-hidden" style="max-width: 170px;">
              <span class="material-symbols-outlined text-white-50">account_circle</span>
              <span class="small fw-semibold text-truncate" id="sidebar-user-name">${user.name}</span>
            </div>
            <button class="btn btn-sm btn-outline-light border-0 p-1 d-flex align-items-center" id="btn-sidebar-logout" title="Logout">
              <span class="material-symbols-outlined fs-5">logout</span>
            </button>
          </div>
          <div class="d-flex gap-2 text-white-50 small px-2" style="font-size: 11px;">
            <a href="/logs" class="text-decoration-none text-white-50" data-link>System Logs</a> &middot;
            <a href="/reports" class="text-decoration-none text-white-50" data-link>Support</a>
          </div>
        </div>
      </aside>

      <!-- Main Canvas Container -->
      <div class="flex-grow-1" style="margin-left: 260px; min-height: 100vh;">
        <!-- Top App Navigation Bar -->
        <header class="navbar navbar-expand navbar-light bg-white border-bottom px-4 sticky-top" style="height: 64px; z-index: 1020;">
          <div class="container-fluid d-flex justify-content-between align-items-center p-0">
            <!-- Search Input placeholder -->
            <div class="d-flex align-items-center flex-grow-1">
              <div class="position-relative w-100" style="max-width: 400px;">
                <span class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">search</span>
                <input class="form-control ps-5 border-light-subtle bg-light bg-opacity-50 rounded-pill text-sm" type="search" placeholder="Search assets, locations..." />
              </div>
            </div>

            <!-- Right Options Controls -->
            <div class="d-flex align-items-center gap-3">
              <span class="badge text-bg-success d-flex align-items-center gap-1.5 px-3 py-2 rounded-pill" style="font-size: 11px;">
                <span class="rounded-circle bg-white d-inline-block" style="width: 6px; height: 6px;"></span>
                Systems Operational
              </span>
              <button class="btn btn-link text-dark position-relative p-2" id="nav-btn-notifications" style="text-decoration: none;">
                <span class="material-symbols-outlined">notifications</span>
                <span class="position-absolute p-1 bg-danger border border-light rounded-circle" style="width: 6px; height: 6px; top: 8px; right: 8px;"></span>
              </button>
              <div class="vr"></div>
              
              <!-- User Profile Dropdown -->
              <div class="dropdown">
                <div class="d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" style="cursor: pointer;">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5BNnUCIiwTPdRUs-cJFeZZTU1Yn3LngfN_VCecDFeZmPFujl7ejsAbbGEwDoBH6SBSxQdMQ3X4odr9ajNPyoZzGGaD-xbJm_0N088PLjhX8l1PszkvVOLz3WY_VxN9zf9-ggtu1gUQPFNyxB3FfvSLaj-w_h6Bp_CZz5xNcqCrOys4pcn5EMrsCxn5tf_NcCDwC4fIvZZZd4smeLtjDY77xYd6yhTBxRUbVoFnSqgECYf8FYmRdc" alt="User Profile" class="rounded-circle border" style="width: 32px; height: 32px; object-fit: cover;" />
                  <div class="d-none d-lg-block text-left">
                    <p class="mb-0 fw-semibold text-dark small" style="line-height: 1;" id="header-user-name">${user.name}</p>
                    <small class="text-muted text-uppercase" style="font-size: 9px;" id="header-user-role">${user.role}</small>
                  </div>
                </div>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  <li><a class="dropdown-item d-flex align-items-center gap-2" href="/dashboard" data-link><span class="material-symbols-outlined fs-6">dashboard</span> Dashboard</a></li>
                  <li><a class="dropdown-item d-flex align-items-center gap-2" href="/logs" data-link><span class="material-symbols-outlined fs-6">history</span> Activity Logs</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item d-flex align-items-center gap-2 text-danger" id="btn-dropdown-logout"><span class="material-symbols-outlined fs-6">logout</span> Sign Out</button></li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="p-4 fade-in-el" style="max-width: 1440px; margin: 0 auto;">
          ${contentHTML}
        </main>
      </div>
    </div>
  `;
}

/**
 * Binds active event listeners to sidebar and header navigation items (e.g. Logout)
 * @param {object} router - The application router instance
 */
export function bindLayoutEvents(router) {
  const logoutHandler = async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to sign out?')) {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          localStorage.removeItem('user');
          router.navigateTo('/');
        } else {
          const result = await response.json();
          alert(result.error ? result.error.message : 'Logout failed');
        }
      } catch (err) {
        console.error('Logout error', err);
        // Fallback cleanup if backend is unreachable
        localStorage.removeItem('user');
        router.navigateTo('/');
      }
    }
  };

  const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
  if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener('click', logoutHandler);
  }

  const btnDropdownLogout = document.getElementById('btn-dropdown-logout');
  if (btnDropdownLogout) {
    btnDropdownLogout.addEventListener('click', logoutHandler);
  }

  // Bind notifications click redirect
  const navBtnNotifications = document.getElementById('nav-btn-notifications');
  if (navBtnNotifications) {
    navBtnNotifications.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigateTo('/notifications');
    });
  }
}
