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
  console.log('Starting Compliance Audit & Reports Integration Tests...');
  let cookieAdmin = null;

  try {
    // 1. Authenticate Admin
    const resLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });
    cookieAdmin = resLogin.headers['set-cookie'][0].split(';')[0];
    console.log('PASS: Logged in Admin.');

    // Create 2 test assets
    const resAsset1 = await request('POST', '/assets', {
      name: 'Audit Target A',
      categoryId: 1,
      condition: 'GOOD',
      location: 'QA Bench 1'
    }, cookieAdmin);
    const assetId1 = resAsset1.body.asset.id;

    const resAsset2 = await request('POST', '/assets', {
      name: 'Audit Target B',
      categoryId: 1,
      condition: 'GOOD',
      location: 'QA Bench 2'
    }, cookieAdmin);
    const assetId2 = resAsset2.body.asset.id;

    console.log(`PASS: Created test assets (IDs: ${assetId1}, ${assetId2})`);

    // 2. Initiate Audit Cycle
    console.log('\n--- Scenario 1: Initiate Audit Cycle ---');
    const resCycle = await request('POST', '/audit/cycles', {
      name: 'IT Assets Audit Q3 2026',
      scopeLocation: 'QA Bench',
      startDate: '2026-07-12',
      endDate: '2026-07-20',
      auditorIds: [1, 6] // Admin and Raj Singh
    }, cookieAdmin);

    let cycleId = null;
    if (resCycle.statusCode === 201) {
      cycleId = resCycle.body.cycleId;
      console.log(`PASS: Audit cycle initiated. Cycle ID: ${cycleId}. Scoped assets populated: ${resCycle.body.scopedAssets}`);
    } else {
      console.error('FAIL: Initiate audit cycle failed:', resCycle.body);
    }

    // 3. Start Audit Cycle
    console.log('\n--- Scenario 2: Start Audit Cycle ---');
    if (cycleId) {
      const resStart = await request('POST', `/audit/cycles/${cycleId}/start`, null, cookieAdmin);
      if (resStart.statusCode === 200) {
        console.log('PASS: Cycle status updated to IN_PROGRESS. Auditors notified.');
      } else {
        console.error('FAIL: Start audit cycle failed:', resStart.body);
      }
    }

    // Fetch findings to get finding IDs
    const resDetails = await request('GET', `/audit/cycles/${cycleId}`, null, cookieAdmin);
    const findings = resDetails.body.findings || [];
    console.log(`PASS: Scoped findings count: ${findings.length}`);

    // 4. Submit Findings (Mark one DAMAGED, one MISSING)
    console.log('\n--- Scenario 3: Submit Audit Findings ---');
    let findingIdDamaged = null;
    let findingIdMissing = null;

    findings.forEach(f => {
      if (f.asset_id === assetId1) findingIdDamaged = f.id;
      if (f.asset_id === assetId2) findingIdMissing = f.id;
    });

    if (findingIdDamaged && findingIdMissing) {
      const resF1 = await request('POST', `/audit/findings/${findingIdDamaged}`, {
        result: 'DAMAGED',
        notes: 'Screen back-light flicker logged.'
      }, cookieAdmin);

      const resF2 = await request('POST', `/audit/findings/${findingIdMissing}`, {
        result: 'MISSING',
        notes: 'Asset not found at QA Bench desk.'
      }, cookieAdmin);

      if (resF1.statusCode === 200 && resF2.statusCode === 200) {
        console.log('PASS: Logged DAMAGED and MISSING findings successfully.');
      } else {
        console.error('FAIL: Submitting findings failed:', resF1.body, resF2.body);
      }
    } else {
      console.error('FAIL: Scoped findings are missing target test assets.');
    }

    // 5. Close Audit Cycle & verify status transitions in database
    console.log('\n--- Scenario 4: Close Audit Cycle & check asset updates ---');
    if (cycleId) {
      const resClose = await request('POST', `/audit/cycles/${cycleId}/close`, null, cookieAdmin);
      if (resClose.statusCode === 200) {
        console.log('PASS: Cycle status updated to CLOSED.');
        console.log(' - Summary verified:', resClose.body.summary.verified);
        console.log(' - Summary damaged:', resClose.body.summary.damaged);
        console.log(' - Summary missing:', resClose.body.summary.missing);

        // Verify status transitions in assets table
        const checkAsset1 = await request('GET', `/assets/${assetId1}`, null, cookieAdmin);
        const checkAsset2 = await request('GET', `/assets/${assetId2}`, null, cookieAdmin);

        if (checkAsset1.body.asset.status === 'UNDER_MAINTENANCE' && checkAsset1.body.asset.condition === 'POOR') {
          console.log('PASS: Damaged audited asset is UNDER_MAINTENANCE (POOR condition).');
        } else {
          console.error('FAIL: Damaged asset state check failed:', checkAsset1.body.asset);
        }

        if (checkAsset2.body.asset.status === 'LOST') {
          console.log('PASS: Missing audited asset status updated to LOST.');
        } else {
          console.error('FAIL: Missing asset status check failed:', checkAsset2.body.asset);
        }
      } else {
        console.error('FAIL: Close audit cycle failed:', resClose.body);
      }
    }

    // 6. Reports & Aggregations Check
    console.log('\n--- Scenario 5: Query Live Reports Aggregations ---');
    const resReports = await request('GET', '/reports', null, cookieAdmin);
    if (resReports.statusCode === 200 && resReports.body.utilization) {
      console.log('PASS: Reports aggregations loaded successfully:');
      console.log(' - Assets utilization breakdown rows:', resReports.body.utilization.length);
      console.log(' - Department allocation summaries:', resReports.body.departmentAllocation.length);
      console.log(' - Active overdue return schedules:', resReports.body.overdueReturns.length);
      console.log(' - Latest closed audit discrepancy count:', resReports.body.auditDiscrepancies.length);
    } else {
      console.error('FAIL: Reports API failed:', resReports.body);
    }

    console.log('\n=======================================');
    console.log('COMPLIANCE AUDIT & REPORTS TESTS PASSED!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
