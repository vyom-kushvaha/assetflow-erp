import * as bootstrap from 'bootstrap';

/**
 * Shared layout component wrapper providing sidebar navigation and header bar.
 */
export function renderLayout(contentHTML, activeLink = '/dashboard') {
  // Read authenticated user details from localStorage if saved
  let user = { name: 'James Henderson', role: 'ADMIN', email: 'admin@assetflow.com' };
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('Failed to parse user session info', e);
  }

  // Setup badge classes & styles according to role
  let roleLabel = 'Employee';
  let badgeStyle = 'background-color: #198754; color: white;';
  let badgeClass = 'bg-success';

  if (user.role === 'ADMIN') {
    roleLabel = 'Administrator';
    badgeClass = 'bg-danger';
    badgeStyle = 'background-color: #dc3545; color: white;';
  } else if (user.role === 'ASSET_MANAGER') {
    roleLabel = 'Asset Manager';
    badgeClass = 'bg-warning text-dark';
    badgeStyle = 'background-color: #fd7e14; color: white;';
  } else if (user.role === 'DEPT_HEAD') {
    roleLabel = 'Department Head';
    badgeClass = 'bg-primary';
    badgeStyle = 'background-color: #0d6efd; color: white;';
  }

  // Generate links based on Role
  let navLinksHTML = '';

  if (user.role === 'ADMIN') {
    navLinksHTML = `
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/dashboard' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/dashboard" data-link>
        <span class="material-symbols-outlined fs-5">dashboard</span> 
        <span>Dashboard</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/organization' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/organization" data-link>
        <span class="material-symbols-outlined fs-5">corporate_fare</span> 
        <span>Organization Setup</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/assets' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/assets" data-link>
        <span class="material-symbols-outlined fs-5">inventory_2</span> 
        <span>Assets</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/allocation' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/allocation" data-link>
        <span class="material-symbols-outlined fs-5">assignment_turned_in</span> 
        <span>Allocation & Transfers</span>
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
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center justify-content-between gap-2 ${activeLink === '/notifications' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/notifications" data-link>
        <div class="d-flex align-items-center gap-2">
          <span class="material-symbols-outlined fs-5">notifications</span> 
          <span>Notifications</span>
        </div>
        <span class="badge bg-danger rounded-pill d-none" style="font-size: 10px;" id="sidebar-notifications-badge">0</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 opacity-75 text-white cursor-pointer" href="#" id="btn-sidebar-profile-trigger">
        <span class="material-symbols-outlined fs-5">person</span> 
        <span>My Profile</span>
      </a>
    `;
  } else if (user.role === 'ASSET_MANAGER') {
    navLinksHTML = `
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/dashboard' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/dashboard" data-link>
        <span class="material-symbols-outlined fs-5">dashboard</span> 
        <span>Dashboard</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/assets' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/assets" data-link>
        <span class="material-symbols-outlined fs-5">inventory_2</span> 
        <span>Assets</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/allocation' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/allocation" data-link>
        <span class="material-symbols-outlined fs-5">assignment_turned_in</span> 
        <span>Allocation & Transfers</span>
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
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center justify-content-between gap-2 ${activeLink === '/notifications' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/notifications" data-link>
        <div class="d-flex align-items-center gap-2">
          <span class="material-symbols-outlined fs-5">notifications</span> 
          <span>Notifications</span>
        </div>
        <span class="badge bg-danger rounded-pill d-none" style="font-size: 10px;" id="sidebar-notifications-badge">0</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 opacity-75 text-white cursor-pointer" href="#" id="btn-sidebar-profile-trigger">
        <span class="material-symbols-outlined fs-5">person</span> 
        <span>My Profile</span>
      </a>
    `;
  } else if (user.role === 'DEPT_HEAD') {
    navLinksHTML = `
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/dashboard' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/dashboard" data-link>
        <span class="material-symbols-outlined fs-5">dashboard</span> 
        <span>Dashboard</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/assets' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/assets" data-link>
        <span class="material-symbols-outlined fs-5">inventory_2</span> 
        <span>Department Assets</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/allocation' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/allocation" data-link>
        <span class="material-symbols-outlined fs-5">assignment_turned_in</span> 
        <span>Allocation Requests</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/booking' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/booking" data-link>
        <span class="material-symbols-outlined fs-5">event_available</span> 
        <span>Resource Booking</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/maintenance' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/maintenance" data-link>
        <span class="material-symbols-outlined fs-5">build</span> 
        <span>Maintenance</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center justify-content-between gap-2 ${activeLink === '/notifications' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/notifications" data-link>
        <div class="d-flex align-items-center gap-2">
          <span class="material-symbols-outlined fs-5">notifications</span> 
          <span>Notifications</span>
        </div>
        <span class="badge bg-danger rounded-pill d-none" style="font-size: 10px;" id="sidebar-notifications-badge">0</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 opacity-75 text-white cursor-pointer" href="#" id="btn-sidebar-profile-trigger">
        <span class="material-symbols-outlined fs-5">person</span> 
        <span>My Profile</span>
      </a>
    `;
  } else {
    // EMPLOYEE / Default
    navLinksHTML = `
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/dashboard' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/dashboard" data-link>
        <span class="material-symbols-outlined fs-5">dashboard</span> 
        <span>Dashboard</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/assets' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/assets" data-link>
        <span class="material-symbols-outlined fs-5">inventory_2</span> 
        <span>My Assets</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/booking' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/booking" data-link>
        <span class="material-symbols-outlined fs-5">event_available</span> 
        <span>My Bookings</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 ${activeLink === '/maintenance' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/maintenance" data-link>
        <span class="material-symbols-outlined fs-5">build</span> 
        <span>My Maintenance Requests</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center justify-content-between gap-2 ${activeLink === '/notifications' ? 'bg-white bg-opacity-10 fw-bold border-start border-4 border-warning' : 'opacity-75 text-white'}" href="/notifications" data-link>
        <div class="d-flex align-items-center gap-2">
          <span class="material-symbols-outlined fs-5">notifications</span> 
          <span>Notifications</span>
        </div>
        <span class="badge bg-danger rounded-pill d-none" style="font-size: 10px;" id="sidebar-notifications-badge">0</span>
      </a>
      <a class="nav-link text-white rounded px-3 py-2 d-flex align-items-center gap-2 opacity-75 text-white cursor-pointer" href="#" id="btn-sidebar-profile-trigger">
        <span class="material-symbols-outlined fs-5">person</span> 
        <span>My Profile</span>
      </a>
    `;
  }

  return `
    <div class="d-flex min-vh-100 flex-column flex-md-row">
      <!-- Sidebar Navigation -->
      <aside class="bg-primary text-white p-3 flex-shrink-0 d-flex flex-column" 
             style="width: 260px; z-index: 1030; position: fixed; left: 0; top: 0; bottom: 0;">
        
        <div class="px-2 mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h4 fw-bold m-0 text-white headline-font tracking-tight">AssetFlow</h1>
            <small class="text-white-50 small" style="font-size: 11px;">Enterprise Resource</small>
          </div>
        </div>

        <!-- User Profile Card -->
        <div class="card bg-white bg-opacity-5 border border-white border-opacity-10 p-3 mb-4 rounded-3 text-white shadow-sm">
          <div class="d-flex align-items-center gap-2.5 mb-2.5">
            <span class="material-symbols-outlined text-white-50 fs-3">account_circle</span>
            <div class="overflow-hidden" style="line-height: 1.25;">
              <strong class="d-block text-truncate text-white" style="font-size: 13px;">${user.name}</strong>
              <small class="text-white-50 text-truncate d-block" style="font-size: 10.5px;">${user.email}</small>
            </div>
          </div>
          <span class="badge ${badgeClass} w-100 py-1.5 fw-bold text-uppercase" style="${badgeStyle}; font-size: 9px; letter-spacing: 0.05em;">${roleLabel}</span>
        </div>

        <!-- Sidebar Navigation Menu links -->
        <nav class="nav flex-column flex-grow-1 gap-1">
          ${navLinksHTML}
        </nav>

        <div class="mt-auto border-top border-white-10 pt-3">
          <div class="d-flex align-items-center justify-content-between mb-3 px-2">
            <button class="btn btn-sm btn-outline-light border-0 w-100 py-2 d-flex align-items-center justify-content-center gap-2" id="btn-sidebar-logout" title="Logout">
              <span class="material-symbols-outlined fs-5">logout</span>
              <span class="small fw-semibold">Sign Out</span>
            </button>
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
                <span class="position-absolute p-1 bg-danger border border-light rounded-circle d-none" id="header-notifications-badge" style="width: 6px; height: 6px; top: 8px; right: 8px;"></span>
              </button>
              <div class="vr"></div>
              
              <!-- User Profile Dropdown -->
              <div class="dropdown">
                <div class="d-flex align-items-center gap-2 dropdown-toggle" id="header-user-dropdown" data-bs-toggle="dropdown" style="cursor: pointer;">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5BNnUCIiwTPdRUs-cJFeZZTU1Yn3LngfN_VCecDFeZmPFujl7ejsAbbGEwDoBH6SBSxQdMQ3X4odr9ajNPyoZzGGaD-xbJm_0N088PLjhX8l1PszkvVOLz3WY_VxN9zf9-ggtu1gUQPFNyxB3FfvSLaj-w_h6Bp_CZz5xNcqCrOys4pcn5EMrsCxn5tf_NcCDwC4fIvZZZd4smeLtjDY77xYd6yhTBxRUbVoFnSqgECYf8FYmRdc" alt="User Profile" class="rounded-circle border" style="width: 32px; height: 32px; object-fit: cover;" />
                  <div class="d-none d-lg-block text-left">
                    <p class="mb-0 fw-semibold text-dark small" style="line-height: 1;" id="header-user-name">${user.name}</p>
                    <small class="text-muted text-uppercase" style="font-size: 9px;" id="header-user-role">${user.role}</small>
                  </div>
                </div>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" id="header-user-dropdown-menu">
                  <li><a class="dropdown-item d-flex align-items-center gap-2" href="/dashboard" data-link><span class="material-symbols-outlined fs-6">dashboard</span> Dashboard</a></li>
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

    <!-- User Profile Modal (Sidebar Trigger) -->
    <div class="modal fade" id="modal-user-profile-sidebar" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">My Enterprise Profile</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <span class="material-symbols-outlined text-muted" style="font-size: 80px;">account_circle</span>
            <h4 class="fw-bold mb-1 mt-2 text-dark">${user.name}</h4>
            <span class="badge ${badgeClass} py-1.5 px-3 mb-4 rounded-pill fw-bold text-uppercase" style="${badgeStyle}; font-size: 10px; letter-spacing: 0.05em;">${roleLabel}</span>
            
            <div class="border rounded p-3 bg-light bg-opacity-50 text-start">
              <div class="row g-2" style="font-size: 13.5px;">
                <div class="col-5 text-muted fw-bold">Email Address:</div>
                <div class="col-7 text-dark">${user.email || 'user@company.com'}</div>
                <div class="col-5 text-muted fw-bold">Current Role:</div>
                <div class="col-7 text-dark fw-semibold">${roleLabel}</div>
                <div class="col-5 text-muted fw-bold">Dept ID Reference:</div>
                <div class="col-7 text-dark">${user.department_id || 'System Pool'}</div>
                <div class="col-5 text-muted fw-bold">Status:</div>
                <div class="col-7 text-success fw-bold">ACTIVE CONNECTION</div>
              </div>
            </div>
          </div>
        </div>
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

  // Initialize user profile dropdown programmatically & add custom click toggler to handle SPA detaches
  const dropdownToggle = document.getElementById('header-user-dropdown');
  const dropdownMenu = document.getElementById('header-user-dropdown-menu');
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  // Bind My Profile modal trigger
  const btnProfile = document.getElementById('btn-sidebar-profile-trigger');
  if (btnProfile) {
    btnProfile.addEventListener('click', (e) => {
      e.preventDefault();
      const profileModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-user-profile-sidebar'));
      profileModal.show();
    });
  }

  // Fetch unread notifications count dynamically & update sidebar/header indicators
  async function updateNotificationBadges() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const unreadCount = (data.notifications || []).filter(n => n.is_read === 0).length;
        
        // Update sidebar notifications count badge
        const badgeSidebar = document.getElementById('sidebar-notifications-badge');
        if (badgeSidebar) {
          if (unreadCount > 0) {
            badgeSidebar.innerText = unreadCount;
            badgeSidebar.classList.remove('d-none');
          } else {
            badgeSidebar.classList.add('d-none');
          }
        }

        // Update header notifications indicator
        const badgeHeader = document.getElementById('header-notifications-badge');
        if (badgeHeader) {
          if (unreadCount > 0) {
            badgeHeader.classList.remove('d-none');
          } else {
            badgeHeader.classList.add('d-none');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load notifications count', err);
    }
  }

  updateNotificationBadges();
}
