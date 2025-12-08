const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Contract clause templates
const clauseTemplates = {
  security: {
    high: `The Vendor shall implement and maintain industry-standard security controls including but not limited to: encryption of data at rest (AES-256) and in transit (TLS 1.2+), multi-factor authentication, role-based access controls, regular security assessments, and 24/7 security monitoring. Vendor shall maintain SOC 2 Type II certification and provide annual reports to the Company.`,
    medium: `The Vendor shall implement appropriate security measures to protect Company data, including encryption, access controls, and regular security reviews. Vendor shall notify Company of any security incidents within 24 hours.`,
    low: `The Vendor shall maintain reasonable security measures to protect any Company information in accordance with industry practices.`
  },
  dataProtection: {
    high: `The Vendor shall process personal data only as instructed by the Company and in compliance with GDPR, POPIA, and other applicable data protection laws. Vendor shall implement appropriate technical and organizational measures, conduct DPIAs where required, and ensure sub-processors meet equivalent standards. Data shall not be transferred outside approved jurisdictions without explicit consent and appropriate safeguards.`,
    medium: `The Vendor shall protect personal data in accordance with applicable data protection legislation and shall not process data for purposes other than those specified in this agreement. Vendor shall notify Company of any data breaches within 48 hours.`,
    low: `The Vendor shall handle any personal data in accordance with applicable privacy laws and regulations.`
  },
  sla: {
    high: `The Vendor guarantees 99.9% uptime availability measured monthly. Response times: Critical issues - 15 minutes, High - 1 hour, Medium - 4 hours, Low - 24 hours. Service credits: <99.9% = 10% credit, <99.5% = 25% credit, <99.0% = 50% credit with termination rights.`,
    medium: `The Vendor shall maintain 99.5% uptime availability. Support response times: Critical - 1 hour, High - 4 hours, Standard - 24 hours. Service credits apply for availability below target.`,
    low: `The Vendor shall provide reasonable service availability and support response times consistent with industry standards.`
  },
  audit: {
    high: `The Company reserves the right to conduct annual security audits and assessments of Vendor's systems and controls, with 30 days notice. Vendor shall provide access to relevant documentation, systems, and personnel. Third-party audit reports (SOC 2, ISO 27001) shall be provided within 30 days of request.`,
    medium: `The Company may request annual audit reports and certifications. Vendor shall cooperate with reasonable audit requests with 60 days notice.`,
    low: `The Vendor shall provide relevant compliance documentation upon reasonable request.`
  },
  termination: {
    high: `Upon termination, Vendor shall: (1) return or securely destroy all Company data within 30 days, (2) provide written certification of data destruction, (3) assist with transition to replacement vendor for up to 90 days, (4) maintain confidentiality obligations for 5 years post-termination.`,
    medium: `Upon termination, Vendor shall return or destroy Company data within 60 days and provide destruction certification. Transition assistance available for 30 days.`,
    low: `Upon termination, Vendor shall return or destroy Company data within 90 days upon request.`
  },
  liability: {
    high: `Vendor's liability for data breaches, security incidents, or privacy violations shall be unlimited. For other breaches, liability is capped at 24 months of fees paid. Vendor shall maintain cyber liability insurance of at least $5M.`,
    medium: `Vendor's liability is capped at 12 months of fees paid under this agreement. Vendor shall maintain appropriate insurance coverage.`,
    low: `Vendor's liability is capped at fees paid in the 6 months preceding any claim.`
  },
  businessContinuity: {
    high: `Vendor shall maintain a documented business continuity and disaster recovery plan, tested annually. RPO: 1 hour, RTO: 4 hours. Vendor shall notify Company of any incidents affecting service within 1 hour.`,
    medium: `Vendor shall maintain business continuity capabilities with RPO of 24 hours and RTO of 48 hours. Annual testing required.`,
    low: `Vendor shall maintain reasonable business continuity measures.`
  },
  subcontracting: {
    high: `Vendor shall not subcontract any services without prior written approval. All sub-processors must meet equivalent security and compliance standards and be disclosed to Company. Vendor remains fully liable for sub-processor actions.`,
    medium: `Vendor shall notify Company of any sub-processors and ensure they meet appropriate standards. Vendor remains responsible for sub-processor compliance.`,
    low: `Vendor may use sub-processors but remains responsible for their performance under this agreement.`
  }
};

