const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'seed.sql');

// Bcrypt hash for "Password@123"
const PASSWORD_HASH = '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq';

// 12 Departments
const departments = [
  { id: 1, name: 'Administration', head: null, parent: null },
  { id: 2, name: 'Human Resources', head: null, parent: null },
  { id: 3, name: 'Finance', head: null, parent: null },
  { id: 4, name: 'Information Technology', head: null, parent: null },
  { id: 5, name: 'Software Development', head: null, parent: null },
  { id: 6, name: 'Quality Assurance', head: null, parent: null },
  { id: 7, name: 'Sales', head: null, parent: null },
  { id: 8, name: 'Marketing', head: null, parent: null },
  { id: 9, name: 'Operations', head: null, parent: null },
  { id: 10, name: 'Procurement', head: null, parent: null },
  { id: 11, name: 'Customer Support', head: null, parent: null },
  { id: 12, name: 'Research & Development', head: null, parent: null }
];

// 40 Users mapping
const users = [
  // Administrator (1)
  { id: 1, name: 'System Administrator', email: 'admin@assetflow.com', role: 'ADMIN', dept: 1 },
  // Asset Managers (3)
  { id: 2, name: 'Priya Sharma', email: 'manager1@assetflow.com', role: 'ASSET_MANAGER', dept: 4 },
  { id: 3, name: 'Rohan Patel', email: 'manager2@assetflow.com', role: 'ASSET_MANAGER', dept: 9 },
  { id: 4, name: 'Neha Gupta', email: 'manager3@assetflow.com', role: 'ASSET_MANAGER', dept: 10 },
  // Department Heads (10)
  { id: 5, name: 'Amit Verma', email: 'it.head@assetflow.com', role: 'DEPT_HEAD', dept: 4 },
  { id: 6, name: 'Sneha Shah', email: 'hr.head@assetflow.com', role: 'DEPT_HEAD', dept: 2 },
  { id: 7, name: 'Rahul Mehta', email: 'finance.head@assetflow.com', role: 'DEPT_HEAD', dept: 3 },
  { id: 8, name: 'Aman Gupta', email: 'sales.head@assetflow.com', role: 'DEPT_HEAD', dept: 7 },
  { id: 9, name: 'Vikas Khanna', email: 'marketing.head@assetflow.com', role: 'DEPT_HEAD', dept: 8 },
  { id: 10, name: 'Ritu Singhal', email: 'ops.head@assetflow.com', role: 'DEPT_HEAD', dept: 9 },
  { id: 11, name: 'Sanjay Roy', email: 'dev.head@assetflow.com', role: 'DEPT_HEAD', dept: 5 },
  { id: 12, name: 'Kiran Bedi', email: 'qa.head@assetflow.com', role: 'DEPT_HEAD', dept: 6 },
  { id: 13, name: 'Deepak Kapoor', email: 'procure.head@assetflow.com', role: 'DEPT_HEAD', dept: 10 },
  { id: 14, name: 'Shalini Sen', email: 'support.head@assetflow.com', role: 'DEPT_HEAD', dept: 11 },
  // Employees (26)
  { id: 15, name: 'Raj Singh', email: 'raj.singh@assetflow.com', role: 'EMPLOYEE', dept: 4 },
  { id: 16, name: 'Anjali Patel', email: 'anjali.patel@assetflow.com', role: 'EMPLOYEE', dept: 2 },
  { id: 17, name: 'Arjun Kumar', email: 'arjun.kumar@assetflow.com', role: 'EMPLOYEE', dept: 3 },
  { id: 18, name: 'Karan Shah', email: 'karan.shah@assetflow.com', role: 'EMPLOYEE', dept: 5 },
  { id: 19, name: 'Mohit Jain', email: 'mohit.jain@assetflow.com', role: 'EMPLOYEE', dept: 5 },
  { id: 20, name: 'Pooja Sharma', email: 'pooja.sharma@assetflow.com', role: 'EMPLOYEE', dept: 6 },
  { id: 21, name: 'Neel Patel', email: 'neel.patel@assetflow.com', role: 'EMPLOYEE', dept: 7 },
  { id: 22, name: 'Harsh Trivedi', email: 'harsh.trivedi@assetflow.com', role: 'EMPLOYEE', dept: 8 },
  { id: 23, name: 'Ayesha Khan', email: 'ayesha.khan@assetflow.com', role: 'EMPLOYEE', dept: 9 },
  { id: 24, name: 'Riya Patel', email: 'riya.patel@assetflow.com', role: 'EMPLOYEE', dept: 5 },
  { id: 25, name: 'Devendra Singh', email: 'devendra.singh@assetflow.com', role: 'EMPLOYEE', dept: 4 },
  { id: 26, name: 'Jyoti Basu', email: 'jyoti.basu@assetflow.com', role: 'EMPLOYEE', dept: 10 },
  { id: 27, name: 'Tarun Kumar', email: 'tarun.kumar@assetflow.com', role: 'EMPLOYEE', dept: 11 },
  { id: 28, name: 'Nisha Pillai', email: 'nisha.pillai@assetflow.com', role: 'EMPLOYEE', dept: 12 },
  { id: 29, name: 'Gaurav Gera', email: 'gaurav.gera@assetflow.com', role: 'EMPLOYEE', dept: 12 },
  { id: 30, name: 'Vikram Seth', email: 'vikram.seth@assetflow.com', role: 'EMPLOYEE', dept: 5 },
  { id: 31, name: 'Preeti Zinta', email: 'preeti.zinta@assetflow.com', role: 'EMPLOYEE', dept: 2 },
  { id: 32, name: 'Abhishek Ray', email: 'abhishek.ray@assetflow.com', role: 'EMPLOYEE', dept: 3 },
  { id: 33, name: 'Shreya Ghoshal', email: 'shreya.ghoshal@assetflow.com', role: 'EMPLOYEE', dept: 8 },
  { id: 34, name: 'Sonu Nigam', email: 'sonu.nigam@assetflow.com', role: 'EMPLOYEE', dept: 9 },
  { id: 35, name: 'Alka Yagnik', email: 'alka.yagnik@assetflow.com', role: 'EMPLOYEE', dept: 6 },
  { id: 36, name: 'Udit Narayan', email: 'udit.narayan@assetflow.com', role: 'EMPLOYEE', dept: 7 },
  { id: 37, name: 'Kumar Sanu', email: 'kumar.sanu@assetflow.com', role: 'EMPLOYEE', dept: 10 },
  { id: 38, name: 'Arijit Singh', email: 'arijit.singh@assetflow.com', role: 'EMPLOYEE', dept: 5 },
  { id: 39, name: 'Jubin Nautiyal', email: 'jubin.nautiyal@assetflow.com', role: 'EMPLOYEE', dept: 4 },
  { id: 40, name: 'Armaan Malik', email: 'armaan.malik@assetflow.com', role: 'EMPLOYEE', dept: 5 }
];

