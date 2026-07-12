import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';

export const NotificationsPage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Alerts Center</h2>
          <p class="text-muted m-0 small">Manage your system warnings, allocations notices, and booking updates.</p>
        </div>
        <button class="btn btn-outline-primary d-flex align-items-center gap-1.5 shadow-sm bg-white" id="btn-read-all-notifications">
          <span class="material-symbols-outlined fs-5">done_all</span>
          <span>Mark All as Read</span>
        </button>
      </div>

      <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white mb-4">
        <!-- Filters Row -->
        <div class="d-flex flex-wrap gap-2 mb-4 align-items-center justify-content-between">
          <div class="d-flex flex-wrap gap-1.5" id="notification-filters">
            <button class="btn btn-sm btn-primary filter-btn" data-filter="ALL">All Alerts</button>
            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="UNREAD">Unread Only</button>
            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="ALLOCATION">Allocations</button>
            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="BOOKING">Bookings</button>
            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="MAINTENANCE">Maintenance</button>
            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="TRANSFER">Transfers</button>
          </div>
          <div>
            <span class="badge bg-secondary px-3 py-1.5 rounded-pill small" id="unread-count-badge">0 Unread</span>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="d-flex flex-column gap-3" id="notifications-list-container">
          <div class="text-center py-5 text-muted">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 small">Loading notifications...</p>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/notifications');
  },

  onMount(router) {
    bindLayoutEvents(router);

    let notifications = [];
    let currentFilter = 'ALL';

    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          notifications = data.notifications || [];
          renderNotificationsList();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function renderNotificationsList() {
      const container = document.getElementById('notifications-list-container');
      const badge = document.getElementById('unread-count-badge');
      if (!container) return;

      const unreadCount = notifications.filter(n => n.is_read === 0).length;
      if (badge) {
        badge.innerText = `${unreadCount} Unread`;
        badge.className = unreadCount > 0 ? 'badge bg-danger px-3 py-1.5 rounded-pill small' : 'badge bg-secondary px-3 py-1.5 rounded-pill small';
      }

      // Filter list
      let filtered = notifications;
      if (currentFilter === 'UNREAD') {
        filtered = notifications.filter(n => n.is_read === 0);
      } else if (currentFilter !== 'ALL') {
        // Match string type containing e.g. "ALLOCATION", "BOOKING", "MAINTENANCE", "TRANSFER"
        filtered = notifications.filter(n => n.type && n.type.toUpperCase().includes(currentFilter));
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="text-center py-5 text-muted bg-light bg-opacity-25 border rounded-3 p-4">
            <span class="material-symbols-outlined fs-1 text-secondary mb-2">notifications_off</span>
            <p class="mb-0 fw-semibold">No alerts found matching your selection.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(n => {
        let alertIcon = 'info';
        let alertClass = 'text-primary border-primary-subtle';
        
        if (n.type && n.type.includes('OVERDUE')) {
          alertIcon = 'warning';
          alertClass = 'text-danger border-danger-subtle bg-danger-subtle bg-opacity-10';
        } else if (n.is_read === 0) {
          alertIcon = 'notifications_active';
          alertClass = 'text-warning border-warning-subtle bg-warning-subtle bg-opacity-10';
        }

        const dateStr = n.created_at.replace('T', ' ').substring(0, 16);

        return `
          <div class="border rounded-3 p-3 bg-white shadow-xs d-flex align-items-start gap-3 position-relative hover-card ${n.is_read === 0 ? 'border-primary-subtle bg-light bg-opacity-10' : ''}">
            <div class="border rounded p-1.5 d-flex align-items-center justify-content-center ${alertClass}">
              <span class="material-symbols-outlined fs-5">${alertIcon}</span>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="badge text-bg-light border small" style="font-size: 10px;">${n.type || 'SYSTEM'}</span>
                <span class="text-muted small" style="font-size: 11px;">${dateStr}</span>
              </div>
              <p class="mb-0 text-dark" style="font-size: 14.5px; line-height: 1.4;">${n.message}</p>
            </div>
            ${n.is_read === 0 ? `
              <button class="btn btn-sm btn-outline-primary px-3 rounded-pill btn-read-notification" data-id="${n.id}">Mark Read</button>
            ` : `
              <span class="text-muted small align-self-center me-2">Read</span>
            `}
          </div>
        `;
      }).join('');

      // Bind mark read buttons
      document.querySelectorAll('.btn-read-notification').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            if (res.ok) {
              loadNotifications();
            }
          } catch (e) {
            console.error(e);
          }
        });
      });
    }

    // Bind Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Toggle active styling
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.className = 'btn btn-sm btn-outline-secondary filter-btn';
        });
        btn.className = 'btn btn-sm btn-primary filter-btn';

        currentFilter = btn.getAttribute('data-filter');
        renderNotificationsList();
      });
    });

    // Mark all read button
    const btnReadAll = document.getElementById('btn-read-all-notifications');
    if (btnReadAll) {
      btnReadAll.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/notifications/read-all', { method: 'POST' });
          if (res.ok) {
            loadNotifications();
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    loadNotifications();
  }
};
