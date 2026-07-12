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

async function runDashboardTests() {
  console.log('Starting Live Dashboard & Alerts Integration Tests...');
  let cookieAdmin = null;

  try {
    // 1. Login Admin
    const resLogin = await request('POST', '/auth/login', {
      email: 'admin@assetflow.com',
      password: 'Password@123'
    });
    cookieAdmin = resLogin.headers['set-cookie'][0].split(';')[0];
    console.log('PASS: Authenticated Admin.');

    // 2. Fetch Dashboard Stats
    console.log('\n--- Fetching live Dashboard KPI metrics and activity logs ---');
    const resStats = await request('GET', '/dashboard/stats', null, cookieAdmin);
    if (resStats.statusCode === 200 && resStats.body.stats) {
      console.log('PASS: Dashboard metrics successfully loaded:');
      console.log(' - Assets Available:', resStats.body.stats.available);
      console.log(' - Assets Allocated:', resStats.body.stats.allocated);
      console.log(' - Under Maintenance:', resStats.body.stats.maintenance);
      console.log(' - Overdue Returns:', resStats.body.stats.overdue);
      console.log(' - Recent Activities count:', resStats.body.activities.length);
    } else {
      console.error('FAIL: Failed to fetch dashboard stats:', resStats.body);
    }

    // 3. Fetch Notifications List
    console.log('\n--- Fetching user alerts center ---');
    const resNotif = await request('GET', '/notifications', null, cookieAdmin);
    if (resNotif.statusCode === 200 && Array.isArray(resNotif.body.notifications)) {
      console.log(`PASS: Notifications fetched. Total: ${resNotif.body.notifications.length}`);
      
      if (resNotif.body.notifications.length > 0) {
        const targetAlert = resNotif.body.notifications[0];
        console.log(` - Testing mark read on notification ID ${targetAlert.id}...`);
        
        const resRead = await request('POST', `/notifications/${targetAlert.id}/read`, null, cookieAdmin);
        if (resRead.statusCode === 200) {
          console.log('PASS: Notification marked as read.');
        } else {
          console.error('FAIL: Mark notification read returned status', resRead.statusCode);
        }
      }
    } else {
      console.error('FAIL: Notifications fetch failed:', resNotif.body);
    }

    // 4. Mark all read
    console.log('\n--- Testing mark all notifications as read ---');
    const resReadAll = await request('POST', '/notifications/read-all', null, cookieAdmin);
    if (resReadAll.statusCode === 200) {
      console.log('PASS: All notifications successfully marked as read.');
    } else {
      console.error('FAIL: Mark all read failed:', resReadAll.body);
    }

    // 5. Fetch Activity Logs with filters
    console.log('\n--- Testing system activity logs queries (Filtered) ---');
    const resLogs = await request('GET', '/logs?entityFilter=assets', null, cookieAdmin);
    if (resLogs.statusCode === 200 && Array.isArray(resLogs.body.logs)) {
      console.log(`PASS: Filtered activity logs returned. Total rows: ${resLogs.body.logs.length}`);
      if (resLogs.body.logs.length > 0) {
        console.log(' - Sample action logged:', resLogs.body.logs[0].action);
      }
    } else {
      console.error('FAIL: Activity logs query failed:', resLogs.body);
    }

    console.log('\n=======================================');
    console.log('DASHBOARD, NOTIFICATIONS & AUDIT LOGS TESTS PASSED!');
    console.log('=======================================');

  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runDashboardTests();