// 15 Categories
const categories = [
  { id: 1, name: 'Laptops' },
  { id: 2, name: 'Desktops' },
  { id: 3, name: 'Monitors' },
  { id: 4, name: 'Printers' },
  { id: 5, name: 'Networking' },
  { id: 6, name: 'Servers' },
  { id: 7, name: 'Projectors' },
  { id: 8, name: 'Conference Rooms' },
  { id: 9, name: 'Meeting Rooms' },
  { id: 10, name: 'Vehicles' },
  { id: 11, name: 'Furniture' },
  { id: 12, name: 'Mobile Devices' },
  { id: 13, name: 'Accessories' },
  { id: 14, name: 'Security Devices' },
  { id: 15, name: 'Software Licenses' }
];

// Generate 100 Assets
const assets = [];
const assetTemplates = [
  // Laptops (1-25)
  { name: 'Dell Latitude 7440', catId: 1, prefix: 'LAP', cost: 85000, isBookable: 0 },
  { name: 'HP EliteBook 840', catId: 1, prefix: 'LAP', cost: 92000, isBookable: 0 },
  { name: 'Lenovo ThinkPad T14', catId: 1, prefix: 'LAP', cost: 78000, isBookable: 0 },
  { name: 'MacBook Pro M3', catId: 1, prefix: 'LAP', cost: 165000, isBookable: 0 },
  { name: 'MacBook Air M2', catId: 1, prefix: 'LAP', cost: 115000, isBookable: 0 },
  // Desktops (26-30)
  { name: 'Dell OptiPlex 7010', catId: 2, prefix: 'DSK', cost: 55000, isBookable: 0 },
  { name: 'HP ProTower 290', catId: 2, prefix: 'DSK', cost: 48000, isBookable: 0 },
  { name: 'iMac 24" M3', catId: 2, prefix: 'DSK', cost: 135000, isBookable: 0 },
  // Monitors (31-45)
  { name: 'Dell 24" Monitor P2422H', catId: 3, prefix: 'MON', cost: 14000, isBookable: 0 },
  { name: 'LG UltraWide 29"', catId: 3, prefix: 'MON', cost: 22000, isBookable: 0 },
  { name: 'Samsung Curved 27"', catId: 3, prefix: 'MON', cost: 19000, isBookable: 0 },
  { name: 'BenQ Designer 27" PD2700Q', catId: 3, prefix: 'MON', cost: 28000, isBookable: 0 },
  // Printers (46-53)
  { name: 'HP LaserJet Pro', catId: 4, prefix: 'PRN', cost: 24000, isBookable: 0 },
  { name: 'Canon ImageRunner', catId: 4, prefix: 'PRN', cost: 120000, isBookable: 0 },
  { name: 'Brother DCP L2520D', catId: 4, prefix: 'PRN', cost: 16500, isBookable: 0 },
  { name: 'Epson EcoTank L3210', catId: 4, prefix: 'PRN', cost: 14500, isBookable: 0 },
  // Networking (54-61)
  { name: 'Cisco Integrated Services Router', catId: 5, prefix: 'NET', cost: 65000, isBookable: 0 },
  { name: 'Cisco Catalyst Switch 24-Port', catId: 5, prefix: 'NET', cost: 45000, isBookable: 0 },
  { name: 'UniFi Access Point U6 Pro', catId: 5, prefix: 'NET', cost: 18000, isBookable: 0 },
  { name: 'Firewall Appliance FortiGate', catId: 5, prefix: 'NET', cost: 95000, isBookable: 0 },
  // Servers (62-65)
  { name: 'Dell PowerEdge R760', catId: 6, prefix: 'SRV', cost: 350000, isBookable: 0 },
  { name: 'HP ProLiant DL380', catId: 6, prefix: 'SRV', cost: 310000, isBookable: 0 },
  // Projectors (66-70)
  { name: 'Epson EB-X06 Projector', catId: 7, prefix: 'PRJ', cost: 38000, isBookable: 1 },
  { name: 'BenQ MX535 Projector', catId: 7, prefix: 'PRJ', cost: 32000, isBookable: 1 },
  { name: 'Sony VPL-DX221', catId: 7, prefix: 'PRJ', cost: 42000, isBookable: 1 },
  // Conference/Meeting Rooms (71-76)
  { name: 'Conference Room A', catId: 8, prefix: 'ROOM', cost: 0, isBookable: 1 },
  { name: 'Conference Room B', catId: 8, prefix: 'ROOM', cost: 0, isBookable: 1 },
  { name: 'Meeting Room Alpha', catId: 9, prefix: 'ROOM', cost: 0, isBookable: 1 },
  { name: 'Meeting Room Beta', catId: 9, prefix: 'ROOM', cost: 0, isBookable: 1 },
  { name: 'Training Room 1', catId: 8, prefix: 'ROOM', cost: 0, isBookable: 1 },
  { name: 'Executive Board Room', catId: 8, prefix: 'ROOM', cost: 0, isBookable: 1 },
  // Vehicles (77-82)
  { name: 'Toyota Innova Crysta', catId: 10, prefix: 'VEH', cost: 2400000, isBookable: 1 },
  { name: 'Hyundai Creta', catId: 10, prefix: 'VEH', cost: 1500000, isBookable: 1 },
  { name: 'Maruti Ertiga VXI', catId: 10, prefix: 'VEH', cost: 1100000, isBookable: 1 },
  { name: 'Honda City i-VTEC', catId: 10, prefix: 'VEH', cost: 1300000, isBookable: 1 },
  { name: 'Ather 450X Electric Scooter', catId: 10, prefix: 'VEH', cost: 160000, isBookable: 1 },
  { name: 'Mahindra Delivery Van', catId: 10, prefix: 'VEH', cost: 850000, isBookable: 1 },
  // Furniture (83-92)
  { name: 'Ergonomic Office Chair', catId: 11, prefix: 'FUR', cost: 12000, isBookable: 0 },
  { name: 'Electric Standing Desk', catId: 11, prefix: 'FUR', cost: 24000, isBookable: 0 },
  { name: 'Executive L-Shape Desk', catId: 11, prefix: 'FUR', cost: 45000, isBookable: 0 },
  { name: 'Modular Meeting Table', catId: 11, prefix: 'FUR', cost: 65000, isBookable: 0 },
  { name: 'Metal Storage Cabinet', catId: 11, prefix: 'FUR', cost: 15000, isBookable: 0 },
  // Mobile Devices (93-100)
  { name: 'iPhone 15 Pro Max', catId: 12, prefix: 'MOB', cost: 140000, isBookable: 0 },
  { name: 'Samsung Galaxy S24 Ultra', catId: 12, prefix: 'MOB', cost: 125000, isBookable: 0 },
  { name: 'iPad Air 10.9"', catId: 12, prefix: 'MOB', cost: 58000, isBookable: 0 },
  { name: 'Microsoft Surface Go 4', catId: 12, prefix: 'MOB', cost: 42000, isBookable: 0 }
];

