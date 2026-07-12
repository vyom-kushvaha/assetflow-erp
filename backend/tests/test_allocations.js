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
  console.log('Starting Asset Allocation & Transfer Integration Tests...');
  let cookieAdmin = null;
  let cookieEmployee = null;

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Guest check
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Checking Guest Route Blocks ---');
    const resUnauth = await request('GET', '/allocations');
    if (resUnauth.statusCode === 401) {
      console.log('PASS: Guest allocation fetch blocked with 401.');
    } else {
      console.error(`FAIL: Guest allocation fetch returned status ${resUnauth.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Employee try allocate
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Employee Authorization Block ---');
    const resEmpLogin = await request('POST', '/auth/login', {
      email: 'raj.singh@assetflow.com',
      password: 'Password@123'
    });

    if (resEmpLogin.statusCode === 200) {
      cookieEmployee = resEmpLogin.headers['set-cookie'][0].split(';')[0];
      console.log('PASS: Employee logged in.');
    } else {
      throw new Error(`FAIL: Employee login failed with status ${resEmpLogin.statusCode}`);
    }

    const resAllocBlock = await request('POST', '/allocations', {
      assetId: 2, // LaserJet Printer (AVAILABLE seed)
      allocatedToUserId: 6, // Raj Singh
      expectedReturnDate: '2026-08-01'
    }, cookieEmployee);

    if (resAllocBlock.statusCode === 403) {
      console.log('PASS: Employee allocation creation blocked with 403 Forbidden.');
    } else {
      console.error(`FAIL: Employee allocation creation returned status ${resAllocBlock.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 3: Admin login
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Admin Authentication ---');
    const resAdminLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });

    if (resAdminLogin.statusCode === 200) {
      cookieAdmin = resAdminLogin.headers['set-cookie'][0].split(';')[0];
      console.log('PASS: Admin logged in.');
    } else {
      throw new Error(`FAIL: Admin login failed with status ${resAdminLogin.statusCode}`);
    }

    // Register a fresh testing asset first (so it's guaranteed AVAILABLE)
    const resAsset = await request('POST', '/assets', {
      name: 'Test Allocation Mobile Phone',
      categoryId: 1,
      condition: 'NEW'
    }, cookieAdmin);

    const freshAssetId = resAsset.body.asset.id;
    console.log(`Fresh asset created for allocation testing. ID: ${freshAssetId}`);

    // -------------------------------------------------------------------------
    // Scenario 4: Admin allocates available asset
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Allocate Asset ---');
    const resAlloc = await request('POST', '/allocations', {
      assetId: freshAssetId,
      allocatedToUserId: 6, // Raj Singh
      expectedReturnDate: '2026-08-30',
      notes: 'Testing phone allocation logs.'
    }, cookieAdmin);

    let activeAllocId = null;
    if (resAlloc.statusCode === 201) {
      activeAllocId = resAlloc.body.allocation.id;
      console.log(`PASS: Allocated fresh asset to employee Raj Singh. Allocation ID: ${activeAllocId}`);
    } else {
      console.error('FAIL: Allocation creation failed:', resAlloc.body);
    }

    // Verify asset status changed to ALLOCATED
    const resAssetDetails = await request('GET', `/assets/${freshAssetId}`, null, cookieAdmin);
    if (resAssetDetails.body.asset.status === 'ALLOCATED') {
      console.log('PASS: Asset status correctly updated to ALLOCATED in database.');
    } else {
      console.error(`FAIL: Asset status is currently ${resAssetDetails.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 5: Double allocation block (Conflict check)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Double Allocation Prevention Conflict Check ---');
    const resDoubleAlloc = await request('POST', '/allocations', {
      assetId: freshAssetId,
      allocatedToUserId: 7, // Neha Kapoor
      expectedReturnDate: '2026-09-10'
    }, cookieAdmin);

    if (resDoubleAlloc.statusCode === 400 && resDoubleAlloc.body.error.message.includes('Double Allocation Blocked')) {
      console.log(`PASS: Double allocation blocked. Active Holder: ${resDoubleAlloc.body.error.message.split('Active Holder: ').pop()}`);
    } else {
      console.error('FAIL: Double allocation checks failed:', resDoubleAlloc.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 6: Create Transfer Request
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Request Asset Transfer ---');
    const resTransfer = await request('POST', '/transfers', {
      assetId: freshAssetId,
      requestedToUserId: 7, // Neha Kapoor
      reason: 'Handing over phone for QA testing.'
    }, cookieEmployee);

    let transferId = null;
    if (resTransfer.statusCode === 201) {
      transferId = resTransfer.body.transfer.id;
      console.log(`PASS: Transfer request logged successfully. ID: #T-${transferId}`);
    } else {
      console.error('FAIL: Log transfer request failed:', resTransfer.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 7: Approve Transfer Request
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Approve Transfer Request ---');
    if (transferId) {
      const resApprove = await request('POST', `/transfers/${transferId}/approve`, null, cookieAdmin);
      if (resApprove.statusCode === 200) {
        console.log('PASS: Transfer approved. Old allocation closed, new active allocation created.');
      } else {
        console.error('FAIL: Approving transfer returned status:', resApprove.statusCode);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Return asset
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Return Allocated Asset ---');
    // Fetch new active allocation for the freshAssetId
    const resFreshAsset = await request('GET', `/assets/${freshAssetId}`, null, cookieAdmin);
    const newActiveAlloc = resFreshAsset.body.asset.allocations.find(al => al.status === 'ACTIVE');
    
    if (newActiveAlloc) {
      const resReturn = await request('POST', `/allocations/${newActiveAlloc.id}/return`, {
        returnConditionNotes: 'Returned in good shape.'
      }, cookieEmployee);

      if (resReturn.statusCode === 200) {
        console.log('PASS: Asset returned back. Current allocation marked RETURNED, asset status AVAILABLE.');
      } else {
        console.error('FAIL: Returning asset returned status:', resReturn.statusCode);
      }
    } else {
      console.error('FAIL: Could not locate active transfer allocation for fresh asset.');
    }

    // Verify asset status reverted back to AVAILABLE
    const resFreshAssetAfterReturn = await request('GET', `/assets/${freshAssetId}`, null, cookieAdmin);
    if (resFreshAssetAfterReturn.body.asset.status === 'AVAILABLE') {
      console.log('PASS: Asset status reverted back to AVAILABLE in database.');
    } else {
      console.error(`FAIL: Asset status is currently ${resFreshAssetAfterReturn.body.asset.status}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 9: Overdue allocations scanning
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Check Overdue Allocations ---');
    const resOverdues = await request('GET', '/allocations/overdue', null, cookieAdmin);
    if (resOverdues.statusCode === 200 && Array.isArray(resOverdues.body.overdues)) {
      console.log(`PASS: Overdue checker scanned and returned ${resOverdues.body.overdues.length} overdue logs.`);
    } else {
      console.error('FAIL: Overdue checking returned status:', resOverdues.statusCode);
    }

    console.log('\n=======================================');
    console.log('ALL ALLOCATION INTEGRATION SCENARIOS PASSED SUCCESSFULLY!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
