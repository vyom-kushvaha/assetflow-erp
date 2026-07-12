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
  console.log('Starting Authentication Module Verification Tests...');
  
  const testEmail = `test_employee_${Date.now()}@assetflow.com`;
  const testPassword = 'Password@123';
  let sessionCookie = null;

  try {
    // ----------------------------------------------------
    // Test 1: Signup User
    // ----------------------------------------------------
    console.log('\n[Test 1] POST /api/auth/signup - Valid Signup');
    const signupPayload = {
      name: 'Test Employee',
      email: testEmail,
      password: testPassword,
      departmentId: 2 // IT Department
    };
    const signupRes = await request('POST', '/auth/signup', signupPayload);
    console.log('Status Code:', signupRes.statusCode);
    console.log('Body:', JSON.stringify(signupRes.body, null, 2));
    
    if (signupRes.statusCode === 201) {
      console.log('✅ Signup Passed');
    } else {
      console.log('❌ Signup Failed');
    }

    // ----------------------------------------------------
    // Test 2: Duplicate Signup Validation
    // ----------------------------------------------------
    console.log('\n[Test 2] POST /api/auth/signup - Duplicate Email');
    const duplicateRes = await request('POST', '/auth/signup', signupPayload);
    console.log('Status Code:', duplicateRes.statusCode);
    console.log('Body:', JSON.stringify(duplicateRes.body, null, 2));
    
    if (duplicateRes.statusCode === 400 && duplicateRes.body.error.message.includes('already registered')) {
      console.log('✅ Duplicate Validation Passed');
    } else {
      console.log('❌ Duplicate Validation Failed');
    }

    // ----------------------------------------------------
    // Test 3: Short Password Validation
    // ----------------------------------------------------
    console.log('\n[Test 3] POST /api/auth/signup - Password Too Short');
    const shortPassRes = await request('POST', '/auth/signup', {
      name: 'Test Invalid',
      email: `valid_email_${Date.now()}@assetflow.com`,
      password: '123'
    });
    console.log('Status Code:', shortPassRes.statusCode);
    console.log('Body:', JSON.stringify(shortPassRes.body, null, 2));
    
    if (shortPassRes.statusCode === 400 && shortPassRes.body.error.details.password.includes('at least 6 characters')) {
      console.log('✅ Password Validation Passed');
    } else {
      console.log('❌ Password Validation Failed');
    }

    // ----------------------------------------------------
    // Test 4: Login User (Valid Credentials)
    // ----------------------------------------------------
    console.log('\n[Test 4] POST /api/auth/login - Valid Credentials');
    const loginPayload = {
      email: testEmail,
      password: testPassword
    };
    const loginRes = await request('POST', '/auth/login', loginPayload);
    console.log('Status Code:', loginRes.statusCode);
    console.log('Body:', JSON.stringify(loginRes.body, null, 2));
    
    if (loginRes.statusCode === 200) {
      console.log('✅ Login Passed');
      // Capture cookie
      const setCookie = loginRes.headers['set-cookie'];
      if (setCookie && setCookie.length > 0) {
        sessionCookie = setCookie[0].split(';')[0];
        console.log('Captured Session Cookie:', sessionCookie);
      }
    } else {
      console.log('❌ Login Failed');
    }

    // ----------------------------------------------------
    // Test 5: Login User (Invalid Credentials)
    // ----------------------------------------------------
    console.log('\n[Test 5] POST /api/auth/login - Invalid Password');
    const badLoginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'WrongPassword'
    });
    console.log('Status Code:', badLoginRes.statusCode);
    console.log('Body:', JSON.stringify(badLoginRes.body, null, 2));
    
    if (badLoginRes.statusCode === 401) {
      console.log('✅ Bad Login Rejected (Passed)');
    } else {
      console.log('❌ Bad Login Failed');
    }

    // ----------------------------------------------------
    // Test 6: Get Current User (With Session Cookie)
    // ----------------------------------------------------
    console.log('\n[Test 6] GET /api/auth/me - Authenticated Request');
    const meRes = await request('GET', '/auth/me', null, sessionCookie);
    console.log('Status Code:', meRes.statusCode);
    console.log('Body:', JSON.stringify(meRes.body, null, 2));
    
    if (meRes.statusCode === 200 && meRes.body.user.email === testEmail) {
      console.log('✅ Get Profile Passed');
    } else {
      console.log('❌ Get Profile Failed');
    }

    // ----------------------------------------------------
    // Test 7: Get Current User (Without Session Cookie)
    // ----------------------------------------------------
    console.log('\n[Test 7] GET /api/auth/me - Unauthenticated Request');
    const anonMeRes = await request('GET', '/auth/me');
    console.log('Status Code:', anonMeRes.statusCode);
    console.log('Body:', JSON.stringify(anonMeRes.body, null, 2));
    
    if (anonMeRes.statusCode === 401) {
      console.log('✅ Anon Request Blocked (Passed)');
    } else {
      console.log('❌ Anon Request Failed');
    }

    // ----------------------------------------------------
    // Test 8: Logout User
    // ----------------------------------------------------
    console.log('\n[Test 8] POST /api/auth/logout - Terminate Session');
    const logoutRes = await request('POST', '/auth/logout', null, sessionCookie);
    console.log('Status Code:', logoutRes.statusCode);
    console.log('Body:', JSON.stringify(logoutRes.body, null, 2));
    
    if (logoutRes.statusCode === 200) {
      console.log('✅ Logout Passed');
    } else {
      console.log('❌ Logout Failed');
    }

    // ----------------------------------------------------
    // Test 9: Get Current User (After Logout)
    // ----------------------------------------------------
    console.log('\n[Test 9] GET /api/auth/me - Profile Access Post-Logout');
    const postLogoutMe = await request('GET', '/auth/me', null, sessionCookie);
    console.log('Status Code:', postLogoutMe.statusCode);
    console.log('Body:', JSON.stringify(postLogoutMe.body, null, 2));
    
    if (postLogoutMe.statusCode === 401) {
      console.log('✅ Profile Access Blocked After Logout (Passed)');
    } else {
      console.log('❌ Profile Access Failed');
    }

    console.log('\nVerification suite completed.');

  } catch (err) {
    console.error('Test run execution error:', err);
  }
}

runTests();
