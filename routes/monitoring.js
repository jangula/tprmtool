const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// List all issues
router.get('/', (req, res) => {
  const issues = db.getIssuesByUser.all(req.session.userId);
  const vendors = db.getVendorsByUser.all(req.session.userId);

  res.render('monitoring/list', {
    issues,
    vendors,
    user: { name: req.session.userName }
  });
});

// New issue form
router.get('/new/:vendorId?', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  const selectedVendorId = req.params.vendorId || '';

  res.render('monitoring/new', {
    vendors,
    selectedVendorId,
    user: { name: req.session.userName }
  });
});

// Create issue
router.post('/new', (req, res) => {
  const {
    vendor_id, issue_type, severity, title,
    description, remediation_plan, due_date
  } = req.body;

  const vendor = db.getVendorById.get(vendor_id, req.session.userId);
  if (!vendor) {
    return res.redirect('/monitoring');
  }

  try {
    db.createIssue.run(
      vendor_id,
      req.session.userId,
      issue_type || 'other',
      severity || 'medium',
      title,
      description || '',
      remediation_plan || '',
      due_date || null,
      'open'
    );

    // Log activity
    db.logActivity.run(req.session.userId, vendor_id, 'issue_created',
      `Issue created: "${title}" (${severity})`);

    res.redirect('/monitoring');
  } catch (error) {
    console.error('Create issue error:', error);
    res.redirect('/monitoring/new');
  }
});

// Update issue status
router.post('/:id/status', (req, res) => {
  const { status } = req.body;
  const issueId = req.params.id;

  try {
    db.updateIssueStatus.run(status, status, issueId, req.session.userId);

    // Log activity
    db.logActivity.run(req.session.userId, null, 'issue_updated',
      `Issue #${issueId} status changed to ${status}`);

    res.redirect('/monitoring');
  } catch (error) {
    console.error('Update issue error:', error);
    res.redirect('/monitoring');
  }
});

module.exports = router;
