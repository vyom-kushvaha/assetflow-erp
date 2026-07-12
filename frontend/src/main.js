// Import API Configuration wrapper
import './config/api.js';

// Import Bootstrap CSS and JS bundles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Global Styles
import './styles/main.css';

// Import Application Routing Modules
import { Router } from './router/index.js';
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { AssetsPage } from './pages/assets.js';
import { AllocationPage } from './pages/allocation.js';
import { OrganizationPage } from './pages/organization.js';
import { BookingPage } from './pages/booking.js';
import { MaintenancePage } from './pages/maintenance.js';
import { AuditPage } from './pages/audit.js';
import { ReportsPage } from './pages/reports.js';
import { LogsPage } from './pages/logs.js';
import { NotificationsPage } from './pages/notifications.js';

// Register routes mapping templates and lifecycle event handlers
const routes = [
  {
    path: '/',
    render: () => LoginPage.render(),
    onMount: (router) => LoginPage.onMount(router)
  },
  {
    path: '/dashboard',
    render: () => DashboardPage.render(),
    onMount: (router) => DashboardPage.onMount(router)
  },
  {
    path: '/assets',
    render: () => AssetsPage.render(),
    onMount: (router) => AssetsPage.onMount(router)
  },
  {
    path: '/allocation',
    render: () => AllocationPage.render(),
    onMount: (router) => AllocationPage.onMount(router)
  },
  {
    path: '/organization',
    render: () => OrganizationPage.render(),
    onMount: (router) => OrganizationPage.onMount(router)
  },
  {
    path: '/booking',
    render: () => BookingPage.render(),
    onMount: (router) => BookingPage.onMount(router)
  },
  {
    path: '/maintenance',
    render: () => MaintenancePage.render(),
    onMount: (router) => MaintenancePage.onMount(router)
  },
  {
    path: '/audit',
    render: () => AuditPage.render(),
    onMount: (router) => AuditPage.onMount(router)
  },
  {
    path: '/reports',
    render: () => ReportsPage.render(),
    onMount: (router) => ReportsPage.onMount(router)
  },
  {
    path: '/logs',
    render: () => LogsPage.render(),
    onMount: (router) => LogsPage.onMount(router)
  },
  {
    path: '/notifications',
    render: () => NotificationsPage.render(),
    onMount: (router) => NotificationsPage.onMount(router)
  },
  {
    path: '*',
    render: () => `
      <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center text-center p-4">
        <h1 class="display-1 fw-bold text-muted headline-font">404</h1>
        <h2 class="fw-bold text-dark mb-3">Page Not Found</h2>
        <p class="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
        <a href="/dashboard" class="btn btn-primary rounded-pill px-4" data-link>Back to Dashboard</a>
      </div>
    `,
    onMount: () => {}
  }
];

// Verify authentication state and boot application router
document.addEventListener('DOMContentLoaded', async () => {
  const router = new Router(routes);

  try {
    const res = await fetch('/api/auth/me');
    const currentPath = window.location.pathname;

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data.user));

      // Authenticated users should not be allowed on the login route
      if (currentPath === '/') {
        router.navigateTo('/dashboard');
      } else {
        router.handleRoute();
      }
    } else {
      localStorage.removeItem('user');

      // Guest users should be forced to login route
      if (currentPath !== '/') {
        router.navigateTo('/');
      } else {
        router.handleRoute();
      }
    }
  } catch (err) {
    console.warn('Session verification failed, booting in offline mode:', err);
    // Offline mode: proceed with standard route matching
    router.handleRoute();
  }
});
