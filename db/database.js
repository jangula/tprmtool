const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use /app/data for database file (separate from code directory)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'tprm.db');

let db = null;

// Initialize database
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (e) {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      organization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_contact TEXT,
      vendor_email TEXT,
      vendor_phone TEXT,
      vendor_address TEXT,
      vendor_website TEXT,
      service_description TEXT,
      contract_value REAL,
      contract_start DATE,
      contract_end DATE,
      status TEXT DEFAULT 'pending',
      risk_tier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      assessment_date DATE DEFAULT CURRENT_DATE,
      data_classification TEXT,
      data_types TEXT,
      business_impact INTEGER,
      data_sensitivity INTEGER,
      system_access INTEGER,
      integration_depth INTEGER,
      replacement_difficulty INTEGER,
      regulatory_exposure INTEGER,
      financial_risk TEXT,
      operational_risk TEXT,
      security_risk TEXT,
      compliance_risk TEXT,
      reputational_risk TEXT,
      strategic_risk TEXT,
      inherent_risk_score INTEGER,
      residual_risk_score INTEGER,
      risk_tier TEXT,
      recommendation TEXT,
      notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS security_questionnaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      has_security_policy TEXT,
      has_ciso TEXT,
      has_risk_management TEXT,
      has_soc2 TEXT,
      has_iso27001 TEXT,
      has_pentest TEXT,
      has_mfa TEXT,
      has_rbac TEXT,
      has_access_reviews TEXT,
      encryption_at_rest TEXT,
      encryption_in_transit TEXT,
      data_retention_policy TEXT,
      has_incident_plan TEXT,
      has_bcdr TEXT,
      questionnaire_score INTEGER,
      status TEXT DEFAULT 'pending',
      completed_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS monitoring_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      issue_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      remediation_plan TEXT,
      due_date DATE,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS offboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      termination_reason TEXT,
      termination_date DATE,
      access_revoked TEXT DEFAULT 'no',
      data_returned TEXT DEFAULT 'no',
      data_destroyed TEXT DEFAULT 'no',
      assets_returned TEXT DEFAULT 'no',
      final_payment TEXT DEFAULT 'no',
      destruction_certificate TEXT DEFAULT 'no',
      status TEXT DEFAULT 'initiated',
      completed_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vendor_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Data Processing Assessment table
  db.run(`
    CREATE TABLE IF NOT EXISTS data_processing_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      data_categories TEXT,
      data_subjects TEXT,
      processing_purposes TEXT,
      legal_basis TEXT,
      data_location TEXT,
      cross_border_transfers TEXT,
      transfer_mechanism TEXT,
      retention_period TEXT,
      deletion_process TEXT,
      subprocessors TEXT,
      subprocessor_list TEXT,
      data_minimization TEXT,
      purpose_limitation TEXT,
      dpia_required TEXT,
      dpia_completed TEXT,
      privacy_notice TEXT,
      consent_mechanism TEXT,
      data_subject_rights TEXT,
      breach_notification TEXT,
      breach_timeline TEXT,
      audit_rights TEXT,
      assessment_notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // SOC 2 Review table
  db.run(`
    CREATE TABLE IF NOT EXISTS soc2_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      report_type TEXT,
      report_period_start DATE,
      report_period_end DATE,
      auditor_name TEXT,
      auditor_firm TEXT,
      opinion_type TEXT,
      trust_services_security TEXT,
      trust_services_availability TEXT,
      trust_services_processing TEXT,
      trust_services_confidentiality TEXT,
      trust_services_privacy TEXT,
      exceptions_noted TEXT,
      exception_details TEXT,
      management_response TEXT,
      complementary_controls TEXT,
      complementary_control_details TEXT,
      subservice_organizations TEXT,
      subservice_details TEXT,
      carve_out_method TEXT,
      inclusive_method TEXT,
      bridge_letter_required TEXT,
      bridge_letter_obtained TEXT,
      key_controls_reviewed TEXT,
      gaps_identified TEXT,
      gap_details TEXT,
      remediation_required TEXT,
      remediation_plan TEXT,
      overall_assessment TEXT,
      reviewer_notes TEXT,
      review_date DATE DEFAULT CURRENT_DATE,
      next_review_date DATE,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // AI Risk Assessment table
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_risk_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      ai_system_name TEXT,
      ai_system_description TEXT,
      ai_use_case TEXT,
      ai_model_type TEXT,
      training_data_source TEXT,
      training_data_personal TEXT,
      model_transparency TEXT,
      explainability_level TEXT,
      human_oversight TEXT,
      oversight_mechanism TEXT,
      automated_decisions TEXT,
      decision_impact TEXT,
      bias_testing TEXT,
      bias_mitigation TEXT,
      fairness_metrics TEXT,
      data_quality_controls TEXT,
      model_validation TEXT,
      performance_monitoring TEXT,
      drift_detection TEXT,
      accuracy_metrics TEXT,
      error_handling TEXT,
      fallback_procedures TEXT,
      data_privacy_compliance TEXT,
      consent_for_ai TEXT,
      right_to_explanation TEXT,
      opt_out_mechanism TEXT,
      data_minimization_ai TEXT,
      retention_ai_data TEXT,
      security_controls_ai TEXT,
      adversarial_testing TEXT,
      model_access_controls TEXT,
      audit_logging_ai TEXT,
      incident_response_ai TEXT,
      vendor_ai_governance TEXT,
      vendor_ai_ethics TEXT,
      vendor_ai_certification TEXT,
      third_party_models TEXT,
      model_supply_chain TEXT,
      intellectual_property TEXT,
      liability_allocation TEXT,
      regulatory_compliance TEXT,
      ai_risk_score INTEGER,
      ai_risk_tier TEXT,
      recommendations TEXT,
      assessment_notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Contract Clause Generator table
  db.run(`
    CREATE TABLE IF NOT EXISTS contract_clauses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER,
      user_id INTEGER NOT NULL,
      service_type TEXT,
      data_handled TEXT,
      data_sensitivity TEXT,
      integration_type TEXT,
      regulatory_requirements TEXT,
      sla_requirements TEXT,
      generated_clauses TEXT,
      custom_clauses TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDatabase();
  console.log('Database initialized successfully');
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Helper to run queries and return results
function runQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (e) {
    console.error('Query error:', e);
    return [];
  }
}

function runInsert(sql, params = []) {
  try {
    db.run(sql, params);
    const result = db.exec("SELECT last_insert_rowid() as id");
    const lastId = result[0]?.values[0]?.[0] || null;
    saveDatabase();
    return { lastInsertRowid: lastId };
  } catch (e) {
    console.error('Insert error:', e);
    return { lastInsertRowid: null };
  }
}

function runUpdate(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return true;
  } catch (e) {
    console.error('Update error:', e);
    return false;
  }
}

// User functions
const createUser = {
  run: (email, password, full_name, organization) => {
    return runInsert(
      'INSERT INTO users (email, password, full_name, organization) VALUES (?, ?, ?, ?)',
      [email, password, full_name, organization]
    );
  }
};

const findUserByEmail = {
  get: (email) => {
    const results = runQuery('SELECT * FROM users WHERE email = ?', [email]);
    return results[0] || null;
  }
};

const findUserById = {
  get: (id) => {
    const results = runQuery('SELECT * FROM users WHERE id = ?', [id]);
    return results[0] || null;
  }
};

// Vendor functions
const createVendor = {
  run: (user_id, vendor_name, vendor_contact, vendor_email, vendor_phone,
    vendor_address, vendor_website, service_description, contract_value,
    contract_start, contract_end, status, risk_tier) => {
    return runInsert(
      `INSERT INTO vendors (user_id, vendor_name, vendor_contact, vendor_email, vendor_phone,
        vendor_address, vendor_website, service_description, contract_value, contract_start,
        contract_end, status, risk_tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, vendor_name, vendor_contact, vendor_email, vendor_phone,
        vendor_address, vendor_website, service_description, contract_value,
        contract_start, contract_end, status, risk_tier]
    );
  }
};