// Replicate templates to fill up to 100 assets exactly
let index = 1;
while (assets.length < 100) {
  const temp = assetTemplates[(index - 1) % assetTemplates.length];
  const countForPrefix = assets.filter(a => a.prefix === temp.prefix).length + 1;
  const tag = `AF-${temp.prefix}-${String(countForPrefix).padStart(4, '0')}`;
  
  // Distribute Statuses:
  // 40 allocated, 35 available, 10 under maintenance, 5 reserved, 5 lost, 5 retired
  let status = 'AVAILABLE';
  if (assets.length < 40) {
    status = 'ALLOCATED';
  } else if (assets.length < 75) {
    status = 'AVAILABLE';
  } else if (assets.length < 85) {
    status = 'UNDER_MAINTENANCE';
  } else if (assets.length < 90) {
    status = 'RESERVED';
  } else if (assets.length < 95) {
    status = 'LOST';
  } else {
    status = 'RETIRED';
  }

  assets.push({
    id: index,
    tag,
    name: `${temp.name} (${countForPrefix})`,
    category_id: temp.catId,
    prefix: temp.prefix,
    serial: `${temp.prefix}-SR-${1000 + index}`,
    qr: `QR-${temp.prefix}-${1000 + index}`,
    date: `2024-0${(index % 8) + 1}-10`,
    cost: temp.cost,
    condition: status === 'UNDER_MAINTENANCE' ? 'DAMAGED' : (index % 5 === 0 ? 'FAIR' : 'GOOD'),
    location: temp.isBookable ? 'Shared Facilities Pool' : `Floor ${(index % 3) + 1}, Wing ${(index % 2) === 0 ? 'A' : 'B'}`,
    dept_id: (index % 12) + 1,
    status,
    isBookable: temp.isBookable
  });
  index++;
}

