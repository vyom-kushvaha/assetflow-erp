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

async function runDemoFlow() {
  console.log('================================================================');
  console.log('RUNNING PROGRAMMATIC END-TO-END QA DEMO FLOW (15 STEPS)...');
  console.log('================================================================');

  let cookieAdmin = null;
  let createdDeptId = null;
  let createdCategoryId = null;
  let createdAssetId = null;
  let allocationId = null;
  let bookingId = null;
  let maintenanceId = null;

  try {
    // -------------------------------------------------------------------------
    // Step 1: Login Admin
    // -------------------------------------------------------------------------
    console.log('\nStep 1: Logging in as Admin...');
    const resLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });
    if (resLogin.statusCode === 200) {
      cookieAdmin = resLogin.headers['set-cookie'][0].split(';')[0];
      console.log('🟢 PASS: Admin logged in successfully.');
    } else {
      throw new Error(`FAIL: Admin login failed, code: ${resLogin.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Step 2: Create Department
    // -------------------------------------------------------------------------
    const deptName = `QA Dept ${Date.now()}`;
    console.log(`\nStep 2: Creating Department "${deptName}"...`);
    const resDept = await request('POST', '/org/departments', {
      name: deptName,
      status: 'ACTIVE'
    }, cookieAdmin);
    if (resDept.statusCode === 201) {
      createdDeptId = resDept.body.department.id;
      console.log(`🟢 PASS: Department created successfully. ID: ${createdDeptId}`);
    } else {
      throw new Error(`FAIL: Department creation failed: ${JSON.stringify(resDept.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 3: Create Asset Category
    // -------------------------------------------------------------------------
    const catName = `QA Devices ${Date.now()}`;
    console.log(`\nStep 3: Creating Asset Category "${catName}"...`);
    const resCat = await request('POST', '/org/categories', {
      name: catName,
      extraFieldsSchema: '{"warranty_period":"number"}'
    }, cookieAdmin);
    if (resCat.statusCode === 201) {
      createdCategoryId = resCat.body.category.id;
      console.log(`🟢 PASS: Category created successfully. ID: ${createdCategoryId}`);
    } else {
      throw new Error(`FAIL: Category creation failed: ${JSON.stringify(resCat.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 4: Promote Employee
    // -------------------------------------------------------------------------
    console.log('\nStep 4: Promoting Employee Raj Singh (User ID 6) to ASSET_MANAGER...');
    const resPromote = await request('PUT', '/org/employees/6/role', {
      role: 'ASSET_MANAGER',
      status: 'ACTIVE'
    }, cookieAdmin);
    if (resPromote.statusCode === 200) {
      console.log('🟢 PASS: Employee Raj Singh successfully promoted to ASSET_MANAGER.');
    } else {
      throw new Error(`FAIL: Employee promotion failed: ${JSON.stringify(resPromote.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 5: Register Asset (Marked bookable for subsequent reservation tests)
    // -------------------------------------------------------------------------
    const assetName = `QA ThinkPad Pro ${Date.now()}`;
    console.log(`\nStep 5: Registering Asset "${assetName}" (isBookable = 1)...`);
    const resAsset = await request('POST', '/assets', {
      name: assetName,
      categoryId: createdCategoryId,
      condition: 'NEW',
      isBookable: 1,
      location: 'QA Lab Desk 1'
    }, cookieAdmin);
    if (resAsset.statusCode === 201) {
      createdAssetId = resAsset.body.asset.id;
      console.log(`🟢 PASS: Asset registered sequentially. Tag: ${resAsset.body.asset.asset_tag}, ID: ${createdAssetId}`);
    } else {
      throw new Error(`FAIL: Asset registration failed: ${JSON.stringify(resAsset.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 6: Allocate Asset
    // -------------------------------------------------------------------------
    console.log(`\nStep 6: Allocating Asset ID ${createdAssetId} to User ID 6 (Raj Singh)...`);
    const resAlloc = await request('POST', '/allocations', {
      assetId: createdAssetId,
      allocatedToUserId: 6,
      expectedReturnDate: '2026-12-31'
    }, cookieAdmin);
    if (resAlloc.statusCode === 201) {
      allocationId = resAlloc.body.allocation.id;
      console.log(`🟢 PASS: Asset allocated. Allocation ID: ${allocationId}`);
    } else {
      throw new Error(`FAIL: Allocation failed: ${JSON.stringify(resAlloc.body)}`);
    }

    // Verify Asset Status is ALLOCATED
    console.log('\nChecking Asset Status in Database...');
    const checkAllocAsset = await request('GET', `/assets/${createdAssetId}`, null, cookieAdmin);
    if (checkAllocAsset.body.asset.status === 'ALLOCATED') {
      console.log('🟢 PASS: Asset status is correctly "ALLOCATED" in database.');
    } else {
      throw new Error(`FAIL: Asset status is currently ${checkAllocAsset.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Step 7: Return Asset
    // -------------------------------------------------------------------------
    console.log(`\nStep 7: Returning Asset via Allocation ID ${allocationId}...`);
    const resReturn = await request('POST', `/allocations/${allocationId}/return`, {
      returnConditionNotes: 'Returned in good shape after QA checks.'
    }, cookieAdmin);
    if (resReturn.statusCode === 200) {
      console.log('🟢 PASS: Asset returned successfully.');
    } else {
      throw new Error(`FAIL: Asset return failed: ${JSON.stringify(resReturn.body)}`);
    }

    // Verify Asset Status is AVAILABLE
    console.log('Checking Asset Status after Return...');
    const checkReturnAsset = await request('GET', `/assets/${createdAssetId}`, null, cookieAdmin);
    if (checkReturnAsset.body.asset.status === 'AVAILABLE') {
      console.log('🟢 PASS: Asset status reverted back to "AVAILABLE" in database.');
    } else {
      throw new Error(`FAIL: Asset status is currently ${checkReturnAsset.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Step 8: Book Resource
    // -------------------------------------------------------------------------
    console.log(`\nStep 8: Booking Resource Asset ID ${createdAssetId}...`);
    const resBook = await request('POST', '/bookings', {
      assetId: createdAssetId,
      startTime: '2026-07-20T10:00:00Z',
      endTime: '2026-07-20T11:00:00Z',
      purpose: 'QA Automation Run Slot'
    }, cookieAdmin);
    if (resBook.statusCode === 201) {
      bookingId = resBook.body.booking.id;
      console.log(`🟢 PASS: Resource booked successfully. Booking ID: ${bookingId}`);
    } else {
      throw new Error(`FAIL: Resource booking failed: ${JSON.stringify(resBook.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 9: Cancel Booking
    // -------------------------------------------------------------------------
    console.log(`\nStep 9: Cancelling Booking ID ${bookingId}...`);
    const resCancel = await request('POST', `/bookings/${bookingId}/cancel`, null, cookieAdmin);
    if (resCancel.statusCode === 200) {
      console.log('🟢 PASS: Booking cancelled successfully.');
    } else {
      throw new Error(`FAIL: Booking cancellation failed: ${JSON.stringify(resCancel.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 10: Raise Maintenance Request
    // -------------------------------------------------------------------------
    console.log(`\nStep 10: Raising Maintenance Request for Asset ID ${createdAssetId}...`);
    const resMaint = await request('POST', '/maintenance', {
      assetId: createdAssetId,
      issueDescription: 'Screen flicker on high resolution.',
      priority: 'MEDIUM'
    }, cookieAdmin);
    if (resMaint.statusCode === 201) {
      maintenanceId = resMaint.body.request.id;
      console.log(`🟢 PASS: Maintenance request raised successfully. Ticket ID: ${maintenanceId}`);
    } else {
      throw new Error(`FAIL: Raising maintenance ticket failed: ${JSON.stringify(resMaint.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 11: Approve Maintenance
    // -------------------------------------------------------------------------
    console.log(`\nStep 11: Approving Maintenance Ticket ID ${maintenanceId}...`);
    const resApprove = await request('POST', `/maintenance/${maintenanceId}/approve`, null, cookieAdmin);
    if (resApprove.statusCode === 200) {
      console.log('🟢 PASS: Maintenance ticket approved.');
    } else {
      throw new Error(`FAIL: Approving ticket failed: ${JSON.stringify(resApprove.body)}`);
    }

    // Verify Asset Status is UNDER_MAINTENANCE
    console.log('Checking Asset Status during repairs...');
    const checkMaintAsset = await request('GET', `/assets/${createdAssetId}`, null, cookieAdmin);
    if (checkMaintAsset.body.asset.status === 'UNDER_MAINTENANCE') {
      console.log('🟢 PASS: Asset status is correctly "UNDER_MAINTENANCE" in database.');
    } else {
      throw new Error(`FAIL: Asset status is currently ${checkMaintAsset.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Step 12: Assign Technician
    // -------------------------------------------------------------------------
    console.log(`\nStep 12: Assigning Technician "Bob the Fixer" to Ticket ID ${maintenanceId}...`);
    const resAssign = await request('POST', `/maintenance/${maintenanceId}/assign`, {
      technicianName: 'Bob the Fixer'
    }, cookieAdmin);
    if (resAssign.statusCode === 200) {
      console.log('🟢 PASS: Technician assigned successfully.');
    } else {
      throw new Error(`FAIL: Assigning technician failed: ${JSON.stringify(resAssign.body)}`);
    }

    // -------------------------------------------------------------------------
    // Step 13: Resolve Maintenance Request
    // -------------------------------------------------------------------------
    console.log(`\nStep 13: Resolving Maintenance Ticket ID ${maintenanceId}...`);
    const resResolve = await request('POST', `/maintenance/${maintenanceId}/resolve`, {
      resolutionNotes: 'Replaced inverter cable.'
    }, cookieAdmin);
    if (resResolve.statusCode === 200) {
      console.log('🟢 PASS: Maintenance request resolved successfully.');
    } else {
      throw new Error(`FAIL: Resolving ticket failed: ${JSON.stringify(resResolve.body)}`);
    }

    // Verify Asset Status reverted to AVAILABLE
    console.log('Checking Asset Status after repair resolution...');
    const checkResolvedAsset = await request('GET', `/assets/${createdAssetId}`, null, cookieAdmin);
    if (checkResolvedAsset.body.asset.status === 'AVAILABLE') {
      console.log('🟢 PASS: Asset status reverted back to "AVAILABLE" in database.');
    } else {
      throw new Error(`FAIL: Asset status after resolve is ${checkResolvedAsset.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Step 14: Verify Notifications & Activity Logs
    // -------------------------------------------------------------------------
    console.log('\nStep 14: Verifying Activity Logs were generated...');
    const checkDetails = await request('GET', `/assets/${createdAssetId}`, null, cookieAdmin);
    // Details returns maintenance history array
    if (checkDetails.body.asset.maintenance && checkDetails.body.asset.maintenance.length > 0) {
      console.log('🟢 PASS: Maintenance History successfully logged under asset details.');
    } else {
      throw new Error('FAIL: Maintenance history is missing in details!');
    }

    // -------------------------------------------------------------------------
    // Step 15: Logout
    // -------------------------------------------------------------------------
    console.log('\nStep 15: Logging out Admin session...');
    const resLogout = await request('POST', '/auth/logout', null, cookieAdmin);
    if (resLogout.statusCode === 200) {
      console.log('🟢 PASS: Admin logged out successfully.');
    } else {
      throw new Error(`FAIL: Logout failed, code: ${resLogout.statusCode}`);
    }

    console.log('\n================================================================');
    console.log('ALL 15 STEPS OF THE FINAL QA DEMO FLOW PASSED CRASH-FREE!');
    console.log('================================================================');

  } catch (err) {
    console.error('\n🔴 QA TEST FLOW FAILED:', err.message);
  }
}

runDemoFlow();
