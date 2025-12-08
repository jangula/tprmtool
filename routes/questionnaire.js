const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Security Questionnaire form
router.get('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existingQuestionnaire = db.getQuestionnaireByVendor.get(vendor.id, req.session.userId);

  res.render('questionnaire/form', {
    vendor,
    questionnaire: existingQuestionnaire,
    user: { name: req.session.userName }
  });
});

// Submit Security Questionnaire
router.post('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const {
    has_security_policy, has_ciso, has_risk_management,
    has_soc2, has_iso27001, has_pentest,
    has_mfa, has_rbac, has_access_reviews,
    encryption_at_rest, encryption_in_transit, data_retention_policy,
    has_incident_plan, has_bcdr
  } = req.body;

  // Calculate score (simple: count 'yes' responses)
  const responses = [
    has_security_policy, has_ciso, has_risk_management,
    has_soc2, has_iso27001, has_pentest,
    has_mfa, has_rbac, has_access_reviews,
    encryption_at_rest, encryption_in_transit, data_retention_policy,
    has_incident_plan, has_bcdr
  ];
  const score = responses.filter(r => r === 'yes').length;
  const percentageScore = Math.round((score / 14) * 100);

  try {
    db.createQuestionnaire.run(
      vendor.id,
      req.session.userId,
      has_security_policy || 'no',
      has_ciso || 'no',
      has_risk_management || 'no',
      has_soc2 || 'no',
      has_iso27001 || 'no',
      has_pentest || 'no',
      has_mfa || 'no',
      has_rbac || 'no',
      has_access_reviews || 'no',
      encryption_at_rest || 'no',
      encryption_in_transit || 'no',
      data_retention_policy || 'no',
      has_incident_plan || 'no',
      has_bcdr || 'no',
      percentageScore,
      'completed',
      new Date().toISOString().split('T')[0]
    );

    // Log activity
    db.logActivity.run(req.session.userId, vendor.id, 'questionnaire_completed',
      `Security questionnaire completed. Score: ${percentageScore}%`);

    res.redirect(`/vendors/${vendor.id}`);
  } catch (error) {
    console.error('Questionnaire error:', error);
    res.redirect(`/questionnaire/${vendor.id}`);
  }
});

module.exports = router;