// Generate Allocations (40 active + 10 returned history = 50 total)
const allocations = [];
for (let i = 1; i <= 40; i++) {
  // Allocated assets: id 1 to 40
  const userObj = users[14 + (i % 26)]; // associate with employees
  allocations.push({
    id: i,
    asset_id: i,
    to_user_id: userObj.id,
    to_dept_id: 'NULL',
    by_user_id: 2, // प्रिया शर्मा allocated them
    date: '2026-06-10',
    expected: '2026-09-10',
    actual: 'NULL',
    status: 'ACTIVE',
    notes: 'NULL'
  });
}
// 10 Returned history
for (let i = 41; i <= 50; i++) {
  const assetId = (i % 20) + 41; // pick some available assets
  const userObj = users[14 + (i % 26)];
  allocations.push({
    id: i,
    asset_id: assetId,
    to_user_id: userObj.id,
    to_dept_id: 'NULL',
    by_user_id: 3,
    date: '2026-04-10',
    expected: '2026-05-10',
    actual: `'2026-05-09'`,
    status: 'RETURNED',
    notes: `'Returned on time, verified in good condition'`
  });
}

// Generate Bookings (35 bookings)
const bookings = [];
const bookableAssets = assets.filter(a => a.isBookable); // rooms & vehicles
for (let i = 1; i <= 35; i++) {
  const asset = bookableAssets[i % bookableAssets.length];
  const userObj = users[14 + (i % 26)];
  
  let bStatus = 'UPCOMING';
  if (i < 10) bStatus = 'UPCOMING';
  else if (i < 20) bStatus = 'COMPLETED';
  else if (i < 30) bStatus = 'ONGOING';
  else bStatus = 'CANCELLED';

  const day = String((i % 28) + 1).padStart(2, '0');
  bookings.push({
    id: i,
    asset_id: asset.id,
    booked_by: userObj.id,
    dept_id: userObj.dept,
    start: `2026-07-${day} 09:00:00`,
    end: `2026-07-${day} 12:00:00`,
    status: bStatus,
    purpose: `Operational requirement task #${1000 + i}`
  });
}

