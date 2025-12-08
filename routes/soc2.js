const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// SOC 2 Review form
router.get('/:vendorId', requireAuth, (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existing = db.getSoc2ReviewByVendor.get(vendor.id, req.session.userId);

  res.render('soc2/form', {
    user: { name: req.session.userName },
    vendor,
    review: existing
  });
});

// Submit SOC 2 Review
router.post('/:vendorId', requireAuth, (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const data = {
    report_type: req.body.report_type,
    report_period_start: req.body.report_period_start,
    report_period_end: req.body.report_period_end,
    auditor_name: req.body.auditor_name,
    auditor_firm: req.body.auditor_firm,
    opinion_type: req.body.opinion_type,
    trust_services_security: req.body.trust_services_security,
    trust_services_availability: req.body.trust_services_availability,
    trust_services_processing: req.body.trust_services_processing,
    trust_services_confidentiality: req.body.trust_services_confidentiality,
    trust_services_privacy: req.body.trust_services_privacy,
    exceptions_noted: req.body.exceptions_noted,
    exception_details: req.body.exception_details,
    management_response: req.body.management_response,
    complementary_controls: req.body.complementary_controls,
    complementary_control_details: req.body.complementary_control_details,
    subservice_organizations: req.body.subservice_organizations,
    subservice_details: req.body.subservice_details,
    carve_out_method: req.body.carve_out_method,
    inclusive_method: req.body.inclusive_method,
    bridge_letter_required: req.body.bridge_letter_required,
    bridge_letter_obtained: req.body.bridge_letter_obtained,
    key_controls_reviewed: req.body.key_controls_reviewed,
    gaps_identified: req.body.gaps_identified,
    gap_details: req.body.gap_details,
    remediation_required: req.body.remediation_required,
    remediation_plan: req.body.remediation_plan,
    overall_assessment: req.body.overall_assessment,
    reviewer_notes: req.body.reviewer_notes,
    next_review_date: req.body.next_review_date,
    status: 'completed'
  };

  db.createSoc2Review.run(vendor.id, req.session.userId, data);

  try {
    db.logActivity.run(req.session.userId, vendor.id, 'soc2_review_completed', `SOC 2 review completed for ${vendor.vendor_name}`);
  } catch (e) {}

  res.redirect(`/vendors/${vendor.id}`);
});

module.exports = router;