const getVendorsByUser = {
  all: (user_id) => {
    return runQuery('SELECT * FROM vendors WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
  }
};

const getVendorById = {
  get: (id, user_id) => {
    const results = runQuery('SELECT * FROM vendors WHERE id = ? AND user_id = ?', [id, user_id]);
    return results[0] || null;
  }
};

const updateVendorStatus = {
  run: (status, risk_tier, id, user_id) => {
    return runUpdate(
      'UPDATE vendors SET status = ?, risk_tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, risk_tier, id, user_id]
    );
  }
};

const deleteVendor = {
  run: (id, user_id) => {
    return runUpdate('DELETE FROM vendors WHERE id = ? AND user_id = ?', [id, user_id]);
  }
};

// Risk Assessment functions
const createAssessment = {
  run: (vendor_id, user_id, data_classification, data_types,
    business_impact, data_sensitivity, system_access, integration_depth,
    replacement_difficulty, regulatory_exposure, financial_risk, operational_risk,
    security_risk, compliance_risk, reputational_risk, strategic_risk,
    inherent_risk_score, residual_risk_score, risk_tier, recommendation, notes, status) => {
    return runInsert(
      `INSERT INTO risk_assessments (vendor_id, user_id, data_classification, data_types,
        business_impact, data_sensitivity, system_access, integration_depth,
        replacement_difficulty, regulatory_exposure, financial_risk, operational_risk,
        security_risk, compliance_risk, reputational_risk, strategic_risk,
        inherent_risk_score, residual_risk_score, risk_tier, recommendation, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, data_classification, data_types,
        business_impact, data_sensitivity, system_access, integration_depth,
        replacement_difficulty, regulatory_exposure, financial_risk, operational_risk,
        security_risk, compliance_risk, reputational_risk, strategic_risk,
        inherent_risk_score, residual_risk_score, risk_tier, recommendation, notes, status]
    );
  }
};

const getAssessmentsByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

const getLatestAssessment = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

// Security Questionnaire functions
const createQuestionnaire = {
  run: (vendor_id, user_id, has_security_policy, has_ciso,
    has_risk_management, has_soc2, has_iso27001, has_pentest, has_mfa, has_rbac,
    has_access_reviews, encryption_at_rest, encryption_in_transit, data_retention_policy,
    has_incident_plan, has_bcdr, questionnaire_score, status, completed_date) => {
    return runInsert(
      `INSERT INTO security_questionnaires (vendor_id, user_id, has_security_policy, has_ciso,
        has_risk_management, has_soc2, has_iso27001, has_pentest, has_mfa, has_rbac,
        has_access_reviews, encryption_at_rest, encryption_in_transit, data_retention_policy,
        has_incident_plan, has_bcdr, questionnaire_score, status, completed_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, has_security_policy, has_ciso,
        has_risk_management, has_soc2, has_iso27001, has_pentest, has_mfa, has_rbac,
        has_access_reviews, encryption_at_rest, encryption_in_transit, data_retention_policy,
        has_incident_plan, has_bcdr, questionnaire_score, status, completed_date]
    );
  }
};

const getQuestionnaireByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM security_questionnaires WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

// Monitoring functions
const createIssue = {
  run: (vendor_id, user_id, issue_type, severity, title, description, remediation_plan, due_date, status) => {
    return runInsert(
      `INSERT INTO monitoring_issues (vendor_id, user_id, issue_type, severity, title,
        description, remediation_plan, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, issue_type, severity, title, description, remediation_plan, due_date, status]
    );
  }
};

const getIssuesByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM monitoring_issues WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

const getIssuesByUser = {
  all: (user_id) => {
    return runQuery(
      `SELECT mi.*, v.vendor_name FROM monitoring_issues mi
      JOIN vendors v ON mi.vendor_id = v.id
      WHERE mi.user_id = ? ORDER BY mi.created_at DESC`,
      [user_id]
    );
  }
};

const updateIssueStatus = {
  run: (status, status2, id, user_id) => {
    const resolved_at = status === 'resolved' ? new Date().toISOString() : null;
    return runUpdate(
      'UPDATE monitoring_issues SET status = ?, resolved_at = ? WHERE id = ? AND user_id = ?',
      [status, resolved_at, id, user_id]
    );
  }
};

// Offboarding functions
const createOffboarding = {
  run: (vendor_id, user_id, termination_reason, termination_date, notes) => {
    return runInsert(
      `INSERT INTO offboarding (vendor_id, user_id, termination_reason, termination_date, notes)
      VALUES (?, ?, ?, ?, ?)`,
      [vendor_id, user_id, termination_reason, termination_date, notes]
    );
  }
};

const getOffboardingByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM offboarding WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

const updateOffboarding = {
  run: (access_revoked, data_returned, data_destroyed, assets_returned, final_payment,
    destruction_certificate, status, status2, id, user_id) => {
    const completed_date = status === 'completed' ? new Date().toISOString().split('T')[0] : null;
    return runUpdate(
      `UPDATE offboarding SET access_revoked = ?, data_returned = ?, data_destroyed = ?,
        assets_returned = ?, final_payment = ?, destruction_certificate = ?, status = ?,
        completed_date = ? WHERE id = ? AND user_id = ?`,
      [access_revoked, data_returned, data_destroyed, assets_returned, final_payment,
        destruction_certificate, status, completed_date, id, user_id]
    );
  }
};

// Activity Log
const logActivity = {
  run: (user_id, vendor_id, action, details) => {
    return runInsert(
      'INSERT INTO activity_log (user_id, vendor_id, action, details) VALUES (?, ?, ?, ?)',
      [user_id, vendor_id, action, details]
    );
  }
};

const getActivityByUser = {
  all: (user_id) => {
    return runQuery(
      `SELECT al.*, v.vendor_name FROM activity_log al
      LEFT JOIN vendors v ON al.vendor_id = v.id
      WHERE al.user_id = ? ORDER BY al.created_at DESC LIMIT 50`,
      [user_id]
    );
  }
};

// Data Processing Assessment functions
const createDataProcessingAssessment = {
  run: (vendor_id, user_id, data) => {
    return runInsert(
      `INSERT INTO data_processing_assessments (vendor_id, user_id, data_categories, data_subjects,
        processing_purposes, legal_basis, data_location, cross_border_transfers, transfer_mechanism,
        retention_period, deletion_process, subprocessors, subprocessor_list, data_minimization,
        purpose_limitation, dpia_required, dpia_completed, privacy_notice, consent_mechanism,
        data_subject_rights, breach_notification, breach_timeline, audit_rights, assessment_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, data.data_categories, data.data_subjects, data.processing_purposes,
        data.legal_basis, data.data_location, data.cross_border_transfers, data.transfer_mechanism,
        data.retention_period, data.deletion_process, data.subprocessors, data.subprocessor_list,
        data.data_minimization, data.purpose_limitation, data.dpia_required, data.dpia_completed,
        data.privacy_notice, data.consent_mechanism, data.data_subject_rights, data.breach_notification,
        data.breach_timeline, data.audit_rights, data.assessment_notes, data.status || 'completed']
    );
  }
};

const getDataProcessingByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM data_processing_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

// SOC 2 Review functions
const createSoc2Review = {
  run: (vendor_id, user_id, data) => {
    return runInsert(
      `INSERT INTO soc2_reviews (vendor_id, user_id, report_type, report_period_start, report_period_end,
        auditor_name, auditor_firm, opinion_type, trust_services_security, trust_services_availability,
        trust_services_processing, trust_services_confidentiality, trust_services_privacy, exceptions_noted,
        exception_details, management_response, complementary_controls, complementary_control_details,
        subservice_organizations, subservice_details, carve_out_method, inclusive_method, bridge_letter_required,
        bridge_letter_obtained, key_controls_reviewed, gaps_identified, gap_details, remediation_required,
        remediation_plan, overall_assessment, reviewer_notes, next_review_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, data.report_type, data.report_period_start, data.report_period_end,
        data.auditor_name, data.auditor_firm, data.opinion_type, data.trust_services_security,
        data.trust_services_availability, data.trust_services_processing, data.trust_services_confidentiality,
        data.trust_services_privacy, data.exceptions_noted, data.exception_details, data.management_response,
        data.complementary_controls, data.complementary_control_details, data.subservice_organizations,
        data.subservice_details, data.carve_out_method, data.inclusive_method, data.bridge_letter_required,
        data.bridge_letter_obtained, data.key_controls_reviewed, data.gaps_identified, data.gap_details,
        data.remediation_required, data.remediation_plan, data.overall_assessment, data.reviewer_notes,
        data.next_review_date, data.status || 'completed']
    );
  }
};

const getSoc2ReviewByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM soc2_reviews WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

// AI Risk Assessment functions
const createAiRiskAssessment = {
  run: (vendor_id, user_id, data) => {
    return runInsert(
      `INSERT INTO ai_risk_assessments (vendor_id, user_id, ai_system_name, ai_system_description,
        ai_use_case, ai_model_type, training_data_source, training_data_personal, model_transparency,
        explainability_level, human_oversight, oversight_mechanism, automated_decisions, decision_impact,
        bias_testing, bias_mitigation, fairness_metrics, data_quality_controls, model_validation,
        performance_monitoring, drift_detection, accuracy_metrics, error_handling, fallback_procedures,
        data_privacy_compliance, consent_for_ai, right_to_explanation, opt_out_mechanism, data_minimization_ai,
        retention_ai_data, security_controls_ai, adversarial_testing, model_access_controls, audit_logging_ai,
        incident_response_ai, vendor_ai_governance, vendor_ai_ethics, vendor_ai_certification, third_party_models,
        model_supply_chain, intellectual_property, liability_allocation, regulatory_compliance,
        ai_risk_score, ai_risk_tier, recommendations, assessment_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, data.ai_system_name, data.ai_system_description, data.ai_use_case,
        data.ai_model_type, data.training_data_source, data.training_data_personal, data.model_transparency,
        data.explainability_level, data.human_oversight, data.oversight_mechanism, data.automated_decisions,
        data.decision_impact, data.bias_testing, data.bias_mitigation, data.fairness_metrics,
        data.data_quality_controls, data.model_validation, data.performance_monitoring, data.drift_detection,
        data.accuracy_metrics, data.error_handling, data.fallback_procedures, data.data_privacy_compliance,
        data.consent_for_ai, data.right_to_explanation, data.opt_out_mechanism, data.data_minimization_ai,
        data.retention_ai_data, data.security_controls_ai, data.adversarial_testing, data.model_access_controls,
        data.audit_logging_ai, data.incident_response_ai, data.vendor_ai_governance, data.vendor_ai_ethics,
        data.vendor_ai_certification, data.third_party_models, data.model_supply_chain, data.intellectual_property,
        data.liability_allocation, data.regulatory_compliance, data.ai_risk_score, data.ai_risk_tier,
        data.recommendations, data.assessment_notes, data.status || 'completed']
    );
  }
};

const getAiRiskAssessmentByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM ai_risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

const getAiRiskAssessmentsByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM ai_risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

function getAllAiRiskAssessments(user_id) {
  const assessments = runQuery(
    `SELECT ai.*, v.vendor_name FROM ai_risk_assessments ai
     JOIN vendors v ON ai.vendor_id = v.id
     WHERE ai.user_id = ? ORDER BY ai.created_at DESC`,
    [user_id]
  );
  return assessments;
}

// Contract Clause Generator functions
const createContractClauses = {
  run: (vendor_id, user_id, data) => {
    return runInsert(
      `INSERT INTO contract_clauses (vendor_id, user_id, service_type, data_handled, data_sensitivity,
        integration_type, regulatory_requirements, sla_requirements, generated_clauses, custom_clauses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, user_id, data.service_type, data.data_handled, data.data_sensitivity,
        data.integration_type, data.regulatory_requirements, data.sla_requirements,
        data.generated_clauses, data.custom_clauses]
    );
  }
};

const getContractClausesByVendor = {
  get: (vendor_id, user_id) => {
    const results = runQuery(
      'SELECT * FROM contract_clauses WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [vendor_id, user_id]
    );
    return results[0] || null;
  }
};

const getContractClausesByUser = {
  all: (user_id) => {
    return runQuery(
      `SELECT cc.*, v.vendor_name FROM contract_clauses cc
      LEFT JOIN vendors v ON cc.vendor_id = v.id
      WHERE cc.user_id = ? ORDER BY cc.created_at DESC`,
      [user_id]
    );
  }
};

// Get all questionnaires for a vendor (history)
const getQuestionnairesByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM security_questionnaires WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

// Get all data processing assessments for a vendor
const getDataProcessingsByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM data_processing_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

// Get all SOC 2 reviews for a vendor
const getSoc2ReviewsByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM soc2_reviews WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

// Get activity log for a vendor
const getActivityByVendor = {
  all: (vendor_id, user_id) => {
    return runQuery(
      'SELECT * FROM activity_log WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
      [vendor_id, user_id]
    );
  }
};

// Get comprehensive vendor history
function getVendorHistory(vendor_id, user_id) {
  const assessments = runQuery(
    'SELECT *, "risk_assessment" as type FROM risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const questionnaires = runQuery(
    'SELECT *, "questionnaire" as type FROM security_questionnaires WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const dataProcessing = runQuery(
    'SELECT *, "data_processing" as type FROM data_processing_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const soc2Reviews = runQuery(
    'SELECT *, "soc2_review" as type FROM soc2_reviews WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const aiRiskAssessments = runQuery(
    'SELECT *, "ai_risk" as type FROM ai_risk_assessments WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const issues = runQuery(
    'SELECT *, "issue" as type FROM monitoring_issues WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const offboarding = runQuery(
    'SELECT *, "offboarding" as type FROM offboarding WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );
  const clauses = runQuery(
    'SELECT *, "contract_clauses" as type FROM contract_clauses WHERE vendor_id = ? AND user_id = ? ORDER BY created_at DESC',
    [vendor_id, user_id]
  );

  return {
    assessments,
    questionnaires,
    dataProcessing,
    soc2Reviews,
    aiRiskAssessments,
    issues,
    offboarding,
    clauses
  };
}

// Get all assessments for reporting
function getAllAssessments(user_id) {
  const assessments = runQuery(
    `SELECT ra.*, v.vendor_name FROM risk_assessments ra
     JOIN vendors v ON ra.vendor_id = v.id
     WHERE ra.user_id = ? ORDER BY ra.created_at DESC`,
    [user_id]
  );
  return assessments;
}

function getAllQuestionnaires(user_id) {
  const questionnaires = runQuery(
    `SELECT sq.*, v.vendor_name FROM security_questionnaires sq
     JOIN vendors v ON sq.vendor_id = v.id
     WHERE sq.user_id = ? ORDER BY sq.created_at DESC`,
    [user_id]
  );
  return questionnaires;
}

function getAllDataProcessing(user_id) {
  const dpa = runQuery(
    `SELECT dpa.*, v.vendor_name FROM data_processing_assessments dpa
     JOIN vendors v ON dpa.vendor_id = v.id
     WHERE dpa.user_id = ? ORDER BY dpa.created_at DESC`,
    [user_id]
  );
  return dpa;
}

function getAllSoc2Reviews(user_id) {
  const reviews = runQuery(
    `SELECT sr.*, v.vendor_name FROM soc2_reviews sr
     JOIN vendors v ON sr.vendor_id = v.id
     WHERE sr.user_id = ? ORDER BY sr.created_at DESC`,
    [user_id]
  );
  return reviews;
}

// Dashboard stats
function getDashboardStats(userId) {
  const totalVendors = runQuery('SELECT COUNT(*) as count FROM vendors WHERE user_id = ?', [userId]);
  const activeVendors = runQuery("SELECT COUNT(*) as count FROM vendors WHERE user_id = ? AND status = 'active'", [userId]);
  const pendingAssessments = runQuery("SELECT COUNT(*) as count FROM vendors WHERE user_id = ? AND status = 'pending'", [userId]);
  const openIssues = runQuery("SELECT COUNT(*) as count FROM monitoring_issues WHERE user_id = ? AND status = 'open'", [userId]);
  const criticalVendors = runQuery("SELECT COUNT(*) as count FROM vendors WHERE user_id = ? AND risk_tier = 'critical'", [userId]);
  const highVendors = runQuery("SELECT COUNT(*) as count FROM vendors WHERE user_id = ? AND risk_tier = 'high'", [userId]);

  return {
    totalVendors: totalVendors[0]?.count || 0,
    activeVendors: activeVendors[0]?.count || 0,
    pendingAssessments: pendingAssessments[0]?.count || 0,
    openIssues: openIssues[0]?.count || 0,
    criticalVendors: criticalVendors[0]?.count || 0,
    highVendors: highVendors[0]?.count || 0
  };
}

module.exports = {
  initializeDatabase,
  createUser,
  findUserByEmail,
  findUserById,
  createVendor,
  getVendorsByUser,
  getVendorById,
  updateVendorStatus,
  deleteVendor,
  createAssessment,
  getAssessmentsByVendor,
  getLatestAssessment,
  createQuestionnaire,
  getQuestionnaireByVendor,
  getQuestionnairesByVendor,
  createIssue,
  getIssuesByVendor,
  getIssuesByUser,
  updateIssueStatus,
  createOffboarding,
  getOffboardingByVendor,
  updateOffboarding,
  logActivity,
  getActivityByUser,
  getActivityByVendor,
  getDashboardStats,
  createDataProcessingAssessment,
  getDataProcessingByVendor,
  getDataProcessingsByVendor,
  createSoc2Review,
  getSoc2ReviewByVendor,
  getSoc2ReviewsByVendor,
  createContractClauses,
  getContractClausesByVendor,
  getContractClausesByUser,
  getVendorHistory,
  getAllAssessments,
  getAllQuestionnaires,
  getAllDataProcessing,
  getAllSoc2Reviews,
  createAiRiskAssessment,
  getAiRiskAssessmentByVendor,
  getAiRiskAssessmentsByVendor,
  getAllAiRiskAssessments
};