// Generate Maintenance Tickets (20 tickets)
const maintenance = [];
for (let i = 1; i <= 20; i++) {
  const asset = assets[i * 4 % assets.length]; // pick various assets
  const raisedBy = users[14 + (i % 26)];
  
  let mStatus = 'PENDING';
  if (i < 5) mStatus = 'PENDING';
  else if (i < 10) mStatus = 'APPROVED';
  else if (i < 13) mStatus = 'TECHNICIAN_ASSIGNED';
  else if (i < 17) mStatus = 'IN_PROGRESS';
  else mStatus = 'RESOLVED';

  maintenance.push({
    id: i,
    asset_id: asset.id,
    raised_by: raisedBy.id,
    description: `Performance calibration and diagnostics request #${200 + i}`,
    priority: i % 3 === 0 ? 'HIGH' : (i % 2 === 0 ? 'MEDIUM' : 'LOW'),
    status: mStatus,
    approved_by: i > 4 ? 2 : 'NULL'
  });
}

// Generate Audit Cycles (3 cycles) & Findings (30 findings)
const auditCycles = [
  { id: 1, name: 'Q1 Asset Verification Cycle', dept: 4, start: '2026-01-10', end: '2026-01-20', status: 'CLOSED', closed: `'2026-01-20 17:00:00'` },
  { id: 2, name: 'Q2 Compliance Asset Audit', dept: 5, start: '2026-04-10', end: '2026-04-20', status: 'CLOSED', closed: `'2026-04-20 17:00:00'` },
  { id: 3, name: 'Annual Enterprise Asset Audit', dept: 2, start: '2026-07-10', end: '2026-07-30', status: 'IN_PROGRESS', closed: 'NULL' }
];

const auditAuditors = [
  { id: 1, cycle_id: 1, user_id: 2 },
  { id: 2, cycle_id: 1, user_id: 3 },
  { id: 3, cycle_id: 2, user_id: 2 },
  { id: 4, cycle_id: 3, user_id: 3 }
];

const findings = [];
for (let i = 1; i <= 30; i++) {
  const cycleId = (i % 3) + 1;
  const asset = assets[i * 3 % assets.length];
  let res = 'VERIFIED';
  if (i % 8 === 0) res = 'DAMAGED';
  else if (i % 12 === 0) res = 'MISSING';

  findings.push({
    id: i,
    audit_cycle_id: cycleId,
    asset_id: asset.id,
    auditor_user_id: 2,
    result: res,
    notes: `Checked during cycle count verification notes #${i}`,
    checked_at: `2026-07-11 11:30:00`
  });
}

