const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Policy templates
const policyTemplates = {
  purpose: {
    standard: `The purpose of this Third Party Risk Management (TPRM) Policy is to establish a framework for identifying, assessing, managing, and monitoring risks associated with third-party relationships. This policy ensures that all third-party engagements are conducted in a manner that protects the organization's assets, data, and reputation.`,
    financial: `The purpose of this Third Party Risk Management (TPRM) Policy is to establish a comprehensive framework for managing risks arising from third-party relationships, in accordance with regulatory requirements including prudential standards and financial services regulations. This policy ensures operational resilience, protects customer data, and maintains compliance with all applicable laws and regulations.`,
    healthcare: `The purpose of this Third Party Risk Management (TPRM) Policy is to establish controls for managing risks associated with business associates and third-party service providers who may access, process, or store protected health information (PHI). This policy ensures HIPAA compliance and protects patient privacy.`
  },
  scope: {
    standard: `This policy applies to all third-party relationships where external entities provide products or services to the organization, have access to organizational systems or data, or act on behalf of the organization. This includes but is not limited to:
- Software and technology vendors
- Cloud service providers
- Business process outsourcing providers
- Consultants and professional service providers
- Data processors
- Hardware and equipment suppliers`,
    comprehensive: `This policy applies to all departments, business units, subsidiaries, and affiliated entities of the organization. It covers the entire lifecycle of third-party relationships including:
- Vendor selection and due diligence
- Contract negotiation and execution
- Ongoing monitoring and performance management
- Incident management and response
- Contract termination and offboarding

All employees involved in selecting, managing, or overseeing third-party relationships must comply with this policy.`
  },
  riskAssessment: {
    tiered: `Third parties shall be classified into risk tiers based on the following factors:

**Critical (Tier 1):**
- Access to highly sensitive or regulated data
- Critical to business operations
- Significant financial exposure
- Direct customer interaction
Assessment: Comprehensive due diligence, annual reassessment, continuous monitoring

**High (Tier 2):**
- Access to confidential data
- Important to operations but alternatives exist
- Moderate financial exposure
Assessment: Detailed due diligence, annual reassessment

**Medium (Tier 3):**
- Limited data access
- Standard business services
- Lower financial exposure
Assessment: Standard due diligence, biennial reassessment

**Low (Tier 4):**
- No sensitive data access
- Non-critical services
- Minimal financial exposure
Assessment: Basic due diligence, periodic review`,
    simple: `All third parties must undergo a risk assessment prior to engagement. The assessment shall evaluate:
- Security posture and controls
- Financial stability
- Regulatory compliance
- Business continuity capabilities
- Reputation and track record

The level of due diligence shall be proportionate to the risk level of the engagement.`
  },
  dueDiligence: {
    comprehensive: `Prior to engaging any third party, the following due diligence activities must be completed:

**Financial Assessment:**
- Review of audited financial statements
- Credit checks and ratings
- Assessment of financial stability

**Security Assessment:**
- Security questionnaire completion
- Review of security certifications (SOC 2, ISO 27001)
- Penetration testing results (for high-risk vendors)
- Review of security policies and procedures

**Compliance Assessment:**
- Regulatory compliance verification
- Data protection compliance (GDPR, POPIA)
- Industry-specific compliance requirements

**Operational Assessment:**
- Business continuity and disaster recovery plans
- Insurance coverage verification
- Key personnel and governance structure
- Sub-contractor arrangements

**Legal Assessment:**
- Corporate documentation verification
- Litigation history review
- Sanctions and watchlist screening`,
    standard: `Prior to engaging third parties, appropriate due diligence must be conducted including:
- Verification of business credentials and reputation
- Assessment of security practices
- Review of relevant compliance certifications
- Evaluation of financial stability
- Reference checks where appropriate`
  },
  contractRequirements: {
    detailed: `All third-party contracts must include the following provisions:

**Security Requirements:**
- Compliance with organization's security policies
- Implementation of appropriate security controls
- Security incident notification requirements
- Right to audit and assess

**Data Protection:**
- Data processing agreement where personal data is involved
- Data classification and handling requirements
- Data retention and deletion obligations
- Sub-processor restrictions

**Service Levels:**
- Defined service level agreements (SLAs)
- Performance metrics and reporting
- Service credits for non-performance

**Business Continuity:**
- Business continuity and disaster recovery requirements
- Recovery time and point objectives
- Testing and certification requirements

**Termination:**
- Termination rights and notice periods
- Data return and destruction requirements
- Transition assistance obligations

**Compliance:**
- Regulatory compliance obligations
- Right to audit
- Reporting requirements`,
    standard: `Third-party contracts must include appropriate terms addressing security, confidentiality, data protection, service levels, and termination rights as determined by the risk assessment.`
  },
  monitoring: {
    continuous: `Ongoing monitoring of third parties shall include:

**Performance Monitoring:**
- Regular review of SLA performance
- Service delivery quality assessment
- Issue tracking and resolution

**Risk Monitoring:**
- Periodic risk reassessments based on tier
- Monitoring of security incidents
- Financial health monitoring
- News and media monitoring

**Compliance Monitoring:**
- Annual certification updates
- Audit report reviews
- Compliance attestations

**Relationship Management:**
- Regular governance meetings
- Escalation management
- Contract compliance reviews`,
    periodic: `Third parties shall be subject to periodic monitoring including performance reviews, compliance checks, and risk reassessments at frequencies determined by their risk tier.`
  },
  incidents: {
    detailed: `Third parties must notify the organization of any security incident or data breach that may affect organizational data or services within 24 hours of discovery. The notification must include:
- Nature and scope of the incident
- Data or systems affected
- Remediation actions taken or planned
- Root cause analysis (when available)

The organization shall maintain an incident response process for third-party incidents including escalation procedures, communication protocols, and remediation tracking.`,
    standard: `Third parties must promptly notify the organization of any security incidents or breaches. Incident response shall follow established organizational procedures.`
  },
  offboarding: {
    detailed: `Upon termination of a third-party relationship:

**Data Return/Destruction:**
- All organizational data must be returned or securely destroyed
- Written certification of data destruction required
- Verification of data deletion from all systems

**Access Revocation:**
- Immediate revocation of all system access
- Return of access credentials and tokens
- Deactivation of accounts and certificates

**Knowledge Transfer:**
- Documentation transfer
- Transition support as required
- Handover to replacement vendor if applicable

**Compliance:**
- Final compliance attestations
- Outstanding issue resolution
- Contract close-out procedures`,
    standard: `Upon termination, third parties must return or destroy all organizational data and certify completion. All access rights shall be revoked promptly.`
  },
  roles: {
    detailed: `**TPRM Team:**
- Maintain TPRM program and policy
- Conduct risk assessments
- Coordinate due diligence activities
- Monitor third-party performance and risks

**Business Owners:**
- Identify need for third-party services
- Participate in vendor selection
- Manage day-to-day vendor relationships
- Report issues and concerns

**Procurement:**
- Manage procurement process
- Negotiate contracts
- Maintain vendor records

**Information Security:**
- Conduct security assessments
- Review security documentation
- Monitor security incidents

**Legal:**
- Review and negotiate contracts
- Ensure regulatory compliance
- Manage legal disputes

**Executive Management:**
- Approve high-risk engagements
- Provide policy oversight
- Allocate resources`,
    standard: `Roles and responsibilities for TPRM activities are defined across business owners, TPRM team, procurement, information security, and legal functions.`
  }
};

