/**
 * Client-Side state manager using localStorage.
 * Pre-seeded with identical data matching backend database seed.sql.
 */

const DEFAULT_STATE = {
  departments: [
    { id: 1, name: 'Administration', head: 'Admin User', parent: null, status: 'ACTIVE' },
    { id: 2, name: 'Information Technology', head: 'Anita Rao', parent: null, status: 'ACTIVE' },
    { id: 3, name: 'Facilities & Operations', head: 'Karan Mehta', parent: null, status: 'ACTIVE' },
    { id: 4, name: 'Human Resources', head: 'Neha Kapoor', parent: null, status: 'ACTIVE' }
  ],
  employees: [
    { id: 1, name: 'Admin User', email: 'admin@assetflow.com', departmentId: 1, role: 'ADMIN', status: 'ACTIVE' },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@assetflow.com', departmentId: 2, role: 'ASSET_MANAGER', status: 'ACTIVE' },
    { id: 3, name: 'Rohit Verma', email: 'rohit.verma@assetflow.com', departmentId: 3, role: 'ASSET_MANAGER', status: 'ACTIVE' },
    { id: 4, name: 'Anita Rao', email: 'anita.rao@assetflow.com', departmentId: 2, role: 'DEPT_HEAD', status: 'ACTIVE' },
    { id: 5, name: 'Karan Mehta', email: 'karan.mehta@assetflow.com', departmentId: 3, role: 'DEPT_HEAD', status: 'ACTIVE' },
    { id: 6, name: 'Raj Singh', email: 'raj.singh@assetflow.com', departmentId: 2, role: 'EMPLOYEE', status: 'ACTIVE' },
    { id: 7, name: 'Neha Kapoor', email: 'neha.kapoor@assetflow.com', departmentId: 4, role: 'EMPLOYEE', status: 'ACTIVE' },
    { id: 8, name: 'Arjun Das', email: 'arjun.das@assetflow.com', departmentId: 3, role: 'EMPLOYEE', status: 'ACTIVE' }
  ],
  categories: [
    { id: 1, name: 'Electronics', fields: JSON.stringify({ warranty_period_months: 'number' }) },
    { id: 2, name: 'Furniture', fields: null },
    { id: 3, name: 'Vehicles', fields: JSON.stringify({ fuel_type: 'string' }) },
    { id: 4, name: 'Facility Space', fields: null }
  ],
  assets: [
    { id: 1, tag: 'AF-0001', name: 'Dell Latitude 5420 Laptop', categoryId: 1, serial: 'DL5420-0001', cost: 75000, condition: 'GOOD', location: 'IT Floor 2', departmentId: 2, status: 'ALLOCATED', bookable: false },
    { id: 2, tag: 'AF-0002', name: 'HP LaserJet Pro Printer', categoryId: 1, serial: 'HP-LJP-2201', cost: 18500, condition: 'FAIR', location: 'IT Floor 2', departmentId: 2, status: 'AVAILABLE', bookable: false },
    { id: 3, tag: 'AF-0003', name: 'Ergo Office Chair', categoryId: 2, serial: 'CHR-9981', cost: 8500, condition: 'GOOD', location: 'HR Wing', departmentId: 4, status: 'ALLOCATED', bookable: false },
    { id: 4, tag: 'AF-0004', name: 'Toyota Innova Crysta (Vehicle)', categoryId: 3, serial: 'MH12-AB-4455', cost: 1850000, condition: 'GOOD', location: 'Basement Parking', departmentId: 3, status: 'AVAILABLE', bookable: true },
    { id: 5, tag: 'AF-0005', name: 'Conference Room B2', categoryId: 4, serial: null, cost: 0, condition: 'GOOD', location: '2nd Floor, Wing B', departmentId: 3, status: 'AVAILABLE', bookable: true },
    { id: 6, tag: 'AF-0006', name: 'Epson EB-X05 Projector', categoryId: 1, serial: 'EPSN-X05-771', cost: 32000, condition: 'POOR', location: 'IT Floor 2', departmentId: 2, status: 'UNDER_MAINTENANCE', bookable: false },
    { id: 7, tag: 'AF-0007', name: 'MacBook Pro 14"', categoryId: 1, serial: 'MBP14-5590', cost: 185000, condition: 'GOOD', location: 'IT Floor 2', departmentId: 2, status: 'AVAILABLE', bookable: false },
    { id: 8, tag: 'AF-0008', name: 'Standing Desk (Adjustable)', categoryId: 2, serial: 'SD-3312', cost: 15000, condition: 'GOOD', location: 'Facilities Store', departmentId: 3, status: 'LOST', bookable: false },
    { id: 9, tag: 'AF-0009', name: 'Conference Room A1', categoryId: 4, serial: null, cost: 0, condition: 'GOOD', location: '1st Floor, Wing A', departmentId: 2, status: 'AVAILABLE', bookable: true }
  ],
  allocations: [
    { id: 1, assetId: 1, toUserId: 6, toDeptId: null, allocatedBy: 2, date: '2026-06-01', expectedReturn: '2026-07-01', actualReturn: null, status: 'ACTIVE' },
    { id: 2, assetId: 3, toUserId: 7, toDeptId: null, allocatedBy: 2, date: '2026-05-15', expectedReturn: '2026-08-15', actualReturn: null, status: 'ACTIVE' }
  ],
  transfers: [
    { id: 1, assetId: 1, fromAllocationId: 1, requestedBy: 6, requestedToUserId: 7, requestedToDeptId: null, status: 'REQUESTED', reason: 'Moving to a new project; handing laptop over to Neha Kapoor.' }
  ],
  bookings: [
    { id: 1, assetId: 5, bookedBy: 6, departmentId: 2, start: '2026-07-14 09:00:00', end: '2026-07-14 10:00:00', purpose: 'Sprint planning', status: 'UPCOMING' },
    { id: 2, assetId: 5, bookedBy: 7, departmentId: 4, start: '2026-07-14 10:00:00', end: '2026-07-14 11:00:00', purpose: 'HR policy review', status: 'UPCOMING' },
    { id: 3, assetId: 4, bookedBy: 8, departmentId: 3, start: '2026-07-13 08:00:00', end: '2026-07-13 12:00:00', purpose: 'Site visit to vendor warehouse', status: 'UPCOMING' }
  ],
  maintenance: [
    { id: 1, assetId: 6, raisedBy: 6, issue: 'Projector bulb is flickering and image is dim.', priority: 'MEDIUM', status: 'APPROVED', approvedBy: 2 },
    { id: 2, assetId: 2, raisedBy: 7, issue: 'Printer frequently jams paper during duplex printing.', priority: 'LOW', status: 'PENDING', approvedBy: null }
  ],
  audits: [
    { id: 1, name: 'IT Assets Audit Q3 2026', scope: 'Information Technology', date: '2026-07-12', status: 'IN_PROGRESS', findings: [] }
  ],
  logs: [
    { id: 1, message: 'System initialized and folder structure created', time: new Date(Date.now() - 1000000).toISOString(), type: 'SYSTEM' },
    { id: 2, message: 'Database schema applied and demo seed data loaded', time: new Date(Date.now() - 500000).toISOString(), type: 'DATABASE' }
  ]
};

export function getState() {
  const stateStr = localStorage.getItem('assetflow_state');
  if (!stateStr) {
    localStorage.setItem('assetflow_state', JSON.stringify(DEFAULT_STATE));
    return DEFAULT_STATE;
  }
  return JSON.parse(stateStr);
}

export function saveState(state) {
  localStorage.setItem('assetflow_state', JSON.stringify(state));
}

export function logActivity(message, type = 'USER') {
  const state = getState();
  const newLog = {
    id: state.logs.length + 1,
    message,
    time: new Date().toISOString(),
    type
  };
  state.logs.unshift(newLog); // Prepend to show newest first
  saveState(state);
}
