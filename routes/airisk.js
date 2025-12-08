const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// AI Risk Assessment form
router.get('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  const existingAssessment = db.getAiRiskAssessmentByVendor.get(vendor.id, req.session.userId);

  res.render('airisk/form', {
    user: { name: req.session.userName },
    vendor,
    assessment: existingAssessment
  });
});

// Submit AI Risk Assessment
router.post('/:vendorId', (req, res) => {
  const vendor = db.getVendorById.get(req.params.vendorId, req.session.userId);
  if (!vendor) {
    return res.redirect('/vendors');
  }

  // Calculate AI risk score based on responses
  let riskScore = 0;
  const riskFactors = {
    // High impact automated decisions
    automated_decisions: { yes: 4, partial: 2, no: 0 },
    decision_impact: { high: 4, medium: 2, low: 1 },
    // Data & Privacy risks
    training_data_personal: { yes: 3, partial: 2, no: 0 },
    data_privacy_compliance: { no: 4, partial: 2, yes: 0 },
    consent_for_ai: { no: 3, partial: 1, yes: 0 },
    // Transparency & Explainability
    model_transparency: { low: 3, medium: 2, high: 0 },
    explainability_level: { none: 4, low: 3, medium: 1, high: 0 },
    human_oversight: { no: 4, limited: 2, yes: 0 },
    // Bias & Fairness
    bias_testing: { no: 4, partial: 2, yes: 0 },
    bias_mitigation: { no: 3, partial: 1, yes: 0 },
    // Model Governance
    model_validation: { no: 3, partial: 1, yes: 0 },
    performance_monitoring: { no: 3, partial: 1, yes: 0 },
    drift_detection: { no: 2, partial: 1, yes: 0 },
    // Security
    security_controls_ai: { no: 4, partial: 2, yes: 0 },
    adversarial_testing: { no: 3, partial: 1, yes: 0 },
    model_access_controls: { no: 3, partial: 1, yes: 0 },
    // Vendor governance
    vendor_ai_governance: { no: 3, partial: 1, yes: 0 },
    vendor_ai_ethics: { no: 2, partial: 1, yes: 0 }
  };

  Object.keys(riskFactors).forEach(key => {
    const value = req.body[key];
    if (value && riskFactors[key][value] !== undefined) {
      riskScore += riskFactors[key][value];
    }
  });

  // Determine risk tier (max possible score is ~60)
  let riskTier;
  if (riskScore >= 40) {
    riskTier = 'critical';
  } else if (riskScore >= 28) {
    riskTier = 'high';
  } else if (riskScore >= 16) {
    riskTier = 'medium';
  } else {
    riskTier = 'low';
  }

  // Generate recommendations
  let recommendations = [];
  if (req.body.human_oversight === 'no' || req.body.human_oversight === 'limited') {
    recommendations.push('Implement human-in-the-loop oversight for AI decisions');
  }
  if (req.body.bias_testing === 'no') {
    recommendations.push('Require vendor to conduct bias testing and provide results');
  }
  if (req.body.explainability_level === 'none' || req.body.explainability_level === 'low') {
    recommendations.push('Request explainability documentation for AI model decisions');
  }
  if (req.body.data_privacy_compliance === 'no') {
    recommendations.push('Ensure AI data processing complies with Namibia ETA and privacy regulations');
  }
  if (req.body.security_controls_ai === 'no') {
    recommendations.push('Implement security controls for AI model protection');
  }
  if (req.body.vendor_ai_governance === 'no') {
    recommendations.push('Require vendor to establish AI governance framework');
  }
  if (req.body.model_validation === 'no') {
    recommendations.push('Request model validation and testing documentation');
  }
  if (req.body.adversarial_testing === 'no') {
    recommendations.push('Conduct adversarial testing to identify AI vulnerabilities');
  }

  const data = {
    ai_system_name: req.body.ai_system_name,
    ai_system_description: req.body.ai_system_description,
    ai_use_case: req.body.ai_use_case,
    ai_model_type: req.body.ai_model_type,
    training_data_source: req.body.training_data_source,
    training_data_personal: req.body.training_data_personal,
    model_transparency: req.body.model_transparency,
    explainability_level: req.body.explainability_level,
    human_oversight: req.body.human_oversight,
    oversight_mechanism: req.body.oversight_mechanism,
    automated_decisions: req.body.automated_decisions,
    decision_impact: req.body.decision_impact,
    bias_testing: req.body.bias_testing,
    bias_mitigation: req.body.bias_mitigation,
    fairness_metrics: req.body.fairness_metrics,
    data_quality_controls: req.body.data_quality_controls,
    model_validation: req.body.model_validation,
    performance_monitoring: req.body.performance_monitoring,
    drift_detection: req.body.drift_detection,
    accuracy_metrics: req.body.accuracy_metrics,
    error_handling: req.body.error_handling,
    fallback_procedures: req.body.fallback_procedures,
    data_privacy_compliance: req.body.data_privacy_compliance,
    consent_for_ai: req.body.consent_for_ai,
    right_to_explanation: req.body.right_to_explanation,
    opt_out_mechanism: req.body.opt_out_mechanism,
    data_minimization_ai: req.body.data_minimization_ai,
    retention_ai_data: req.body.retention_ai_data,
    security_controls_ai: req.body.security_controls_ai,
    adversarial_testing: req.body.adversarial_testing,
    model_access_controls: req.body.model_access_controls,
    audit_logging_ai: req.body.audit_logging_ai,
    incident_response_ai: req.body.incident_response_ai,
    vendor_ai_governance: req.body.vendor_ai_governance,
    vendor_ai_ethics: req.body.vendor_ai_ethics,
    vendor_ai_certification: req.body.vendor_ai_certification,
    third_party_models: req.body.third_party_models,
    model_supply_chain: req.body.model_supply_chain,
    intellectual_property: req.body.intellectual_property,
    liability_allocation: req.body.liability_allocation,
    regulatory_compliance: req.body.regulatory_compliance,
    ai_risk_score: riskScore,
    ai_risk_tier: riskTier,
    recommendations: recommendations.join('\n'),
    assessment_notes: req.body.assessment_notes,
    status: 'completed'
  };

  db.createAiRiskAssessment.run(vendor.id, req.session.userId, data);
  db.logActivity.run(req.session.userId, vendor.id, 'ai_risk_assessment',
    `AI Risk Assessment completed for "${vendor.vendor_name}" - Risk Tier: ${riskTier.toUpperCase()}`);

  res.redirect(`/vendors/${vendor.id}`);
});

module.exports = router;
