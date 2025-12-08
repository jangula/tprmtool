const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

// Risk Management Hub
router.get('/', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  const stats = db.getDashboardStats(req.session.userId);

  // Get recent assessments of each type
  const recentAssessments = db.getAllAssessments(req.session.userId).slice(0, 5);
  const recentQuestionnaires = db.getAllQuestionnaires(req.session.userId).slice(0, 5);
  const recentDataProcessing = db.getAllDataProcessing(req.session.userId).slice(0, 5);
  const recentSoc2 = db.getAllSoc2Reviews(req.session.userId).slice(0, 5);
  const recentAiRisk = db.getAllAiRiskAssessments(req.session.userId).slice(0, 5);

  res.render('riskmanagement/index', {
    user: { name: req.session.userName },
    vendors,
    stats,
    recentAssessments,
    recentQuestionnaires,
    recentDataProcessing,
    recentSoc2,
    recentAiRisk
  });
});

// Risk Assessment selection page
router.get('/assessment', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('riskmanagement/assessment-select', {
    user: { name: req.session.userName },
    vendors,
    assessmentType: 'risk'
  });
});

// Security Questionnaire selection page
router.get('/questionnaire', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('riskmanagement/assessment-select', {
    user: { name: req.session.userName },
    vendors,
    assessmentType: 'questionnaire'
  });
});

// Data Processing Assessment selection page
router.get('/data-processing', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('riskmanagement/assessment-select', {
    user: { name: req.session.userName },
    vendors,
    assessmentType: 'data-processing'
  });
});

// SOC 2 Review selection page
router.get('/soc2', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('riskmanagement/assessment-select', {
    user: { name: req.session.userName },
    vendors,
    assessmentType: 'soc2'
  });
});

// AI Risk Assessment selection page
router.get('/ai-risk', (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  res.render('riskmanagement/assessment-select', {
    user: { name: req.session.userName },
    vendors,
    assessmentType: 'ai-risk'
  });
});

module.exports = router;