// Generate clauses based on selections
function generateClauses(data) {
  const sensitivity = data.data_sensitivity || 'medium';
  const clauses = [];
  const regulations = data.regulatory_requirements ? data.regulatory_requirements.split(',').map(r => r.trim()) : [];

  // Always include security clause
  clauses.push({
    title: '1. Security Requirements',
    content: clauseTemplates.security[sensitivity]
  });

  // Data protection clause
  if (data.data_handled === 'yes' || regulations.includes('GDPR') || regulations.includes('POPIA')) {
    clauses.push({
      title: '2. Data Protection and Privacy',
      content: clauseTemplates.dataProtection[sensitivity]
    });
  }

  // SLA clause for critical services
  if (data.service_type === 'cloud' || data.service_type === 'saas' || data.integration_type === 'api') {
    clauses.push({
      title: '3. Service Level Agreement',
      content: clauseTemplates.sla[sensitivity]
    });
  }

  // Audit rights
  clauses.push({
    title: '4. Audit Rights',
    content: clauseTemplates.audit[sensitivity]
  });

  // Termination and exit
  clauses.push({
    title: '5. Termination and Data Return',
    content: clauseTemplates.termination[sensitivity]
  });

  // Liability
  clauses.push({
    title: '6. Liability and Insurance',
    content: clauseTemplates.liability[sensitivity]
  });

  // Business continuity
  if (data.service_type === 'cloud' || data.service_type === 'saas' || sensitivity === 'high') {
    clauses.push({
      title: '7. Business Continuity',
      content: clauseTemplates.businessContinuity[sensitivity]
    });
  }

  // Subcontracting
  if (data.data_handled === 'yes' || sensitivity === 'high') {
    clauses.push({
      title: '8. Subcontracting',
      content: clauseTemplates.subcontracting[sensitivity]
    });
  }

  // Regulatory specific clauses
  let clauseNum = clauses.length + 1;

  if (regulations.includes('ETA')) {
    clauses.push({
      title: `${clauseNum}. Namibia Electronic Transactions Act Compliance`,
      content: `Vendor shall comply with the Electronic Transactions Act of Namibia where applicable, ensuring that electronic communications, data messages, and electronic signatures meet the requirements of the Act. Vendor shall maintain appropriate records of electronic transactions and ensure the integrity and authenticity of electronic data.`
    });
    clauseNum++;
  }

  if (regulations.includes('FIA')) {
    clauses.push({
      title: `${clauseNum}. Anti-Money Laundering Compliance`,
      content: `Vendor shall comply with the Financial Intelligence Act (FIA) and Prevention of Organised Crime Act (POCA) of Namibia. Vendor shall implement appropriate customer due diligence measures, maintain transaction records, and report suspicious transactions to the Financial Intelligence Centre as required by law.`
    });
    clauseNum++;
  }

  if (regulations.includes('NAMFISA')) {
    clauses.push({
      title: `${clauseNum}. NAMFISA Regulatory Compliance`,
      content: `Where applicable, Vendor shall comply with the requirements of the Namibia Financial Institutions Supervisory Authority (NAMFISA) including but not limited to outsourcing guidelines, fit and proper requirements, and operational risk management standards for financial services providers.`
    });
    clauseNum++;
  }

  if (regulations.includes('BON')) {
    clauses.push({
      title: `${clauseNum}. Bank of Namibia Requirements`,
      content: `Vendor shall comply with all applicable Bank of Namibia (BoN) regulations, circulars, and guidelines including requirements for outsourcing by banking institutions, cybersecurity requirements, and technology risk management standards. Vendor shall support the Company's regulatory reporting obligations.`
    });
    clauseNum++;
  }

  if (regulations.includes('GDPR')) {
    clauses.push({
      title: `${clauseNum}. GDPR Compliance`,
      content: `Where Vendor processes personal data of EU residents, this agreement constitutes a Data Processing Agreement under Article 28 of the GDPR. Vendor acts as Data Processor. Standard Contractual Clauses (SCCs) shall apply to any transfers outside the EEA. Vendor shall maintain records of processing activities and assist with data subject requests within 72 hours.`
    });
    clauseNum++;
  }

  if (regulations.includes('POPIA')) {
    clauses.push({
      title: `${clauseNum}. POPIA Compliance`,
      content: `Where Vendor processes personal information of South African data subjects, Vendor shall comply with the Protection of Personal Information Act (POPIA). Vendor agrees to the operator obligations under Section 21 of POPIA, including processing only on documented instructions and implementing appropriate security safeguards.`
    });
    clauseNum++;
  }

  return clauses;
}

// Contract Clause Generator - standalone page
router.get('/', requireAuth, (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);
  const savedClauses = db.getContractClausesByUser.all(req.session.userId);

  res.render('contractclauses/index', {
    user: { name: req.session.userName },
    vendors,
    savedClauses
  });
});

// Generate clauses form
router.get('/generate', requireAuth, (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);

  res.render('contractclauses/generate', {
    user: { name: req.session.userName },
    vendors,
    generatedClauses: null,
    formData: null
  });
});

// Generate clauses - POST
router.post('/generate', requireAuth, (req, res) => {
  const vendors = db.getVendorsByUser.all(req.session.userId);

  const data = {
    service_type: req.body.service_type,
    data_handled: req.body.data_handled,
    data_sensitivity: req.body.data_sensitivity,
    integration_type: req.body.integration_type,
    regulatory_requirements: Array.isArray(req.body.regulatory_requirements)
      ? req.body.regulatory_requirements.join(', ')
      : req.body.regulatory_requirements,
    sla_requirements: req.body.sla_requirements
  };

  const generatedClauses = generateClauses(data);

  res.render('contractclauses/generate', {
    user: { name: req.session.userName },
    vendors,
    generatedClauses,
    formData: data
  });
});

// Save generated clauses
router.post('/save', requireAuth, (req, res) => {
  const data = {
    service_type: req.body.service_type,
    data_handled: req.body.data_handled,
    data_sensitivity: req.body.data_sensitivity,
    integration_type: req.body.integration_type,
    regulatory_requirements: req.body.regulatory_requirements,
    sla_requirements: req.body.sla_requirements,
    generated_clauses: req.body.generated_clauses,
    custom_clauses: req.body.custom_clauses
  };

  const vendorId = req.body.vendor_id || null;
  db.createContractClauses.run(vendorId, req.session.userId, data);

  try {
    db.logActivity.run(req.session.userId, vendorId, 'clauses_generated', 'Contract clauses generated');
  } catch (e) {}

  res.redirect('/contract-clauses');
});

module.exports = router;