// Generate Notifications (45 notifications)
const notifications = [];
const notifTypes = ['ASSET_ASSIGNED', 'TRANSFER_REQUESTED', 'MAINTENANCE_APPROVED', 'BOOKING_CONFIRMED', 'OVERDUE_RETURN_ALERT'];
for (let i = 1; i <= 45; i++) {
  const userObj = users[i % users.length];
  const type = notifTypes[i % notifTypes.length];
  notifications.push({
    id: i,
    user_id: userObj.id,
    type,
    message: `System notification update regarding asset operation task ID #${5000 + i}`,
    related_type: `'asset'`,
    related_id: (i % 100) + 1,
    is_read: i % 3 === 0 ? 0 : 1 // mix read / unread counts
  });
}

// Generate Activity Logs (260 logs)
const activityLogs = [];
const actionsList = ['LOGIN', 'LOGOUT', 'ASSET_REGISTERED', 'ASSET_ALLOCATED', 'MAINTENANCE_APPROVED', 'BOOKING_CREATED', 'AUDIT_CYCLE_CLOSED'];
for (let i = 1; i <= 260; i++) {
  const userObj = users[i % users.length];
  const action = actionsList[i % actionsList.length];
  activityLogs.push({
    id: i,
    user_id: userObj.id,
    action,
    entity_type: `'asset'`,
    entity_id: (i % 100) + 1,
    details: `'{"detail":"Automated bulk logging entry reference #${7000 + i}"}'`
  });
}

// Write the whole SQL stream
let sql = `-- =====================================================================\n`;
sql += `-- AssetFlow — Complete Seed Demo Data (100% Matching requirements)\n`;
sql += `-- =====================================================================\n\n`;
sql += `PRAGMA foreign_keys = ON;\n\n`;

// 1. Departments
sql += `-- 1. Departments\n`;
sql += `INSERT INTO departments (id, name, head_user_id, parent_department_id, status) VALUES\n`;
const deptValues = departments.map(d => `    (${d.id}, '${d.name}', NULL, NULL, 'ACTIVE')`).join(',\n');
sql += deptValues + ';\n\n';

// 2. Users
sql += `-- 2. Users\n`;
sql += `INSERT INTO users (id, name, email, password_hash, department_id, role, status) VALUES\n`;
const userValues = users.map(u => `    (${u.id}, '${u.name}', '${u.email}', '${PASSWORD_HASH}', ${u.dept}, '${u.role}', 'ACTIVE')`).join(',\n');
sql += userValues + ';\n\n';

// Department head updates
sql += `-- Department head associations\n`;
sql += `UPDATE departments SET head_user_id = 5 WHERE id = 4;\n`;
sql += `UPDATE departments SET head_user_id = 6 WHERE id = 2;\n`;
sql += `UPDATE departments SET head_user_id = 7 WHERE id = 3;\n`;
sql += `UPDATE departments SET head_user_id = 8 WHERE id = 7;\n`;
sql += `UPDATE departments SET head_user_id = 9 WHERE id = 8;\n`;
sql += `UPDATE departments SET head_user_id = 10 WHERE id = 9;\n`;
sql += `UPDATE departments SET head_user_id = 11 WHERE id = 5;\n`;
sql += `UPDATE departments SET head_user_id = 12 WHERE id = 6;\n`;
sql += `UPDATE departments SET head_user_id = 13 WHERE id = 10;\n`;
sql += `UPDATE departments SET head_user_id = 14 WHERE id = 11;\n\n`;

// 3. Categories
sql += `-- 3. Asset Categories\n`;
sql += `INSERT INTO asset_categories (id, name, extra_fields_schema) VALUES\n`;
const catValues = categories.map(c => `    (${c.id}, '${c.name}', NULL)`).join(',\n');
sql += catValues + ';\n\n';

// 4. Assets
sql += `-- 4. Assets\n`;
sql += `INSERT INTO assets (id, asset_tag, name, category_id, serial_number, qr_code, acquisition_date, acquisition_cost, condition, location, department_id, status, is_bookable) VALUES\n`;
const assetValues = assets.map(a => {
  return `    (${a.id}, '${a.tag}', '${a.name}', ${a.category_id}, '${a.serial}', '${a.qr}', '${a.date}', ${a.cost}, '${a.condition}', '${a.location}', ${a.dept_id}, '${a.status}', ${a.isBookable})`;
}).join(',\n');
sql += assetValues + ';\n\n';

