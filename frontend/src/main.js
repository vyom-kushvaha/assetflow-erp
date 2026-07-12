// Import Bootstrap CSS and JS bundles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Global Styles
import './styles/main.css';

// Import Custom Client-Side Router
import { Router } from './router/index.js';

// Define Minimal Application Routes (Placeholder pages)
const routes = [
  {
    path: '/',
    render: () => `
      <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center text-center p-4">
        <div class="card shadow-lg p-5 border-0 rounded-4" style="max-width: 600px; backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.9);">
          <div class="mb-4">
            <span class="fs-1">⚡</span>
          </div>
          <h1 class="display-5 fw-bold text-dark mb-3">AssetFlow ERP</h1>
          <p class="text-muted mb-4 fs-5">
            Welcome to the Enterprise Asset & Resource Management System. A production-ready, clean, modular boilerplate.
          </p>
          <div class="d-flex justify-content-center gap-3">
            <a href="/dashboard" class="btn btn-primary btn-lg px-4 rounded-pill" data-link>Go to Dashboard</a>
            <a href="https://github.com" target="_blank" class="btn btn-outline-secondary btn-lg px-4 rounded-pill">Documentation</a>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/dashboard',
    render: () => `
      <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
          <div>
            <h1 class="fw-bold text-dark m-0">Dashboard</h1>
            <p class="text-muted m-0">AssetFlow Management Overview</p>
          </div>
          <a href="/" class="btn btn-outline-primary rounded-pill px-4" data-link>&larr; Back Home</a>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 class="text-muted fw-semibold mb-2">Total Assets</h5>
              <h2 class="fw-bold text-primary">--</h2>
              <p class="text-xs text-muted mt-2 mb-0">System ready to register items</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 class="text-muted fw-semibold mb-2">Active Resources</h5>
              <h2 class="fw-bold text-success">--</h2>
              <p class="text-xs text-muted mt-2 mb-0">Team member associations</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 class="text-muted fw-semibold mb-2">System Status</h5>
              <h2 class="fw-bold text-info">Online</h2>
              <p class="text-xs text-muted mt-2 mb-0">Connected to local node</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '*',
    render: () => `
      <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center text-center p-4">
        <h1 class="display-1 fw-bold text-muted">404</h1>
        <h2 class="fw-bold text-dark mb-3">Page Not Found</h2>
        <p class="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
        <a href="/" class="btn btn-primary rounded-pill px-4" data-link>Back to Home</a>
      </div>
    `
  }
];

// Initialize and Bind Router on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  const router = new Router(routes);
  router.handleRoute();
});
