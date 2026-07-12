const auditModel = require('../models/auditModel');
const assetModel = require('../models/assetModel');
const allocationModel = require('../models/allocationModel'); // For logs and notifications

const auditService = {
  async createCycle({ name, scopeDepartmentId, scopeLocation, startDate, endDate, auditorIds, createdBy }) {
    if (!name || !startDate || !endDate || !auditorIds || auditorIds.length === 0) {
      const err = new Error('Cycle name, dates, and at least one auditor are required.');
      err.status = 400;
      throw err;
    }

    // 1. Insert audit cycle
    const cycleId = await auditModel.createCycle({
      name,
      scopeDepartmentId,
      scopeLocation,
      startDate,
      endDate,
      createdBy
    });

    // 2. Add auditors relation
    await auditModel.addAuditors(cycleId, auditorIds);

    // 3. Populate findings list
    const scopedCount = await auditModel.populateFindings(cycleId, scopeDepartmentId, scopeLocation);

    // Log action
    await allocationModel.addActivityLog({
      userId: createdBy,
      action: 'CREATE_AUDIT_CYCLE',
      entityType: 'audit_cycles',
      entityId: cycleId,
      details: { name, scopedAssets: scopedCount }
    });

    return { cycleId, scopedCount };
  },

  async startAudit(id, userId) {
    const cycle = await auditModel.findCycleById(id);
    if (!cycle) {
      const err = new Error(`Audit cycle ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (cycle.status !== 'PLANNED') {
      const err = new Error('Only planned cycles can be started.');
      err.status = 400;
      throw err;
    }

    await auditModel.updateCycleStatus(id, 'IN_PROGRESS');

    // Notify assigned auditors
    for (const aud of cycle.auditors) {
      await allocationModel.addNotification({
        userId: aud.id,
        type: 'AUDIT_STARTED',
        message: `You have been assigned as an auditor for the cycle "${cycle.name}".`,
        relatedEntityType: 'audit_cycles',
        relatedEntityId: id
      });
    }

    // Log action
    await allocationModel.addActivityLog({
      userId,
      action: 'START_AUDIT_CYCLE',
      entityType: 'audit_cycles',
      entityId: id,
      details: { name: cycle.name }
    });

    return true;
  },

  async submitFinding(findingId, { result, notes, auditorUserId, userRole }) {
    const finding = await auditModel.findFindingById(findingId);
    if (!finding) {
      const err = new Error(`Audit finding ID ${findingId} not found.`);
      err.status = 404;
      throw err;
    }

    const cycle = await auditModel.findCycleById(finding.audit_cycle_id);
    if (cycle.status !== 'IN_PROGRESS') {
      const err = new Error('Findings can only be submitted for cycles that are currently IN_PROGRESS.');
      err.status = 400;
      throw err;
    }

    // Authorization check: User must be an assigned auditor or Admin/Asset Manager
    const isAssigned = cycle.auditors.some(a => a.id === auditorUserId);
    const hasGlobalAuth = userRole === 'ADMIN' || userRole === 'ASSET_MANAGER';
    if (!isAssigned && !hasGlobalAuth) {
      const err = new Error('Unauthorized: You are not assigned to audit this cycle.');
      err.status = 403;
      throw err;
    }

    await auditModel.updateFinding(findingId, { result, notes, auditorUserId });

    // Log action
    await allocationModel.addActivityLog({
      userId: auditorUserId,
      action: 'SUBMIT_AUDIT_FINDING',
      entityType: 'audit_findings',
      entityId: findingId,
      details: { cycleId: finding.audit_cycle_id, assetId: finding.asset_id, result }
    });

    return true;
  },

  async closeAudit(id, userId) {
    const cycle = await auditModel.findCycleById(id);
    if (!cycle) {
      const err = new Error(`Audit cycle ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (cycle.status !== 'IN_PROGRESS') {
      const err = new Error('Only in-progress cycles can be closed.');
      err.status = 400;
      throw err;
    }

    // 1. Close cycle status
    await auditModel.updateCycleStatus(id, 'CLOSED');

    // 2. Fetch findings and execute status changes
    const findings = await auditModel.findFindingsByCycleId(id);
    let missingCount = 0;
    let damagedCount = 0;
    let verifiedCount = 0;

    for (const f of findings) {
      if (f.result === 'VERIFIED') {
        verifiedCount++;
      } else if (f.result === 'DAMAGED') {
        damagedCount++;
        // Set asset status to UNDER_MAINTENANCE, poor condition
        const asset = await assetModel.findById(f.asset_id);
        if (asset) {
          await assetModel.update(f.asset_id, {
            name: asset.name,
            categoryId: asset.category_id,
            serialNumber: asset.serial_number,
            qrCode: asset.qr_code,
            acquisitionDate: asset.acquisition_date,
            acquisitionCost: asset.acquisition_cost,
            condition: 'POOR',
            location: asset.location,
            departmentId: asset.department_id,
            status: 'UNDER_MAINTENANCE',
            isBookable: asset.is_bookable
          });
        }
      } else if (f.result === 'MISSING') {
        missingCount++;
        // Set asset status to LOST
        const asset = await assetModel.findById(f.asset_id);
        if (asset) {
          await assetModel.update(f.asset_id, {
            name: asset.name,
            categoryId: asset.category_id,
            serialNumber: asset.serial_number,
            qrCode: asset.qr_code,
            acquisitionDate: asset.acquisition_date,
            acquisitionCost: asset.acquisition_cost,
            condition: asset.condition,
            location: asset.location,
            departmentId: asset.department_id,
            status: 'LOST',
            isBookable: asset.is_bookable
          });
        }
      }
    }

    // 3. Log Action
    await allocationModel.addActivityLog({
      userId,
      action: 'CLOSE_AUDIT_CYCLE',
      entityType: 'audit_cycles',
      entityId: id,
      details: {
        name: cycle.name,
        verified: verifiedCount,
        damaged: damagedCount,
        missing: missingCount
      }
    });

    // 4. Send notification alerts to admins
    await allocationModel.addNotification({
      userId: cycle.created_by,
      type: 'AUDIT_CLOSED',
      message: `Audit cycle "${cycle.name}" has been closed. Summary: ${verifiedCount} Verified, ${damagedCount} Damaged, ${missingCount} Missing.`,
      relatedEntityType: 'audit_cycles',
      relatedEntityId: id
    });

    return {
      verified: verifiedCount,
      damaged: damagedCount,
      missing: missingCount
    };
  },

  async getCycles() {
    return await auditModel.findAllCycles();
  },

  async getCycleDetails(id) {
    const cycle = await auditModel.findCycleById(id);
    if (!cycle) {
      const err = new Error(`Audit cycle ID ${id} not found.`);
      err.status = 404;
      throw err;
    }
    const findings = await auditModel.findFindingsByCycleId(id);
    return {
      cycle,
      findings
    };
  }
};

module.exports = auditService;
