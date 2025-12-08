const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const db = require('./db/database');

// Initialize database (async)
(async () => {
  await db.initializeDatabase();
})();

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration with file-based store for concurrent users
const fileStoreOptions = {
  path: path.join(__dirname, 'sessions'),
  ttl: 86400, // 24 hours in seconds
  retries: 5,
  reapInterval: 3600, // Clean up expired sessions every hour
  logFn: function() {} // Suppress verbose logging
};

app.use(session({
  store: new FileStore(fileStoreOptions),
  secret: process.env.SESSION_SECRET || 'tprm-training-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true only if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make session data available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const assessmentRoutes = require('./routes/assessment');
const questionnaireRoutes = require('./routes/questionnaire');
const monitoringRoutes = require('./routes/monitoring');
const offboardingRoutes = require('./routes/offboarding');
const dataProcessingRoutes = require('./routes/dataprocessing');
const soc2Routes = require('./routes/soc2');
const contractClausesRoutes = require('./routes/contractclauses');
const guidelinesRoutes = require('./routes/guidelines');
const policyRoutes = require('./routes/policy');
const reportsRoutes = require('./routes/reports');
const riskManagementRoutes = require('./routes/riskmanagement');
const aiRiskRoutes = require('./routes/airisk');

app.use('/', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/assessment', assessmentRoutes);
app.use('/questionnaire', questionnaireRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/offboarding', offboardingRoutes);
app.use('/data-processing', dataProcessingRoutes);
app.use('/soc2', soc2Routes);
app.use('/contract-clauses', contractClausesRoutes);
app.use('/guidelines', guidelinesRoutes);
app.use('/policy', policyRoutes);
app.use('/reports', reportsRoutes);
app.use('/risk-management', riskManagementRoutes);
app.use('/ai-risk', aiRiskRoutes);

// Dashboard
const { requireAuth } = require('./middleware/auth');

app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.get('/dashboard', requireAuth, (req, res) => {
  const stats = db.getDashboardStats(req.session.userId);
  const recentActivity = db.getActivityByUser.all(req.session.userId);
  const vendors = db.getVendorsByUser.all(req.session.userId);

  res.render('dashboard', {
    user: { name: req.session.userName },
    stats,
    recentActivity: recentActivity.slice(0, 10),
    vendors: vendors.slice(0, 5)
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TPRM Tool running on http://0.0.0.0:${PORT}`);
});
