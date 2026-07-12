-- =====================================================================
-- AssetFlow — SQLite Schema
-- Implements the approved architecture exactly: 14 tables, no redesign.
-- Enums are implemented as TEXT + CHECK constraints (SQLite has no ENUM).
-- Run via backend/src/database/init.js
-- =====================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ---------------------------------------------------------------------
-- 1. departments
-- Master data: organizational units. Self-referencing for hierarchy.
-- head_user_id forward-references users(id); SQLite does not require the
-- referenced table to exist yet, so table order below is safe.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT NOT NULL UNIQUE,
    head_user_id            INTEGER,
    parent_department_id    INTEGER,
    status                  TEXT NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_head   ON departments(head_user_id);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);

-- ---------------------------------------------------------------------
-- 2. users
-- Every login-capable account. Role assigned ONLY by Admin promotion
-- (never at signup) — enforced in the service layer, not the DB.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    department_id   INTEGER,
    role            TEXT NOT NULL DEFAULT 'EMPLOYEE'
                        CHECK (role IN ('ADMIN','ASSET_MANAGER','DEPT_HEAD','EMPLOYEE')),
    status          TEXT NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);

-- ---------------------------------------------------------------------
-- 3. asset_categories
-- extra_fields_schema holds an optional JSON description of category-
-- specific fields (e.g. warranty_period_months for Electronics) so no
-- extra tables/EAV model is needed for the MVP.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_categories (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT NOT NULL UNIQUE,
    extra_fields_schema     TEXT,
    created_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 4. assets
-- Central registry. status is the single source of truth for the
-- lifecycle state machine (Available/Allocated/Reserved/Under
-- Maintenance/Lost/Retired/Disposed).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_tag           TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    category_id         INTEGER NOT NULL,
    serial_number       TEXT,
    qr_code             TEXT UNIQUE,
    acquisition_date    TEXT,
    acquisition_cost    REAL,
    condition           TEXT NOT NULL DEFAULT 'GOOD'
                            CHECK (condition IN ('NEW','GOOD','FAIR','POOR','DAMAGED')),
    location            TEXT,
    department_id       INTEGER,
    status              TEXT NOT NULL DEFAULT 'AVAILABLE'
                            CHECK (status IN ('AVAILABLE','ALLOCATED','RESERVED',
                                               'UNDER_MAINTENANCE','LOST','RETIRED','DISPOSED')),
    is_bookable         INTEGER NOT NULL DEFAULT 0 CHECK (is_bookable IN (0,1)),
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id)   REFERENCES asset_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_assets_serial     ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_category   ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status     ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(department_id);
CREATE INDEX IF NOT EXISTS idx_assets_location   ON assets(location);
CREATE INDEX IF NOT EXISTS idx_assets_bookable   ON assets(is_bookable);

-- ---------------------------------------------------------------------
-- 5. asset_documents
-- Photos/attachments. Only file_path is stored; binary lives on disk
-- under backend/uploads/.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_documents (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id        INTEGER NOT NULL,
    file_path       TEXT NOT NULL,
    file_type       TEXT,
    uploaded_by     INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id)    REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset ON asset_documents(asset_id);

