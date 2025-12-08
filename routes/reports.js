const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// Reports Dashboard
router.get('/', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  const stats = db.getDashboardStats(req.session.userId);
  const assessments = db.getAllAssessments(req.session.userId);
  const questionnaires = db.getAllQuestionnaires(req.session.userId);

  res.render('reports/index', {
    user: { name: req.session.userName },
    vendors,
    stats,
    assessments,
    questionnaires
  });
});

// Vendor specific report
router.get('/vendor/:id', (req, res) => {
  const vendor = db.getVendorById.get(req.params.id, req.session.userId);
  if (!vendor) {
    return res.redirect('/reports');
  }

  const history = db.getVendorHistory(vendor.id, req.session.userId);
  const activity = db.getActivityByVendor.all(vendor.id, req.session.userId);

  res.render('reports/vendor', {
    user: { name: req.session.userName },
    vendor,
    history,
    activity
  });
});

// Export vendors as CSV
router.get('/export/vendors', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);

  const csv = [
    ['Vendor Name', 'Status', 'Risk Tier', 'Contact', 'Email', 'Phone', 'Contract Value', 'Contract Start', 'Contract End', 'Service Description', 'Created At'].join(','),
    ...vendors.map(v => [
      `"${v.vendor_name || ''}"`,
      v.status || '',
      v.risk_tier || '',
      `"${v.vendor_contact || ''}"`,
      v.vendor_email || '',
      v.vendor_phone || '',
      v.contract_value || 0,
      v.contract_start || '',
      v.contract_end || '',
      `"${(v.service_description || '').replace(/"/g, '""')}"`,
      v.created_at || ''
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=vendors_export.csv');
  res.send(csv);
});

// Export risk assessments as CSV
router.get('/export/assessments', (req, res) => {
  const assessments = db.getAllAssessments(req.session.userId);

  const csv = [
    ['Vendor', 'Assessment Date', 'Risk Tier', 'Inherent Score', 'Residual Score', 'Data Classification', 'Financial Risk', 'Operational Risk', 'Security Risk', 'Compliance Risk', 'Reputational Risk', 'Strategic Risk', 'Recommendation', 'Status'].join(','),
    ...assessments.map(a => [
      `"${a.vendor_name || ''}"`,
      a.assessment_date || '',
      a.risk_tier || '',
      a.inherent_risk_score || 0,
      a.residual_risk_score || 0,
      a.data_classification || '',
      a.financial_risk || '',
      a.operational_risk || '',
      a.security_risk || '',
      a.compliance_risk || '',
      a.reputational_risk || '',
      a.strategic_risk || '',
      `"${(a.recommendation || '').replace(/"/g, '""')}"`,
      a.status || ''
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=risk_assessments_export.csv');
  res.send(csv);
});

// Export questionnaires as CSV
router.get('/export/questionnaires', (req, res) => {
  const questionnaires = db.getAllQuestionnaires(req.session.userId);

  const csv = [
    ['Vendor', 'Completed Date', 'Security Score', 'Security Policy', 'CISO', 'Risk Management', 'SOC 2', 'ISO 27001', 'Pen Test', 'MFA', 'RBAC', 'Access Reviews', 'Encryption at Rest', 'Encryption in Transit', 'Data Retention', 'Incident Plan', 'BC/DR', 'Status'].join(','),
    ...questionnaires.map(q => [
      `"${q.vendor_name || ''}"`,
      q.completed_date || '',
      q.questionnaire_score || 0,
      q.has_security_policy || '',
      q.has_ciso || '',
      q.has_risk_management || '',
      q.has_soc2 || '',
      q.has_iso27001 || '',
      q.has_pentest || '',
      q.has_mfa || '',
      q.has_rbac || '',
      q.has_access_reviews || '',
      q.encryption_at_rest || '',
      q.encryption_in_transit || '',
      q.data_retention_policy || '',
      q.has_incident_plan || '',
      q.has_bcdr || '',
      q.status || ''
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=questionnaires_export.csv');
  res.send(csv);
});

// Export issues as CSV
router.get('/export/issues', (req, res) => {
  const issues = db.getIssuesByUser.all(req.session.userId);

  const csv = [
    ['Vendor', 'Title', 'Type', 'Severity', 'Status', 'Due Date', 'Description', 'Remediation Plan', 'Created At', 'Resolved At'].join(','),
    ...issues.map(i => [
      `"${i.vendor_name || ''}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.issue_type || '',
      i.severity || '',
      i.status || '',
      i.due_date || '',
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${(i.remediation_plan || '').replace(/"/g, '""')}"`,
      i.created_at || '',
      i.resolved_at || ''
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=issues_export.csv');
  res.send(csv);
});

// Export vendor report as CSV
router.get('/export/vendor/:id', (req, res) => {
  const vendor = db.getVendorById.get(req.params.id, req.session.userId);
  if (!vendor) {
    return res.status(404).send('Vendor not found');
  }

  const history = db.getVendorHistory(vendor.id, req.session.userId);

  let csv = `VENDOR REPORT: ${vendor.vendor_name}\n`;
  csv += `Generated: ${new Date().toISOString()}\n\n`;

  // Vendor Details
  csv += `VENDOR DETAILS\n`;
  csv += `Name,${vendor.vendor_name}\n`;
  csv += `Status,${vendor.status}\n`;
  csv += `Risk Tier,${vendor.risk_tier || 'Not assessed'}\n`;
  csv += `Contact,${vendor.vendor_contact || ''}\n`;
  csv += `Email,${vendor.vendor_email || ''}\n`;
  csv += `Phone,${vendor.vendor_phone || ''}\n`;
  csv += `Contract Value,${vendor.contract_value || 0}\n`;
  csv += `Contract Period,${vendor.contract_start || 'N/A'} to ${vendor.contract_end || 'N/A'}\n\n`;

  // Risk Assessments
  if (history.assessments.length > 0) {
    csv += `RISK ASSESSMENTS (${history.assessments.length})\n`;
    csv += 'Date,Risk Tier,Inherent Score,Financial,Operational,Security,Compliance,Recommendation\n';
    history.assessments.forEach(a => {
      csv += `${a.created_at},${a.risk_tier || ''},${a.inherent_risk_score || 0},${a.financial_risk || ''},${a.operational_risk || ''},${a.security_risk || ''},${a.compliance_risk || ''},"${(a.recommendation || '').replace(/"/g, '""')}"\n`;
    });
    csv += '\n';
  }

  // Questionnaires
  if (history.questionnaires.length > 0) {
    csv += `SECURITY QUESTIONNAIRES (${history.questionnaires.length})\n`;
    csv += 'Date,Score,MFA,SOC2,ISO27001,Encryption,BC/DR,Status\n';
    history.questionnaires.forEach(q => {
      csv += `${q.created_at},${q.questionnaire_score || 0}%,${q.has_mfa || ''},${q.has_soc2 || ''},${q.has_iso27001 || ''},${q.encryption_at_rest || ''},${q.has_bcdr || ''},${q.status || ''}\n`;
    });
    csv += '\n';
  }

  // Issues
  if (history.issues.length > 0) {
    csv += `MONITORING ISSUES (${history.issues.length})\n`;
    csv += 'Date,Title,Severity,Status,Due Date\n';
    history.issues.forEach(i => {
      csv += `${i.created_at},"${(i.title || '').replace(/"/g, '""')}",${i.severity || ''},${i.status || ''},${i.due_date || ''}\n`;
    });
    csv += '\n';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${vendor.vendor_name.replace(/[^a-z0-9]/gi, '_')}_report.csv`);
  res.send(csv);
});

module.exports = router;
