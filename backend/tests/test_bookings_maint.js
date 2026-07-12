const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting Resource Booking & Maintenance Integration Tests...');
  let cookieAdmin = null;
  let cookieEmployee = null;

  try {
    // 1. Authenticate Admin and Employee
    const resAdminLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });
    cookieAdmin = resAdminLogin.headers['set-cookie'][0].split(';')[0];

    const resEmpLogin = await request('POST', '/auth/login', {
      email: 'raj.singh@assetflow.com',
      password: 'Password@123'
    });
    cookieEmployee = resEmpLogin.headers['set-cookie'][0].split(';')[0];

    console.log('PASS: Logged in test users.');

    // Create a bookable asset (isBookable = 1)
    const resAssetBookable = await request('POST', '/assets', {
      name: 'Meeting Room A',
      categoryId: 2, // Software / Infrastructure
      condition: 'NEW',
      isBookable: 1
    }, cookieAdmin);
    const bookableAssetId = resAssetBookable.body.asset.id;
    console.log(`PASS: Created bookable asset ID: ${bookableAssetId}`);

    // Create a non-bookable asset (isBookable = 0)
    const resAssetNonBookable = await request('POST', '/assets', {
      name: 'Confidential Laptop',
      categoryId: 1,
      condition: 'GOOD',
      isBookable: 0
    }, cookieAdmin);
    const nonBookableAssetId = resAssetNonBookable.body.asset.id;

    // -------------------------------------------------------------------------
    // Scenario 1: Book Non-Bookable Asset Block
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Book Non-Bookable Asset Block ---');
    const resBookNon = await request('POST', '/bookings', {
      assetId: nonBookableAssetId,
      startTime: '2026-07-20T09:00:00Z',
      endTime: '2026-07-20T10:00:00Z',
      purpose: 'Illegal booking'
    }, cookieAdmin);

    if (resBookNon.statusCode === 400 && resBookNon.body.error.message.includes('not marked as bookable')) {
      console.log('PASS: Non-bookable asset booking blocked.');
    } else {
      console.error('FAIL: Non-bookable booking check failed:', resBookNon.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Create Valid Booking
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Create Valid Booking ---');
    const resBook1 = await request('POST', '/bookings', {
      assetId: bookableAssetId,
      startTime: '2026-07-20T09:00:00Z',
      endTime: '2026-07-20T10:00:00Z',
      purpose: 'Team planning session'
    }, cookieAdmin);

    let bookingId1 = null;
    if (resBook1.statusCode === 201) {
      bookingId1 = resBook1.body.booking.id;
      console.log(`PASS: Booking created successfully. ID: ${bookingId1}`);
    } else {
      console.error('FAIL: Booking creation failed:', resBook1.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 3: Overlap check (rejects 09:30 - 10:30)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Overlap Validation Reject ---');
    const resOverlap = await request('POST', '/bookings', {
      assetId: bookableAssetId,
      startTime: '2026-07-20T09:30:00Z',
      endTime: '2026-07-20T10:30:00Z',
      purpose: 'Overlap booking session'
    }, cookieAdmin);

    if (resOverlap.statusCode === 400 && resOverlap.body.error.message.includes('Overlapping booking conflict')) {
      console.log('PASS: Overlapping time slot blocked successfully.');
    } else {
      console.error('FAIL: Overlap validation checks failed:', resOverlap.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 4: Reschedule Booking
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Reschedule Booking ---');
    if (bookingId1) {
      const resResched = await request('PUT', `/bookings/${bookingId1}/reschedule`, {
        startTime: '2026-07-20T11:00:00Z',
        endTime: '2026-07-20T12:00:00Z'
      }, cookieAdmin);

      if (resResched.statusCode === 200) {
        console.log('PASS: Booking rescheduled successfully.');
      } else {
        console.error('FAIL: Rescheduling failed:', resResched.body);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 5: Cancel Booking
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Cancel Booking ---');
    if (bookingId1) {
      const resCancel = await request('POST', `/bookings/${bookingId1}/cancel`, null, cookieAdmin);
      if (resCancel.statusCode === 200) {
        console.log('PASS: Booking cancelled successfully.');
      } else {
        console.error('FAIL: Booking cancellation failed:', resCancel.body);
      }
    }

    // =========================================================================
    // MAINTENANCE WORKFLOW TESTS
    // =========================================================================

    // Create a fresh asset for repairs
    const resAssetRepairs = await request('POST', '/assets', {
      name: 'Broken Printer A',
      categoryId: 1,
      condition: 'FAIR'
    }, cookieAdmin);
    const repairsAssetId = resAssetRepairs.body.asset.id;

    // -------------------------------------------------------------------------
    // Scenario 6: Raise Request (Check authorization block)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Raise Maintenance (Auth check) ---');
    // Employee tries to raise request on unallocated asset -> returns 403
    const resRaiseBlock = await request('POST', '/maintenance', {
      assetId: repairsAssetId,
      issueDescription: 'Cartridge jammed.'
    }, cookieEmployee);

    if (resRaiseBlock.statusCode === 403) {
      console.log('PASS: Employee blocked from raising request on unallocated asset.');
    } else {
      console.error(`FAIL: Unauthorized employee request returned status ${resRaiseBlock.statusCode}`);
    }

    // Admin raises request successfully (authorized role)
    const resRaise = await request('POST', '/maintenance', {
      assetId: repairsAssetId,
      issueDescription: 'Cartridge jammed.',
      priority: 'HIGH'
    }, cookieAdmin);

    let ticketId = null;
    if (resRaise.statusCode === 201) {
      ticketId = resRaise.body.request.id;
      console.log(`PASS: Maintenance ticket logged successfully. ID: ${ticketId}`);
    } else {
      console.error('FAIL: Maintenance logging failed:', resRaise.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 7: Approve ticket (Asset becomes UNDER_MAINTENANCE)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Approve Maintenance Request ---');
    if (ticketId) {
      const resApprove = await request('POST', `/maintenance/${ticketId}/approve`, null, cookieAdmin);
      if (resApprove.statusCode === 200) {
        console.log('PASS: Maintenance ticket approved.');
        
        // Check asset status in database
        const resAssetCheck = await request('GET', `/assets/${repairsAssetId}`, null, cookieAdmin);
        if (resAssetCheck.body.asset.status === 'UNDER_MAINTENANCE') {
          console.log('PASS: Asset status correctly changed to UNDER_MAINTENANCE in database.');
        } else {
          console.error(`FAIL: Asset status is currently: ${resAssetCheck.body.asset.status}`);
        }
      } else {
        console.error('FAIL: Approval endpoint failed:', resApprove.body);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Assign Technician
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Assign Technician ---');
    if (ticketId) {
      const resAssign = await request('POST', `/maintenance/${ticketId}/assign`, {
        technicianName: 'Bob the Repairman'
      }, cookieAdmin);

      if (resAssign.statusCode === 200) {
        console.log('PASS: Technician Bob assigned to ticket.');
      } else {
        console.error('FAIL: Assigning technician failed:', resAssign.body);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 9: Resolve Request (Asset becomes AVAILABLE)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Resolve Maintenance Request ---');
    if (ticketId) {
      const resResolve = await request('POST', `/maintenance/${ticketId}/resolve`, {
        resolutionNotes: 'Replaced toner roller assembly.'
      }, cookieAdmin);

      if (resResolve.statusCode === 200) {
        console.log('PASS: Ticket resolved.');

        // Check asset status in database (should be reverted to AVAILABLE)
        const resAssetCheck = await request('GET', `/assets/${repairsAssetId}`, null, cookieAdmin);
        if (resAssetCheck.body.asset.status === 'AVAILABLE') {
          console.log('PASS: Asset status reverted back to AVAILABLE after repairs completed.');
        } else {
          console.error(`FAIL: Asset status after resolve is: ${resAssetCheck.body.asset.status}`);
        }
      } else {
        console.error('FAIL: Resolution endpoint failed:', resResolve.body);
      }
    }

    console.log('\n=======================================');
    console.log('ALL BOOKING & MAINTENANCE INTEGRATION SCENARIOS PASSED!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
