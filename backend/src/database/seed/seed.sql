-- =====================================================================
-- AssetFlow — Demo Seed Data
-- All demo users share the password: Password@123
-- (bcrypt hash below was generated with cost factor 10; verified working
--  with both the `bcrypt` and `bcryptjs` npm packages used by auth service)
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. Departments (head_user_id set to NULL first; updated after users exist)
-- ---------------------------------------------------------------------
INSERT INTO departments (id, name, head_user_id, parent_department_id, status) VALUES
    (1, 'Administration',            NULL, NULL, 'ACTIVE'),
    (2, 'Information Technology',    NULL, NULL, 'ACTIVE'),
    (3, 'Facilities & Operations',   NULL, NULL, 'ACTIVE'),
    (4, 'Human Resources',           NULL, NULL, 'ACTIVE');

-- ---------------------------------------------------------------------
-- 2. Users
-- Demo password for ALL users below: Password@123
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, department_id, role, status) VALUES
    (1, 'Admin User',    'admin@assetflow.com',        '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 1, 'ADMIN',          'ACTIVE'),
    (2, 'Priya Sharma',  'priya.sharma@assetflow.com', '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 2, 'ASSET_MANAGER',  'ACTIVE'),
    (3, 'Rohit Verma',   'rohit.verma@assetflow.com',  '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 3, 'ASSET_MANAGER',  'ACTIVE'),
    (4, 'Anita Rao',     'anita.rao@assetflow.com',    '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 2, 'DEPT_HEAD',      'ACTIVE'),
    (5, 'Karan Mehta',   'karan.mehta@assetflow.com',  '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 3, 'DEPT_HEAD',      'ACTIVE'),
    (6, 'Raj Singh',     'raj.singh@assetflow.com',    '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 2, 'EMPLOYEE',       'ACTIVE'),
    (7, 'Neha Kapoor',   'neha.kapoor@assetflow.com',  '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 4, 'EMPLOYEE',       'ACTIVE'),
    (8, 'Arjun Das',     'arjun.das@assetflow.com',    '$2b$10$B3MjCfdGdGSpeW7q6a7k9u5l4zrHn6PBRbEK0Wd.Ri5r/v/u453Wq', 3, 'EMPLOYEE',       'ACTIVE');

-- Now that users exist, wire up department heads (Admin-only action in the app)
UPDATE departments SET head_user_id = 4 WHERE id = 2;  -- Anita Rao heads IT
UPDATE departments SET head_user_id = 5 WHERE id = 3;  -- Karan Mehta heads Facilities

-- ---------------------------------------------------------------------
-- 3. Asset Categories
-- ---------------------------------------------------------------------
INSERT INTO asset_categories (id, name, extra_fields_schema) VALUES
    (1, 'Electronics',     '{"warranty_period_months":"number"}'),
    (2, 'Furniture',       NULL),
    (3, 'Vehicles',        '{"fuel_type":"string"}'),
    (4, 'Facility Space',  NULL);

-- ---------------------------------------------------------------------
-- 4. Assets (covers every lifecycle status at least once)
-- ---------------------------------------------------------------------
INSERT INTO assets (id, asset_tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location, department_id, status, is_bookable) VALUES
    (1, 'AF-0001', 'Dell Latitude 5420 Laptop',        1, 'DL5420-0001',   '2024-06-10', 75000,   'GOOD', 'IT Floor 2',           2, 'ALLOCATED',        0),
    (2, 'AF-0002', 'HP LaserJet Pro Printer',           1, 'HP-LJP-2201',   '2023-11-05', 18500,   'FAIR', 'IT Floor 2',           2, 'AVAILABLE',        0),
    (3, 'AF-0003', 'Ergo Office Chair',                 2, 'CHR-9981',      '2023-01-20', 8500,    'GOOD', 'HR Wing',              4, 'ALLOCATED',        0),
    (4, 'AF-0004', 'Toyota Innova Crysta (Vehicle)',    3, 'MH12-AB-4455',  '2022-08-15', 1850000, 'GOOD', 'Basement Parking',     3, 'AVAILABLE',        1),
    (5, 'AF-0005', 'Conference Room B2',                4, NULL,           '2021-01-01', 0,       'GOOD', '2nd Floor, Wing B',    3, 'AVAILABLE',        1),
    (6, 'AF-0006', 'Epson EB-X05 Projector',            1, 'EPSN-X05-771',  '2023-03-12', 32000,   'POOR', 'IT Floor 2',           2, 'UNDER_MAINTENANCE',0),
    (7, 'AF-0007', 'MacBook Pro 14"',                   1, 'MBP14-5590',    '2024-02-18', 185000,  'GOOD', 'IT Floor 2',           2, 'AVAILABLE',        0),
    (8, 'AF-0008', 'Standing Desk (Adjustable)',        2, 'SD-3312',       '2022-05-09', 15000,   'GOOD', 'Facilities Store',     3, 'LOST',             0),
    (9, 'AF-0009', 'Conference Room A1',                4, NULL,           '2021-01-01', 0,       'GOOD', '1st Floor, Wing A',    2, 'AVAILABLE',        1);

-- ---------------------------------------------------------------------
-- 5. Allocations
-- AF-0001 -> Raj Singh, overdue (expected_return_date in the past relative
-- to the sample "today" of 2026-07-12) to demo the Overdue Return alert.
-- AF-0007 has a closed-out historical allocation (RETURNED) for history view.
-- ---------------------------------------------------------------------
INSERT INTO allocations (id, asset_id, allocated_to_user_id, allocated_to_department_id, allocated_by, allocation_date, expected_return_date, actual_return_date, status, return_condition_notes) VALUES
    (1, 1, 6, NULL, 2, '2026-06-01', '2026-07-01', NULL,         'ACTIVE',   NULL),
    (2, 3, 7, NULL, 2, '2026-05-15', '2026-08-15', NULL,         'ACTIVE',   NULL),
    (3, 7, 8, NULL, 3, '2026-01-10', '2026-02-10', '2026-02-08', 'RETURNED', 'Returned in good condition, minor scratches on lid.');

-- ---------------------------------------------------------------------
-- 6. Transfer Requests
-- Raj Singh (current holder of AF-0001) requests handing it to Neha Kapoor.
-- ---------------------------------------------------------------------
INSERT INTO transfer_requests (id, asset_id, from_allocation_id, requested_by, requested_to_user_id, requested_to_department_id, status, reason) VALUES
    (1, 1, 1, 6, 7, NULL, 'REQUESTED', 'Moving to a new project; handing laptop over to Neha Kapoor.');

-- ---------------------------------------------------------------------
-- 7. Bookings
-- Room B2 has two back-to-back (non-overlapping) bookings to demonstrate
-- the overlap rule allows adjacent slots (09:00-10:00 then 10:00-11:00).
-- ---------------------------------------------------------------------
INSERT INTO bookings (id, asset_id, booked_by, department_id, start_time, end_time, status, purpose) VALUES
    (1, 5, 6, 2, '2026-07-14 09:00:00', '2026-07-14 10:00:00', 'UPCOMING', 'Sprint planning'),
    (2, 5, 7, 4, '2026-07-14 10:00:00', '2026-07-14 11:00:00', 'UPCOMING', 'HR policy review'),
    (3, 4, 8, 3, '2026-07-13 08:00:00', '2026-07-13 12:00:00', 'UPCOMING', 'Site visit to vendor warehouse');

-- ---------------------------------------------------------------------
-- 8. Maintenance Requests
-- AF-0006 approved and matches asset.status = UNDER_MAINTENANCE above.
-- ---------------------------------------------------------------------
INSERT INTO maintenance_requests (id, asset_id, raised_by, issue_description, priority, status, approved_by) VALUES
    (1, 6, 6, 'Projector bulb is flickering and image is very dim during presentations.', 'MEDIUM', 'APPROVED', 2),
    (2, 2, 7, 'Printer frequently jams paper on duplex printing.',                          'LOW',    'PENDING',  NULL);

-- ---------------------------------------------------------------------
-- 9. Audit Cycles
-- Cycle 1: in-progress, scoped to IT — some findings still pending.
-- Cycle 2: closed, scoped to Facilities — produced the LOST status on AF-0008.
-- ---------------------------------------------------------------------
INSERT INTO audit_cycles (id, name, scope_department_id, start_date, end_date, status, created_by, closed_at) VALUES
    (1, 'Q3 IT Asset Verification',           2, '2026-07-10', '2026-07-20', 'IN_PROGRESS', 1, NULL),
    (2, 'Facilities Asset Audit - June 2026', 3, '2026-06-01', '2026-06-10', 'CLOSED',       1, '2026-06-11 10:00:00');

-- ---------------------------------------------------------------------
-- 10. Audit Cycle Auditors
-- ---------------------------------------------------------------------
INSERT INTO audit_cycle_auditors (id, audit_cycle_id, auditor_user_id) VALUES
    (1, 1, 2),  -- Priya Sharma audits Cycle 1
    (2, 1, 4),  -- Anita Rao audits Cycle 1
    (3, 2, 3),  -- Rohit Verma audited Cycle 2
    (4, 2, 5);  -- Karan Mehta audited Cycle 2

-- ---------------------------------------------------------------------
-- 11. Audit Findings
-- Cycle 1 (IT scope: assets 1,2,6,7,9) — two still unchecked, showing an
-- in-progress cycle mid-way through.
-- Cycle 2 (Facilities scope: assets 4,5,8) — fully checked and closed,
-- with AF-0008 confirmed MISSING (matches assets.status = 'LOST').
-- ---------------------------------------------------------------------
INSERT INTO audit_findings (id, audit_cycle_id, asset_id, auditor_user_id, result, notes, checked_at) VALUES
    (1, 1, 1, 2, 'VERIFIED', 'Present with holder Raj Singh.',                          '2026-07-11 11:00:00'),
    (2, 1, 2, 2, 'VERIFIED', NULL,                                                       '2026-07-11 11:05:00'),
    (3, 1, 6, 4, 'DAMAGED',  'Confirmed bulb defect; already under maintenance.',        '2026-07-11 11:20:00'),
    (4, 1, 7, NULL, NULL,    NULL,                                                       NULL),
    (5, 1, 9, NULL, NULL,    NULL,                                                       NULL),
    (6, 2, 4, 3, 'VERIFIED', NULL,                                                       '2026-06-05 09:00:00'),
    (7, 2, 5, 5, 'VERIFIED', NULL,                                                       '2026-06-05 09:15:00'),
    (8, 2, 8, 3, 'MISSING',  'Not found in Facilities Store during physical count.',     '2026-06-06 14:00:00');

-- ---------------------------------------------------------------------
-- 12. Notifications
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, user_id, type, message, related_entity_type, related_entity_id, is_read) VALUES
    (1, 6, 'ASSET_ASSIGNED',          'You have been assigned Dell Latitude 5420 Laptop (AF-0001).',                              'asset',            1, 1),
    (2, 2, 'TRANSFER_REQUESTED',      'Raj Singh requested to transfer AF-0001 to Neha Kapoor.',                                  'transfer_request', 1, 0),
    (3, 6, 'MAINTENANCE_APPROVED',    'Your maintenance request for Epson EB-X05 Projector (AF-0006) was approved.',              'maintenance_request', 1, 0),
    (4, 8, 'BOOKING_CONFIRMED',       'Your booking for Toyota Innova Crysta (AF-0004) on 2026-07-13 08:00-12:00 is confirmed.',   'booking',          3, 1),
    (5, 5, 'AUDIT_DISCREPANCY_FLAGGED','Standing Desk (AF-0008) was marked MISSING during Facilities Asset Audit - June 2026.',   'audit_finding',    8, 1),
    (6, 6, 'OVERDUE_RETURN_ALERT',    'Your allocation of Dell Latitude 5420 Laptop (AF-0001) is overdue for return (was due 2026-07-01).', 'allocation', 1, 0);

-- ---------------------------------------------------------------------
-- 13. Activity Logs
-- ---------------------------------------------------------------------
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details) VALUES
    (1, 1, 'LOGIN',                 'user',               1, NULL),
    (2, 1, 'ROLE_PROMOTED',         'user',               4, '{"role":"DEPT_HEAD"}'),
    (3, 1, 'ROLE_PROMOTED',         'user',               2, '{"role":"ASSET_MANAGER"}'),
    (4, 2, 'ASSET_REGISTERED',      'asset',              1, '{"asset_tag":"AF-0001"}'),
    (5, 2, 'ASSET_ALLOCATED',       'allocation',         1, '{"asset_id":1,"to_user_id":6}'),
    (6, 6, 'TRANSFER_REQUESTED',    'transfer_request',   1, '{"asset_id":1}'),
    (7, 2, 'MAINTENANCE_APPROVED',  'maintenance_request',1, '{"from":"PENDING","to":"APPROVED"}'),
    (8, 8, 'BOOKING_CREATED',       'booking',            3, '{"asset_id":4}'),
    (9, 1, 'AUDIT_CYCLE_CLOSED',    'audit_cycle',        2, '{"result":"1 missing item flagged"}');