// 5. Allocations
sql += `-- 5. Allocations\n`;
sql += `INSERT INTO allocations (id, asset_id, allocated_to_user_id, allocated_to_department_id, allocated_by, allocation_date, expected_return_date, actual_return_date, status, return_condition_notes) VALUES\n`;
const allocValues = allocations.map(al => {
  return `    (${al.id}, ${al.asset_id}, ${al.to_user_id}, ${al.to_dept_id}, ${al.by_user_id}, '${al.date}', '${al.expected}', ${al.actual}, '${al.status}', ${al.notes})`;
}).join(',\n');
sql += allocValues + ';\n\n';

// 6. Bookings
sql += `-- 6. Bookings\n`;
sql += `INSERT INTO bookings (id, asset_id, booked_by, department_id, start_time, end_time, status, purpose) VALUES\n`;
const bookingValues = bookings.map(b => {
  return `    (${b.id}, ${b.asset_id}, ${b.booked_by}, ${b.dept_id}, '${b.start}', '${b.end}', '${b.status}', '${b.purpose}')`;
}).join(',\n');
sql += bookingValues + ';\n\n';

// 7. Maintenance
sql += `-- 7. Maintenance Tickets\n`;
sql += `INSERT INTO maintenance_requests (id, asset_id, raised_by, issue_description, priority, status, approved_by) VALUES\n`;
const maintValues = maintenance.map(m => {
  return `    (${m.id}, ${m.asset_id}, ${m.raised_by}, '${m.description}', '${m.priority}', '${m.status}', ${m.approved_by})`;
}).join(',\n');
sql += maintValues + ';\n\n';

// 8. Audit Cycles
sql += `-- 8. Audit Cycles\n`;
sql += `INSERT INTO audit_cycles (id, name, scope_department_id, start_date, end_date, status, created_by, closed_at) VALUES\n`;
const cycleValues = auditCycles.map(cy => {
  return `    (${cy.id}, '${cy.name}', ${cy.dept}, '${cy.start}', '${cy.end}', '${cy.status}', 1, ${cy.closed})`;
}).join(',\n');
sql += cycleValues + ';\n\n';

// Audit Cycle Auditors
sql += `-- Audit Cycle Auditors\n`;
sql += `INSERT INTO audit_cycle_auditors (id, audit_cycle_id, auditor_user_id) VALUES\n`;
const audValues = auditAuditors.map(au => {
  return `    (${au.id}, ${au.cycle_id}, ${au.user_id})`;
}).join(',\n');
sql += audValues + ';\n\n';

// Audit Findings
sql += `-- Audit Findings\n`;
sql += `INSERT INTO audit_findings (id, audit_cycle_id, asset_id, auditor_user_id, result, notes, checked_at) VALUES\n`;
const findingValues = findings.map(f => {
  return `    (${f.id}, ${f.audit_cycle_id}, ${f.asset_id}, ${f.auditor_user_id}, '${f.result}', '${f.notes}', '${f.checked_at}')`;
}).join(',\n');
sql += findingValues + ';\n\n';

// 9. Notifications
sql += `-- 9. Notifications\n`;
sql += `INSERT INTO notifications (id, user_id, type, message, related_entity_type, related_entity_id, is_read) VALUES\n`;
const notifValues = notifications.map(n => {
  return `    (${n.id}, ${n.user_id}, '${n.type}', '${n.message}', ${n.related_type}, ${n.related_id}, ${n.is_read})`;
}).join(',\n');
sql += notifValues + ';\n\n';

// 10. Activity Logs
sql += `-- 10. Activity Logs\n`;
sql += `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details) VALUES\n`;
const logValues = activityLogs.map(l => {
  return `    (${l.id}, ${l.user_id}, '${l.action}', ${l.entity_type}, ${l.entity_id}, ${l.details})`;
}).join(',\n');
sql += logValues + ';\n\n';

// Save sql file
fs.writeFileSync(SEED_PATH, sql, 'utf8');
console.log('Successfully generated seed.sql with full demo dataset.');
