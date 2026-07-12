import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import * as bootstrap from 'bootstrap';

export const BookingPage = {
  render() {
    const contentHTML = `
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="text-primary m-0 fw-bold">Resource Booking</h2>
          <p class="text-muted m-0 small">Reserve shared enterprise spaces, conference rooms, vehicles, and test hardware.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-create-booking">
          <span class="material-symbols-outlined fs-5">event_upcoming</span>
          <span>Book Resource</span>
        </button>
      </div>

      <div class="row g-4">
        <!-- Left: Bookings list -->
        <div class="col-xl-8">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Upcoming Reservations</h4>
            
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;" class="text-muted uppercase fw-bold">
                    <th>Resource Tag</th>
                    <th>Resource Name</th>
                    <th>Reserved By</th>
                    <th>Time Slot</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;" id="bookings-table-body">
                  <tr>
                    <td colspan="7" class="text-center py-4 text-muted">Loading reservations directory...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Bookable assets quick lookup -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Bookable Resources</h4>
            <div class="d-flex flex-column gap-2" style="max-height: 480px; overflow-y: auto;" id="bookable-resources-container">
              <div class="text-center py-4 text-muted small">Loading bookable assets...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Booking Modal -->
      <div class="modal fade" id="modal-create-booking" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Book a Resource</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="form-create-booking">
                <div class="mb-3">
                  <label class="form-label fw-semibold" for="book-asset">Select Resource *</label>
                  <select class="form-select" id="book-asset" required>
                    <option value="" disabled selected>Select Resource...</option>
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="book-user">Reserved By *</label>
                  <select class="form-select" id="book-user" required>
                    <option value="" disabled selected>Select Employee Profile</option>
                    <!-- Populated dynamically -->
                  </select>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="book-start">Start Time *</label>
                    <input type="datetime-local" class="form-control" id="book-start" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="book-end">End Time *</label>
                    <input type="datetime-local" class="form-control" id="book-end" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="book-purpose">Purpose of Reservation *</label>
                  <input type="text" class="form-control" id="book-purpose" placeholder="Team standup meeting" required>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Save Booking</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    return renderLayout(contentHTML, '/booking');
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
    let employees = [];
    let bookings = [];

    async function loadData() {
      try {
        // Fetch Assets
        const resAssets = await fetch('/api/assets');
        if (resAssets.ok) {
          const data = await resAssets.json();
          assets = data.assets || [];
        }

        // Fetch Employees
        const resEmp = await fetch('/api/org/employees');
        if (resEmp.ok) {
          const data = await resEmp.json();
          employees = data.employees || [];
        }

        // Fetch Bookings
        const resBookings = await fetch('/api/bookings');
        if (resBookings.ok) {
          const data = await resBookings.json();
          bookings = data.bookings || [];
        }

        populateSelectors();
        renderBookableResources();
        renderBookingsList();
      } catch (err) {
        console.error('Failed to load bookings data', err);
      }
    }

    function populateSelectors() {
      const bookableAssets = assets.filter(a => a.is_bookable === 1);

      // Book Resource selector
      const bookAssetSelect = document.getElementById('book-asset');
      if (bookAssetSelect) {
        bookAssetSelect.innerHTML = '<option value="" disabled selected>Select Resource...</option>' +
          bookableAssets.map(a => `<option value="${a.id}">${a.asset_tag} - ${a.name} (${a.location || 'N/A'})</option>`).join('');
      }

      // Employees selector
      const bookUserSelect = document.getElementById('book-user');
      if (bookUserSelect) {
        bookUserSelect.innerHTML = '<option value="" disabled selected>Select Employee Profile</option>' +
          employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('');
      }
    }

    function renderBookableResources() {
      const container = document.getElementById('bookable-resources-container');
      if (!container) return;

      const bookableAssets = assets.filter(a => a.is_bookable === 1);

      if (bookableAssets.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted small">No bookable resources found in the database.</div>`;
        return;
      }

      container.innerHTML = bookableAssets.map(a => `
        <div class="border rounded p-3 d-flex align-items-center justify-content-between bg-light bg-opacity-25 shadow-xs">
          <div>
            <span class="fw-semibold text-primary d-block">${a.asset_tag}</span>
            <strong class="text-dark d-block text-truncate" style="max-width: 180px;">${a.name}</strong>
            <small class="text-muted">${a.location || 'Storage Pool'}</small>
          </div>
          <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">Reservable</span>
        </div>
      `).join('');
    }

    function renderBookingsList() {
      const tbody = document.getElementById('bookings-table-body');
      if (!tbody) return;

      if (bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No reservations found.</td></tr>`;
        return;
      }

      tbody.innerHTML = bookings.map(b => {
        let statusBadge = 'bg-secondary';
        if (b.status === 'UPCOMING') statusBadge = 'bg-success';
        else if (b.status === 'ONGOING') statusBadge = 'bg-primary';
        else if (b.status === 'CANCELLED') statusBadge = 'bg-danger';
        else if (b.status === 'COMPLETED') statusBadge = 'bg-dark';

        const isUpcoming = b.status === 'UPCOMING';

        const formattedStart = b.start_time.replace('T', ' ').substring(0, 16);
        const formattedEnd = b.end_time.replace('T', ' ').substring(0, 16);

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${b.asset_tag}</td>
            <td class="fw-bold text-dark">${b.asset_name}</td>
            <td>${b.user_name}</td>
            <td>
              <div class="small">
                <strong>Start:</strong> ${formattedStart}<br>
                <strong>End:</strong> ${formattedEnd}
              </div>
            </td>
            <td>${b.purpose}</td>
            <td><span class="badge ${statusBadge} px-2.5 py-1.5 rounded">${b.status}</span></td>
            <td>
              ${isUpcoming 
                ? `<button class="btn btn-sm btn-outline-danger btn-cancel-booking" data-id="${b.id}">Cancel</button>` 
                : `<span class="text-muted small">-</span>`
              }
            </td>
          </tr>
        `;
      }).join('');

      // Bind Cancel Buttons
      document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
        btn.addEventListener('click', async () => {
          const bookingId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to cancel this reservation?')) {
            try {
              const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
              if (res.ok) {
                alert('Reservation cancelled successfully!');
                loadData();
              } else {
                const data = await res.json();
                alert(data.error ? data.error.message : 'Cancellation failed.');
              }
            } catch (err) {
              console.error(err);
              alert('Connection failed');
            }
          }
        });
      });
    }

    // Handle Form Submit
    const formBooking = document.getElementById('form-create-booking');
    if (formBooking) {
      formBooking.addEventListener('submit', async (e) => {
        e.preventDefault();

        const assetId = document.getElementById('book-asset').value;
        const bookedBy = document.getElementById('book-user').value;
        const startTime = document.getElementById('book-start').value;
        const endTime = document.getElementById('book-end').value;
        const purpose = document.getElementById('book-purpose').value.trim();

        if (!assetId || !bookedBy || !startTime || !endTime || !purpose) {
          alert('Please fill out all required fields.');
          return;
        }

        const startDt = new Date(startTime);
        const endDt = new Date(endTime);

        if (startDt >= endDt) {
          alert('Error: End time must be after the start time.');
          return;
        }

        // Get matching employee's department ID
        const emp = employees.find(e => e.id === parseInt(bookedBy, 10));
        const departmentId = emp ? emp.department_id : null;

        try {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId,
              startTime,
              endTime,
              purpose,
              departmentId
            })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Resource reserved successfully!');
            formBooking.reset();

            dismissModal('modal-create-booking');
            loadData();
          } else {
            alert(data.error ? data.error.message : 'Reservation failed.');
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
