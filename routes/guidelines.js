const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Step-by-step guidelines for different procurement types
const guidelines = {
  new_software: {
    title: 'Purchasing New Software / SaaS',
    description: 'Follow these steps when procuring new software or cloud-based services',
    steps: [
      {
        step: 1,
        title: 'Business Justification',
        description: 'Document the business need and obtain budget approval',
        tasks: [
          'Identify the business problem the software will solve',
          'Document expected benefits and ROI',
          'Get preliminary budget approval from your manager',
          'Check if similar solutions already exist in-house'
        ],
        responsible: 'Requesting Department',
        documents: ['Business Case Template', 'Budget Request Form']
      },
      {
        step: 2,
        title: 'Vendor Identification',
        description: 'Research and shortlist potential vendors',
        tasks: [
          'Research available solutions in the market',
          'Create a shortlist of 2-3 potential vendors',
          'Request demos or trials where possible',
          'Compare features, pricing, and reviews'
        ],
        responsible: 'Requesting Department + Procurement',
        documents: ['Vendor Comparison Matrix']
      },
      {
        step: 3,
        title: 'Initial Risk Assessment',
        description: 'Complete initial TPRM screening',
        tasks: [
          'Submit vendor details to TPRM team',
          'Complete the Vendor Onboarding Form in TPRM Tool',
          'Identify data types that will be processed',
          'Determine integration requirements'
        ],
        responsible: 'Requesting Department + TPRM Team',
        documents: ['Vendor Onboarding Form', 'Data Classification Guide']
      },
      {
        step: 4,
        title: 'Security Assessment',
        description: 'Evaluate vendor security posture',
        tasks: [
          'Send Security Questionnaire to vendor',
          'Request SOC 2 report or equivalent certifications',
          'Review vendor security documentation',
          'Assess data protection measures'
        ],
        responsible: 'Information Security + TPRM Team',
        documents: ['Security Questionnaire', 'SOC 2 Review Checklist']
      },
      {
        step: 5,
        title: 'Legal & Compliance Review',
        description: 'Ensure contractual and regulatory compliance',
        tasks: [
          'Review vendor contract terms',
          'Ensure required security clauses are included',
          'Verify regulatory compliance (GDPR, POPIA, etc.)',
          'Negotiate DPA if personal data involved'
        ],
        responsible: 'Legal + Compliance',
        documents: ['Contract Review Checklist', 'DPA Template', 'Required Contract Clauses']
      },
      {
        step: 6,
        title: 'Final Approval',
        description: 'Obtain sign-off from relevant stakeholders',
        tasks: [
          'Compile all assessment results',
          'Present findings to approval committee',
          'Document risk acceptance if applicable',
          'Obtain final sign-off'
        ],
        responsible: 'TPRM Team + Management',
        documents: ['Vendor Approval Form', 'Risk Acceptance Form']
      },
      {
        step: 7,
        title: 'Contract Execution & Onboarding',
        description: 'Finalize contract and begin implementation',
        tasks: [
          'Execute contract with agreed terms',
          'Set up vendor in procurement systems',
          'Plan implementation/integration',
          'Schedule regular review meetings'
        ],
        responsible: 'Procurement + IT + Requesting Department',
        documents: ['Signed Contract', 'Implementation Plan']
      }
    ]
  },
  software_extension: {
    title: 'Extending Existing Software Contract',
    description: 'Follow these steps when renewing or extending an existing vendor contract',
    steps: [
      {
        step: 1,
        title: 'Contract Review',
        description: 'Review current contract terms and performance',
        tasks: [
          'Review current contract expiry date',
          'Assess vendor performance during contract period',
          'Document any issues or incidents',
          'Review pricing and terms for renewal'
        ],
        responsible: 'Requesting Department + Procurement',
        documents: ['Current Contract', 'Performance Review']
      },
      {
        step: 2,
        title: 'Re-Assessment Check',
        description: 'Determine if full re-assessment is required',
        tasks: [
          'Check when last security assessment was done',
          'Review any security incidents since last assessment',
          'Assess if scope of services has changed',
          'Determine if data access has changed'
        ],
        responsible: 'TPRM Team',
        documents: ['Previous Assessment', 'Incident Log']
      },
      {
        step: 3,
        title: 'Updated Security Review',
        description: 'Conduct updated security assessment if required',
        tasks: [
          'Request updated certifications (SOC 2, ISO 27001)',
          'Review any changes to vendor security posture',
          'Assess new features or integrations',
          'Update risk rating if necessary'
        ],
        responsible: 'Information Security + TPRM Team',
        documents: ['Updated Security Questionnaire', 'Certification Updates']
      },
      {
        step: 4,
        title: 'Contract Negotiation',
        description: 'Negotiate renewal terms',
        tasks: [
          'Review and update contract clauses',
          'Negotiate pricing for renewal period',
          'Update SLAs if required',
          'Include any new compliance requirements'
        ],
        responsible: 'Procurement + Legal',
        documents: ['Updated Contract', 'SLA Document']
      },
      {
        step: 5,
        title: 'Approval & Renewal',
        description: 'Obtain approval and execute renewal',
        tasks: [
          'Present renewal recommendation',
          'Obtain budget approval',
          'Execute contract renewal',
          'Update vendor records in TPRM system'
        ],
        responsible: 'Management + Procurement',
        documents: ['Renewal Approval Form', 'Signed Amendment']
      }
    ]
  },
  new_hardware: {
    title: 'Purchasing New Hardware / Equipment',
    description: 'Follow these steps when procuring hardware or physical equipment',
    steps: [
      {
        step: 1,
        title: 'Requirements Definition',
        description: 'Define hardware requirements and specifications',
        tasks: [
          'Document technical requirements',
          'Specify quantity and specifications',
          'Identify installation requirements',
          'Get IT approval for hardware standards'
        ],
        responsible: 'Requesting Department + IT',
        documents: ['Hardware Requirements Spec', 'IT Standards Checklist']
      },
      {
        step: 2,
        title: 'Vendor Selection',
        description: 'Identify and evaluate hardware vendors',
        tasks: [
          'Research approved hardware vendors',
          'Obtain quotes from multiple vendors',
          'Compare pricing, warranty, and support',
          'Check vendor reputation and reliability'
        ],
        responsible: 'Procurement + IT',
        documents: ['Vendor Quotes', 'Comparison Matrix']
      },
      {
        step: 3,
        title: 'Security Assessment',
        description: 'Assess security implications of hardware',
        tasks: [
          'Determine if hardware connects to network',
          'Assess firmware/software security',
          'Review vendor security practices',
          'Check for supply chain security'
        ],
        responsible: 'IT Security + TPRM Team',
        documents: ['Hardware Security Checklist']
      },
      {
        step: 4,
        title: 'Procurement Approval',
        description: 'Obtain necessary approvals',
        tasks: [
          'Submit purchase requisition',
          'Obtain budget approval',
          'Get IT sign-off',
          'Complete vendor onboarding if new vendor'
        ],
        responsible: 'Requesting Department + Finance',
        documents: ['Purchase Requisition', 'Budget Approval']
      },
      {
        step: 5,
        title: 'Order & Delivery',
        description: 'Place order and manage delivery',
        tasks: [
          'Issue purchase order',
          'Track delivery',
          'Inspect hardware on receipt',
          'Complete goods received process'
        ],
        responsible: 'Procurement',
        documents: ['Purchase Order', 'Delivery Note', 'GRN']
      }
    ]
  },
  bpo: {
    title: 'Business Process Outsourcing (BPO)',
    description: 'Follow these steps when outsourcing business processes to third parties',
    steps: [
      {
        step: 1,
        title: 'Scope Definition',
        description: 'Define the scope of outsourcing',
        tasks: [
          'Document processes to be outsourced',
          'Define service requirements and SLAs',
          'Identify data and systems involved',
          'Assess business criticality'
        ],
        responsible: 'Business Unit + Operations',
        documents: ['Scope of Work', 'Process Documentation']
      },
      {
        step: 2,
        title: 'Risk Assessment',
        description: 'Comprehensive risk assessment for BPO',
        tasks: [
          'Complete detailed TPRM assessment',
          'Assess operational risks',
          'Evaluate data protection requirements',
          'Consider geographic/jurisdiction risks'
        ],
        responsible: 'TPRM Team + Risk Management',
        documents: ['BPO Risk Assessment', 'DPIA if required']
      },
      {
        step: 3,
        title: 'Vendor Selection',
        description: 'Formal vendor selection process',
        tasks: [
          'Issue RFP to potential vendors',
          'Evaluate vendor capabilities',
          'Conduct site visits if required',
          'Check references and track record'
        ],
        responsible: 'Procurement + Business Unit',
        documents: ['RFP Document', 'Vendor Evaluation Matrix']
      },
      {
        step: 4,
        title: 'Due Diligence',
        description: 'Comprehensive vendor due diligence',
        tasks: [
          'Financial stability assessment',
          'Security and compliance audit',
          'Review business continuity plans',
          'Assess sub-contractor usage'
        ],
        responsible: 'TPRM Team + Finance + Legal',
        documents: ['Due Diligence Report', 'Financial Assessment']
      },
      {
        step: 5,
        title: 'Contract Negotiation',
        description: 'Negotiate comprehensive BPO contract',
        tasks: [
          'Define detailed SLAs and KPIs',
          'Include security and compliance clauses',
          'Negotiate liability and indemnity terms',
          'Define exit and transition clauses'
        ],
        responsible: 'Legal + Procurement + Business Unit',
        documents: ['Master Services Agreement', 'SLA Schedule', 'Security Schedule']
      },
      {
        step: 6,
        title: 'Governance Setup',
        description: 'Establish ongoing governance framework',
        tasks: [
          'Define governance structure',
          'Set up regular review meetings',
          'Establish escalation procedures',
          'Plan for audits and assessments'
        ],
        responsible: 'Business Unit + TPRM Team',
        documents: ['Governance Framework', 'Meeting Schedule']
      },
      {
        step: 7,
        title: 'Transition & Go-Live',
        description: 'Manage transition to outsourced service',
        tasks: [
          'Execute transition plan',
          'Transfer knowledge and documentation',
          'Conduct parallel running if required',
          'Go-live and stabilization'
        ],
        responsible: 'Project Team + Vendor',
        documents: ['Transition Plan', 'Go-Live Checklist']
      }
    ]
  },
  consulting: {
    title: 'Engaging Consultants / Professional Services',
    description: 'Follow these steps when engaging consultants or professional service providers',
    steps: [
      {
        step: 1,
        title: 'Define Engagement',
        description: 'Define the consulting engagement scope',
        tasks: [
          'Document objectives and deliverables',
          'Define timeline and milestones',
          'Identify required expertise',
          'Set budget parameters'
        ],
        responsible: 'Requesting Department',
        documents: ['Statement of Work Draft', 'Budget Request']
      },
      {
        step: 2,
        title: 'Vendor Identification',
        description: 'Identify suitable consultants',
        tasks: [
          'Check preferred vendor list',
          'Request proposals from consultants',
          'Review credentials and experience',
          'Check references'
        ],
        responsible: 'Requesting Department + Procurement',
        documents: ['RFP/RFQ', 'Consultant Proposals']
      },
      {
        step: 3,
        title: 'Risk & Access Assessment',
        description: 'Assess risks and access requirements',
        tasks: [
          'Determine data access required',
          'Assess system access needs',
          'Review confidentiality requirements',
          'Complete TPRM screening'
        ],
        responsible: 'TPRM Team + IT Security',
        documents: ['Access Request Form', 'NDA']
      },
      {
        step: 4,
        title: 'Contract & Approval',
        description: 'Finalize contract and obtain approval',
        tasks: [
          'Negotiate contract terms',
          'Include IP and confidentiality clauses',
          'Obtain necessary approvals',
          'Execute contract'
        ],
        responsible: 'Legal + Procurement + Management',
        documents: ['Consulting Agreement', 'NDA', 'IP Assignment']
      },
      {
        step: 5,
        title: 'Onboarding & Access',
        description: 'Onboard consultant and provision access',
        tasks: [
          'Complete security briefing',
          'Provision required access',
          'Set up project governance',
          'Kick-off engagement'
        ],
        responsible: 'IT + Requesting Department',
        documents: ['Access Provisioning', 'Project Plan']
      }
    ]
  },
  data_processor: {
    title: 'Engaging a Data Processor',
    description: 'Follow these steps when engaging a vendor who will process personal data',
    steps: [
      {
        step: 1,
        title: 'Data Mapping',
        description: 'Map the personal data to be processed',
        tasks: [
          'Identify categories of personal data',
          'Document data subjects affected',
          'Determine processing purposes',
          'Identify data flows and transfers'
        ],
        responsible: 'Data Protection + Business Unit',
        documents: ['Data Mapping Template', 'ROPA Update']
      },
      {
        step: 2,
        title: 'DPIA Assessment',
        description: 'Conduct Data Protection Impact Assessment if required',
        tasks: [
          'Determine if DPIA is required',
          'Assess privacy risks',
          'Identify mitigating controls',
          'Document DPIA findings'
        ],
        responsible: 'Data Protection Officer',
        documents: ['DPIA Template', 'Risk Assessment']
      },
      {
        step: 3,
        title: 'Vendor Assessment',
        description: 'Assess vendor data protection capabilities',
        tasks: [
          'Review vendor privacy policies',
          'Assess technical security measures',
          'Verify compliance certifications',
          'Review sub-processor arrangements'
        ],
        responsible: 'TPRM Team + Data Protection',
        documents: ['Data Protection Assessment', 'Security Review']
      },
      {
        step: 4,
        title: 'DPA Negotiation',
        description: 'Negotiate Data Processing Agreement',
        tasks: [
          'Draft or review DPA',
          'Ensure Article 28 compliance (GDPR)',
          'Include required POPIA provisions',
          'Define data retention and deletion'
        ],
        responsible: 'Legal + Data Protection',
        documents: ['Data Processing Agreement', 'SCCs if required']
      },
      {
        step: 5,
        title: 'Implementation',
        description: 'Implement data processing arrangement',
        tasks: [
          'Execute DPA',
          'Implement technical controls',
          'Set up monitoring and auditing',
          'Update privacy notices if required'
        ],
        responsible: 'IT + Data Protection + Business Unit',
        documents: ['Signed DPA', 'Technical Implementation Plan']
      }
    ]
  }
};

// Guidelines home page
router.get('/', requireAuth, (req, res) => {
  res.render('guidelines/index', {
    user: { name: req.session.userName }
  });
});

// Get specific guideline
router.get('/:type', requireAuth, (req, res) => {
  const type = req.params.type;
  const guideline = guidelines[type];

  if (!guideline) {
    return res.redirect('/guidelines');
  }

  res.render('guidelines/view', {
    user: { name: req.session.userName },
    guideline,
    type
  });
});

module.exports = router;
