const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Risk Assessment form
router.get('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existingAssessment = db.getLatestAssessment.get(vendor.id, req.session.userId);

  res.render('assessment/form', {
    vendor,
    assessment: existingAssessment,
    user: { name: req.session.userName }
  });
});

// Submit Risk Assessment
router.post('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const {
    data_classification, data_types,
    business_impact, data_sensitivity, system_access,
    integration_depth, replacement_difficulty, regulatory_exposure,
    financial_risk, operational_risk, security_risk,
    compliance_risk, reputational_risk, strategic_risk,
    recommendation, notes
  } = req.body;

  // Calculate inherent risk score
  const scores = [
    parseInt(business_impact) || 1,
    parseInt(data_sensitivity) || 1,
    parseInt(system_access) || 1,
    parseInt(integration_depth) || 1,
    parseInt(replacement_difficulty) || 1,
    parseInt(regulatory_exposure) || 1
  ];
  const inherentRiskScore = scores.reduce((a, b) => a + b, 0);

  // Determine risk tier
  let riskTier;
  if (inherentRiskScore >= 19) riskTier = 'critical';
  else if (inherentRiskScore >= 13) riskTier = 'high';
  else if (inherentRiskScore >= 7) riskTier = 'medium';
  else riskTier = 'low';

  // Residual risk (simplified - same as inherent for now)
  const residualRiskScore = inherentRiskScore;

  try {
    db.createAssessment.run(
      vendor.id,
      req.session.userId,
      data_classification || '',
      Array.isArray(data_types) ? data_types.join(',') : (data_types || ''),
      parseInt(business_impact) || 1,
      parseInt(data_sensitivity) || 1,
      parseInt(system_access) || 1,
      parseInt(integration_depth) || 1,
      parseInt(replacement_difficulty) || 1,
      parseInt(regulatory_exposure) || 1,
      financial_risk || 'low',
      operational_risk || 'low',
      security_risk || 'low',
      compliance_risk || 'low',
      reputational_risk || 'low',
      strategic_risk || 'low',
      inherentRiskScore,
      residualRiskScore,
      riskTier,
      recommendation || '',
      notes || '',
      'completed'
    );

    // Update vendor status and risk tier
    db.updateVendorStatus.run('active', riskTier, vendor.id, req.session.userId);

    // Log activity
    db.logActivity.run(req.session.userId, vendor.id, 'assessment_completed',
      `Risk assessment completed. Risk Tier: ${riskTier.toUpperCase()}`);

    res.redirect(`/vendors/${vendor.id}`);
  } catch (error) {
    console.error('Assessment error:', error);
    res.redirect(`/assessment/${vendor.id}`);
  }
});

module.exports = router;
