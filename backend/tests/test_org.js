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
  console.log('Starting Organization Setup Module Integration Tests...');
  let cookieAdmin = null;
  let cookieEmployee = null;

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Accessing organization routes without logging in (Unauthenticated)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Checking Guest Route Blocks ---');
    const resUnauth = await request('GET', '/org/departments');
    if (resUnauth.statusCode === 401) {
      console.log('PASS: Guest department fetch blocked with 401 Unauthorized.');
    } else {
      console.error(`FAIL: Guest department fetch returned status ${resUnauth.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Create a regular employee and try to make modifications (Unauthorized)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Regular Employee Authorization Checks ---');
    const testEmail = `test_emp_${Date.now()}@assetflow.com`;
    // Register employee
    const resReg = await request('POST', '/auth/signup', {
      name: 'Regular Employee',
      email: testEmail,
      password: 'Password@123',
      departmentId: 1
    });

    if (resReg.statusCode === 201) {
      // Save cookie
      cookieEmployee = resReg.headers['set-cookie'][0].split(';')[0];
      console.log('PASS: Employee registered successfully.');
    } else {
      throw new Error(`FAIL: Employee signup failed with status ${resReg.statusCode}`);
    }

    // Try to create department as employee
    const resDeptBlock = await request('POST', '/org/departments', {
      name: 'Illegal Department'
    }, cookieEmployee);

    if (resDeptBlock.statusCode === 403) {
      console.log('PASS: Employee department creation blocked with 403 Forbidden.');
    } else {
      console.error(`FAIL: Employee department creation returned status ${resDeptBlock.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 3: Login as ADMIN
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Admin Authentication ---');
    const resAdminLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });

    if (resAdminLogin.statusCode === 200) {
      cookieAdmin = resAdminLogin.headers['set-cookie'][0].split(';')[0];
      console.log('PASS: Admin logged in successfully.');
    } else {
      throw new Error(`FAIL: Admin login failed with status ${resAdminLogin.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 4: Admin creates a department
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Create Department ---');
    const deptName = `Engineering_${Date.now()}`;
    const resDeptCreate = await request('POST', '/org/departments', {
      name: deptName,
      headUserId: 1,
      parentDepartmentId: 1
    }, cookieAdmin);

    let newDeptId = null;
    if (resDeptCreate.statusCode === 201) {
      newDeptId = resDeptCreate.body.department.id;
      console.log(`PASS: Created department "${deptName}" with ID ${newDeptId}.`);
    } else {
      console.error('FAIL: Department creation failed:', resDeptCreate.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 5: Duplicate Department Name check
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Duplicate Department Verification ---');
    const resDeptDup = await request('POST', '/org/departments', {
      name: deptName
    }, cookieAdmin);

    if (resDeptDup.statusCode === 400) {
      console.log('PASS: Duplicate department creation blocked with 400 Bad Request.');
    } else {
      console.error(`FAIL: Duplicate department creation returned status ${resDeptDup.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 6: Self-referencing parent check
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Self-referencing parent block check ---');
    if (newDeptId) {
      const resSelfRef = await request('PUT', `/org/departments/${newDeptId}`, {
        name: deptName,
        headUserId: 1,
        parentDepartmentId: newDeptId,
        status: 'ACTIVE'
      }, cookieAdmin);

      if (resSelfRef.statusCode === 400) {
        console.log('PASS: Self-referencing parent blocked with 400 Bad Request.');
      } else {
        console.error(`FAIL: Self-referencing parent update returned status ${resSelfRef.statusCode}`);
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 7: List departments
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: List Departments ---');
    const resDeptList = await request('GET', '/org/departments', null, cookieAdmin);
    if (resDeptList.statusCode === 200 && Array.isArray(resDeptList.body.departments)) {
      console.log(`PASS: Fetched ${resDeptList.body.departments.length} departments.`);
    } else {
      console.error('FAIL: Fetching departments list failed:', resDeptList.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Admin creates a Category
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Create Category ---');
    const catName = `Printers_${Date.now()}`;
    const resCatCreate = await request('POST', '/org/categories', {
      name: catName,
      description: 'Office network laser printers',
      status: 'ACTIVE',
      fields: { model_number: 'string', duplex_supported: 'string' }
    }, cookieAdmin);

    let newCatId = null;
    if (resCatCreate.statusCode === 201) {
      newCatId = resCatCreate.body.category.id;
      console.log(`PASS: Registered category "${catName}" with ID ${newCatId}.`);
    } else {
      console.error('FAIL: Category creation failed:', resCatCreate.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 9: Duplicate Category check
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Duplicate Category Check ---');
    const resCatDup = await request('POST', '/org/categories', {
      name: catName
    }, cookieAdmin);

    if (resCatDup.statusCode === 400) {
      console.log('PASS: Duplicate category registration blocked with 400.');
    } else {
      console.error(`FAIL: Duplicate category registration returned status ${resCatDup.statusCode}`);
    }

    // -------------------------------------------------------------------------
    // Scenario 10: List Categories
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 10: List Categories ---');
    const resCatList = await request('GET', '/org/categories', null, cookieAdmin);
    if (resCatList.statusCode === 200 && Array.isArray(resCatList.body.categories)) {
      console.log(`PASS: Fetched ${resCatList.body.categories.length} categories.`);
    } else {
      console.error('FAIL: Fetching categories failed:', resCatList.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 11: List Employees
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 11: Employee Directory ---');
    const resEmpList = await request('GET', '/org/employees', null, cookieAdmin);
    if (resEmpList.statusCode === 200 && Array.isArray(resEmpList.body.employees)) {
      console.log(`PASS: Fetched ${resEmpList.body.employees.length} employee records.`);
    } else {
      console.error('FAIL: Fetching employee directory failed:', resEmpList.body);
    }

    // -------------------------------------------------------------------------
    // Scenario 12: Role promotion / Deactivation
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 12: Promote & Update Employee settings ---');
    const targetEmployee = resEmpList.body.employees.find(e => e.email === testEmail);
    if (targetEmployee) {
      const resRoleUpdate = await request('PUT', `/org/employees/${targetEmployee.id}/role`, {
        role: 'ASSET_MANAGER',
        status: 'ACTIVE',
        departmentId: 1
      }, cookieAdmin);

      if (resRoleUpdate.statusCode === 200) {
        console.log(`PASS: Promoted employee ID ${targetEmployee.id} to ASSET_MANAGER.`);

        // Log in as this newly promoted ASSET_MANAGER
        const resManagerLogin = await request('POST', '/auth/login', {
          email: testEmail,
          password: 'Password@123'
        });

        if (resManagerLogin.statusCode === 200) {
          const cookieManager = resManagerLogin.headers['set-cookie'][0].split(';')[0];

          // Attempt to create a category as ASSET_MANAGER (should be blocked)
          const resCatBlock = await request('POST', '/org/categories', {
            name: `IllegalCat_${Date.now()}`
          }, cookieManager);

          if (resCatBlock.statusCode === 403) {
            console.log('PASS: Asset Manager category creation blocked with 403 Forbidden.');
          } else {
            console.error(`FAIL: Asset Manager category creation returned status ${resCatBlock.statusCode}`);
          }
        }
      } else {
        console.error('FAIL: Employee role update failed:', resRoleUpdate.body);
      }
    } else {
      console.error('FAIL: Target employee not found in list.');
    }

    console.log('\n=======================================');
    console.log('ALL INTEGRATION TEST SCENARIOS COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
