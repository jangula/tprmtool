const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// List all vendors
router.get('/', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('vendors/list', {
    vendors,
    user: { name: req.session.userName }
  });
});

// New vendor form (Onboarding)
router.get('/new', (req, res) => {
  res.render('vendors/new', {
    user: { name: req.session.userName },
    error: null
  });
});

// Create vendor
router.post('/new', (req, res) => {
  const {
    vendor_name, vendor_contact, vendor_email, vendor_phone,
    vendor_address, vendor_website, service_description,
    contract_value, contract_start, contract_end
  } = req.body;

  try {
    const result = db.createVendor.run(
      req.session.userId,
      vendor_name,
      vendor_contact || '',
      vendor_email || '',
      vendor_phone || '',
      vendor_address || '',
      vendor_website || '',
      service_description || '',
      parseFloat(contract_value) || 0,
      contract_start || null,
      contract_end || null,
      'pending',
      null
    );

    // Log activity
    db.logActivity.run(req.session.userId, result.lastInsertRowid, 'vendor_created', `Vendor "${vendor_name}" onboarded`);

    res.redirect(`/vendors/${result.lastInsertRowid}`);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.render('vendors/new', {
      user: { name: req.session.userName },
      error: 'Failed to create vendor'
    });
  }
});

// View vendor details
router.get('/:id', (req, res) => {
  const vendor = db.getVendorById.get(req.params.id, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const assessment = db.getLatestAssessment.get(vendor.id, req.session.userId);
  const questionnaire = db.getQuestionnaireByVendor.get(vendor.id, req.session.userId);
  const issues = db.getIssuesByVendor.all(vendor.id, req.session.userId);
  const offboarding = db.getOffboardingByVendor.get(vendor.id, req.session.userId);

  // Get full history
  const history = db.getVendorHistory(vendor.id, req.session.userId);
  const activity = db.getActivityByVendor.all(vendor.id, req.session.userId);

  res.render('vendors/view', {
    vendor,
    assessment,
    questionnaire,
    issues,
    offboarding,
    history,
    activity,
    user: { name: req.session.userName }
  });
});

// Delete vendor
router.post('/:id/delete', (req, res) => {
  const vendor = db.getVendorById.get(req.params.id, req.session.userId);
  if (vendor) {
    db.deleteVendor.run(req.params.id, req.session.userId);
    db.logActivity.run(req.session.userId, null, 'vendor_deleted', `Vendor "${vendor.vendor_name}" deleted`);
  }
  res.redirect('/vendors');
});

module.exports = router;