// Generate policy based on selections
function generatePolicy(config) {
  const policy = {
    title: `${config.organization_name || 'Organization'} Third Party Risk Management Policy`,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    sections: []
  };

  // Purpose
  policy.sections.push({
    title: '1. Purpose',
    content: policyTemplates.purpose[config.industry] || policyTemplates.purpose.standard
  });

  // Scope
  policy.sections.push({
    title: '2. Scope',
    content: config.scope_detail === 'comprehensive' ? policyTemplates.scope.comprehensive : policyTemplates.scope.standard
  });

  // Risk Assessment
  policy.sections.push({
    title: '3. Risk Assessment and Classification',
    content: config.risk_approach === 'tiered' ? policyTemplates.riskAssessment.tiered : policyTemplates.riskAssessment.simple
  });

  // Due Diligence
  policy.sections.push({
    title: '4. Due Diligence Requirements',
    content: config.due_diligence_level === 'comprehensive' ? policyTemplates.dueDiligence.comprehensive : policyTemplates.dueDiligence.standard
  });

  // Contract Requirements
  policy.sections.push({
    title: '5. Contract Requirements',
    content: config.contract_detail === 'detailed' ? policyTemplates.contractRequirements.detailed : policyTemplates.contractRequirements.standard
  });

  // Ongoing Monitoring
  policy.sections.push({
    title: '6. Ongoing Monitoring',
    content: config.monitoring_approach === 'continuous' ? policyTemplates.monitoring.continuous : policyTemplates.monitoring.periodic
  });

  // Incident Management
  policy.sections.push({
    title: '7. Incident Management',
    content: config.incident_detail === 'detailed' ? policyTemplates.incidents.detailed : policyTemplates.incidents.standard
  });

  // Offboarding
  policy.sections.push({
    title: '8. Offboarding and Termination',
    content: config.offboarding_detail === 'detailed' ? policyTemplates.offboarding.detailed : policyTemplates.offboarding.standard
  });

  // Roles and Responsibilities
  policy.sections.push({
    title: '9. Roles and Responsibilities',
    content: config.roles_detail === 'detailed' ? policyTemplates.roles.detailed : policyTemplates.roles.standard
  });

  // Regulatory Requirements
  if (config.regulations && config.regulations.length > 0) {
    let regContent = 'This policy ensures compliance with the following regulatory requirements:\n\n';

    if (config.regulations.includes('ETA')) {
      regContent += '**Electronic Transactions Act (Namibia):**\nThird parties involved in electronic transactions must comply with the Electronic Transactions Act requirements for data messages, electronic signatures, and record retention. Vendors must ensure the integrity and authenticity of electronic communications.\n\n';
    }
    if (config.regulations.includes('FIA')) {
      regContent += '**Financial Intelligence Act / Anti-Money Laundering:**\nThird parties must comply with the Financial Intelligence Act (FIA) and Prevention of Organised Crime Act (POCA). This includes customer due diligence requirements, transaction monitoring, record keeping, and suspicious transaction reporting to the Financial Intelligence Centre.\n\n';
    }
    if (config.regulations.includes('NAMFISA')) {
      regContent += '**NAMFISA Requirements:**\nThird parties providing services to financial institutions regulated by NAMFISA must comply with applicable outsourcing guidelines, fit and proper requirements, and operational risk management standards as issued by the Namibia Financial Institutions Supervisory Authority.\n\n';
    }
    if (config.regulations.includes('BON')) {
      regContent += '**Bank of Namibia Requirements:**\nThird parties providing services to banking institutions must comply with Bank of Namibia regulations, circulars, and guidelines including outsourcing requirements, cybersecurity standards, and technology risk management frameworks.\n\n';
    }
    if (config.regulations.includes('GDPR')) {
      regContent += '**General Data Protection Regulation (GDPR):**\nWhere third parties process personal data of EU residents, they must comply with GDPR requirements including Article 28 (processor obligations), appropriate technical and organizational measures, and data transfer requirements.\n\n';
    }
    if (config.regulations.includes('POPIA')) {
      regContent += '**Protection of Personal Information Act (POPIA):**\nWhere third parties process personal information of South African data subjects, they must comply with POPIA requirements including Section 21 operator obligations, appropriate security safeguards, and processing only on documented instructions.\n\n';
    }
    if (config.regulations.includes('PCI-DSS')) {
      regContent += '**Payment Card Industry Data Security Standard (PCI-DSS):**\nThird parties handling payment card data must maintain PCI-DSS compliance and provide annual attestation of compliance.\n\n';
    }

    policy.sections.push({
      title: '10. Regulatory Compliance',
      content: regContent
    });
  }

  // Policy Governance
  policy.sections.push({
    title: config.regulations ? '11. Policy Governance' : '10. Policy Governance',
    content: `**Policy Owner:** ${config.policy_owner || 'Chief Risk Officer'}

**Review Frequency:** This policy shall be reviewed ${config.review_frequency || 'annually'} or when significant changes occur.

**Exceptions:** Any exceptions to this policy must be documented, approved by the policy owner, and reviewed periodically.

**Non-Compliance:** Violations of this policy may result in disciplinary action and must be reported to the policy owner.`
  });

  return policy;
}

// Policy generator page
router.get('/', requireAuth, (req, res) => {
  res.render('policy/index', {
    user: { name: req.session.userName },
    generatedPolicy: null,
    formData: null
  });
});

// Generate policy - POST
router.post('/generate', requireAuth, (req, res) => {
  const config = {
    organization_name: req.body.organization_name,
    industry: req.body.industry,
    scope_detail: req.body.scope_detail,
    risk_approach: req.body.risk_approach,
    due_diligence_level: req.body.due_diligence_level,
    contract_detail: req.body.contract_detail,
    monitoring_approach: req.body.monitoring_approach,
    incident_detail: req.body.incident_detail,
    offboarding_detail: req.body.offboarding_detail,
    roles_detail: req.body.roles_detail,
    regulations: Array.isArray(req.body.regulations) ? req.body.regulations : (req.body.regulations ? [req.body.regulations] : []),
    policy_owner: req.body.policy_owner,
    review_frequency: req.body.review_frequency
  };

  const generatedPolicy = generatePolicy(config);

  res.render('policy/index', {
    user: { name: req.session.userName },
    generatedPolicy,
    formData: config
  });
});

module.exports = router;