-- ---------------------------------------------------------------------
-- 6. allocations
-- Holder is exactly one of {user, department} — enforced by CHECK.
-- Business rule "no double-allocation": enforced by a PARTIAL UNIQUE
-- INDEX so SQLite itself rejects a second ACTIVE row for the same asset,
-- in addition to the application-level check in allocationService.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS allocations (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id                    INTEGER NOT NULL,
    allocated_to_user_id        INTEGER,
    allocated_to_department_id  INTEGER,
    allocated_by                INTEGER NOT NULL,
    allocation_date             TEXT NOT NULL DEFAULT (datetime('now')),
    expected_return_date        TEXT,
    actual_return_date          TEXT,
    status                      TEXT NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('ACTIVE','RETURNED','TRANSFERRED')),
    return_condition_notes      TEXT,
    created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at                  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id)                   REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_to_user_id)       REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (allocated_to_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (allocated_by)               REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (
        (allocated_to_user_id IS NOT NULL AND allocated_to_department_id IS NULL)
        OR
        (allocated_to_user_id IS NULL AND allocated_to_department_id IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS idx_allocations_asset            ON allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status           ON allocations(status);
CREATE INDEX IF NOT EXISTS idx_allocations_expected_return  ON allocations(expected_return_date);
CREATE INDEX IF NOT EXISTS idx_allocations_holder_user      ON allocations(allocated_to_user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_holder_dept      ON allocations(allocated_to_department_id);
-- Business rule: only one ACTIVE allocation per asset at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_allocations_one_active_per_asset
    ON allocations(asset_id) WHERE status = 'ACTIVE';

-- ---------------------------------------------------------------------
-- 7. transfer_requests
-- Requested -> Approved/Rejected -> Completed. Target is exactly one of
-- {user, department}, same pattern as allocations.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transfer_requests (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id                    INTEGER NOT NULL,
    from_allocation_id          INTEGER NOT NULL,
    requested_by                INTEGER NOT NULL,
    requested_to_user_id        INTEGER,
    requested_to_department_id  INTEGER,
    status                      TEXT NOT NULL DEFAULT 'REQUESTED'
                                    CHECK (status IN ('REQUESTED','APPROVED','REJECTED','COMPLETED')),
    approved_by                 INTEGER,
    approved_at                 TEXT,
    reason                      TEXT,
    created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at                  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id)                   REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (from_allocation_id)         REFERENCES allocations(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by)               REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_to_user_id)       REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_to_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by)                REFERENCES users(id) ON DELETE SET NULL,
    CHECK (
        (requested_to_user_id IS NOT NULL AND requested_to_department_id IS NULL)
        OR
        (requested_to_user_id IS NULL AND requested_to_department_id IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_asset  ON transfer_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON transfer_requests(status);

-- ---------------------------------------------------------------------
-- 8. bookings
-- Time-slot booking of bookable assets. The half-open overlap check
-- (existing.start < new.end AND existing.end > new.start) is enforced
-- in bookingService at insert time — SQLite CHECK constraints cannot
-- reference other rows, so this stays an application-level rule.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id        INTEGER NOT NULL,
    booked_by       INTEGER NOT NULL,
    department_id   INTEGER,
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'UPCOMING'
                        CHECK (status IN ('UPCOMING','ONGOING','COMPLETED','CANCELLED')),
    purpose         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id)      REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by)     REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CHECK (end_time > start_time)
);
CREATE INDEX IF NOT EXISTS idx_bookings_asset      ON bookings(asset_id);
CREATE INDEX IF NOT EXISTS idx_bookings_asset_time ON bookings(asset_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings(status);

-- ---------------------------------------------------------------------
-- 9. maintenance_requests
-- Pending -> Approved/Rejected -> Technician Assigned -> In Progress ->
-- Resolved. technician_name is a free-text field (no technician entity
-- for MVP, per scope decision).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id            INTEGER NOT NULL,
    raised_by           INTEGER NOT NULL,
    issue_description   TEXT NOT NULL,
    priority            TEXT NOT NULL DEFAULT 'MEDIUM'
                            CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    photo_path          TEXT,
    status              TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','APPROVED','REJECTED',
                                               'TECHNICIAN_ASSIGNED','IN_PROGRESS','RESOLVED')),
    approved_by         INTEGER,
    technician_name     TEXT,
    resolution_notes    TEXT,
    resolved_at         TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id)    REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by)   REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset  ON maintenance_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);

-- ---------------------------------------------------------------------
-- 10. audit_cycles
-- Scoped by department and/or free-text location, with a date range.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_cycles (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT NOT NULL,
    scope_department_id     INTEGER,
    scope_location          TEXT,
    start_date              TEXT NOT NULL,
    end_date                TEXT NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'PLANNED'
                                CHECK (status IN ('PLANNED','IN_PROGRESS','CLOSED')),
    created_by              INTEGER NOT NULL,
    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at               TEXT,
    FOREIGN KEY (scope_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)          REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_audit_cycles_status     ON audit_cycles(status);
CREATE INDEX IF NOT EXISTS idx_audit_cycles_department ON audit_cycles(scope_department_id);

-- ---------------------------------------------------------------------
-- 11. audit_cycle_auditors (many-to-many: cycles <-> auditors)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_cycle_auditors (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_cycle_id      INTEGER NOT NULL,
    auditor_user_id     INTEGER NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (audit_cycle_id)  REFERENCES audit_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (auditor_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (audit_cycle_id, auditor_user_id)
);
CREATE INDEX IF NOT EXISTS idx_audit_cycle_auditors_cycle   ON audit_cycle_auditors(audit_cycle_id);
CREATE INDEX IF NOT EXISTS idx_audit_cycle_auditors_auditor ON audit_cycle_auditors(auditor_user_id);

-- ---------------------------------------------------------------------
-- 12. audit_findings
-- One row per (cycle, asset), pre-populated when the cycle is scoped.
-- Discrepancy report = SELECT * WHERE result IN ('MISSING','DAMAGED') —
-- no separate report table needed.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_findings (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_cycle_id      INTEGER NOT NULL,
    asset_id            INTEGER NOT NULL,
    auditor_user_id     INTEGER,
    result              TEXT CHECK (result IN ('VERIFIED','MISSING','DAMAGED')),
    notes               TEXT,
    checked_at          TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (audit_cycle_id)  REFERENCES audit_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id)        REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (auditor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (audit_cycle_id, asset_id)
);
CREATE INDEX IF NOT EXISTS idx_audit_findings_cycle  ON audit_findings(audit_cycle_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_asset  ON audit_findings(asset_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_result ON audit_findings(result);

-- ---------------------------------------------------------------------
-- 13. notifications
-- related_entity_type/id is a generic pointer (e.g. 'asset', 42) so one
-- table serves every event type in the notification matrix.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER NOT NULL,
    type                    TEXT NOT NULL,
    message                 TEXT NOT NULL,
    related_entity_type     TEXT,
    related_entity_id       INTEGER,
    is_read                 INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0,1)),
    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_user      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------
-- 14. activity_logs
-- Generic action logger, written explicitly by services (not a
-- catch-all request logger). details stores a small JSON snapshot.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    action          TEXT NOT NULL,
    entity_type     TEXT,
    entity_id       INTEGER,
    details         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity  ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user    ON activity_logs(user_id);
