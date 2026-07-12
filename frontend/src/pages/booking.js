import { renderLayout, bindLayoutEvents } from '../layouts/layout.js';
import { getState, saveState, logActivity } from '../utils/state.js';

export const BookingPage = {
  render() {
    const state = getState();
    const bookableAssets = state.assets.filter(a => a.bookable || a.is_bookable === 1);
    const employees = state.employees;

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
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Bookable assets quick lookup -->
        <div class="col-xl-4">
          <div class="card card-shadow border-light-subtle rounded-3 p-4 bg-white h-100">
            <h4 class="h5 fw-bold mb-3 text-dark">Bookable Resources</h4>
            <div class="d-flex flex-column gap-2" style="max-height: 480px; overflow-y: auto;">
              ${bookableAssets.map(a => `
                <div class="border rounded p-3 d-flex align-items-center justify-content-between bg-light bg-opacity-25">
                  <div>
                    <span class="fw-semibold text-primary d-block">${a.tag}</span>
                    <strong class="text-dark d-block text-truncate" style="max-width: 180px;">${a.name}</strong>
                    <small class="text-muted">${a.location}</small>
                  </div>
                  <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">Reservable</span>
                </div>
              `).join('')}
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
                    ${bookableAssets.map(a => `<option value="${a.id}">${a.tag} - ${a.name} (${a.location})</option>`).join('')}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold" for="book-user">Reserved By *</label>
                  <select class="form-select" id="book-user" required>
                    <option value="" disabled selected>Select Employee Profile</option>
                    ${employees.map(e => `<option value="${e.id}">${e.name} (${e.email})</option>`).join('')}
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

    function renderBookingsList() {
      const state = getState();
      const bookings = state.bookings;
      const assets = state.assets;
      const employees = state.employees;

      const tbody = document.getElementById('bookings-table-body');
      if (bookings.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">No reservations found.</td>
          </tr>
        `;
        return;
      }

      // Sort by start time descending
      const sorted = [...bookings].sort((a, b) => new Date(b.start) - new Date(a.start));

      tbody.innerHTML = sorted.map(b => {
        const asset = assets.find(a => a.id === b.assetId);
        const assetTag = asset ? asset.tag : 'N/A';
        const assetName = asset ? asset.name : 'Unknown';

        const emp = employees.find(e => e.id === b.bookedBy);
        const empName = emp ? emp.name : 'System User';

        let statusBadge = 'bg-secondary';
        if (b.status === 'UPCOMING') statusBadge = 'bg-success';
        else if (b.status === 'CANCELLED') statusBadge = 'bg-danger';

        const isUpcoming = b.status === 'UPCOMING';

        return `
          <tr class="fade-in-el">
            <td class="fw-semibold text-primary py-3">${assetTag}</td>
            <td class="fw-bold text-dark">${assetName}</td>
            <td>${empName}</td>
            <td>
              <div class="small">
                <strong>Start:</strong> ${b.start}<br>
                <strong>End:</strong> ${b.end}
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
        btn.addEventListener('click', (e) => {
          const bookingId = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('Are you sure you want to cancel this reservation?')) {
            const state = getState();
            const booking = state.bookings.find(b => b.id === bookingId);
            if (booking) {
              booking.status = 'CANCELLED';
              saveState(state);
              logActivity(`Cancelled resource booking ID #${bookingId}`, 'BOOKING');
              router.navigateTo('/booking');
            }
          }
        });
      });
    }

    // Handle Form Submit
    const formBooking = document.getElementById('form-create-booking');
    if (formBooking) {
      formBooking.addEventListener('submit', (e) => {
        e.preventDefault();

        const assetId = parseInt(document.getElementById('book-asset').value, 10);
        const bookedBy = parseInt(document.getElementById('book-user').value, 10);
        const startRaw = document.getElementById('book-start').value;
        const endRaw = document.getElementById('book-end').value;
        const purpose = document.getElementById('book-purpose').value.trim();

        if (isNaN(assetId) || isNaN(bookedBy) || !startRaw || !endRaw || !purpose) {
          alert('Please fill out all required fields.');
          return;
        }

        const start = startRaw.replace('T', ' ') + ':00';
        const end = endRaw.replace('T', ' ') + ':00';

        const startTime = new Date(startRaw);
        const endTime = new Date(endRaw);

        if (startTime >= endTime) {
          alert('Error: End time must be after the start time.');
          return;
        }

        const state = getState();

        // Business Rule: Enforce overlap conflict checks
        // (existing.start < new.end AND existing.end > new.start)
        const hasConflict = state.bookings.some(b => {
          if (b.assetId !== assetId || b.status !== 'UPCOMING') return false;
          
          const bStart = new Date(b.start.replace(' ', 'T'));
          const bEnd = new Date(b.end.replace(' ', 'T'));

          return (bStart < endTime && bEnd > startTime);
        });

        if (hasConflict) {
          alert('Reservation Conflict: This resource is already reserved during the requested time slot.');
          return;
        }

        const emp = state.employees.find(e => e.id === bookedBy);
        const deptId = emp ? emp.departmentId : 1;

        // Add booking
        const newBooking = {
          id: state.bookings.length + 1,
          assetId,
          bookedBy,
          departmentId: deptId,
          start,
          end,
          status: 'UPCOMING',
          purpose
        };

        state.bookings.push(newBooking);
        saveState(state);
        logActivity(`Created resource booking for asset ID: ${assetId}`, 'BOOKING');

        // Reset and close
        formBooking.reset();
        const modalEl = document.getElementById('modal-create-booking');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }

        router.navigateTo('/booking');
        alert('Resource reserved successfully!');
      });
    }

    renderBookingsList();
  }
};
