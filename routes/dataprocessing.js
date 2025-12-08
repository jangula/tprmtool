const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Data Processing Assessment form
router.get('/:vendorId', requireAuth, (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existing = db.getDataProcessingByVendor.get(vendor.id, req.session.userId);

  res.render('dataprocessing/form', {
    user: { name: req.session.userName },
    vendor,
    assessment: existing
  });
});

// Submit Data Processing Assessment
router.post('/:vendorId', requireAuth, (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const data = {
    data_categories: Array.isArray(req.body.data_categories) ? req.body.data_categories.join(', ') : req.body.data_categories,
    data_subjects: Array.isArray(req.body.data_subjects) ? req.body.data_subjects.join(', ') : req.body.data_subjects,
    processing_purposes: req.body.processing_purposes,
    legal_basis: req.body.legal_basis,
    data_location: req.body.data_location,
    cross_border_transfers: req.body.cross_border_transfers,
    transfer_mechanism: req.body.transfer_mechanism,
    retention_period: req.body.retention_period,
    deletion_process: req.body.deletion_process,
    subprocessors: req.body.subprocessors,
    subprocessor_list: req.body.subprocessor_list,
    data_minimization: req.body.data_minimization,
    purpose_limitation: req.body.purpose_limitation,
    dpia_required: req.body.dpia_required,
    dpia_completed: req.body.dpia_completed,
    privacy_notice: req.body.privacy_notice,
    consent_mechanism: req.body.consent_mechanism,
    data_subject_rights: req.body.data_subject_rights,
    breach_notification: req.body.breach_notification,
    breach_timeline: req.body.breach_timeline,
    audit_rights: req.body.audit_rights,
    assessment_notes: req.body.assessment_notes,
    status: 'completed'
  };

  db.createDataProcessingAssessment.run(vendor.id, req.session.userId, data);

  try {
    db.logActivity.run(req.session.userId, vendor.id, 'data_processing_completed', `Data processing assessment completed for ${vendor.vendor_name}`);
  } catch (e) {}

  res.redirect(`/vendors/${vendor.id}`);
});

module.exports = router;
