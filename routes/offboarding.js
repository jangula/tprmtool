const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Initiate offboarding form
router.get('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existingOffboarding = db.getOffboardingByVendor.get(vendor.id, req.session.userId);

  res.render('offboarding/form', {
    vendor,
    offboarding: existingOffboarding,
    user: { name: req.session.userName }
  });
});

// Create offboarding record
router.post('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const { termination_reason, termination_date, notes } = req.body;

  try {
    db.createOffboarding.run(
      vendor.id,
      req.session.userId,
      termination_reason || '',
      termination_date || null,
      notes || ''
    );

    // Update vendor status
    db.updateVendorStatus.run('offboarding', vendor.risk_tier, vendor.id, req.session.userId);

    // Log activity
    db.logActivity.run(req.session.userId, vendor.id, 'offboarding_initiated',
      `Offboarding initiated for "${vendor.vendor_name}"`);

    res.redirect(`/offboarding/${vendor.id}`);
  } catch (error) {
    console.error('Offboarding error:', error);
    res.redirect(`/vendors/${vendor.id}`);
  }
});

// Update offboarding checklist
router.post('/:vendorId/update', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const offboarding = db.getOffboardingByVendor.get(vendor.id, req.session.userId);
  if (!offboarding) {
    return res.redirect(`/vendors/${vendor.id}`);
  }

  const {
    access_revoked, data_returned, data_destroyed,
    assets_returned, final_payment, destruction_certificate
  } = req.body;

  // Check if all items are complete
  const allComplete = [
    access_revoked, data_returned, data_destroyed,
    assets_returned, final_payment, destruction_certificate
  ].every(item => item === 'yes');

  const status = allComplete ? 'completed' : 'in_progress';

  try {
    db.updateOffboarding.run(
      access_revoked || 'no',
      data_returned || 'no',
      data_destroyed || 'no',
      assets_returned || 'no',
      final_payment || 'no',
      destruction_certificate || 'no',
      status,
      status,
      offboarding.id,
      req.session.userId
    );

    if (allComplete) {
      // Update vendor status to offboarded
      db.updateVendorStatus.run('offboarded', vendor.risk_tier, vendor.id, req.session.userId);

      db.logActivity.run(req.session.userId, vendor.id, 'offboarding_completed',
        `Offboarding completed for "${vendor.vendor_name}"`);
    } else {
      db.logActivity.run(req.session.userId, vendor.id, 'offboarding_updated',
        `Offboarding checklist updated for "${vendor.vendor_name}"`);
    }

    res.redirect(`/vendors/${vendor.id}`);
  } catch (error) {
    console.error('Update offboarding error:', error);
    res.redirect(`/offboarding/${vendor.id}`);
  }
});

module.exports = router;
