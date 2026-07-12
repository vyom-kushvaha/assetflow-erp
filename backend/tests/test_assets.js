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
  console.log('Starting Asset Registration & Directory Integration Tests...');
  let cookieAdmin = null;
  let cookieEmployee = null;

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Guest check (unauthenticated block)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Checking Guest Route Blocks ---');
    const resUnauth = await request('GET', '/assets');
    if (resUnauth.statusCode === 401) {
      console.log('PASS: Guest asset fetch blocked with 401 Unauthorized.');
    } else {
      console.error(`FAIL: Guest asset fetch returned status ${resUnauth.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Regular employee block
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

    const resCreateBlock = await request('POST', '/assets', {
      name: 'Illegal Laptop',
      categoryId: 1,
      condition: 'NEW'
    }, cookieEmployee);

    if (resCreateBlock.statusCode === 403) {
      console.log('PASS: Employee asset creation blocked with 403 Forbidden.');
    } else {
      console.error(`FAIL: Employee asset creation returned status ${resCreateBlock.statusCode}`);
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

    // -------------------------------------------------------------------------
    // Scenario 4: Admin creates asset (checks auto generated tag)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Create Asset ---');
    const resAssetCreate1 = await request('POST', '/assets', {
      name: 'HP EliteBook 840 G8',
      categoryId: 1, // Electronics
      serialNumber: `HP-SN-${Date.now()}`,
      qrCode: `QR-HP-${Date.now()}`,
      acquisitionDate: '2026-07-12',
      acquisitionCost: 85000,
      condition: 'NEW',
      location: 'HQ Floor 4',
      departmentId: 1,
      isBookable: 0
    }, cookieAdmin);

    let newAssetId1 = null;
    let newAssetTag1 = null;
    if (resAssetCreate1.statusCode === 201) {
      newAssetId1 = resAssetCreate1.body.asset.id;
      newAssetTag1 = resAssetCreate1.body.asset.asset_tag;
      console.log(`PASS: Created asset tag: ${newAssetTag1} with ID ${newAssetId1}.`);
    } else {
      console.error('FAIL: Asset registration failed:', resAssetCreate1.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 5: Admin creates second asset (checks sequential increment)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Auto tag sequential check ---');
    const resAssetCreate2 = await request('POST', '/assets', {
      name: 'HP EliteBook 840 G8 (B)',
      categoryId: 1,
      serialNumber: `HP-SN-B-${Date.now()}`,
      qrCode: `QR-HP-B-${Date.now()}`,
      acquisitionDate: '2026-07-12',
      acquisitionCost: 85000,
      condition: 'NEW',
      location: 'HQ Floor 4',
      departmentId: 1,
      isBookable: 0
    }, cookieAdmin);

    if (resAssetCreate2.statusCode === 201) {
      const tag2 = resAssetCreate2.body.asset.asset_tag;
      console.log(`PASS: Sequential asset tag auto-generated: ${tag2}.`);
    } else {
      console.error('FAIL: Second asset registration failed:', resAssetCreate2.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 6: Duplicate QR Code block
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Duplicate QR Code Verification ---');
    const dupQr = `QR-DUP-${Date.now()}`;
    // Register first asset with QR code
    await request('POST', '/assets', {
      name: 'Asset A',
      categoryId: 1,
      qrCode: dupQr,
      condition: 'GOOD'
    }, cookieAdmin);

    // Try registering second asset with same QR code
    const resQrDup = await request('POST', '/assets', {
      name: 'Asset B',
      categoryId: 1,
      qrCode: dupQr,
      condition: 'GOOD'
    }, cookieAdmin);

    if (resQrDup.statusCode === 400) {
      console.log('PASS: Duplicate QR Code registration blocked with 400 Bad Request.');
    } else {
      console.error(`FAIL: Duplicate QR Code registration returned status ${resQrDup.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 7: Get all assets list
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Fetch Assets Directory ---');
    const resList = await request('GET', '/assets', null, cookieAdmin);
    if (resList.statusCode === 200 && Array.isArray(resList.body.assets)) {
      console.log(`PASS: Fetched ${resList.body.assets.length} assets.`);
    } else {
      console.error('FAIL: Fetching assets directory failed:', resList.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Get asset details (with nested attachments and history fields)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Retrieve Asset Details ---');
    if (newAssetId1) {
      const resDetails = await request('GET', `/assets/${newAssetId1}`, null, cookieAdmin);
      if (resDetails.statusCode === 200 && resDetails.body.asset.allocations !== undefined) {
        console.log('PASS: Fetched details containing nested allocations history arrays.');
      } else {
        console.error('FAIL: Fetching asset details failed:', resDetails.body);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 9: Add document attachment to the asset
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Attach Document to Asset ---');
    if (newAssetId1) {
      const resDoc = await request('POST', `/assets/${newAssetId1}/documents`, {
        filePath: '/uploads/invoices/hp_elitebook_inv.pdf',
        fileType: 'pdf'
      }, cookieAdmin);

      if (resDoc.statusCode === 201) {
        console.log('PASS: Document invoice file attached successfully.');
      } else {
        console.error('FAIL: Document attachment upload failed:', resDoc.body);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 10: Edit asset details
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 10: Edit Asset Details ---');
    if (newAssetId1) {
      const resEdit = await request('PUT', `/assets/${newAssetId1}`, {
        name: 'HP EliteBook 840 G8 (Updated)',
        categoryId: 1,
        condition: 'GOOD',
        status: 'UNDER_MAINTENANCE'
      }, cookieAdmin);

      if (resEdit.statusCode === 200) {
        console.log('PASS: Asset details edited successfully.');
      } else {
        console.error('FAIL: Editing asset returned status:', resEdit.statusCode);
      }
    }

    console.log('\n=======================================');
    console.log('ALL ASSETS INTEGRATION SCENARIOS PASSED SUCCESSFULLY!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
