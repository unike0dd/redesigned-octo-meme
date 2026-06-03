(function () {
  // Translation database
  const translations = {
    en: {
      // Common
      home: "Home",
      about: "About",
      careers: "Careers",
      contact: "Contact",
      learning: "Learning",
      services: "Services",

      // Header/Nav
      brand: "Gabriel Services",
      tagline: "Outsource, Delivered",

      // Browser page titles
      homePageTitle: "Gabriel Services | Outsource, Delivered",
      aboutPageTitle: "About Gabriel Services",
      careersPageTitle: "Careers | Gabriel Services",
      servicesPageTitle: "Gabriel Services | Service Overview",
      logisticsServicePageTitle: "Logistics Operations | Gabriel Services",
      adminServicePageTitle: "Administrative Back Office | Gabriel Services",
      customerServicePageTitle:
        "Customer Relations | Gabriel Services",
      itServicePageTitle: "IT Support | Gabriel Services",

      // Footer sections
      company: "Company",
      servicePagesLabel: "Service Pages",
      supportLearning: "Support & Learning",
      legal: "Legal",

      // Legal links
      termsConditions: "Terms & Conditions",
      cookiesConsent: "Cookies Consent",
      privacyGdpr: "Privacy & GDPR",

      // Services
      logisticsOps: "Logistics Operations",
      adminBackOffice: "Administrative Back Office",
      customerRelations: "Customer Relations",
      itSupport: "IT Support",

      // 2026 operational content refresh
      aboutApproachCardText: "We help businesses improve productivity, strengthen service consistency, protect customer trust, and keep day-to-day work moving with clearer ownership and better follow-through.",
      aboutApproachCardTitle: "We organize the work that keeps the business moving.",
      aboutApproachEyebrow: "Our Approach",
      aboutApproachHeadline: "Built on consistency, clarity, and practical execution.",
      aboutApproachLead: "Our approach is built on consistency, transparent communication, practical execution, and cost-conscious support delivery.",
      aboutExploreApproach: "Explore our approach",
      aboutFocus1Eyebrow: "Daily execution",
      aboutFocus1Item1: "Daily operational execution",
      aboutFocus1Item2: "Task follow-through",
      aboutFocus1Item3: "Workflow coordination",
      aboutFocus1Item4: "Reporting and status updates",
      aboutFocus1Text: "We help keep tasks, follow-ups, tickets, documents, schedules, and operational details moving with structure and consistency.",
      aboutFocus1Title: "Dependable execution without operational noise.",
      aboutFocus2Eyebrow: "Customer trust",
      aboutFocus2Item1: "Customer communication",
      aboutFocus2Item2: "Ticket follow-up",
      aboutFocus2Item3: "Resolution tracking",
      aboutFocus2Item4: "Case closure",
      aboutFocus2Text: "We support communication, follow-up, resolution tracking, CSAT continuity, and concern routing so customer trust is protected.",
      aboutFocus2Title: "Customer issues should not disappear into gaps.",
      aboutFocus3Eyebrow: "Operational structure",
      aboutFocus3Item1: "Workflow tracking",
      aboutFocus3Item2: "Documentation control",
      aboutFocus3Item3: "Scheduling coordination",
      aboutFocus3Item4: "Process alignment",
      aboutFocus3Text: "We help organize daily workflows, communication, documentation, scheduling, vendor coordination, and internal support activity.",
      aboutFocus3Title: "Fragmented operations need structure.",
      aboutFocus4Eyebrow: "Growth focus",
      aboutFocus4Item1: "Leadership support",
      aboutFocus4Item2: "Improved productivity",
      aboutFocus4Item3: "Reduced friction",
      aboutFocus4Item4: "Growth-focused support",
      aboutFocus4Text: "By handling operational details, we help leadership and teams recover time, reduce friction, and stay focused on growth.",
      aboutFocus4Title: "Your team should spend less time putting out fires.",
      aboutFocusHeadline: "Choose the operational priority.",
      aboutFocusIntro: "Select a focus area to show how Gabriel Services supports execution, communication, consistency, and growth.",
      aboutFocusOptions: "About page focus options",
      aboutFocusTab1: "Daily Execution",
      aboutFocusTab2: "Customer Trust",
      aboutFocusTab3: "Operational Structure",
      aboutFocusTab4: "Growth Focus",
      aboutHandle1Text: "Dispatch coordination, tracking continuity, follow-up, and operational visibility.",
      aboutHandle1Title: "Logistics Operations Support",
      aboutHandle2Text: "Scheduling, documentation, reporting, workflow tracking, and daily administrative support.",
      aboutHandle2Title: "Administrative Back-Office Execution",
      aboutHandle3Text: "Customer communication, ticket follow-up, CSAT support, billing clarification, and resolution tracking.",
      aboutHandle3Title: "Customer Relations and Communication Support",
      aboutHandle4Text: "Service continuity, status updates, escalation visibility, case notes, and customer issue closure.",
      aboutHandle4Title: "Customer Operations Follow-up",
      aboutHandle5Text: "Help desk intake, troubleshooting, access support, incident investigation, and resolution ownership.",
      aboutHandle5Title: "IT Support — Level I and Level II",
      aboutHandle6Text: "Operational follow-through, reporting, coordination, and task visibility across daily business activity.",
      aboutHandle6Title: "Workflow Coordination and Daily Execution",
      aboutHandleHeadline: "Cross-functional support for daily operations.",
      aboutHeroEyebrow: "About Gabriel Services",
      aboutHeroLead1: "Gabriel Services is an operational support partner focused on helping modern businesses stay organized, responsive, and consistent in their daily execution.",
      aboutHeroLead2: "We provide cross-functional support across logistics operations, administrative back office, customer relations, customer operations, and IT support.",
      aboutHeroTitle: "Operational support for modern businesses.",
      aboutIssue1Tag: "Trust",
      aboutIssue1Text: "Customer trust weakens when concerns, tasks, tickets, or opportunities are not handled consistently.",
      aboutIssue1Title: "Missed Follow-ups",
      aboutIssue2Tag: "Clarity",
      aboutIssue2Text: "Resolution slows down when messages, updates, ownership, and next steps are not clearly managed.",
      aboutIssue2Title: "Unclear Communication",
      aboutIssue3Tag: "Structure",
      aboutIssue3Text: "Operational friction increases when tasks, documents, scheduling, reporting, and handoffs are fragmented.",
      aboutIssue3Title: "Disorganized Workflows",
      aboutIssue4Tag: "Execution",
      aboutIssue4Text: "Growth is affected when small operational details are missed, delayed, or left without accountable follow-through.",
      aboutIssue4Title: "Overlooked Details",
      aboutMetaDescription: "Gabriel Services is an operational support partner helping modern businesses stay organized, responsive, and consistent through logistics operations, administrative back office, customer relations, customer operations, and IT support.",
      aboutOperatingSnapshot: "Operating philosophy snapshot",
      aboutPhilosophyHeadline: "We do not overcomplicate operations. We organize them.",
      aboutPhilosophyTitle: "Operating Philosophy",
      aboutProof1: "Daily Execution",
      aboutProof2: "Operational Consistency",
      aboutProof3: "Transparent Communication",
      aboutProof4: "Cost-Conscious Support",
      aboutProofLabel: "Operational support highlights",
      aboutResultHeadline: "You get more done with less friction.",
      aboutResultLead1: "More clarity. More structure. More follow-through. More operational consistency. More time to focus on growth instead of putting out fires.",
      aboutResultLead2: "Gabriel Services helps modern businesses operate with better rhythm, stronger organization, and dependable daily execution.",
      aboutRoleText: "We step into the operational details that slow teams down, create confusion, or leave opportunities unresolved — then we bring structure, follow-through, and dependable execution.",
      aboutStatusExecution: "Execution",
      aboutStatusFollowup: "Follow-up",
      aboutStatusPractical: "Practical",
      aboutStatusReliable: "Reliable",
      aboutStatusStructure: "Structure",
      aboutStatusSupport: "Support",
      aboutStepInEyebrow: "Where We Step In",
      aboutStepInHeadline: "No opportunity should slip through the cracks.",
      aboutStepInText: "We help make sure every task, follow-up, customer concern, document, schedule, ticket, and operational detail is handled with structure so your business can stay focused, responsive, and running smoothly.",
      aboutUnresolvedEyebrow: "When Opportunities Are Left Unresolved",
      aboutUnresolvedHeadline: "Small issues can quietly become bigger business problems.",
      aboutUnresolvedText: "Missed follow-ups, unclear communication, disorganized workflows, overlooked details, and inconsistent execution can eventually affect growth, service quality, customer trust, and business stability.",
      aboutValue1Text: "We organize work, reduce operational friction, and help your team focus on higher-value priorities.",
      aboutValue1Title: "Improve Productivity",
      aboutValue2Text: "We support stronger follow-through, clearer ownership, and more dependable daily execution.",
      aboutValue2Title: "Increase Consistency",
      aboutValue3Text: "We help prevent missed communication, delayed follow-up, and unresolved customer concerns.",
      aboutValue3Title: "Protect Customer Trust",
      aboutValue4Text: "We keep updates, handoffs, notes, and task visibility cleaner across the operation.",
      aboutValue4Title: "Strengthen Communication Flow",
      aboutValue5Text: "We bring structure to scattered tasks, documents, tickets, schedules, and internal follow-ups.",
      aboutValue5Title: "Organize Fragmented Workflows",
      aboutValue6Text: "We focus on practical, efficient service delivery that supports daily business needs without unnecessary complexity.",
      aboutValue6Title: "Deliver Cost-Conscious Support",
      aboutValueEyebrow: "How We Create Value",
      aboutValueHeadline: "More structure. Less friction.",
      aboutValueIntro: "We act as a reliable operational partner — plugging into your team and handling execution so you do not have to carry every operational detail alone.",
      adminCoverage1: "Executive administrative support",
      adminCoverage10: "Day-to-day back-office execution",
      adminCoverage2: "Calendar and scheduling coordination",
      adminCoverage3: "Email and communication management",
      adminCoverage4: "Document organization and preparation",
      adminCoverage5: "Vendor coordination",
      adminCoverage6: "Internal operational support",
      adminCoverage7: "Travel planning and coordination",
      adminCoverage8: "Reporting and status updates",
      adminCoverage9: "Administrative workflow tracking",
      adminCoverageTitle: "Administrative Back Office Support",
      adminMetaDescription: "Administrative back-office support for workflow coordination, documentation, scheduling, reporting, vendor communication, travel planning, and day-to-day execution.",
      adminOutcome: "A cleaner operational rhythm with stronger organization, better follow-through, clearer documentation, and dependable administrative support for leadership and daily business needs.",
      adminServiceEyebrow: "Administrative Back Office",
      adminServiceLead1: "We handle the operational details that keep leadership focused and daily business activity moving with structure, accuracy, and consistency.",
      adminServiceLead2: "Our administrative back-office support covers workflow coordination, documentation, scheduling, reporting, vendor communication, travel planning, and day-to-day execution for growing teams.",
      adminServiceTitle: "Administrative Back Office",
      coverageTitle: "Coverage",
      customerCoverage1: "Customer communication management",
      customerCoverage10: "Case notes and resolution closure",
      customerCoverage2: "Ticket follow-up and resolution tracking",
      customerCoverage3: "First-contact resolution support",
      customerCoverage4: "Customer satisfaction follow-ups — CSAT support",
      customerCoverage5: "Billing clarification support",
      customerCoverage6: "Upsell opportunity support",
      customerCoverage7: "Service recovery and concern routing",
      customerCoverage8: "Customer status updates",
      customerCoverage9: "Escalation visibility and follow-through",
      customerCoverageTitle: "Customer Relations Support",
      customerMetaDescription: "Customer relations support for communication, ticket follow-up, resolution tracking, billing clarification, customer satisfaction follow-ups, upsell support, and first-contact resolution.",
      customerOutcome: "A stronger customer support rhythm with clearer communication, faster follow-up, better resolution visibility, and a more consistent customer experience.",
      customerServiceEyebrow: "Customer Relations",
      customerServiceLead1: "We manage customer communication, service consistency, ticket follow-up, resolution tracking, billing clarification, customer satisfaction follow-ups, upsell support, and first-contact resolution.",
      customerServiceLead2: "We help businesses maintain customer satisfaction, protect service trust, and keep every customer issue moving through a clear resolution flow.",
      dynamicFocusTitle: "Dynamic Focus",
      exploreServices: "Explore services",
      getCustomOptimizationPlan: "Get a Custom Optimization Plan",
      homeAdminLane: "Records, scheduling, and process upkeep.",
      homeCustomerLane: "Communication, follow-up, and service rhythm.",
      homeItLane: "Ticket triage and day-to-day request handling.",
      homeLogisticsLane: "Dispatch and tracking continuity.",
      homeMetaDescription: "Gabriel Services delivers reliable day-to-day execution and operational support across logistics, customer relations, administrative back office, and IT support.",
      itCoverageHeadline: "Level I and Level II support lanes.",
      itLevel1Item1: "Help desk intake and ticket creation",
      itLevel1Item2: "Basic troubleshooting",
      itLevel1Item3: "End-user support",
      itLevel1Item4: "Account access assistance",
      itLevel1Item5: "Escalation coordination",
      itLevel1Title: "Level I Support",
      itLevel2Item1: "Advanced troubleshooting",
      itLevel2Item2: "Incident investigation",
      itLevel2Item3: "System support",
      itLevel2Item4: "Workflow support",
      itLevel2Item5: "Root-cause analysis",
      itLevel2Item6: "Resolution ownership after escalation",
      itLevel2Title: "Level II Support",
      itMetaDescription: "Structured IT Support for Level I and Level II coverage, help desk intake, ticket creation, troubleshooting, account access assistance, incident investigation, system support, workflow support, root-cause analysis, and escalation resolution ownership.",
      itOutcome: "More structured technical support, clearer ticket visibility, and dependable follow-through for day-to-day IT requests.",
      itServiceEyebrow: "IT Support",
      itSnapshotHeadline: "Structured coverage for everyday technical needs.",
      itSupportServiceIntroNew: "We provide structured technical support coverage.",
      itSupportServiceLead2: "From help desk intake to advanced troubleshooting follow-through, we keep technical requests organized, visible, and moving toward resolution.",
      itSupportServiceTitleNew: "IT Support (Level I & Level II)",
      logisticsCoverage1: "Dispatch coordination",
      logisticsCoverage2: "Tracking continuity",
      logisticsCoverage3: "Documentation coordination",
      logisticsCoverage4: "Carrier follow-up",
      logisticsCoverage5: "Customer status updates",
      logisticsCoverage6: "Exception visibility",
      logisticsCoverage7: "Timeline support",
      logisticsCoverage8: "Operational reporting",
      logisticsCoverageTitle: "Logistics Operations Support",
      logisticsMetaDescription: "Logistics Operations support for dispatch coordination, tracking, documentation, carrier and customer follow-up, exception visibility, and status updates.",
      logisticsOutcome: "More visible logistics activity, clearer follow-up, stronger documentation, and dependable support for dispatch, tracking, and operational updates.",
      logisticsServiceEyebrow: "Logistics Operations",
      logisticsServiceLead1: "Gabriel Services supports logistics workflows with dispatch coordination, tracking continuity, documentation, and status visibility.",
      logisticsServiceLead2: "We help keep shipment activity moving with carrier and customer follow-up, exception visibility, and practical operational updates.",
      mainNavigation: "About Services Careers Contact ES Dark",
      outcomeTitle: "Outcome",
      serviceFocus1Text: "We organize requests, updates, handoffs, and next steps so support work has clear ownership.",
      serviceFocus1Title: "Coordinate the daily moving pieces.",
      serviceFocus2Text: "We maintain visibility across open items, pending responses, escalations, and resolution status.",
      serviceFocus2Title: "Track follow-up through completion.",
      serviceFocus3Text: "We keep status updates clear and practical so leaders can see progress without chasing details.",
      serviceFocus3Title: "Report what matters.",
      serviceFocusHeadline: "Focused support for the details that need movement.",
      serviceFocusTab1: "Coordinate",
      serviceFocusTab2: "Track",
      serviceFocusTab3: "Report",
      serviceHandlingHeadline: "Clear intake, organized follow-through, and visible status.",
      serviceHandlingText: "We align to your workflow, manage the day-to-day details, and keep communication practical so work does not stall between handoffs.",
      serviceHandlingTitle: "Service handling",
      serviceOverviewAdminDescNew: "Records, scheduling, reporting, vendor communication, workflow tracking, and daily back-office execution.",
      serviceOverviewCustomerDescNew: "Communication, follow-up, ticket resolution tracking, customer satisfaction support, and service rhythm.",
      serviceOverviewIntroNew: "Four service lanes designed to keep daily business activity organized, responsive, and moving with dependable execution.",
      serviceOverviewItDescNew: "Help desk intake, ticket triage, troubleshooting, access assistance, and structured Level I / Level II support.",
      serviceOverviewLogisticsDescNew: "Dispatch, tracking, documentation, carrier/customer follow-up, exception visibility, and status updates.",
      servicePanelNote: "Structured support that keeps work visible, coordinated, and moving toward resolution.",
      serviceSnapshotTitle: "Service Snapshot",
      servicesCtaHeadline: "Start with the operational lane that needs the most support.",
      servicesCtaText: "We can begin with one support area and expand as your workflows, follow-ups, and daily execution needs become clearer.",
      servicesMetaDescription: "Explore Gabriel Services support lanes for logistics operations, administrative back office, customer relations operations, and IT support.",

      // Legal page titles
      termsTitle: "Terms & Conditions",
      cookiesTitle: "Cookies Consent",
      privacyTitle: "Privacy & GDPR",

      // Theme & Language toggles
      lightTheme: "Light",
      darkTheme: "Dark",
      languageLabel: "Language",
      languageSelector: "Language selector",
      mobileNavigation: "Mobile Navigation",
      switchToEnglish: "Switch to English",
      switchToSpanish: "Switch to Spanish",
      themeLabelText: "Theme",

      // Footer meta
      copyright: "© 2026 Gabriel Services",

      // Home page
      homeTagline: "OUTSOURCE, DELIVERED",
      homeH1:
        "Reliable day-to-day execution,<br/>Outstanding operational support for modern businesses.",
      homeDescription:
        "Gabriel Services provides Logistics, Customer Relations, Administrative Back Office, and IT Support — integrating experience, coordination, operations management, customer satisfaction, and PC / desk support.<br/><br/>We execute the day-to-day so your team can focus on driving growth.",
      bookConsultation: "Start a conversation",
      seeServiceCoverage: "Service Overview",
      processeDriven: "Process-Driven Operations",
      practicalTransparent:
        "Practical, transparent, responsive, and aligned to your operating rhythm.",
      serviceAreasBuilt: "Service areas built for daily execution",
      logisticsDesc: "Dispatch and tracking continuity for shipment movement, operational updates, carrier follow-up, and timeline protection.",
      adminDesc: "Documentation, scheduling, reporting, vendor coordination, travel planning, and daily back-office execution.",
      customerRelDesc: "Customer communication, ticket follow-up, CSAT support, billing clarification, upsell support, and resolution flow.",
      itSupportDesc: "Level I and Level II support for help desk intake, troubleshooting, access assistance, incident investigation, workflow support, and resolution ownership.",
      exploreService: "Explore service",
      sitemap: "Sitemap",
      servicesOverview: "Services Overview",
      serviceOverviewTitle: "Service Overview",
      serviceOverviewIntro:
        "Gabriel Services delivers professional operational support across four core areas. Each service is designed to reduce friction, improve consistency, and let your team focus on what matters most.",
      serviceOverviewLogisticsDesc:
        "Structured coordination, shipment tracking, and operational continuity for supply chain activity.",
      serviceOverviewAdminDesc:
        "Documentation, scheduling, reporting, vendor coordination, travel planning, and daily back-office execution.",
      serviceOverviewCustomerDesc:
        "Customer communication, ticket follow-up, CSAT support, billing clarification, upsell support, and resolution flow.",
      serviceOverviewItDesc:
        "Level I and Level II support for help desk intake, troubleshooting, access assistance, incident investigation, workflow support, and resolution ownership.",
      whyBusinessesTitle: "Why businesses work with Gabriel Services",
      whyBusinessesText:
        "Businesses choose Gabriel Services for practical execution, clear communication, and consistent daily support that helps teams stay focused on growth.",
      startSupportTitle: "Start with the support you expect",
      requestConsultation: "Start with the support you expect",
      viewEngagementOptions: "Contact Us",
      serviceDetailEyebrowAdmin: "Service Lane 02",
      serviceDetailEyebrowCustomer: "Service Lane 03",
      serviceDetailEyebrowIt: "Service Lane 04",
      coverageEyebrow: "Coverage",
      serviceLanesEyebrow: "Operating lanes",
      workflowEyebrow: "Workflow",
      dynamicFocusEyebrow: "Dynamic Focus",
      outcomeEyebrow: "Outcome",
      selectedPriorityEyebrow: "Selected priority",
      customOptimizationPlanCta: "Get a Custom Optimization Plan",
      viewCoverageCta: "View coverage",
      adminDetailTitle: "Administrative Back Office",
      adminDetailHeroCopy: "We handle the operational details that keep leadership focused and daily business activity moving with structure, accuracy, and consistency.",
      adminDetailSecondaryCopy: "Our administrative back-office support covers workflow coordination, documentation, scheduling, reporting, vendor communication, travel planning, and day-to-day execution for growing teams.",
      adminProofStripAria: "Administrative support proof points",
      adminProofPill1: "Records prepared",
      adminProofPill2: "Calendars aligned",
      adminProofPill3: "Follow-ups active",
      adminCommandPanelAria: "Back office snapshot",
      adminSnapshotEyebrow: "Back Office Snapshot",
      adminSnapshotTitle: "Structure behind the visible operation.",
      adminStatusRecords: "Records",
      adminStatusClean: "Clean",
      adminStatusScheduling: "Scheduling",
      adminStatusAligned: "Aligned",
      adminStatusFollowUp: "Follow-up",
      adminStatusActive: "Active",
      adminCoverageTitle: "What this service handles",
      adminSupportStatement: "We support leadership and daily business operations by keeping tasks organized, records prepared, calendars aligned, and internal follow-ups moving without disruption.",
      adminCoverage1: "Executive administrative support",
      adminCoverage2: "Calendar and scheduling coordination",
      adminCoverage3: "Email and communication management",
      adminCoverage4: "Document organization and preparation",
      adminCoverage5: "Vendor coordination",
      adminCoverage6: "Internal operational support",
      adminCoverage7: "Travel planning and coordination",
      adminCoverage8: "Reporting and status updates",
      adminCoverage9: "Administrative workflow tracking",
      adminCoverage10: "Day-to-day back-office execution",
      adminLanesTitle: "Three ways we create administrative rhythm",
      adminLane1Title: "Executive support",
      adminLane1Text: "Calendar coordination, travel planning, meeting preparation, and daily leadership assistance.",
      adminLane1Tag: "Leadership",
      adminLane2Title: "Documentation and records",
      adminLane2Text: "Prepared files, organized records, reporting support, process notes, and easier retrieval.",
      adminLane2Tag: "Structure",
      adminLane3Title: "Vendor and internal coordination",
      adminLane3Text: "Communication handling, status checks, task routing, and follow-through across stakeholders.",
      adminLane3Tag: "Coordination",
      adminProcessTitle: "How admin support moves",
      adminProcess1: "Receive the task or support request.",
      adminProcess2: "Clarify owner, deadline, and required details.",
      adminProcess3: "Prepare records, calendar items, or documentation.",
      adminProcess4: "Coordinate follow-up with stakeholders.",
      adminProcess5: "Close the loop with clean status updates.",
      adminFocusTitle: "Choose the back-office priority",
      adminFocusIntro: "Select the operating area you want to tighten first.",
      adminFocusTabsAria: "Administrative focus options",
      adminFocusTabExecutive: "Executive Support",
      adminFocusTabRecords: "Records and Documents",
      adminFocusTabCoordination: "Coordination Flow",
      adminOutcomeTitle: "A cleaner operational rhythm",
      adminOutcomeText: "A cleaner operational rhythm with stronger organization, better follow-through, clearer documentation, and dependable administrative support for leadership and daily business needs.",
      customerDetailTitle: "Customer Relations",
      customerDetailHeroCopy: "We manage customer communication, service consistency, ticket follow-up, resolution tracking, billing clarification, customer satisfaction follow-ups, upsell support, and first-contact resolution.",
      customerSupportStatement: "We help businesses maintain customer satisfaction, protect service trust, and keep every customer issue moving through a clear resolution flow.",
      customerProofStripAria: "Customer relations proof points",
      customerProofPill1: "Tickets tracked",
      customerProofPill2: "CSAT supported",
      customerProofPill3: "Cases closed",
      customerCommandPanelAria: "Customer relations snapshot",
      customerSnapshotEyebrow: "Customer Snapshot",
      customerSnapshotTitle: "Resolution flow with visible ownership.",
      customerStatusTickets: "Tickets",
      customerStatusTracked: "Tracked",
      customerStatusCSAT: "CSAT",
      customerStatusActive: "Active",
      customerStatusClosure: "Closure",
      customerStatusVisible: "Visible",
      customerCoverageTitle: "What this service handles",
      customerCoverageIntro: "Customer relations support keeps communication clear, follow-up timely, and resolution details visible from intake through closure.",
      customerCoverage1: "Customer communication management",
      customerCoverage2: "Ticket follow-up and resolution tracking",
      customerCoverage3: "First-contact resolution support",
      customerCoverage4: "Customer satisfaction follow-ups — CSAT support",
      customerCoverage5: "Billing clarification support",
      customerCoverage6: "Upsell opportunity support",
      customerCoverage7: "Service recovery and concern routing",
      customerCoverage8: "Customer status updates",
      customerCoverage9: "Escalation visibility and follow-through",
      customerCoverage10: "Case notes and resolution closure",
      customerLanesTitle: "Three ways we protect customer trust",
      customerLane1Title: "Communication rhythm",
      customerLane1Text: "Responsive updates, clear notes, and customer-facing follow-through.",
      customerLane1Tag: "Clarity",
      customerLane2Title: "Resolution visibility",
      customerLane2Text: "Ticket status, escalation paths, service recovery routing, and ownership cues.",
      customerLane2Tag: "Visibility",
      customerLane3Title: "Satisfaction follow-up",
      customerLane3Text: "CSAT support, concern checks, upsell opportunity support, and closure notes.",
      customerLane3Tag: "Retention",
      customerProcessTitle: "How customer issues move",
      customerProcess1: "Capture the inquiry, ticket, or concern.",
      customerProcess2: "Clarify billing, service, or resolution details.",
      customerProcess3: "Route concerns and coordinate escalation visibility.",
      customerProcess4: "Follow up with customers and internal owners.",
      customerProcess5: "Close cases with notes and resolution confirmation.",
      customerFocusTitle: "Choose the customer priority",
      customerFocusIntro: "Select the customer flow your team wants to strengthen.",
      customerFocusTabsAria: "Customer focus options",
      customerFocusTabCommunication: "Communication Management",
      customerFocusTabResolution: "Resolution Tracking",
      customerFocusTabSatisfaction: "CSAT and Recovery",
      customerOutcomeTitle: "A stronger customer support rhythm",
      customerOutcomeText: "A stronger customer support rhythm with clearer communication, faster follow-up, better resolution visibility, and a more consistent customer experience.",
      itDetailTitle: "IT Support (Level I & Level II)",
      itDetailHeroCopy: "We provide structured technical support coverage across front-line assistance, deeper troubleshooting, incident review, workflow support, and post-escalation ownership.",
      itProofStripAria: "IT support proof points",
      itProofPill1: "Intake owned",
      itProofPill2: "Issues routed",
      itProofPill3: "Resolution tracked",
      itCommandPanelAria: "IT support snapshot",
      itSnapshotEyebrow: "Support Snapshot",
      itSnapshotTitle: "A visible path from intake to resolution.",
      itStatusIntake: "Intake",
      itStatusReady: "Ready",
      itStatusTroubleshooting: "Troubleshooting",
      itStatusStructured: "Structured",
      itStatusEscalation: "Escalation",
      itStatusOwned: "Owned",
      itCoverageTitle: "Level I and Level II support coverage",
      itCoverageIntro: "Structured technical support keeps every request visible, routed, and owned from the first intake through final resolution.",
      itLevelOneTitle: "Level I Support",
      itLevelOne1: "Help desk intake and ticket creation",
      itLevelOne2: "Basic troubleshooting",
      itLevelOne3: "End-user support",
      itLevelOne4: "Account access assistance",
      itLevelOne5: "Escalation coordination",
      itLevelTwoTitle: "Level II Support",
      itLevelTwo1: "Advanced troubleshooting",
      itLevelTwo2: "Incident investigation",
      itLevelTwo3: "System support",
      itLevelTwo4: "Workflow support",
      itLevelTwo5: "Root-cause analysis",
      itLevelTwo6: "Resolution ownership after escalation",
      itLanesTitle: "Support lanes with clear ownership",
      itLane1Title: "Front-line assistance",
      itLane1Text: "Help desk intake, ticket creation, end-user support, and access assistance.",
      itLane1Tag: "Level I",
      itLane2Title: "Deeper troubleshooting",
      itLane2Text: "Advanced troubleshooting, incident investigation, system support, and workflow support.",
      itLane2Tag: "Level II",
      itLane3Title: "Post-escalation ownership",
      itLane3Text: "Root-cause analysis, resolution ownership after escalation, and closure visibility.",
      itLane3Tag: "Ownership",
      itProcessTitle: "How IT issues move",
      itProcess1: "Open the ticket and capture issue context.",
      itProcess2: "Triage the request and identify support level.",
      itProcess3: "Troubleshoot, investigate, or coordinate escalation.",
      itProcess4: "Own post-escalation status and user updates.",
      itProcess5: "Confirm resolution and close the loop.",
      itFocusTitle: "Choose the support priority",
      itFocusIntro: "Select the technical support flow your team needs to stabilize.",
      itFocusTabsAria: "IT support focus options",
      itFocusTabLevelOne: "Level I Intake",
      itFocusTabLevelTwo: "Level II Troubleshooting",
      itFocusTabOwnership: "Resolution Ownership",
      itOutcomeTitle: "Every issue has a path",
      itOutcomeText: "Every issue has a path, a status, and an owner — from first intake through final resolution.",
      serviceFocusAdminExecutiveTitle: "Executive Support",
      serviceFocusAdminExecutiveText: "Practical assistance for calendars, travel planning, scheduling, follow-up, and daily leadership coordination.",
      serviceFocusAdminExecutiveItem1: "Calendar coordination",
      serviceFocusAdminExecutiveItem2: "Travel planning",
      serviceFocusAdminExecutiveItem3: "Email support",
      serviceFocusAdminExecutiveItem4: "Meeting preparation",
      serviceFocusAdminExecutiveItem5: "Task follow-up",
      serviceFocusAdminExecutiveItem6: "Document handling",
      serviceFocusAdminRecordsTitle: "Records and Documents",
      serviceFocusAdminRecordsText: "Cleaner documentation flow for growing businesses that need order, structure, and easier retrieval.",
      serviceFocusAdminRecordsItem1: "Record upkeep",
      serviceFocusAdminRecordsItem2: "Document preparation",
      serviceFocusAdminRecordsItem3: "File organization",
      serviceFocusAdminRecordsItem4: "Process notes",
      serviceFocusAdminRecordsItem5: "Data updates",
      serviceFocusAdminRecordsItem6: "Internal references",
      serviceFocusAdminCoordinationTitle: "Coordination Flow",
      serviceFocusAdminCoordinationText: "Support for vendor communication, internal requests, handoffs, follow-ups, and daily operational continuity.",
      serviceFocusAdminCoordinationItem1: "Vendor follow-up",
      serviceFocusAdminCoordinationItem2: "Internal coordination",
      serviceFocusAdminCoordinationItem3: "Status checks",
      serviceFocusAdminCoordinationItem4: "Task routing",
      serviceFocusAdminCoordinationItem5: "Communication support",
      serviceFocusAdminCoordinationItem6: "Workflow continuity",
      serviceFocusCustomerCommunicationTitle: "Communication Management",
      serviceFocusCustomerCommunicationText: "Keep every customer touchpoint clear, timely, and documented so service trust is easier to protect.",
      serviceFocusCustomerCommunicationItem1: "Customer communication management",
      serviceFocusCustomerCommunicationItem2: "Status updates",
      serviceFocusCustomerCommunicationItem3: "Case notes",
      serviceFocusCustomerCommunicationItem4: "Billing clarification",
      serviceFocusCustomerCommunicationItem5: "Concern routing",
      serviceFocusCustomerCommunicationItem6: "Follow-up cadence",
      serviceFocusCustomerResolutionTitle: "Resolution Tracking",
      serviceFocusCustomerResolutionText: "Maintain visibility from ticket follow-up through escalation, ownership, resolution notes, and final closure.",
      serviceFocusCustomerResolutionItem1: "Ticket follow-up",
      serviceFocusCustomerResolutionItem2: "Resolution tracking",
      serviceFocusCustomerResolutionItem3: "First-contact support",
      serviceFocusCustomerResolutionItem4: "Escalation visibility",
      serviceFocusCustomerResolutionItem5: "Service recovery",
      serviceFocusCustomerResolutionItem6: "Resolution closure",
      serviceFocusCustomerSatisfactionTitle: "CSAT and Recovery",
      serviceFocusCustomerSatisfactionText: "Support satisfaction follow-ups, recovery moments, and upsell opportunities without losing resolution discipline.",
      serviceFocusCustomerSatisfactionItem1: "CSAT support",
      serviceFocusCustomerSatisfactionItem2: "Satisfaction follow-ups",
      serviceFocusCustomerSatisfactionItem3: "Upsell opportunity support",
      serviceFocusCustomerSatisfactionItem4: "Customer trust checks",
      serviceFocusCustomerSatisfactionItem5: "Feedback notes",
      serviceFocusCustomerSatisfactionItem6: "Retention rhythm",
      serviceFocusItLevelOneTitle: "Level I Intake",
      serviceFocusItLevelOneText: "Front-line coverage for the first moment a user needs assistance, access support, or ticket visibility.",
      serviceFocusItLevelOneItem1: "Help desk intake",
      serviceFocusItLevelOneItem2: "Ticket creation",
      serviceFocusItLevelOneItem3: "Basic troubleshooting",
      serviceFocusItLevelOneItem4: "End-user support",
      serviceFocusItLevelOneItem5: "Account access assistance",
      serviceFocusItLevelTwoTitle: "Level II Troubleshooting",
      serviceFocusItLevelTwoText: "Deeper technical review for incidents that need investigation, system support, workflow support, and practical diagnosis.",
      serviceFocusItLevelTwoItem1: "Advanced troubleshooting",
      serviceFocusItLevelTwoItem2: "Incident investigation",
      serviceFocusItLevelTwoItem3: "System support",
      serviceFocusItLevelTwoItem4: "Workflow support",
      serviceFocusItLevelTwoItem5: "Root-cause analysis",
      serviceFocusItLevelTwoItem6: "Escalation coordination",
      serviceFocusItOwnershipTitle: "Resolution Ownership",
      serviceFocusItOwnershipText: "Post-escalation ownership keeps status, user communication, and final resolution from falling out of view.",
      serviceFocusItOwnershipItem1: "Resolution ownership after escalation",
      serviceFocusItOwnershipItem2: "Status updates",
      serviceFocusItOwnershipItem3: "Closure confirmation",
      serviceFocusItOwnershipItem4: "Issue path visibility",
      serviceFocusItOwnershipItem5: "User-focused handoff",
      howWeWorkTitle: "How We Work",
      howWeWorkHeadline:
        "Assessment → Integration → Execution → Monitoring → Optimization",
      howWeWorkIntro:
        "We plug into your operating rhythm with a clear process that keeps support practical, visible, and steadily improving.",
      assessmentStep: "Assessment",
      integrationStep: "Integration",
      executionStep: "Execution",
      monitoringStep: "Monitoring",
      optimizationStep: "Optimization",
      assessmentStepText:
        "Understand daily work, support gaps, friction points, and operational priorities.",
      integrationStepText:
        "Align with your workflow, communication style, systems, and execution standards.",
      executionStepText:
        "Handle day-to-day support with consistency, accuracy, communication, and follow-through.",
      monitoringStepText:
        "Track support activity, status updates, service rhythm, and operational visibility.",
      optimizationStepText:
        "Improve workflows, reduce friction, strengthen support quality, and refine execution.",
      costConsciousSupportTitle: "Cost-Conscious Support",
      costConsciousSupportHeadline:
        "Support that makes sense for growing businesses.",
      costConsciousSupportText:
        "All at a cost that makes sense for growing businesses — no enterprise overhead and no unnecessary contracts.",
      operationalSnapshotTitle: "Operational Snapshot",
      operationalSnapshotText:
        "Practical, transparent, responsive, and aligned to your operating rhythm.",
      noEnterpriseOverheadText: "No enterprise overhead",
      finalCtaTitle: "Ready To Start?",
      finalCtaText:
        "Did we mention it? All at a cost that makes sense for growing businesses — no enterprise overhead and no unnecessary contracts.",
      startExpectedSupport: "Start with the support you expect",
      contactUs: "Contact Us",
      gabrielHighlights: "Gabriel Services highlights",
      proofPracticalExecution: "Practical Execution",
      proofClearCommunication: "Clear Communication",
      proofResponsiveSupport: "Responsive Support",
      statusClear: "Clear",
      statusAligned: "Aligned",
      statusConsistent: "Consistent",
      statusOngoing: "Ongoing",
      serviceAreasIntro:
        "Gabriel Services supports the operational areas that keep modern businesses organized, responsive, and consistent.",
      whyBusinessesHeadline:
        "Practical execution, clear communication, and consistent support.",
      practicalExecutionText:
        "We focus on the work that needs to get done, without overcomplicating the process.",
      transparentCommunicationTitle: "Transparent Communication",
      transparentCommunicationText:
        "We keep updates clear, tasks visible, and support activity easier to follow.",
      responsiveSupportText:
        "We help daily operations move with stronger follow-through and better rhythm.",
      alignedOperationsTitle: "Aligned Operations",
      alignedOperationsText:
        "We integrate into your workflow and adapt to the way your business operates.",
      growthFocusTitle: "Growth Focus",
      growthFocusText:
        "We handle the day-to-day so your internal team can focus on higher-value work.",
      costConsciousDeliveryTitle: "Cost-Conscious Delivery",
      costConsciousDeliveryText:
        "Support that makes sense for growing businesses, without enterprise overhead.",

      aboutTitle: "About",
      aboutIntro1:
        "Gabriel Services is an operational support partner focused on daily execution for modern businesses.",
      aboutIntro2:
        "We provide cross-functional support across logistics operations, administrative back office, customer operations, and IT support.",
      aboutIntro3:
        "Our approach is built on consistency, transparent communication, and practical execution.",
      aboutWhenIssuesTitle: "When opportunities are left unresolved",
      aboutWhenIssuesText:
        "Small operational issues, when ignored, can quietly damage customer trust. Overlooked details slow growth, create missed opportunities, and eventually affect business stability.",
      aboutThatIsWhereText: "That is where we step in.",
      aboutDetailsHandledText:
        "We make sure no opportunity slips through the cracks. Every detail is handled so your business stays organized, responsive, and running smoothly.",
      aboutWhatWeHandleTitle: "What we handle",
      aboutWhatWeHandleText:
        "We step in by handling the details and bringing structure to fragmented operations. We integrate into your workflows, align with your processes, and focus on execution so your team can stay focused on growth.",
      aboutApproachSimpleTitle: "Our approach is simple:",
      aboutApproachItem1: "We improve productivity.",
      aboutApproachItem2: "We increase operational consistency.",
      aboutApproachItem3: "We deliver high-quality execution.",
      aboutApproachItem4:
        "We operate with practical and cost-conscious service delivery.",
      aboutApproachItem5:
        "We act as a reliable operational partner — plugging into your team and handling execution so you don't have to.",
      aboutResultTitle: "The result",
      aboutResult1: "You get more done with less friction.",
      aboutResult2: "More clarity.",
      aboutResult3:
        "More time to focus on growth instead of putting out fires.",
      aboutResult4:
        "All at a cost that makes sense for growing businesses — no enterprise overhead and no contracts.",
      aboutSupportTitle: "What we support",
      aboutSupportText: "We focus on four operational areas:",
      aboutSupportArea1: "Logistics",
      aboutSupportArea2: "Customer Relations",
      aboutSupportArea3: "Administrative Back Office",
      aboutSupportArea4: "IT Support (Level I and Level II)",
      aboutOurServicesTitle: "Our Services",
      aboutLogisticsOperationsTitle: "Logistics Operations",
      aboutLogisticsOperationsText:
        "We help keep your logistics organized, visible, and moving:",
      aboutLogisticsList1: "Dispatch coordination",
      aboutLogisticsList2: "Shipment tracking (ocean, air, and ground)",
      aboutLogisticsList3: "Customer communication and follow-ups",
      aboutLogisticsList4: "Invoicing and billing support",
      aboutLogisticsList5: "Documentation coordination",
      aboutCustomerRelationsTitle: "Customer Relations",
      aboutCustomerRelationsText:
        "We help maintain customer satisfaction and resolution flow:",
      aboutCustomerRelationsList1: "Ticket follow-up and resolution tracking",
      aboutCustomerRelationsList2:
        "Customer satisfaction follow-ups (CSAT support)",
      aboutCustomerRelationsList3: "Billing clarification support",
      aboutCustomerRelationsList4: "First contact resolution support",
      aboutCustomerRelationsList5: "Customer communication management",
      aboutAdminBackOfficeTitle: "Administrative Back Office",
      aboutAdminBackOfficeText:
        "We support leadership and daily business operations:",
      aboutAdminBackOfficeList1: "Executive administrative support",
      aboutAdminBackOfficeList2: "Calendar and scheduling coordination",
      aboutAdminBackOfficeList3: "Email and communication management",
      aboutAdminBackOfficeList4: "Document organization and preparation",
      aboutAdminBackOfficeList5: "Vendor coordination",
      aboutAdminBackOfficeList6: "Internal operational support",
      aboutAdminBackOfficeList7: "Travel planning and coordination",
      aboutITSupportTitle: "IT Support (Level I & Level II)",
      aboutITSupportText: "We provide structured technical support coverage:",
      aboutLevel1Title: "Level I Support",
      aboutLevel1List1: "Help desk intake and ticket creation",
      aboutLevel1List2: "Basic troubleshooting",
      aboutLevel1List3: "End-user support",
      aboutLevel1List4: "Account access assistance",
      aboutLevel1List5: "Escalation coordination",
      aboutLevel2Title: "Level II Support",
      aboutLevel2List1: "Advanced troubleshooting",
      aboutLevel2List2: "Incident investigation",
      aboutLevel2List3: "System and workflow support",
      aboutLevel2List4: "Root cause analysis",
      aboutLevel2List5: "Resolution ownership after escalation",
      contactTitle: "Contact",
      contactMetaDescription:
        "Contact Gabriel Services for support, onboarding, projects, and partnership opportunities.",
      honeypotWebsiteLabel: "Website",
      contactProtectionUnavailable: "Contact protection module unavailable.",
      contactFullNameRequired: "Please enter your full name.",
      contactEmailRequired: "Please enter a valid email address.",
      contactMessageRequired: "Please enter a message.",
      contactSessionBlocked: "This contact session has been blocked.",
      contactSubmitBlockedGeneric: "Your message could not be submitted.",
      contactSubmitBlockedSecure: "Your message could not be submitted securely.",
      contactSubmitPending: "Sending your message securely...",
      contactSubmitSuccess: "Your message was received securely.",
      contactSubmitUnavailable: "Your message could not be submitted right now.",
      contactIntro:
        "Describe the aptitudes, objectives, goals, and expectations you are seeking.",
      contactRequestTitle: "Contact Request",
      contactRequestButtonLabel: "Send Request",
      addContactEntry: "+ Add",
      expectationsLabel: "Describe what do you expect from your candidates / applicants",
      fullName: "Full Name",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailAddress: "Email Address",
      countryCode: "Country Code",
      contactNumber: "Contact Number",
      city: "City",
      stateProvince: "State/Province",
      spaceSuiteApt: "Space/Suite/Apt",
      countryZipCode: "Country Zip Code",
      bestContactTime: "Best Time to Contact You",
      messageLabel: "Message",
      inquiryAboutTitle:
        "Tell us your expectation about the Remote Assistant’s expertise, knowledge and abilities",
      inquiryAboutHelper: "Aptitude, skills, experience, knowledge",
      inquiryCardAptitudeTitle: "Aptitude, skills, experience, knowledge",
      inquiryCardInterestTitle: "Interest and education",
      skillsLabel: "Skills",
      languagesLabel: "Languages",
      projectsLabel: "Projects",
      educationLabel: "Education",
      addSkill: "Add +",
      removeSkill: "Remove -",
      removeAll: "Remove All",
      experienceLabel: "Experience",
      experienceLevelLabel: "Experience Level",
      placeholderAddExperienceEntry: "Add experience entry",
      experienceLevelEntryLevel: "Entry Level",
      experienceLevelJunior: "Junior",
      experienceLevelIntermediate: "Intermediate",
      experienceLevelAdvanced: "Advanced",
      experienceLevelSenior: "Senior",
      experienceLevelExpert: "Expert",
      experienceLevelEngineer: "Engineer",
      experienceLevelCLevel: "C Level",
      placeholderAddLanguageEntry: "Add language entry",
      placeholderAddSkillEntry: "Add skill entry",
      placeholderAddAreaInterestEntry: "Add area of interest entry",
      placeholderAddProjectEntry: "Add project entry",
      placeholderAddEducationEntry: "Add education entry",
      submitApplication: "Submit Application",
      contactButtonLabel: "Send",
      clearForm: "Clear Form",
      careersTitle: "Careers",
      careersIntro:
        "Describe the aptitudes, objectives, goals, and expectations you are seeking.",
      availabilityLabel: "Availability",
      availabilityImmediately: "Immediately",
      availability15Days: "15 days",
      availability30Days: "30 days",
      availability45Days: "45 days",
      availability60Days: "60 days",
      availability90Days: "90 days",
      areaInterestLabel: "Area of Interest",
      careersOptionLogistics: "Logistics",
      careersOptionAdministration: "Administration",
      careersOptionAdministrationBackOffice: "Administration Back Office",
      careersOptionCustomerRelations: "Customer Relations",
      careersOptionItSupport: "IT Support",
      experienceLabel: "Experience",
      experienceLevelLabel: "Experience Level",
      experienceLevelEntry: "Entry",
      experienceLevelEntryLevel: "Entry Level",
      experienceLevelJunior: "Junior",
      experienceLevelIntermediate: "Intermediate",
      experienceLevelAdvance: "Advance",
      experienceLevelAdvanced: "Advanced",
      experienceLevelSenior: "Senior",
      experienceLevelExpert: "Expert",
      experienceLevelEngineer: "Engineer",
      experienceLevelLowerManagement: "Lower Management",
      experienceLevelTopManagement: "Top Management",
      experienceLevelSeniorManagement: "Senior Management",
      experienceLevelCSuite: "C Suite",
      experienceLevelCLevel: "C Level",
      languageLevelLabel: "Language Level",
      languageLevelBeginner: "Beginner",
      languageLevelElementary: "Elementary",
      languageLevelIntermediate: "Intermediate",
      languageLevelUpperIntermediate: "Upper Intermediate",
      languageLevelAdvanced: "Advanced",
      languageLevelProficient: "Proficient",
      skillLevelLabel: "Skill Level",
      skillLevelNovice: "Novice",
      skillLevelAdvancedBeginner: "Advanced Beginner",
      skillLevelProficient: "Proficient",
      skillLevelExpert: "Expert",
      projectStatusLabel: "Project Status",
      projectStatusFinished: "Finished",
      projectStatusInProgress: "In-Progress",
      projectStatusAbandoned: "Abandoned",
      projectStatusCancelled: "Cancelled",
      resumeLinkLabel: "Resume/Profile link",
      educationLevelLabel: "Education Level",
      educationOptionGed: "GED",
      educationOptionHighSchool: "High School",
      educationOptionSomeCollege: "Some College",
      educationOptionAssociate: "Associate",
      educationOptionAssociateDegree: "Associate Degree",
      educationOptionBachelor: "Bachelor",
      educationOptionGraduate: "Graduate",
      educationOptionMaster: "Master",
      educationOptionMasters: "Masters",
      educationOptionDoctorate: "Doctorate",
      educationOptionCertified: "Certified",
      bestContactTime: "Best Time to Contact You",
      bestContactDateLabel: "Best contact date",
      bestContactTimeLabel: "Best contact time",
      messageLabel: "Message",
      careerMessagePrompt: "Tell us about YOU",
      learningTitle: "Learning",
      learningIntro:
        "Guidance and practical service knowledge for English-first, workflow-oriented operations support.",
      trackLogisticsTitle: "Logistics Operations",
      trackLogisticsText:
        "Learn coordination, tracking, and continuity essentials.",
      logisticsServiceTitle: "Logistics Operations",
      logisticsServiceIntro:
        "Gabriel Services supports logistics workflows with operational oversight, dispatch coordination, and shipment visibility designed to keep your supply chain moving.",
      logisticsServiceOfferTitle: "What We Offer",
      logisticsServiceOffer1: "Dispatch coordination and carrier communication.",
      logisticsServiceOffer2:
        "Shipment tracking for air, ocean, and ground transport.",
      logisticsServiceOffer3:
        "Inventory status monitoring and exception management.",
      logisticsServiceOffer4:
        "Supplier and carrier follow-up to protect delivery timelines.",
      logisticsServiceWorkTitle: "How We Work",
      logisticsServiceWorkIntro:
        "We integrate into your existing logistics ecosystem, align with operational milestones, and provide consistent execution every day.",
      logisticsServiceWork1:
        "Clear handoff practices and communication templates.",
      logisticsServiceWork2:
        "Regular status updates and early issue escalation.",
      logisticsServiceWork3:
        "Data-driven tracking with actionable next steps.",
      logisticsServiceWhyTitle: "Why Choose This Service",
      logisticsServiceWhyText:
        "This service is ideal for businesses that need dependable logistics support without adding internal overhead. We help reduce delays, improve visibility, and keep your operations responsive.",
      backToServices: "Back to Services",
      trackAdminTitle: "Administrative Back Office",
      trackAdminText:
        "Learn documentation, reporting rhythm, and process upkeep.",
      adminLearningTitle: "Administrative Back Office Learning",
      adminLearningIntro:
        "Training designed for operational support teams that manage internal systems, scheduling, documentation, and task workflows.",
      learningObjectivesTitle: "Learning Objectives",
      adminLearningObjective1:
        "Develop reliable documentation and reporting habits",
      adminLearningObjective2:
        "Improve task coordination across teams and stakeholders",
      adminLearningObjective3:
        "Learn how to maintain consistent administrative workflows",
      keyTopicsTitle: "Key Topics",
      adminLearningTopic1: "Calendar and communication management",
      adminLearningTopic2: "Document organization and version control",
      adminLearningTopic3: "Vendor follow-up and service coordination",
      practicalApplicationTitle: "Practical Application",
      adminLearningApplication:
        "These skills help back office teams reduce operational friction and support faster decision-making across the business.",
      adminLearningPageTitle: "Administrative Back Office Learning | Gabriel Services",
      adminLearningMetaDescription:
        "Learning track for Administrative Back Office: process discipline, reporting, and internal operations skills.",
      logisticsLearningPageTitle: "Logistics Operations Learning | Gabriel Services",
      logisticsLearningMetaDescription:
        "Learning track for Logistics Operations: workflow coordination, tracking systems, and continuity skills.",
      logisticsLearningTitle: "Logistics Operations Learning",
      logisticsLearningIntro:
        "A practical guide for logistics teams and operations professionals focused on continuity, tracking discipline, and process coordination.",
      logisticsLearningObjective1:
        "Understand core logistics workflows and handoff points",
      logisticsLearningObjective2:
        "Learn best practices for shipment tracking and exception management",
      logisticsLearningObjective3:
        "Create repeatable communication processes for carriers and suppliers",
      logisticsLearningTopic1: "Dispatch coordination and operations planning",
      logisticsLearningTopic2:
        "Visibility standards for air, ocean, and ground shipments",
      logisticsLearningTopic3:
        "Follow-up management and escalation control",
      logisticsLearningApplication:
        "This track is designed for people who need to turn logistics planning into predictable daily execution without adding operational burden.",
      customerLearningPageTitle: "Customer Relations Learning | Gabriel Services",
      customerLearningMetaDescription:
        "Customer Relations learning track: communication best practices, escalation flows, and customer care skills.",
      customerLearningTitle: "Customer Relations Learning",
      customerLearningIntro:
        "Learn how to manage customer communications, handle escalations, and maintain a reliable service rhythm in every customer interaction.",
      customerLearningObjective1:
        "Master communication best practices for customer-facing teams.",
      customerLearningObjective2:
        "Understand escalation flows and fast issue-resolution practices.",
      customerLearningObjective3:
        "Develop a consistent follow-up and satisfaction process.",
      customerLearningTopic1: "Ticket follow-up and resolution control.",
      customerLearningTopic2:
        "Customer satisfaction measurement and feedback.",
      customerLearningTopic3:
        "Clear and timely customer communication.",
      customerLearningApplication:
        "These practices help teams convert customer interactions into reliable outcomes and clearer handoffs across operations.",
      itLearningPageTitle: "IT Support Learning | Gabriel Services",
      itLearningMetaDescription:
        "Learning track for IT Support: support workflows, ticket management, and user-centered IT operations.",
      itLearningTitle: "IT Support Learning",
      itLearningIntro:
        "A practical learning track for IT support workflows, ticket handling, and user-facing technical operations.",
      itLearningObjective1:
        "Understand ticket lifecycle and user support workflows",
      itLearningObjective2:
        "Learn effective technical communication and escalation practices",
      itLearningObjective3:
        "Build measurable support habits for daily operations",
      itLearningTopic1: "Help desk intake, categorization, and response planning",
      itLearningTopic2: "Incident tracking and progress communication",
      itLearningTopic3: "Support documentation and follow-up handoffs",
      itLearningApplication:
        "This track is built for teams that need consistent technical support without losing focus on reliable user service delivery.",
      relatedLearningTitle: "Explore other learning tracks",
      relatedLearningText:
        "Keep moving between the core learning tracks to compare skills, workflows, and practical applications.",
      relatedLearningAria: "Related learning tracks",
      backToLearning: "Back to Learning",
      adminBackOfficeServiceIntro:
        "Our back office services bring structure and reliability to your internal operations, helping reduce risk and maintain a consistent business rhythm.",
      adminBackOfficeHandleTitle: "What We Handle",
      adminBackOfficeHandle1:
        "Executive administrative support and calendar management",
      adminBackOfficeHandle2:
        "Document preparation, filing, and version control",
      adminBackOfficeHandle3:
        "Email and communication coordination for internal teams",
      adminBackOfficeHandle4:
        "Vendor follow-up, invoice tracking, and reporting support",
      adminBackOfficeWorksTitle: "How This Service Works",
      adminBackOfficeWorksText:
        "We partner closely with your team to understand processes, capture priority actions, and keep every task aligned with your business schedule.",
      adminBackOfficeWorksPoint1:
        "Clear ownership for recurring tasks and follow-up items",
      adminBackOfficeWorksPoint2: "Documented task flows and progress tracking",
      adminBackOfficeWorksPoint3:
        "Regular status updates to stakeholders and team leads",
      adminBackOfficeMattersTitle: "Why It Matters",
      adminBackOfficeMattersText:
        "Strong back office support helps businesses scale by removing administrative friction, improving consistency, and freeing your team to focus on higher-value work.",
      trackCustomerTitle: "Customer Operations",
      trackCustomerText:
        "Learn follow-up flow, escalation continuity, and response rhythm.",
      customerRelationsServiceTitle: "Customer Relations Operations",
      customerRelationsServiceIntro:
        "We support customer experience with consistent communication, escalation management, and follow-up workflows that keep every issue moving toward resolution.",
      customerRelationsServiceAreasTitle: "Core Service Areas",
      customerRelationsServiceArea1:
        "Ticket follow-up and resolution tracking.",
      customerRelationsServiceArea2:
        "Customer satisfaction check-ins and feedback support.",
      customerRelationsServiceArea3:
        "Billing clarification and escalation assistance.",
      customerRelationsServiceArea4:
        "First-contact resolution support and status communication.",
      customerRelationsServiceHowTitle: "How We Support Customers",
      customerRelationsServiceHowText:
        "Our team helps maintain trust by managing a consistent customer communication rhythm and resolving inquiries in a timely, accurate manner.",
      customerRelationsServiceHow1:
        "Standardized responses and escalation protocols.",
      customerRelationsServiceHow2:
        "Customer follow-up and satisfaction checks.",
      customerRelationsServiceHow3:
        "Clear handoffs between teams and delivery partners.",
      customerRelationsServiceWhyTitle: "Why This Matters",
      customerRelationsServiceWhyText:
        "Strong customer relations operations reduce churn, improve brand perception, and ensure your customers always feel supported.",
      trackITTitle: "IT Support",
      trackITText:
        "Learn triage basics, ticket communication, and request handling.",
      itSupportMetaDescription:
        "Professional Level I and Level II IT support for help desk intake, ticket creation, troubleshooting, end-user support, account access assistance, escalation coordination, incident investigation, workflow support, root-cause analysis, and resolution ownership.",
      itSupportServiceIntro:
        "We provide structured technical support coverage for help desk intake, ticket creation, troubleshooting, end-user support, account access assistance, escalation coordination, incident investigation, workflow support, root-cause analysis, and resolution ownership after escalation.",
      itSupportHeroEyebrow: "Service Lane 04",
      itSupportHeroLead:
        "Structured technical support coverage for Level I and Level II assistance.",
      itSupportHeroIntro:
        "We provide structured technical support coverage for help desk intake, ticket creation, troubleshooting, end-user support, account access assistance, escalation coordination, incident investigation, workflow support, root-cause analysis, and resolution ownership after escalation.",
      itSupportProofLevel1: "Level I Coverage",
      itSupportProofLevel2: "Level II Ownership",
      itSupportProofEscalation: "Escalation Coordination",
      itSupportProofRootCause: "Root-Cause Discipline",
      itSupportRequestCta: "Request IT support",
      itSupportViewCoverageCta: "View coverage",
      itSupportSnapshotEyebrow: "Support Snapshot",
      itSupportSnapshotTitle:
        "Clear intake. Strong triage. Accountable resolution.",
      itSupportSnapshotIntake: "Structured intake",
      itSupportSnapshotPriority: "Priority tracking",
      itSupportSnapshotEscalation: "Escalation ownership",
      itSupportSnapshotResolution: "Resolution clarity",
      itSupportSnapshotText:
        "Built for businesses that need calm, documented, professional support from first contact through final closure.",
      itSupportCoverageEyebrow: "Coverage",
      itSupportCoverageTitle: "Two levels of technical support.",
      itSupportCoverageIntro:
        "We provide structured technical support coverage across front-line assistance, deeper troubleshooting, incident review, workflow support, and post-escalation ownership.",
      serviceHighlightsTitle: "Service Highlights",
      itSupportLevel1Eyebrow: "Front-Line Response",
      itSupportLevel1Body:
        "Level I support keeps user issues moving with clean intake, first-touch assistance, basic troubleshooting, access help, and clear escalation coordination.",
      itSupportHighlight1: "Help desk intake and ticket creation",
      itSupportHighlight2: "Basic troubleshooting and issue diagnosis",
      itSupportHighlight3: "Account access and system support coordination",
      itSupportHighlight4:
        "Escalation management to specialized teams when needed",
      itSupportLevel2Eyebrow: "Technical Ownership",
      itSupportLevel2Body:
        "Level II support handles deeper investigation, advanced troubleshooting, system and workflow support, root-cause analysis, and resolution ownership after escalation.",
      itSupportLevel2SystemSupport: "System support",
      itSupportLevel2WorkflowSupport: "Workflow support",
      itSupportLevel2RootCause: "Root-cause analysis",
      itSupportDeliveryTitle: "How We Deliver Support",
      itSupportDeliveryText:
        "We maintain a structured support rhythm that follows incoming requests from first contact through resolution, with visibility and accountability at every step.",
      itSupportDeliveryPoint1: "Fast ticket intake and triage",
      itSupportDeliveryPoint2: "Clear status updates and escalation pathways",
      itSupportDeliveryPoint3: "Practical, user-focused communication",
      itSupportWorkflowEyebrow: "Workflow",
      itSupportWorkflowTitle: "How IT support moves.",
      itSupportWorkflowIntro:
        "The support process is designed to reduce confusion, protect productivity, and make every ticket easier to track from request to resolution.",
      itSupportWorkflowReceiveTitle: "Receive",
      itSupportWorkflowReceiveText:
        "Capture the user request, issue details, affected system, and business impact.",
      itSupportWorkflowClassifyTitle: "Classify",
      itSupportWorkflowClassifyText:
        "Confirm the issue type, urgency, affected user, priority, and support path.",
      itSupportWorkflowResolveTitle: "Resolve at L1",
      itSupportWorkflowResolveText:
        "Handle basic troubleshooting, user support, and access assistance where possible.",
      itSupportWorkflowEscalateTitle: "Escalate to L2",
      itSupportWorkflowEscalateText:
        "Move deeper incidents into advanced investigation with clear notes and ownership.",
      itSupportWorkflowCloseTitle: "Close with clarity",
      itSupportWorkflowCloseText:
        "Document the action taken, final status, root cause, and resolution outcome.",
      itSupportFocusEyebrow: "Dynamic Focus",
      itSupportFocusTitle: "Choose the IT support priority.",
      itSupportFocusIntro:
        "Select a priority area to show the exact coverage points that matter most to your operation.",
      itSupportFocusLevel1Eyebrow: "Front-line support",
      itSupportFocusLevel1Text:
        "Structured first-contact assistance for user requests, ticket creation, basic troubleshooting, access help, and escalation coordination.",
      itSupportFocusLevel2Eyebrow: "Advanced ownership",
      itSupportFocusLevel2Text:
        "Deeper technical coverage for advanced troubleshooting, incident review, system and workflow support, root-cause analysis, and post-escalation resolution.",
      itSupportFocusEscalationTab: "Escalation Flow",
      itSupportFocusEscalationEyebrow: "Clear handoff",
      itSupportFocusEscalationText:
        "A disciplined escalation path that keeps issues visible, documented, prioritized, and owned until final closure.",
      itSupportFocusEscalationItem1: "Issue notes",
      itSupportFocusEscalationItem2: "Priority tracking",
      itSupportFocusEscalationItem3: "Escalation coordination",
      itSupportFocusEscalationItem4: "Internal handoff",
      itSupportFocusEscalationItem5: "Status communication",
      itSupportFocusEscalationItem6: "Resolution closure",
      itSupportLeadEyebrow: "Reliable Support Coverage",
      itSupportLeadTitle:
        "Need IT support that feels organized, responsive, and accountable?",
      itSupportLeadText:
        "Use the inquiry flow to describe your support volume, user issues, ticket flow, access needs, recurring incidents, or escalation requirements.",
      itSupportLeadPrimaryCta: "Start IT support inquiry",
      whyItWorksTitle: "Why It Works",
      itSupportWhyText:
        "The right IT support keeps your team productive, prevents small issues from becoming larger problems, and helps maintain reliable daily operations.",
      backToServices: "Back to Services",
      exploreTrack: "Explore track",
      termsSection1Title: "1. Agreement to Terms",
      termsSection1Text:
        "By accessing and using this website and the services provided by Gabriel Services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
      termsSection2Title: "2. Use License",
      termsSection2Text:
        "Gabriel Services grants you a limited license to access and use the website and services for lawful purposes only. You agree not to:",
      termsSection2List1:
        "Reproduce, duplicate, copy, or sell any portion of the website or services",
      termsSection2List2:
        "Access the website for any unlawful or unauthorized purpose",
      termsSection2List3:
        "Disrupt the normal flow of dialogue or otherwise disrupt the services",
      termsSection2List4:
        "Attempt to gain unauthorized access to our systems or networks",
      termsSection2List5:
        "Use automated systems or scripts to collect data without permission",
      termsSection2List6:
        "Engage in any form of harassment or abusive behavior",
      termsSection3Title: "3. Disclaimer of Warranties",
      termsSection3Text:
        "The materials on Gabriel Services' website are provided on an 'as is' basis. Gabriel Services makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
      termsSection4Title: "4. Limitations of Liability",
      termsSection4Text:
        "In no event shall Gabriel Services or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Gabriel Services' website, even if Gabriel Services or an authorized representative has been notified orally or in writing of the possibility of such damage.",
      termsSection5Title: "5. Accuracy of Materials",
      termsSection5Text:
        "The materials appearing on Gabriel Services' website could include technical, typographical, or photographic errors. Gabriel Services does not warrant that any of the materials on its website are accurate, complete, or current. Gabriel Services may make changes to the materials contained on its website at any time without notice.",
      termsSection6Title: "6. Links",
      termsSection6Text:
        "Gabriel Services has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Gabriel Services of the site. Use of any such linked website is at the user's own risk.",
      termsSection7Title: "7. Modifications",
      termsSection7Text:
        "Gabriel Services may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
      termsSection8Title: "8. Governing Law",
      termsSection8Text:
        "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Gabriel Services operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
      termsSection9Title: "9. Service Description",
      termsSection9Text:
        "Gabriel Services provides operational support services including Logistics Operations, Administrative Back Office, Customer Relations Operations, and IT Support. The specific services requested and agreed upon between Gabriel Services and the client are detailed in the service agreement.",
      termsSection10Title: "10. Payment Terms",
      termsSection10Text:
        "Payment terms are as specified in the individual service agreement. Invoices are due upon receipt unless otherwise agreed in writing. Late payments may result in service suspension.",
      termsSection11Title: "11. Intellectual Property Rights",
      termsSection11Text:
        "All content included on this website, such as text, graphics, logos, images, and software, is the property of Gabriel Services or its content suppliers and is protected by international copyright laws.",
      termsSection12Title: "12. Limitation of Service",
      termsSection12Text:
        "Gabriel Services reserves the right to refuse service to anyone at its sole discretion. Gabriel Services also reserves the right to limit or terminate services, close accounts, and remove or edit content in our sole discretion.",
      termsSection13Title: "13. Contact for Legal Inquiries",
      termsSection13Text:
        "If you have any questions about these Terms & Conditions, please contact us at the email or address provided on our Contact page.",
      termsLastUpdated: "Last Updated: May 5, 2026",

      cookiesLastUpdated: "Last Updated: May 5, 2026",
      cookiesTitle: "Cookies Consent Policy",
      cookiesSection1Title: "1. What Are Cookies?",
      cookiesSection1Text:
        "Cookies are small data files containing a string of characters that are placed on your computer or mobile device when you visit our website. They allow us to recognize your browser or device, remember information about your preferences, and help personalize your experience on the Gabriel Services website.",
      cookiesSection2Title: "2. Types of Cookies We Use",
      cookiesSection2EssentialTitle: "Essential Cookies",
      cookiesSection2EssentialText:
        "These cookies are necessary for the website to function properly and cannot be disabled through our systems. They are used to:",
      cookiesSection2EssentialList1: "Enable basic website functionality",
      cookiesSection2EssentialList2: "Maintain security and prevent fraud",
      cookiesSection2EssentialList3:
        "Preserve user preferences (language and theme selections)",
      cookiesSection2PerformanceTitle: "Performance Cookies",
      cookiesSection2PerformanceText:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us:",
      cookiesSection2PerformanceList1:
        "Identify pages that are accessed most frequently",
      cookiesSection2PerformanceList2:
        "Measure the effectiveness of advertising campaigns",
      cookiesSection2PerformanceList3: "Understand user navigation patterns",
      cookiesSection2FunctionalTitle: "Functional Cookies",
      cookiesSection2FunctionalText:
        "These cookies enable enhanced functionality and personalization, including:",
      cookiesSection2FunctionalList1: "Remembering your language preference",
      cookiesSection2FunctionalList2: "Storing your theme preference",
      cookiesSection2FunctionalList3: "Recording form data for convenience",
      cookiesSection2AnalyticalTitle: "Analytical Cookies",
      cookiesSection2AnalyticalText:
        "We use analytical cookies to understand how our website is used, including the duration of visits and the paths users take through the website. This helps us improve the design and functionality of our website.",
      cookiesSection3Title: "3. Browser Cache / Local Storage",
      cookiesSection3Text:
        "To enhance user experience, we save your language and theme choices in your browser cache using localStorage, including:",
      cookiesSection3List1: "Language preference (English or Spanish)",
      cookiesSection3List2: "Theme preference (Light or Dark mode)",
      cookiesSection3Text2:
        "This information is stored locally on your device and is not transmitted to our servers.",
      cookiesSection4Title: "4. Third-Party Cookies",
      cookiesSection4Text:
        "Third-party cookies may be placed on your device by external service providers including:",
      cookiesSection4List1: "Analytics providers",
      cookiesSection4List2: "Advertising networks",
      cookiesSection4List3: "Social media platforms",
      cookiesSection4Text2:
        "We do not have control over third-party cookies. You can set your browser to refuse cookies or to alert you when cookies are being sent.",
      cookiesSection5Title: "5. How to Control Cookies",
      cookiesSection5Text:
        "You have the right to choose whether to accept or reject cookies. Most web browsers allow you to:",
      cookiesSection5List1: "View cookies that have been set on your device",
      cookiesSection5List2: "Delete cookies from your device",
      cookiesSection5List3:
        "Block future cookies from being set on your device",
      cookiesSection5List4:
        "Set your browser to notify you when a cookie is about to be set",
      cookiesSection5Text2:
        "If you choose to block or delete cookies, some features of our website may not work as intended.",
      cookiesSection6Title: "6. Google Analytics",
      cookiesSection6Text:
        "We may use Google Analytics to collect information about your use of our website. Google Analytics collects information such as:",
      cookiesSection6List1: "IP address",
      cookiesSection6List2: "Device type",
      cookiesSection6List3: "Browser type",
      cookiesSection6List4: "Pages visited and time spent on each page",
      cookiesSection6Text2:
        "The information is used to compile reports on website activity, which help us understand how our website is being used and to improve its design and functionality. Google Analytics does not identify individual users.",
      cookiesSection7Title: "7. Your Consent",
      cookiesSection7Text:
        "By continuing to use our website after receiving this cookie notice, you consent to the use of cookies as described in this policy. If you do not consent to the use of cookies, you should disable cookies in your browser settings before continuing to use our website.",
      cookiesSection8Title: "8. Updates to This Policy",
      cookiesSection8Text:
        "We may update this Cookies Consent Policy from time to time to reflect changes in technology, legislation, or other changes. We encourage you to review this policy periodically to stay informed about how we protect your privacy.",
      cookiesSection9Title: "9. Contact Us",
      cookiesSection9Text:
        "If you have any questions about our Cookies Consent Policy or our use of cookies, please contact us through the Contact page on our website or via the contact information provided on our main website.",

      privacySection1Title: "1. Introduction",
      privacySection1Text:
        'Gabriel Services ("we," "us," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully to understand our practices regarding your personal data.',
      privacySection2Title: "2. Information We Collect",
      privacySection2DirectTitle: "Information You Provide Directly",
      privacySection2DirectList1:
        "Contact Information: Name, email address, telephone number, and company name",
      privacySection2DirectList2:
        "Service Information: Details about your business operations and service requirements",
      privacySection2DirectList3:
        "Communication Records: Content of messages, emails, and support tickets",
      privacySection2DirectList4:
        "Payment Information: Billing address and payment method details (processed securely)",
      privacySection2AutoTitle: "Information Collected Automatically",
      privacySection2AutoList1:
        "Device Information: IP address, browser type, operating system, and device identifiers",
      privacySection2AutoList2:
        "Usage Data: Pages visited, time spent on pages, links clicked, and navigation patterns",
      privacySection2AutoList3:
        "Cookies and Similar Technologies: Browser and local storage data for preferences",
      privacySection2AutoList4:
        "Referral Information: How you accessed our website",
      privacySection3Title: "3. How We Use Your Information",
      privacySection3Text:
        "We use collected information for the following purposes:",
      privacySection3List1: "Providing and managing services requested",
      privacySection3List2:
        "Processing transactions and sending related information",
      privacySection3List3: "Sending transactional and promotional emails",
      privacySection3List4:
        "Responding to inquiries and providing customer support",
      privacySection3List5: "Improving our website and services",
      privacySection3List6: "Analyzing website usage patterns",
      privacySection3List7: "Preventing fraud and ensuring security",
      privacySection3List8: "Complying with legal obligations",
      privacySection3List9:
        "Creating aggregate, de-identified data for analytics",
      privacySection4Title: "4. Legal Basis for Processing (GDPR)",
      privacySection4Text:
        "Under GDPR, we process personal data based on these lawful grounds:",
      privacySection4List1:
        "Contractual Necessity: Processing necessary to perform our services with you",
      privacySection4List2:
        "Legal Obligation: Processing required by law or regulation",
      privacySection4List3:
        "Legitimate Interests: Processing necessary for our legitimate business interests",
      privacySection4List4:
        "Consent: Processing based on your explicit consent",
      privacySection5Title: "5. Data Retention",
      privacySection5Text:
        "We retain personal data only as long as necessary for the purposes stated in this policy or as required by law. Retention periods vary depending on the type of data:",
      privacySection5List1:
        "Contact information: Retained for the duration of the service relationship plus 7 years for accounting purposes",
      privacySection5List2:
        "Website analytics data: Retained for up to 26 months",
      privacySection5List3:
        "User preferences (language/theme): Stored locally on your device indefinitely until deleted",
      privacySection6Title: "6. Data Sharing and Disclosure",
      privacySection6Text:
        "We do not sell your personal data. We may share information with:",
      privacySection6List1:
        "Service Providers: Third parties who assist in providing services (under data processing agreements)",
      privacySection6List2:
        "Legal Authorities: When required by law or to protect rights and safety",
      privacySection6List3:
        "Business Transfers: In the event of merger, acquisition, or sale of assets",
      privacySection7Title: "7. Your Rights Under GDPR",
      privacySection7Text:
        "If you are in the EU/EEA, you have the following rights:",
      privacySection7List1:
        "Right to Access: Obtain a copy of the personal data we hold about you",
      privacySection7List2:
        "Right to Rectification: Correct inaccurate or incomplete personal data",
      privacySection7List3:
        'Right to Erasure ("Right to be Forgotten"): Request deletion of your personal data',
      privacySection7List4:
        "Right to Restrict Processing: Limit how we process your data",
      privacySection7List5:
        "Right to Data Portability: Receive your data in a portable format",
      privacySection7List6:
        "Right to Object: Object to processing of your data",
      privacySection7List7:
        "Right to Lodge a Complaint: File a complaint with your local data protection authority",
      privacySection8Title: "8. Data Security",
      privacySection8Text:
        "We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:",
      privacySection8List1: "SSL/TLS encryption for data in transit",
      privacySection8List2: "Secure authentication protocols",
      privacySection8List3: "Regular security audits and testing",
      privacySection8List4: "Restricted access to personal data",
      privacySection8List5: "Data protection training for staff",
      privacySection8Text2:
        "While we strive to protect your information, no security system is impenetrable, and we cannot guarantee absolute security.",
      privacySection9Title: "9. International Data Transfers",
      privacySection9Text:
        "If you access our website from outside the United States, your information may be transferred to, stored in, and processed in the United States or other countries. By providing information to us, you consent to such transfer. We ensure that international transfers are protected by appropriate safeguards, including Standard Contractual Clauses.",
      privacySection10Title: "10. Children's Privacy",
      privacySection10Text:
        "Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child without parental consent, we will delete such data immediately.",
      privacySection11Title: "11. Third-Party Links",
      privacySection11Text:
        "Our website may contain links to third-party websites. We are not responsible for the privacy practices of third-party sites. We encourage you to review the privacy policies of any third-party site before providing your personal information.",
      privacySection12Title: "12. Exercising Your Rights",
      privacySection12Text:
        "To exercise any of your privacy rights, please contact us using the information provided at the end of this policy. We will respond to your request within 30 days (or as required by applicable law). You may need to provide identification to verify your request.",
      privacySection13Title: "13. Data Protection Officer",
      privacySection13Text:
        "If you have questions about our privacy practices or wish to exercise your rights under GDPR, you may contact our Data Protection Officer through the contact information provided on our Contact page.",
      privacySection14Title: "14. Updates to This Privacy Policy",
      privacySection14Text:
        'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. The "Last Updated" date at the bottom of this policy indicates when it was last revised. Continued use of our website following changes means you accept the updated policy.',
      privacySection15Title: "15. Contact Us",
      privacySection15Text:
        "For privacy inquiries, GDPR requests, or to exercise your data rights, please contact us through our Contact page or using the contact information provided on the main website. We commit to addressing your concerns promptly.",
      privacyLastUpdated: "Last Updated: May 5, 2026",
    },
    es: {
      // Common
      home: "Inicio",
      about: "Acerca de",
      careers: "Carreras",
      contact: "Contacto",
      learning: "Aprendizaje",
      services: "Servicios",

      // Header/Nav
      brand: "Gabriel Services",
      tagline: "Tercerización, Entregada",

      // Browser page titles
      homePageTitle: "Gabriel Services | Tercerización, Entregada",
      aboutPageTitle: "Acerca de Gabriel Services",
      careersPageTitle: "Carreras | Gabriel Services",
      servicesPageTitle: "Gabriel Services | Descripción General de Servicios",
      logisticsServicePageTitle: "Operaciones Logísticas | Gabriel Services",
      adminServicePageTitle: "Back Office Administrativo | Gabriel Services",
      customerServicePageTitle:
        "Relaciones con Clientes | Gabriel Services",
      itServicePageTitle: "Soporte de TI | Gabriel Services",

      // Footer sections
      company: "Empresa",
      servicePagesLabel: "Páginas de Servicios",
      supportLearning: "Soporte y Aprendizaje",
      legal: "Legal",

      // Legal links
      termsConditions: "Términos y Condiciones",
      cookiesConsent: "Consentimiento de Cookies",
      privacyGdpr: "Privacidad y RGPD",

      // Services
      logisticsOps: "Operaciones Logísticas",
      adminBackOffice: "Back Office Administrativo",
      customerRelations: "Relaciones con Clientes",
      itSupport: "Soporte de TI",

      // Actualización de contenido operativo 2026
      aboutApproachCardText: "Ayudamos a las empresas a mejorar productividad, fortalecer la consistencia del servicio, proteger la confianza del cliente y mantener el trabajo diario avanzando con propiedad más clara y mejor seguimiento.",
      aboutApproachCardTitle: "Organizamos el trabajo que mantiene el negocio en movimiento.",
      aboutApproachEyebrow: "Nuestro enfoque",
      aboutApproachHeadline: "Basado en consistencia, claridad y ejecución práctica.",
      aboutApproachLead: "Nuestro enfoque se basa en consistencia, comunicación transparente, ejecución práctica y entrega de soporte consciente del costo.",
      aboutExploreApproach: "Explorar nuestro enfoque",
      aboutFocus1Eyebrow: "Ejecución diaria",
      aboutFocus1Item1: "Ejecución operativa diaria",
      aboutFocus1Item2: "Seguimiento de tareas",
      aboutFocus1Item3: "Coordinación de flujos",
      aboutFocus1Item4: "Reportes y actualizaciones de estado",
      aboutFocus1Text: "Ayudamos a mantener tareas, seguimientos, tickets, documentos, agendas y detalles operativos avanzando con estructura y consistencia.",
      aboutFocus1Title: "Ejecución confiable sin ruido operativo.",
      aboutFocus2Eyebrow: "Confianza del cliente",
      aboutFocus2Item1: "Comunicación con clientes",
      aboutFocus2Item2: "Seguimiento de tickets",
      aboutFocus2Item3: "Control de resolución",
      aboutFocus2Item4: "Cierre de casos",
      aboutFocus2Text: "Apoyamos comunicación, seguimiento, control de resolución, continuidad CSAT y enrutamiento de inquietudes para proteger la confianza del cliente.",
      aboutFocus2Title: "Los problemas de clientes no deben perderse en brechas.",
      aboutFocus3Eyebrow: "Estructura operativa",
      aboutFocus3Item1: "Seguimiento de flujos",
      aboutFocus3Item2: "Control de documentación",
      aboutFocus3Item3: "Coordinación de programación",
      aboutFocus3Item4: "Alineación de procesos",
      aboutFocus3Text: "Ayudamos a organizar flujos diarios, comunicación, documentación, programación, coordinación de proveedores y soporte interno.",
      aboutFocus3Title: "Las operaciones fragmentadas necesitan estructura.",
      aboutFocus4Eyebrow: "Enfoque en crecimiento",
      aboutFocus4Item1: "Soporte al liderazgo",
      aboutFocus4Item2: "Productividad mejorada",
      aboutFocus4Item3: "Fricción reducida",
      aboutFocus4Item4: "Soporte enfocado en crecimiento",
      aboutFocus4Text: "Al gestionar detalles operativos, ayudamos a liderazgo y equipos a recuperar tiempo, reducir fricción y enfocarse en crecimiento.",
      aboutFocus4Title: "Su equipo debe pasar menos tiempo apagando incendios.",
      aboutFocusHeadline: "Elija la prioridad operativa.",
      aboutFocusIntro: "Seleccione un área para mostrar cómo Gabriel Services apoya ejecución, comunicación, consistencia y crecimiento.",
      aboutFocusOptions: "Opciones de enfoque de la página Acerca de",
      aboutFocusTab1: "Ejecución diaria",
      aboutFocusTab2: "Confianza del cliente",
      aboutFocusTab3: "Estructura operativa",
      aboutFocusTab4: "Enfoque en crecimiento",
      aboutHandle1Text: "Coordinación de despacho, continuidad de seguimiento, seguimiento operativo y visibilidad.",
      aboutHandle1Title: "Soporte de operaciones logísticas",
      aboutHandle2Text: "Programación, documentación, reportes, seguimiento de flujos y soporte administrativo diario.",
      aboutHandle2Title: "Ejecución de back office administrativo",
      aboutHandle3Text: "Comunicación con clientes, seguimiento de tickets, soporte CSAT, aclaración de facturación y seguimiento de resolución.",
      aboutHandle3Title: "Soporte de relaciones y comunicación con clientes",
      aboutHandle4Text: "Continuidad del servicio, actualizaciones de estado, visibilidad de escalaciones, notas de caso y cierre de asuntos.",
      aboutHandle4Title: "Seguimiento de operaciones de clientes",
      aboutHandle5Text: "Entrada de mesa de ayuda, solución de problemas, soporte de acceso, investigación de incidentes y propiedad de resolución.",
      aboutHandle5Title: "Soporte de TI — Nivel I y Nivel II",
      aboutHandle6Text: "Seguimiento operativo, reportes, coordinación y visibilidad de tareas en la actividad diaria del negocio.",
      aboutHandle6Title: "Coordinación de flujos y ejecución diaria",
      aboutHandleHeadline: "Soporte multifuncional para operaciones diarias.",
      aboutHeroEyebrow: "Acerca de Gabriel Services",
      aboutHeroLead1: "Gabriel Services es un socio de soporte operativo enfocado en ayudar a empresas modernas a mantenerse organizadas, ágiles y constantes en su ejecución diaria.",
      aboutHeroLead2: "Ofrecemos soporte multifuncional en operaciones logísticas, back office administrativo, relaciones con clientes, operaciones de clientes y soporte de TI.",
      aboutHeroTitle: "Soporte operativo para empresas modernas.",
      aboutIssue1Tag: "Confianza",
      aboutIssue1Text: "La confianza del cliente se debilita cuando preocupaciones, tareas, tickets u oportunidades no se gestionan con consistencia.",
      aboutIssue1Title: "Seguimientos perdidos",
      aboutIssue2Tag: "Claridad",
      aboutIssue2Text: "La resolución se retrasa cuando mensajes, actualizaciones, propiedad y próximos pasos no se gestionan claramente.",
      aboutIssue2Title: "Comunicación poco clara",
      aboutIssue3Tag: "Estructura",
      aboutIssue3Text: "La fricción operativa aumenta cuando tareas, documentos, programación, reportes y traspasos están fragmentados.",
      aboutIssue3Title: "Flujos de trabajo desorganizados",
      aboutIssue4Tag: "Ejecución",
      aboutIssue4Text: "El crecimiento se afecta cuando pequeños detalles operativos se pierden, retrasan o quedan sin seguimiento responsable.",
      aboutIssue4Title: "Detalles pasados por alto",
      aboutMetaDescription: "Gabriel Services es un socio de soporte operativo que ayuda a empresas modernas a mantenerse organizadas, ágiles y constantes mediante operaciones logísticas, back office administrativo, relaciones con clientes, operaciones de clientes y soporte de TI.",
      aboutOperatingSnapshot: "Resumen de filosofía operativa",
      aboutPhilosophyHeadline: "No complicamos las operaciones. Las organizamos.",
      aboutPhilosophyTitle: "Filosofía operativa",
      aboutProof1: "Ejecución diaria",
      aboutProof2: "Consistencia operativa",
      aboutProof3: "Comunicación transparente",
      aboutProof4: "Soporte consciente del costo",
      aboutProofLabel: "Aspectos destacados del soporte operativo",
      aboutResultHeadline: "Obtiene más con menos fricción.",
      aboutResultLead1: "Más claridad. Más estructura. Más seguimiento. Más consistencia operativa. Más tiempo para enfocarse en crecer en vez de apagar incendios.",
      aboutResultLead2: "Gabriel Services ayuda a empresas modernas a operar con mejor ritmo, mayor organización y ejecución diaria confiable.",
      aboutRoleText: "Entramos en los detalles operativos que frenan a los equipos, crean confusión o dejan oportunidades sin resolver; luego aportamos estructura, seguimiento y ejecución confiable.",
      aboutStatusExecution: "Ejecución",
      aboutStatusFollowup: "Seguimiento",
      aboutStatusPractical: "Práctico",
      aboutStatusReliable: "Confiable",
      aboutStatusStructure: "Estructura",
      aboutStatusSupport: "Soporte",
      aboutStepInEyebrow: "Dónde intervenimos",
      aboutStepInHeadline: "Ninguna oportunidad debe escaparse.",
      aboutStepInText: "Ayudamos a asegurar que cada tarea, seguimiento, inquietud del cliente, documento, agenda, ticket y detalle operativo se gestione con estructura para que su negocio siga enfocado, ágil y funcionando sin contratiempos.",
      aboutUnresolvedEyebrow: "Cuando las oportunidades quedan sin resolver",
      aboutUnresolvedHeadline: "Los problemas pequeños pueden convertirse silenciosamente en problemas mayores.",
      aboutUnresolvedText: "Seguimientos perdidos, comunicación poco clara, flujos desorganizados, detalles omitidos y ejecución inconsistente pueden afectar el crecimiento, la calidad del servicio, la confianza del cliente y la estabilidad del negocio.",
      aboutValue1Text: "Organizamos el trabajo, reducimos fricción operativa y ayudamos a su equipo a enfocarse en prioridades de mayor valor.",
      aboutValue1Title: "Mejorar productividad",
      aboutValue2Text: "Apoyamos un seguimiento más fuerte, propiedad más clara y ejecución diaria más confiable.",
      aboutValue2Title: "Aumentar consistencia",
      aboutValue3Text: "Ayudamos a prevenir comunicación perdida, seguimiento demorado e inquietudes de clientes sin resolver.",
      aboutValue3Title: "Proteger la confianza del cliente",
      aboutValue4Text: "Mantenemos actualizaciones, traspasos, notas y visibilidad de tareas más limpias en la operación.",
      aboutValue4Title: "Fortalecer el flujo de comunicación",
      aboutValue5Text: "Aportamos estructura a tareas, documentos, tickets, agendas y seguimientos internos dispersos.",
      aboutValue5Title: "Organizar flujos fragmentados",
      aboutValue6Text: "Nos enfocamos en una entrega práctica y eficiente que apoya las necesidades diarias sin complejidad innecesaria.",
      aboutValue6Title: "Entregar soporte consciente del costo",
      aboutValueEyebrow: "Cómo creamos valor",
      aboutValueHeadline: "Más estructura. Menos fricción.",
      aboutValueIntro: "Actuamos como un socio operativo confiable, integrándonos a su equipo y gestionando la ejecución para que usted no cargue solo con cada detalle operativo.",
      adminCoverage1: "Soporte administrativo ejecutivo",
      adminCoverage10: "Ejecución diaria de back office",
      adminCoverage2: "Coordinación de calendario y programación",
      adminCoverage3: "Gestión de correo electrónico y comunicación",
      adminCoverage4: "Organización y preparación de documentos",
      adminCoverage5: "Coordinación de proveedores",
      adminCoverage6: "Soporte operativo interno",
      adminCoverage7: "Planificación y coordinación de viajes",
      adminCoverage8: "Reportes y actualizaciones de estado",
      adminCoverage9: "Seguimiento de flujos administrativos",
      adminCoverageTitle: "Soporte de Back Office Administrativo",
      adminMetaDescription: "Soporte de back office administrativo para coordinación de flujos, documentación, programación, reportes, comunicación con proveedores, planificación de viajes y ejecución diaria.",
      adminOutcome: "Un ritmo operativo más limpio con mejor organización, mayor seguimiento, documentación más clara y soporte administrativo confiable para liderazgo y necesidades diarias del negocio.",
      adminServiceEyebrow: "Back Office Administrativo",
      adminServiceLead1: "Gestionamos los detalles operativos que mantienen al liderazgo enfocado y la actividad diaria avanzando con estructura, precisión y consistencia.",
      adminServiceLead2: "Nuestro soporte de back office administrativo cubre coordinación de flujos, documentación, programación, reportes, comunicación con proveedores, planificación de viajes y ejecución diaria para equipos en crecimiento.",
      adminServiceTitle: "Back Office Administrativo",
      coverageTitle: "Cobertura",
      customerCoverage1: "Gestión de comunicación con clientes",
      customerCoverage10: "Notas de caso y cierre de resolución",
      customerCoverage2: "Seguimiento de tickets y control de resolución",
      customerCoverage3: "Soporte de resolución en primer contacto",
      customerCoverage4: "Seguimientos de satisfacción del cliente — soporte CSAT",
      customerCoverage5: "Soporte de aclaración de facturación",
      customerCoverage6: "Soporte de oportunidades de upsell",
      customerCoverage7: "Recuperación de servicio y enrutamiento de inquietudes",
      customerCoverage8: "Actualizaciones de estado para clientes",
      customerCoverage9: "Visibilidad de escalaciones y seguimiento",
      customerCoverageTitle: "Soporte de Relaciones con Clientes",
      customerMetaDescription: "Soporte de relaciones con clientes para comunicación, seguimiento de tickets, control de resolución, aclaración de facturación, seguimientos de satisfacción, soporte de upsell y resolución en primer contacto.",
      customerOutcome: "Un ritmo de soporte al cliente más fuerte con comunicación más clara, seguimiento más rápido, mejor visibilidad de resolución y experiencia más consistente.",
      customerServiceEyebrow: "Relaciones con Clientes",
      customerServiceLead1: "Gestionamos comunicación con clientes, consistencia del servicio, seguimiento de tickets, control de resolución, aclaración de facturación, seguimientos de satisfacción, soporte de upsell y resolución en primer contacto.",
      customerServiceLead2: "Ayudamos a empresas a mantener la satisfacción del cliente, proteger la confianza del servicio y mantener cada asunto avanzando mediante un flujo claro de resolución.",
      dynamicFocusTitle: "Enfoque dinámico",
      exploreServices: "Explorar servicios",
      getCustomOptimizationPlan: "Obtener un plan de optimización personalizado",
      homeAdminLane: "Registros, programación y mantenimiento de procesos.",
      homeCustomerLane: "Comunicación, seguimiento y ritmo de servicio.",
      homeItLane: "Clasificación de tickets y gestión diaria de solicitudes.",
      homeLogisticsLane: "Continuidad de despacho y seguimiento.",
      homeMetaDescription: "Gabriel Services ofrece ejecución diaria confiable y soporte operativo en logística, relaciones con clientes, back office administrativo y soporte de TI.",
      itCoverageHeadline: "Líneas de soporte Nivel I y Nivel II.",
      itLevel1Item1: "Entrada de mesa de ayuda y creación de tickets",
      itLevel1Item2: "Solución básica de problemas",
      itLevel1Item3: "Soporte al usuario final",
      itLevel1Item4: "Asistencia de acceso a cuentas",
      itLevel1Item5: "Coordinación de escalación",
      itLevel1Title: "Soporte de Nivel I",
      itLevel2Item1: "Solución avanzada de problemas",
      itLevel2Item2: "Investigación de incidentes",
      itLevel2Item3: "Soporte de sistemas",
      itLevel2Item4: "Soporte de flujos de trabajo",
      itLevel2Item5: "Análisis de causa raíz",
      itLevel2Item6: "Propiedad de resolución después de escalación",
      itLevel2Title: "Soporte de Nivel II",
      itMetaDescription: "Soporte de TI estructurado para cobertura Nivel I y Nivel II, entrada de mesa de ayuda, creación de tickets, solución de problemas, asistencia de acceso, investigación de incidentes, soporte de sistemas, soporte de flujos, análisis de causa raíz y propiedad de resolución tras escalación.",
      itOutcome: "Soporte técnico más estructurado, visibilidad más clara de tickets y seguimiento confiable para solicitudes diarias de TI.",
      itServiceEyebrow: "Soporte de TI",
      itSnapshotHeadline: "Cobertura estructurada para necesidades técnicas diarias.",
      itSupportServiceIntroNew: "Ofrecemos cobertura de soporte técnico estructurada.",
      itSupportServiceLead2: "Desde la entrada de mesa de ayuda hasta el seguimiento de solución avanzada, mantenemos las solicitudes técnicas organizadas, visibles y avanzando hacia la resolución.",
      itSupportServiceTitleNew: "Soporte de TI (Nivel I y Nivel II)",
      logisticsCoverage1: "Coordinación de despacho",
      logisticsCoverage2: "Continuidad de seguimiento",
      logisticsCoverage3: "Coordinación de documentación",
      logisticsCoverage4: "Seguimiento a transportistas",
      logisticsCoverage5: "Actualizaciones de estado para clientes",
      logisticsCoverage6: "Visibilidad de excepciones",
      logisticsCoverage7: "Soporte de cronogramas",
      logisticsCoverage8: "Reportes operativos",
      logisticsCoverageTitle: "Soporte de Operaciones Logísticas",
      logisticsMetaDescription: "Soporte de operaciones logísticas para coordinación de despacho, seguimiento, documentación, seguimiento a transportistas y clientes, visibilidad de excepciones y actualizaciones de estado.",
      logisticsOutcome: "Actividad logística más visible, seguimiento más claro, documentación más fuerte y soporte confiable para despacho, seguimiento y actualizaciones operativas.",
      logisticsServiceEyebrow: "Operaciones Logísticas",
      logisticsServiceLead1: "Gabriel Services apoya flujos logísticos con coordinación de despacho, continuidad de seguimiento, documentación y visibilidad de estado.",
      logisticsServiceLead2: "Ayudamos a mantener la actividad de envíos avanzando con seguimiento a transportistas y clientes, visibilidad de excepciones y actualizaciones operativas prácticas.",
      mainNavigation: "Navegación principal",
      outcomeTitle: "Resultado",
      serviceFocus1Text: "Organizamos solicitudes, actualizaciones, traspasos y próximos pasos para que el trabajo de soporte tenga responsabilidad clara.",
      serviceFocus1Title: "Coordinar las piezas móviles diarias.",
      serviceFocus2Text: "Mantenemos visibilidad sobre elementos abiertos, respuestas pendientes, escalaciones y estado de resolución.",
      serviceFocus2Title: "Dar seguimiento hasta la finalización.",
      serviceFocus3Text: "Mantenemos actualizaciones de estado claras y prácticas para que los líderes vean el progreso sin perseguir detalles.",
      serviceFocus3Title: "Reportar lo que importa.",
      serviceFocusHeadline: "Soporte enfocado para los detalles que necesitan movimiento.",
      serviceFocusTab1: "Coordinar",
      serviceFocusTab2: "Dar seguimiento",
      serviceFocusTab3: "Reportar",
      serviceHandlingHeadline: "Entrada clara, seguimiento organizado y estado visible.",
      serviceHandlingText: "Nos alineamos con su flujo de trabajo, gestionamos los detalles diarios y mantenemos una comunicación práctica para que el trabajo no se detenga entre traspasos.",
      serviceHandlingTitle: "Gestión del servicio",
      serviceOverviewAdminDescNew: "Registros, programación, reportes, comunicación con proveedores, seguimiento de flujos y ejecución diaria de back office.",
      serviceOverviewCustomerDescNew: "Comunicación, seguimiento, control de resolución de tickets, soporte de satisfacción del cliente y ritmo de servicio.",
      serviceOverviewIntroNew: "Cuatro líneas de servicio diseñadas para mantener la actividad diaria del negocio organizada, ágil y en movimiento con ejecución confiable.",
      serviceOverviewItDescNew: "Entrada de mesa de ayuda, clasificación de tickets, solución de problemas, asistencia de acceso y soporte estructurado Nivel I / Nivel II.",
      serviceOverviewLogisticsDescNew: "Despacho, seguimiento, documentación, seguimiento a transportistas/clientes, visibilidad de excepciones y actualizaciones de estado.",
      servicePanelNote: "Soporte estructurado que mantiene el trabajo visible, coordinado y avanzando hacia la resolución.",
      serviceSnapshotTitle: "Resumen del servicio",
      servicesCtaHeadline: "Comience con la línea operativa que necesita más soporte.",
      servicesCtaText: "Podemos comenzar con un área de soporte y expandir a medida que sus flujos, seguimientos y necesidades de ejecución diaria se vuelvan más claros.",
      servicesMetaDescription: "Explore las líneas de soporte de Gabriel Services para operaciones logísticas, back office administrativo, relaciones con clientes y soporte de TI.",

      // Legal page titles
      termsTitle: "Términos y Condiciones",
      cookiesTitle: "Política de consentimiento de cookies",
      privacyTitle: "Privacidad y RGPD",

      // Theme & Language toggles
      lightTheme: "Claro",
      darkTheme: "Oscuro",
      languageLabel: "Idioma",
      languageSelector: "Selector de idioma",
      mobileNavigation: "Navegación móvil",
      switchToEnglish: "Cambiar a inglés",
      switchToSpanish: "Cambiar a español",
      themeLabelText: "Tema",

      // Footer meta
      copyright: "© 2026 Gabriel Services",

      // Home page
      homeTagline: "TERCERIZACIÓN, ENTREGADA",
      homeH1:
        "Ejecución confiable día a día,<br/>Soporte operativo excepcional para negocios modernos.",
      homeDescription:
        "Gabriel Services proporciona Logística, Relaciones con Clientes, Back Office Administrativo y Soporte de TI — integrando experiencia, coordinación, gestión de operaciones, satisfacción del cliente y soporte de PC / escritorio.<br/><br/>Ejecutamos el día a día para que su equipo pueda enfocarse en impulsar el crecimiento.",
      bookConsultation: "Iniciar una conversación",
      seeServiceCoverage: "Resumen de servicios",
      processeDriven: "Operaciones impulsadas por procesos",
      practicalTransparent:
        "Práctico, transparente, ágil y alineado con su ritmo operativo.",
      serviceAreasBuilt: "Áreas de servicio diseñadas para la ejecución diaria",
      logisticsDesc: "Continuidad de despacho y seguimiento para movimiento de envíos, actualizaciones operativas, seguimiento de transportistas y protección de tiempos.",
      adminDesc: "Documentación, programación, reportes, coordinación con proveedores, planificación de viajes y ejecución diaria de back office.",
      customerRelDesc: "Comunicación con clientes, seguimiento de tickets, soporte CSAT, aclaración de facturación, soporte de oportunidades de venta adicional y flujo de resolución.",
      itSupportDesc: "Soporte de Nivel I y Nivel II para recepción de mesa de ayuda, solución de problemas, asistencia de acceso, investigación de incidentes, soporte de flujos de trabajo y propiedad de resolución.",
      exploreService: "Explorar servicio",
      sitemap: "Mapa del sitio",
      servicesOverview: "Descripción General de Servicios",
      serviceOverviewTitle: "Descripción General de Servicios",
      serviceOverviewIntro:
        "Gabriel Services brinda soporte operativo profesional en cuatro áreas principales. Cada servicio está diseñado para reducir la fricción, mejorar la consistencia y permitir que tu equipo se enfoque en lo más importante.",
      serviceOverviewLogisticsDesc:
        "Coordinación estructurada, seguimiento de envíos y continuidad operativa para actividades de la cadena de suministro.",
      serviceOverviewAdminDesc:
        "Documentación, gestión de calendarios, reportes y disciplina de procesos para mantener tu negocio funcionando sin problemas.",
      serviceOverviewCustomerDesc:
        "Comunicaciones con clientes, resolución de problemas y flujos de seguimiento diseñados para mejorar la satisfacción y la retención.",
      serviceOverviewItDesc:
        "Soporte técnico estructurado de Nivel I y Nivel II para recepción, solución de problemas, asistencia de acceso, escalamiento y responsabilidad de resolución.",
      whyBusinessesTitle: "Por qué las empresas trabajan con Gabriel Services",
      whyBusinessesText:
        "Las empresas eligen Gabriel Services por su ejecución práctica, comunicación clara y soporte diario constante que ayuda a los equipos a mantenerse enfocados en el crecimiento.",
      startSupportTitle: "Comience con el soporte que espera",
      requestConsultation: "Comience con el soporte que espera",
      viewEngagementOptions: "Contáctenos",


      serviceDetailEyebrowAdmin: "Carril de Servicio 02",
      serviceDetailEyebrowCustomer: "Carril de Servicio 03",
      serviceDetailEyebrowIt: "Carril de Servicio 04",
      coverageEyebrow: "Cobertura",
      serviceLanesEyebrow: "Carriles operativos",
      workflowEyebrow: "Flujo de trabajo",
      dynamicFocusEyebrow: "Enfoque dinámico",
      outcomeEyebrow: "Resultado",
      selectedPriorityEyebrow: "Prioridad seleccionada",
      customOptimizationPlanCta: "Obtén un plan de optimización personalizado",
      viewCoverageCta: "Ver cobertura",
      adminDetailTitle: "Back Office Administrativo",
      adminDetailHeroCopy: "Gestionamos los detalles operativos que mantienen al liderazgo enfocado y la actividad diaria del negocio avanzando con estructura, precisión y consistencia.",
      adminDetailSecondaryCopy: "Nuestro soporte de back office administrativo cubre coordinación de flujos de trabajo, documentación, programación, reportes, comunicación con proveedores, planificación de viajes y ejecución diaria para equipos en crecimiento.",
      adminProofStripAria: "Puntos de prueba del soporte administrativo",
      adminProofPill1: "Registros preparados",
      adminProofPill2: "Calendarios alineados",
      adminProofPill3: "Seguimientos activos",
      adminCommandPanelAria: "Resumen de back office",
      adminSnapshotEyebrow: "Resumen de Back Office",
      adminSnapshotTitle: "Estructura detrás de la operación visible.",
      adminStatusRecords: "Registros",
      adminStatusClean: "Limpios",
      adminStatusScheduling: "Programación",
      adminStatusAligned: "Alineada",
      adminStatusFollowUp: "Seguimiento",
      adminStatusActive: "Activo",
      adminCoverageTitle: "Lo que gestiona este servicio",
      adminSupportStatement: "Apoyamos al liderazgo y las operaciones diarias manteniendo tareas organizadas, registros preparados, calendarios alineados y seguimientos internos en movimiento sin interrupciones.",
      adminCoverage1: "Soporte administrativo ejecutivo",
      adminCoverage2: "Coordinación de calendario y programación",
      adminCoverage3: "Gestión de correo electrónico y comunicación",
      adminCoverage4: "Organización y preparación de documentos",
      adminCoverage5: "Coordinación con proveedores",
      adminCoverage6: "Soporte operativo interno",
      adminCoverage7: "Planificación y coordinación de viajes",
      adminCoverage8: "Reportes y actualizaciones de estado",
      adminCoverage9: "Seguimiento de flujos administrativos",
      adminCoverage10: "Ejecución diaria de back office",
      adminLanesTitle: "Tres formas en que creamos ritmo administrativo",
      adminLane1Title: "Soporte ejecutivo",
      adminLane1Text: "Coordinación de calendario, planificación de viajes, preparación de reuniones y asistencia diaria al liderazgo.",
      adminLane1Tag: "Liderazgo",
      adminLane2Title: "Documentación y registros",
      adminLane2Text: "Archivos preparados, registros organizados, soporte de reportes, notas de proceso y recuperación más sencilla.",
      adminLane2Tag: "Estructura",
      adminLane3Title: "Coordinación interna y con proveedores",
      adminLane3Text: "Gestión de comunicación, verificaciones de estado, enrutamiento de tareas y seguimiento entre interesados.",
      adminLane3Tag: "Coordinación",
      adminProcessTitle: "Cómo avanza el soporte administrativo",
      adminProcess1: "Recibir la tarea o solicitud de soporte.",
      adminProcess2: "Aclarar responsable, fecha límite y detalles requeridos.",
      adminProcess3: "Preparar registros, elementos de calendario o documentación.",
      adminProcess4: "Coordinar seguimiento con las partes interesadas.",
      adminProcess5: "Cerrar el ciclo con actualizaciones claras de estado.",
      adminFocusTitle: "Elige la prioridad de back office",
      adminFocusIntro: "Selecciona el área operativa que deseas fortalecer primero.",
      adminFocusTabsAria: "Opciones de enfoque administrativo",
      adminFocusTabExecutive: "Soporte Ejecutivo",
      adminFocusTabRecords: "Registros y Documentos",
      adminFocusTabCoordination: "Flujo de Coordinación",
      adminOutcomeTitle: "Un ritmo operativo más limpio",
      adminOutcomeText: "Un ritmo operativo más limpio con mayor organización, mejor seguimiento, documentación más clara y soporte administrativo confiable para el liderazgo y las necesidades diarias del negocio.",
      customerDetailTitle: "Relaciones con Clientes",
      customerDetailHeroCopy: "Gestionamos comunicación con clientes, consistencia del servicio, seguimiento de tickets, control de resolución, aclaración de facturación, seguimientos de satisfacción, soporte de upsell y resolución en el primer contacto.",
      customerSupportStatement: "Ayudamos a las empresas a mantener la satisfacción del cliente, proteger la confianza en el servicio y mantener cada situación avanzando mediante un flujo claro de resolución.",
      customerProofStripAria: "Puntos de prueba de relaciones con clientes",
      customerProofPill1: "Tickets rastreados",
      customerProofPill2: "CSAT apoyado",
      customerProofPill3: "Casos cerrados",
      customerCommandPanelAria: "Resumen de relaciones con clientes",
      customerSnapshotEyebrow: "Resumen de Clientes",
      customerSnapshotTitle: "Flujo de resolución con propiedad visible.",
      customerStatusTickets: "Tickets",
      customerStatusTracked: "Rastreados",
      customerStatusCSAT: "CSAT",
      customerStatusActive: "Activo",
      customerStatusClosure: "Cierre",
      customerStatusVisible: "Visible",
      customerCoverageTitle: "Lo que gestiona este servicio",
      customerCoverageIntro: "El soporte de relaciones con clientes mantiene la comunicación clara, el seguimiento oportuno y los detalles de resolución visibles desde la recepción hasta el cierre.",
      customerCoverage1: "Gestión de comunicación con clientes",
      customerCoverage2: "Seguimiento de tickets y control de resolución",
      customerCoverage3: "Soporte de resolución en el primer contacto",
      customerCoverage4: "Seguimientos de satisfacción del cliente — soporte CSAT",
      customerCoverage5: "Soporte de aclaración de facturación",
      customerCoverage6: "Soporte de oportunidades de venta adicional",
      customerCoverage7: "Recuperación de servicio y enrutamiento de inquietudes",
      customerCoverage8: "Actualizaciones de estado al cliente",
      customerCoverage9: "Visibilidad de escalaciones y seguimiento",
      customerCoverage10: "Notas de caso y cierre de resolución",
      customerLanesTitle: "Tres formas en que protegemos la confianza del cliente",
      customerLane1Title: "Ritmo de comunicación",
      customerLane1Text: "Actualizaciones receptivas, notas claras y seguimiento de cara al cliente.",
      customerLane1Tag: "Claridad",
      customerLane2Title: "Visibilidad de resolución",
      customerLane2Text: "Estado de tickets, rutas de escalación, recuperación de servicio y señales de propiedad.",
      customerLane2Tag: "Visibilidad",
      customerLane3Title: "Seguimiento de satisfacción",
      customerLane3Text: "Soporte CSAT, revisión de inquietudes, soporte de oportunidades de upsell y notas de cierre.",
      customerLane3Tag: "Retención",
      customerProcessTitle: "Cómo avanzan los asuntos de clientes",
      customerProcess1: "Capturar la consulta, ticket o inquietud.",
      customerProcess2: "Aclarar detalles de facturación, servicio o resolución.",
      customerProcess3: "Enrutar inquietudes y coordinar visibilidad de escalación.",
      customerProcess4: "Dar seguimiento con clientes y responsables internos.",
      customerProcess5: "Cerrar casos con notas y confirmación de resolución.",
      customerFocusTitle: "Elige la prioridad del cliente",
      customerFocusIntro: "Selecciona el flujo de clientes que tu equipo quiere fortalecer.",
      customerFocusTabsAria: "Opciones de enfoque de clientes",
      customerFocusTabCommunication: "Gestión de Comunicación",
      customerFocusTabResolution: "Control de Resolución",
      customerFocusTabSatisfaction: "CSAT y Recuperación",
      customerOutcomeTitle: "Un ritmo de soporte al cliente más fuerte",
      customerOutcomeText: "Un ritmo de soporte al cliente más fuerte con comunicación más clara, seguimiento más rápido, mayor visibilidad de resolución y una experiencia del cliente más consistente.",
      itDetailTitle: "Soporte de TI (Nivel I y Nivel II)",
      itDetailHeroCopy: "Brindamos cobertura de soporte técnico estructurada para asistencia de primera línea, solución de problemas más profunda, revisión de incidentes, soporte de flujos de trabajo y propiedad posterior a escalaciones.",
      itProofStripAria: "Puntos de prueba de soporte de TI",
      itProofPill1: "Recepción atendida",
      itProofPill2: "Incidencias enrutadas",
      itProofPill3: "Resolución rastreada",
      itCommandPanelAria: "Resumen de soporte de TI",
      itSnapshotEyebrow: "Resumen de Soporte",
      itSnapshotTitle: "Una ruta visible desde la recepción hasta la resolución.",
      itStatusIntake: "Recepción",
      itStatusReady: "Lista",
      itStatusTroubleshooting: "Diagnóstico",
      itStatusStructured: "Estructurado",
      itStatusEscalation: "Escalación",
      itStatusOwned: "Asignada",
      itCoverageTitle: "Cobertura de soporte Nivel I y Nivel II",
      itCoverageIntro: "El soporte técnico estructurado mantiene cada solicitud visible, enrutada y con responsable desde la primera recepción hasta la resolución final.",
      itLevelOneTitle: "Soporte Nivel I",
      itLevelOne1: "Recepción de mesa de ayuda y creación de tickets",
      itLevelOne2: "Solución básica de problemas",
      itLevelOne3: "Soporte al usuario final",
      itLevelOne4: "Asistencia de acceso a cuentas",
      itLevelOne5: "Coordinación de escalaciones",
      itLevelTwoTitle: "Soporte Nivel II",
      itLevelTwo1: "Solución avanzada de problemas",
      itLevelTwo2: "Investigación de incidentes",
      itLevelTwo3: "Soporte de sistemas",
      itLevelTwo4: "Soporte de flujos de trabajo",
      itLevelTwo5: "Análisis de causa raíz",
      itLevelTwo6: "Propiedad de resolución después de escalación",
      itLanesTitle: "Carriles de soporte con propiedad clara",
      itLane1Title: "Asistencia de primera línea",
      itLane1Text: "Recepción de mesa de ayuda, creación de tickets, soporte al usuario final y asistencia de acceso.",
      itLane1Tag: "Nivel I",
      itLane2Title: "Solución de problemas más profunda",
      itLane2Text: "Solución avanzada, investigación de incidentes, soporte de sistemas y soporte de flujos de trabajo.",
      itLane2Tag: "Nivel II",
      itLane3Title: "Propiedad posterior a escalación",
      itLane3Text: "Análisis de causa raíz, propiedad de resolución después de escalación y visibilidad de cierre.",
      itLane3Tag: "Propiedad",
      itProcessTitle: "Cómo avanzan los asuntos de TI",
      itProcess1: "Abrir el ticket y capturar el contexto del problema.",
      itProcess2: "Clasificar la solicitud e identificar el nivel de soporte.",
      itProcess3: "Diagnosticar, investigar o coordinar la escalación.",
      itProcess4: "Gestionar estado posterior a escalación y actualizaciones al usuario.",
      itProcess5: "Confirmar resolución y cerrar el ciclo.",
      itFocusTitle: "Elige la prioridad de soporte",
      itFocusIntro: "Selecciona el flujo de soporte técnico que tu equipo necesita estabilizar.",
      itFocusTabsAria: "Opciones de enfoque de soporte de TI",
      itFocusTabLevelOne: "Recepción Nivel I",
      itFocusTabLevelTwo: "Diagnóstico Nivel II",
      itFocusTabOwnership: "Propiedad de Resolución",
      itOutcomeTitle: "Cada incidencia tiene una ruta",
      itOutcomeText: "Cada incidencia tiene una ruta, un estado y un responsable — desde la primera recepción hasta la resolución final.",
      serviceFocusAdminExecutiveTitle: "Soporte Ejecutivo",
      serviceFocusAdminExecutiveText: "Asistencia práctica para calendarios, planificación de viajes, programación, seguimiento y coordinación diaria del liderazgo.",
      serviceFocusAdminExecutiveItem1: "Coordinación de calendario",
      serviceFocusAdminExecutiveItem2: "Planificación de viajes",
      serviceFocusAdminExecutiveItem3: "Soporte de correo electrónico",
      serviceFocusAdminExecutiveItem4: "Preparación de reuniones",
      serviceFocusAdminExecutiveItem5: "Seguimiento de tareas",
      serviceFocusAdminExecutiveItem6: "Gestión documental",
      serviceFocusAdminRecordsTitle: "Registros y Documentos",
      serviceFocusAdminRecordsText: "Flujo documental más limpio para empresas en crecimiento que necesitan orden, estructura y recuperación sencilla.",
      serviceFocusAdminRecordsItem1: "Mantenimiento de registros",
      serviceFocusAdminRecordsItem2: "Preparación de documentos",
      serviceFocusAdminRecordsItem3: "Organización de archivos",
      serviceFocusAdminRecordsItem4: "Notas de proceso",
      serviceFocusAdminRecordsItem5: "Actualizaciones de datos",
      serviceFocusAdminRecordsItem6: "Referencias internas",
      serviceFocusAdminCoordinationTitle: "Flujo de Coordinación",
      serviceFocusAdminCoordinationText: "Soporte para comunicación con proveedores, solicitudes internas, traspasos, seguimientos y continuidad operativa diaria.",
      serviceFocusAdminCoordinationItem1: "Seguimiento con proveedores",
      serviceFocusAdminCoordinationItem2: "Coordinación interna",
      serviceFocusAdminCoordinationItem3: "Verificaciones de estado",
      serviceFocusAdminCoordinationItem4: "Enrutamiento de tareas",
      serviceFocusAdminCoordinationItem5: "Soporte de comunicación",
      serviceFocusAdminCoordinationItem6: "Continuidad de flujo",
      serviceFocusCustomerCommunicationTitle: "Gestión de Comunicación",
      serviceFocusCustomerCommunicationText: "Mantén cada punto de contacto claro, oportuno y documentado para proteger mejor la confianza en el servicio.",
      serviceFocusCustomerCommunicationItem1: "Gestión de comunicación con clientes",
      serviceFocusCustomerCommunicationItem2: "Actualizaciones de estado",
      serviceFocusCustomerCommunicationItem3: "Notas de caso",
      serviceFocusCustomerCommunicationItem4: "Aclaración de facturación",
      serviceFocusCustomerCommunicationItem5: "Enrutamiento de inquietudes",
      serviceFocusCustomerCommunicationItem6: "Cadencia de seguimiento",
      serviceFocusCustomerResolutionTitle: "Control de Resolución",
      serviceFocusCustomerResolutionText: "Mantén visibilidad desde el seguimiento de tickets hasta la escalación, propiedad, notas de resolución y cierre final.",
      serviceFocusCustomerResolutionItem1: "Seguimiento de tickets",
      serviceFocusCustomerResolutionItem2: "Control de resolución",
      serviceFocusCustomerResolutionItem3: "Soporte de primer contacto",
      serviceFocusCustomerResolutionItem4: "Visibilidad de escalación",
      serviceFocusCustomerResolutionItem5: "Recuperación de servicio",
      serviceFocusCustomerResolutionItem6: "Cierre de resolución",
      serviceFocusCustomerSatisfactionTitle: "CSAT y Recuperación",
      serviceFocusCustomerSatisfactionText: "Apoya seguimientos de satisfacción, momentos de recuperación y oportunidades de upsell sin perder disciplina de resolución.",
      serviceFocusCustomerSatisfactionItem1: "Soporte CSAT",
      serviceFocusCustomerSatisfactionItem2: "Seguimientos de satisfacción",
      serviceFocusCustomerSatisfactionItem3: "Soporte de oportunidades de upsell",
      serviceFocusCustomerSatisfactionItem4: "Revisiones de confianza del cliente",
      serviceFocusCustomerSatisfactionItem5: "Notas de retroalimentación",
      serviceFocusCustomerSatisfactionItem6: "Ritmo de retención",
      serviceFocusItLevelOneTitle: "Recepción Nivel I",
      serviceFocusItLevelOneText: "Cobertura de primera línea para el primer momento en que un usuario necesita asistencia, soporte de acceso o visibilidad de ticket.",
      serviceFocusItLevelOneItem1: "Recepción de mesa de ayuda",
      serviceFocusItLevelOneItem2: "Creación de tickets",
      serviceFocusItLevelOneItem3: "Solución básica de problemas",
      serviceFocusItLevelOneItem4: "Soporte al usuario final",
      serviceFocusItLevelOneItem5: "Asistencia de acceso a cuentas",
      serviceFocusItLevelTwoTitle: "Diagnóstico Nivel II",
      serviceFocusItLevelTwoText: "Revisión técnica más profunda para incidentes que requieren investigación, soporte de sistemas, soporte de flujos de trabajo y diagnóstico práctico.",
      serviceFocusItLevelTwoItem1: "Solución avanzada de problemas",
      serviceFocusItLevelTwoItem2: "Investigación de incidentes",
      serviceFocusItLevelTwoItem3: "Soporte de sistemas",
      serviceFocusItLevelTwoItem4: "Soporte de flujos de trabajo",
      serviceFocusItLevelTwoItem5: "Análisis de causa raíz",
      serviceFocusItLevelTwoItem6: "Coordinación de escalación",
      serviceFocusItOwnershipTitle: "Propiedad de Resolución",
      serviceFocusItOwnershipText: "La propiedad posterior a escalación mantiene el estado, la comunicación con usuarios y la resolución final siempre visibles.",
      serviceFocusItOwnershipItem1: "Propiedad de resolución después de escalación",
      serviceFocusItOwnershipItem2: "Actualizaciones de estado",
      serviceFocusItOwnershipItem3: "Confirmación de cierre",
      serviceFocusItOwnershipItem4: "Visibilidad de la ruta del problema",
      serviceFocusItOwnershipItem5: "Traspaso enfocado en el usuario",

      howWeWorkTitle: "Cómo trabajamos",
      howWeWorkHeadline:
        "Evaluación → Integración → Ejecución → Monitoreo → Optimización",
      howWeWorkIntro:
        "Nos integramos a su ritmo operativo con un proceso claro que mantiene el soporte práctico, visible y en mejora continua.",
      assessmentStep: "Evaluación",
      integrationStep: "Integración",
      executionStep: "Ejecución",
      monitoringStep: "Monitoreo",
      optimizationStep: "Optimización",
      assessmentStepText:
        "Comprender el trabajo diario, brechas de soporte, puntos de fricción y prioridades operativas.",
      integrationStepText:
        "Alinear con su flujo de trabajo, estilo de comunicación, sistemas y estándares de ejecución.",
      executionStepText:
        "Gestionar el soporte diario con consistencia, precisión, comunicación y seguimiento.",
      monitoringStepText:
        "Dar seguimiento a la actividad de soporte, actualizaciones de estado, ritmo de servicio y visibilidad operativa.",
      optimizationStepText:
        "Mejorar flujos de trabajo, reducir fricción, fortalecer la calidad del soporte y refinar la ejecución.",
      costConsciousSupportTitle: "Soporte consciente del costo",
      costConsciousSupportHeadline:
        "Soporte que tiene sentido para empresas en crecimiento.",
      costConsciousSupportText:
        "Todo a un costo que tiene sentido para empresas en crecimiento — sin sobrecarga empresarial y sin contratos innecesarios.",
      operationalSnapshotTitle: "Resumen operativo",
      operationalSnapshotText:
        "Práctico, transparente, ágil y alineado con su ritmo operativo.",
      noEnterpriseOverheadText: "Sin sobrecarga empresarial",
      finalCtaTitle: "¿Listo para comenzar?",
      finalCtaText:
        "¿Ya lo mencionamos? Todo a un costo que tiene sentido para empresas en crecimiento — sin sobrecarga empresarial y sin contratos innecesarios.",
      startExpectedSupport: "Comience con el soporte que espera",
      contactUs: "Contáctenos",
      gabrielHighlights: "Aspectos destacados de Gabriel Services",
      proofPracticalExecution: "Ejecución práctica",
      proofClearCommunication: "Comunicación clara",
      proofResponsiveSupport: "Soporte ágil",
      statusClear: "Claro",
      statusAligned: "Alineado",
      statusConsistent: "Constante",
      statusOngoing: "Continuo",
      serviceAreasIntro:
        "Gabriel Services apoya las áreas operativas que mantienen a las empresas modernas organizadas, ágiles y consistentes.",
      whyBusinessesHeadline:
        "Ejecución práctica, comunicación clara y soporte constante.",
      practicalExecutionText:
        "Nos enfocamos en el trabajo que debe realizarse, sin complicar el proceso innecesariamente.",
      transparentCommunicationTitle: "Comunicación transparente",
      transparentCommunicationText:
        "Mantenemos actualizaciones claras, tareas visibles y actividad de soporte más fácil de seguir.",
      responsiveSupportText:
        "Ayudamos a que las operaciones diarias avancen con mejor seguimiento y ritmo.",
      alignedOperationsTitle: "Operaciones alineadas",
      alignedOperationsText:
        "Nos integramos a su flujo de trabajo y nos adaptamos a la forma en que opera su negocio.",
      growthFocusTitle: "Enfoque en crecimiento",
      growthFocusText:
        "Manejamos el día a día para que su equipo interno pueda enfocarse en trabajo de mayor valor.",
      costConsciousDeliveryTitle: "Entrega consciente del costo",
      costConsciousDeliveryText:
        "Soporte que tiene sentido para empresas en crecimiento, sin sobrecarga empresarial.",

      aboutTitle: "Acerca de",
      aboutIntro1:
        "Gabriel Services es un socio de soporte operativo enfocado en la ejecución diaria para negocios modernos.",
      aboutIntro2:
        "Ofrecemos soporte multifuncional en operaciones logísticas, back office administrativo, operaciones de atención al cliente y soporte de TI.",
      aboutIntro3:
        "Nuestro enfoque se basa en la consistencia, la comunicación transparente y la ejecución práctica.",
      aboutWhenIssuesTitle: "Cuando las oportunidades quedan sin resolver",
      aboutWhenIssuesText:
        "Los pequeños problemas operativos, cuando se ignoran, pueden dañar silenciosamente la confianza del cliente. Los detalles pasados por alto ralentizan el crecimiento, crean oportunidades perdidas y eventualmente afectan la estabilidad del negocio.",
      aboutThatIsWhereText: "Ahí es donde intervenimos.",
      aboutDetailsHandledText:
        "Nos aseguramos de que ninguna oportunidad se escape. Cada detalle se maneja para que su negocio se mantenga organizado, receptivo y funcione sin contratiempos.",
      aboutWhatWeHandleTitle: "Lo que manejamos",
      aboutWhatWeHandleText:
        "Intervenimos manejando los detalles y aportando estructura a operaciones fragmentadas. Nos integramos en sus flujos de trabajo, alineamos con sus procesos y nos enfocamos en la ejecución para que su equipo pueda centrarse en el crecimiento.",
      aboutApproachSimpleTitle: "Nuestro enfoque es simple:",
      aboutApproachItem1: "Mejoramos la productividad.",
      aboutApproachItem2: "Aumentamos la consistencia operativa.",
      aboutApproachItem3: "Entregamos ejecución de alta calidad.",
      aboutApproachItem4:
        "Operamos con una entrega de servicio práctica y consciente de los costos.",
      aboutApproachItem5:
        "Actuamos como un socio operativo confiable: integrándonos a su equipo y manejando la ejecución para que usted no tenga que hacerlo.",
      aboutResultTitle: "El resultado",
      aboutResult1: "Obtiene más con menos fricción.",
      aboutResult2: "Más claridad.",
      aboutResult3:
        "Más tiempo para centrarse en el crecimiento en lugar de apagar incendios.",
      aboutResult4:
        "Todo a un costo que tiene sentido para empresas en crecimiento: sin gastos generales empresariales y sin contratos.",
      aboutSupportTitle: "Lo que apoyamos",
      aboutSupportText: "Nos enfocamos en cuatro áreas operativas:",
      aboutSupportArea1: "Logística",
      aboutSupportArea2: "Relaciones con Clientes",
      aboutSupportArea3: "Back Office Administrativo",
      aboutSupportArea4: "Soporte de TI (Nivel I y Nivel II)",
      aboutOurServicesTitle: "Nuestros Servicios",
      aboutLogisticsOperationsTitle: "Operaciones Logísticas",
      aboutLogisticsOperationsText:
        "Ayudamos a mantener su logística organizada, visible y en movimiento:",
      aboutLogisticsList1: "Coordinación de despacho",
      aboutLogisticsList2:
        "Seguimiento de envíos (marítimo, aéreo y terrestre)",
      aboutLogisticsList3: "Comunicación con clientes y seguimientos",
      aboutLogisticsList4: "Soporte de facturación y cobro",
      aboutLogisticsList5: "Coordinación de documentación",
      aboutCustomerRelationsTitle: "Relaciones con Clientes",
      aboutCustomerRelationsText:
        "Ayudamos a mantener la satisfacción del cliente y el flujo de resolución:",
      aboutCustomerRelationsList1: "Seguimiento de tickets y resolución",
      aboutCustomerRelationsList2:
        "Seguimientos de satisfacción del cliente (soporte CSAT)",
      aboutCustomerRelationsList3: "Soporte de aclaración de facturación",
      aboutCustomerRelationsList4:
        "Soporte de resolución en el primer contacto",
      aboutCustomerRelationsList5: "Gestión de la comunicación con el cliente",
      aboutAdminBackOfficeTitle: "Back Office Administrativo",
      aboutAdminBackOfficeText:
        "Apoyamos el liderazgo y las operaciones diarias del negocio:",
      aboutAdminBackOfficeList1: "Soporte administrativo ejecutivo",
      aboutAdminBackOfficeList2: "Coordinación de calendario y programación",
      aboutAdminBackOfficeList3: "Gestión de correo y comunicación",
      aboutAdminBackOfficeList4: "Organización y preparación de documentos",
      aboutAdminBackOfficeList5: "Coordinación de proveedores",
      aboutAdminBackOfficeList6: "Soporte operativo interno",
      aboutAdminBackOfficeList7: "Planificación y coordinación de viajes",
      aboutITSupportTitle: "Soporte de TI (Nivel I y Nivel II)",
      aboutITSupportText: "Ofrecemos cobertura técnica estructurada:",
      aboutLevel1Title: "Soporte de Nivel I",
      aboutLevel1List1: "Entrada de mesa de ayuda y creación de tickets",
      aboutLevel1List2: "Solución básica de problemas",
      aboutLevel1List3: "Soporte al usuario final",
      aboutLevel1List4: "Asistencia con acceso a cuentas",
      aboutLevel1List5: "Coordinación de escalamiento",
      aboutLevel2Title: "Soporte de Nivel II",
      aboutLevel2List1: "Solución avanzada de problemas",
      aboutLevel2List2: "Investigación de incidentes",
      aboutLevel2List3: "Soporte de sistemas y flujos de trabajo",
      aboutLevel2List4: "Análisis de causa raíz",
      aboutLevel2List5: "Responsabilidad de resolución después de la escalada",

      contactTitle: "Contacto",
      contactMetaDescription:
        "Contacta a Gabriel Services para soporte, incorporación, proyectos y oportunidades de colaboración.",
      honeypotWebsiteLabel: "Sitio web",
      contactProtectionUnavailable: "El módulo de protección de contacto no está disponible.",
      contactFullNameRequired: "Ingresa tu nombre completo.",
      contactEmailRequired: "Ingresa una dirección de correo electrónico válida.",
      contactMessageRequired: "Ingresa un mensaje.",
      contactSessionBlocked: "Esta sesión de contacto ha sido bloqueada.",
      contactSubmitBlockedGeneric: "No se pudo enviar tu mensaje.",
      contactSubmitBlockedSecure: "No se pudo enviar tu mensaje de forma segura.",
      contactSubmitPending: "Enviando tu mensaje de forma segura...",
      contactSubmitSuccess: "Tu mensaje se recibió de forma segura.",
      contactSubmitUnavailable: "No se pudo enviar tu mensaje en este momento.",
      contactIntro:
        "Describe the aptitudes, objectives, goals, and expectations you are seeking.",
      contactRequestTitle: "Solicitud de contacto",
      contactRequestButtonLabel: "Enviar solicitud",
      addContactEntry: "+ Agregar",
      expectationsLabel: "Describe qué esperas de tus candidatos / postulantes",
      fullName: "Nombre completo",
      firstNameLabel: "Nombre",
      lastNameLabel: "Apellido",
      emailAddress: "Dirección de correo electrónico",
      countryCode: "Código de país",
      contactNumber: "Número de contacto",
      city: "Ciudad",
      stateProvince: "Estado/Provincia",
      spaceSuiteApt: "Espacio/Suite/Apartamento",
      countryZipCode: "Código postal del país",
      bestContactTime: "Mejor hora para contactarte",
      messageLabel: "Mensaje",
      inquiryAboutTitle:
        "Cuéntanos tus expectativas sobre la experiencia, el conocimiento y las habilidades del Asistente Remoto",
      inquiryAboutHelper: "Aptitud, habilidades, experiencia, conocimiento",
      inquiryCardAptitudeTitle: "Aptitud, habilidades, experiencia, conocimiento",
      inquiryCardInterestTitle: "Interés y educación",
      skillsLabel: "Habilidades",
      languagesLabel: "Idiomas",
      projectsLabel: "Proyectos",
      educationLabel: "Educación",
      addSkill: "Agregar +",
      removeSkill: "Eliminar -",
      removeAll: "Eliminar todo",
      experienceLabel: "Experiencia",
      experienceLevelLabel: "Nivel de experiencia",
      placeholderAddExperienceEntry: "Agregar experiencia",
      experienceLevelEntryLevel: "Nivel inicial",
      experienceLevelJunior: "Junior",
      experienceLevelIntermediate: "Intermedio",
      experienceLevelAdvanced: "Avanzado",
      experienceLevelSenior: "Senior",
      experienceLevelExpert: "Experto",
      experienceLevelEngineer: "Ingeniero",
      experienceLevelCLevel: "Nivel C",

      placeholderAddLanguageEntry: "Agregar idioma",
      placeholderAddSkillEntry: "Agregar habilidad",
      placeholderAddAreaInterestEntry: "Agregar área de interés",
      placeholderAddProjectEntry: "Agregar proyecto",
      placeholderAddEducationEntry: "Agregar educación",
      submitApplication: "Enviar solicitud",
      contactButtonLabel: "Enviar",
      clearForm: "Limpiar formulario",

      careersTitle: "Carreras",
      careersIntro:
        "Describe the aptitudes, objectives, goals, and expectations you are seeking.",
      availabilityLabel: "Disponibilidad",
      availabilityImmediately: "Inmediatamente",
      availability15Days: "15 días",
      availability30Days: "30 días",
      availability45Days: "45 días",
      availability60Days: "60 días",
      availability90Days: "90 días",
      areaInterestLabel: "Área de interés",
      careersOptionLogistics: "Logística",
      careersOptionAdministration: "Administración",
      careersOptionAdministrationBackOffice: "Administración Back Office",
      careersOptionCustomerRelations: "Relaciones con Clientes",
      careersOptionItSupport: "Soporte de TI",
      experienceLabel: "Experiencia",
      experienceLevelLabel: "Nivel de experiencia",
      experienceLevelEntry: "Entrada",
      experienceLevelEntryLevel: "Nivel inicial",
      experienceLevelJunior: "Junior",
      experienceLevelIntermediate: "Intermedio",
      experienceLevelAdvance: "Avance",
      experienceLevelAdvanced: "Avanzado",
      experienceLevelSenior: "Senior",
      experienceLevelExpert: "Experto",
      experienceLevelEngineer: "Ingeniero",
      experienceLevelLowerManagement: "Gerencia baja",
      experienceLevelTopManagement: "Alta gerencia",
      experienceLevelSeniorManagement: "Gerencia senior",
      experienceLevelCSuite: "C Suite",
      experienceLevelCLevel: "Nivel C",
      languageLevelLabel: "Nivel de idioma",
      languageLevelBeginner: "Principiante",
      languageLevelElementary: "Elemental",
      languageLevelIntermediate: "Intermedio",
      languageLevelUpperIntermediate: "Intermedio alto",
      languageLevelAdvanced: "Avanzado",
      languageLevelProficient: "Competente",
      skillLevelLabel: "Nivel de habilidad",
      skillLevelNovice: "Novato",
      skillLevelAdvancedBeginner: "Principiante avanzado",
      skillLevelProficient: "Competente",
      skillLevelExpert: "Experto",
      projectStatusLabel: "Estado del proyecto",
      projectStatusFinished: "Finalizado",
      projectStatusInProgress: "En progreso",
      projectStatusAbandoned: "Abandonado",
      projectStatusCancelled: "Cancelado",
      resumeLinkLabel: "Enlace de currículum/perfil",
      educationLevelLabel: "Nivel educativo",
      educationOptionGed: "GED",
      educationOptionHighSchool: "Secundaria",
      educationOptionSomeCollege: "Algunos estudios universitarios",
      educationOptionAssociate: "Técnico/Superior",
      educationOptionAssociateDegree: "Grado asociado",
      educationOptionBachelor: "Licenciatura",
      educationOptionGraduate: "Graduado",
      educationOptionMaster: "Maestría",
      educationOptionMasters: "Maestría",
      educationOptionDoctorate: "Doctorado",
      educationOptionCertified: "Certificación",
      bestContactTime: "Mejor hora para contactarte",
      bestContactDateLabel: "Mejor fecha de contacto",
      bestContactTimeLabel: "Mejor hora de contacto",
      messageLabel: "Mensaje",
      careerMessagePrompt: "Cuéntanos sobre TI",

      learningTitle: "Aprendizaje",
      learningIntro:
        "Guía y conocimiento práctico de servicio para soporte operativo orientado a flujos de trabajo, con preferencia por el inglés.",
      trackLogisticsTitle: "Operaciones Logísticas",
      trackLogisticsText:
        "Aprende los fundamentos de coordinación, seguimiento y continuidad.",
      logisticsServiceTitle: "Operaciones Logísticas",
      logisticsServiceIntro:
        "Gabriel Services apoya los flujos de trabajo logísticos con supervisión operativa, coordinación de despachos y visibilidad de envíos, diseñados para mantener tu cadena de suministro en movimiento.",
      logisticsServiceOfferTitle: "Lo que ofrecemos",
      logisticsServiceOffer1:
        "Coordinación de despachos y comunicación con transportistas.",
      logisticsServiceOffer2:
        "Seguimiento de envíos por transporte aéreo, marítimo y terrestre.",
      logisticsServiceOffer3:
        "Monitoreo del estado del inventario y gestión de excepciones.",
      logisticsServiceOffer4:
        "Seguimiento con proveedores y transportistas para proteger los tiempos de entrega.",
      logisticsServiceWorkTitle: "Cómo trabajamos",
      logisticsServiceWorkIntro:
        "Nos integramos a tu ecosistema logístico existente, nos alineamos con los hitos operativos y proporcionamos una ejecución constante todos los días.",
      logisticsServiceWork1:
        "Prácticas claras de traspaso y plantillas de comunicación.",
      logisticsServiceWork2:
        "Actualizaciones periódicas de estado y escalación temprana de problemas.",
      logisticsServiceWork3:
        "Seguimiento basado en datos con próximos pasos accionables.",
      logisticsServiceWhyTitle: "Por qué elegir este servicio",
      logisticsServiceWhyText:
        "Este servicio es ideal para negocios que necesitan soporte logístico confiable sin aumentar la carga interna. Ayudamos a reducir retrasos, mejorar la visibilidad y mantener tus operaciones receptivas.",
      backToServices: "Volver a Servicios",
      trackAdminTitle: "Back Office Administrativo",
      trackAdminText:
        "Aprende documentación, ritmo de reportes y mantenimiento de procesos.",
      adminLearningTitle: "Aprendizaje de Administración Back Office",
      adminLearningIntro:
        "Capacitación diseñada para equipos de soporte operativo que gestionan sistemas internos, programación, documentación y flujos de trabajo de tareas.",
      learningObjectivesTitle: "Objetivos de aprendizaje",
      adminLearningObjective1:
        "Desarrollar hábitos confiables de documentación y reportes.",
      adminLearningObjective2:
        "Mejorar la coordinación de tareas entre equipos y partes interesadas.",
      adminLearningObjective3:
        "Aprender cómo mantener flujos administrativos consistentes.",
      keyTopicsTitle: "Temas clave",
      adminLearningTopic1: "Gestión de calendario y comunicación.",
      adminLearningTopic2: "Organización de documentos y control de versiones.",
      adminLearningTopic3:
        "Seguimiento con proveedores y coordinación de servicios.",
      practicalApplicationTitle: "Aplicación práctica",
      adminLearningApplication:
        "Estas habilidades ayudan a los equipos de back office a reducir la fricción operativa y apoyar una toma de decisiones más rápida en todo el negocio.",
      adminLearningPageTitle: "Aprendizaje de Administración Back Office | Gabriel Services",
      adminLearningMetaDescription:
        "Ruta de aprendizaje para Administración Back Office: disciplina de procesos, reportes y habilidades de operaciones internas.",
      logisticsLearningPageTitle: "Aprendizaje de Operaciones Logísticas | Gabriel Services",
      logisticsLearningMetaDescription:
        "Ruta de aprendizaje para Operaciones Logísticas: coordinación de flujos de trabajo, sistemas de seguimiento y habilidades de continuidad.",
      logisticsLearningTitle: "Aprendizaje de Operaciones Logísticas",
      logisticsLearningIntro:
        "Guía práctica para equipos de logística y profesionales de operaciones, enfocada en la continuidad, la disciplina de seguimiento y la coordinación de procesos.",
      logisticsLearningObjective1:
        "Comprender los principales flujos de trabajo logísticos y los puntos de traspaso",
      logisticsLearningObjective2:
        "Aprender mejores prácticas para el seguimiento de envíos y la gestión de excepciones",
      logisticsLearningObjective3:
        "Crear procesos de comunicación repetibles para transportistas y proveedores",
      logisticsLearningTopic1: "Coordinación de despachos y planificación operativa",
      logisticsLearningTopic2:
        "Estándares de visibilidad para envíos aéreos, marítimos y terrestres",
      logisticsLearningTopic3:
        "Gestión de seguimientos y control de escalaciones",
      logisticsLearningApplication:
        "Esta ruta está diseñada para personas que necesitan convertir la planificación logística en una ejecución diaria predecible, sin agregar carga operativa.",
      customerLearningPageTitle: "Aprendizaje de Relaciones con Clientes | Gabriel Services",
      customerLearningMetaDescription:
        "Aprendizaje de Relaciones con Clientes: mejores prácticas de comunicación, flujos de escalación y habilidades de atención al cliente.",
      customerLearningTitle: "Aprendizaje de Relaciones con Clientes",
      customerLearningIntro:
        "Aprende cómo gestionar comunicaciones con clientes, manejar escalaciones y mantener un ritmo de servicio confiable en cada interacción con el cliente.",
      customerLearningObjective1:
        "Dominar mejores prácticas de comunicación para equipos que tratan directamente con clientes.",
      customerLearningObjective2:
        "Comprender flujos de escalación y resolución rápida de problemas.",
      customerLearningObjective3:
        "Desarrollar un proceso consistente de seguimiento y satisfacción.",
      customerLearningTopic1: "Seguimiento de tickets y control de resolución.",
      customerLearningTopic2:
        "Medición de satisfacción y retroalimentación del cliente.",
      customerLearningTopic3:
        "Comunicación clara y oportuna con el cliente.",
      customerLearningApplication:
        "Estas prácticas ayudan a los equipos a convertir las interacciones con clientes en resultados confiables y traspasos más claros entre operaciones.",
      itLearningPageTitle: "Aprendizaje de Soporte de TI | Gabriel Services",
      itLearningMetaDescription:
        "Ruta de aprendizaje de Soporte de TI: flujos de soporte, gestión de tickets y operaciones de TI centradas en usuarios.",
      itLearningTitle: "Aprendizaje de Soporte de TI",
      itLearningIntro:
        "Ruta práctica de aprendizaje para flujos de soporte de TI, manejo de tickets y operaciones técnicas orientadas al usuario.",
      itLearningObjective1:
        "Comprender el ciclo de vida de tickets y los flujos de soporte a usuarios",
      itLearningObjective2:
        "Aprender prácticas efectivas de comunicación técnica y escalación",
      itLearningObjective3:
        "Crear hábitos medibles de soporte para operaciones diarias",
      itLearningTopic1:
        "Recepción de mesa de ayuda, categorización y planificación de respuesta",
      itLearningTopic2: "Seguimiento de incidentes y comunicación de progreso",
      itLearningTopic3:
        "Documentación de soporte y traspasos de seguimiento",
      itLearningApplication:
        "Esta ruta está creada para equipos que necesitan soporte técnico constante sin perder el enfoque en una entrega confiable de servicio al usuario.",
      relatedLearningTitle: "Explorar otras rutas de aprendizaje",
      relatedLearningText:
        "Continúa navegando entre las rutas principales para comparar habilidades, flujos de trabajo y aplicaciones prácticas.",
      relatedLearningAria: "Rutas de aprendizaje relacionadas",
      backToLearning: "Volver a Aprendizaje",
      adminBackOfficeServiceIntro:
        "Nuestros servicios de back office aportan estructura y confiabilidad a tus operaciones internas, ayudando a reducir riesgos y mantener un ritmo empresarial constante.",
      adminBackOfficeHandleTitle: "Lo que gestionamos",
      adminBackOfficeHandle1:
        "Soporte administrativo ejecutivo y gestión de calendario.",
      adminBackOfficeHandle2:
        "Preparación de documentos, archivo y control de versiones.",
      adminBackOfficeHandle3:
        "Coordinación de correos electrónicos y comunicaciones para equipos internos.",
      adminBackOfficeHandle4:
        "Seguimiento con proveedores, control de facturas y soporte de reportes.",
      adminBackOfficeWorksTitle: "Cómo funciona este servicio",
      adminBackOfficeWorksText:
        "Trabajamos de cerca con tu equipo para comprender los procesos, capturar acciones prioritarias y mantener cada tarea alineada con el calendario de tu negocio.",
      adminBackOfficeWorksPoint1:
        "Responsabilidad clara para tareas recurrentes y elementos de seguimiento.",
      adminBackOfficeWorksPoint2:
        "Flujos de tareas documentados y seguimiento del progreso.",
      adminBackOfficeWorksPoint3:
        "Actualizaciones periódicas de estado para partes interesadas y líderes de equipo.",
      adminBackOfficeMattersTitle: "Por qué importa",
      adminBackOfficeMattersText:
        "Un sólido soporte de back office ayuda a las empresas a escalar al eliminar fricción administrativa, mejorar la consistencia y liberar a tu equipo para enfocarse en trabajos de mayor valor.",
      trackCustomerTitle: "Operaciones de Clientes",
      trackCustomerText:
        "Aprende flujo de seguimiento, continuidad de escalaciones y ritmo de respuesta.",
      customerRelationsServiceTitle:
        "Operaciones de Relaciones con Clientes",
      customerRelationsServiceIntro:
        "Apoyamos la experiencia del cliente con comunicación constante, gestión de escalaciones y flujos de seguimiento que mantienen cada situación avanzando hacia su resolución.",
      customerRelationsServiceAreasTitle: "Áreas principales del servicio",
      customerRelationsServiceArea1:
        "Seguimiento de tickets y control de resolución.",
      customerRelationsServiceArea2:
        "Revisiones de satisfacción del cliente y soporte de retroalimentación.",
      customerRelationsServiceArea3:
        "Aclaración de facturación y asistencia en escalaciones.",
      customerRelationsServiceArea4:
        "Soporte de resolución en el primer contacto y comunicación de estado.",
      customerRelationsServiceHowTitle: "Cómo apoyamos a los clientes",
      customerRelationsServiceHowText:
        "Nuestro equipo ayuda a mantener la confianza gestionando un ritmo constante de comunicación con el cliente y resolviendo consultas de manera oportuna y precisa.",
      customerRelationsServiceHow1:
        "Respuestas estandarizadas y protocolos de escalación.",
      customerRelationsServiceHow2:
        "Seguimiento al cliente y revisiones de satisfacción.",
      customerRelationsServiceHow3:
        "Traspasos claros entre equipos y socios de entrega.",
      customerRelationsServiceWhyTitle: "Por qué esto importa",
      customerRelationsServiceWhyText:
        "Las operaciones sólidas de relaciones con clientes reducen la pérdida de clientes, mejoran la percepción de la marca y garantizan que tus clientes siempre se sientan apoyados.",
      trackITTitle: "Soporte de TI",
      trackITText:
        "Aprende fundamentos de clasificación, comunicación de tickets y manejo de solicitudes.",
      itSupportMetaDescription:
        "Soporte profesional de TI de Nivel I y Nivel II para recepción de mesa de ayuda, creación de tickets, solución de problemas, soporte al usuario final, asistencia de acceso a cuentas, coordinación de escalamiento, investigación de incidentes, soporte de flujos de trabajo, análisis de causa raíz y responsabilidad de resolución.",
      itSupportServiceIntro:
        "Ofrecemos cobertura técnica estructurada para recepción de mesa de ayuda, creación de tickets, solución de problemas, soporte al usuario final, asistencia de acceso a cuentas, coordinación de escalamiento, investigación de incidentes, soporte de flujos de trabajo, análisis de causa raíz y responsabilidad de resolución después de la escalada.",
      itSupportHeroEyebrow: "Carril de Servicio 04",
      itSupportHeroLead:
        "Cobertura técnica estructurada para asistencia de Nivel I y Nivel II.",
      itSupportHeroIntro:
        "Ofrecemos cobertura técnica estructurada para recepción de mesa de ayuda, creación de tickets, solución de problemas, soporte al usuario final, asistencia de acceso a cuentas, coordinación de escalamiento, investigación de incidentes, soporte de flujos de trabajo, análisis de causa raíz y responsabilidad de resolución después de la escalada.",
      itSupportProofLevel1: "Cobertura de Nivel I",
      itSupportProofLevel2: "Responsabilidad de Nivel II",
      itSupportProofEscalation: "Coordinación de Escalamiento",
      itSupportProofRootCause: "Disciplina de Causa Raíz",
      itSupportRequestCta: "Solicitar soporte de TI",
      itSupportViewCoverageCta: "Ver cobertura",
      itSupportSnapshotEyebrow: "Resumen de Soporte",
      itSupportSnapshotTitle:
        "Recepción clara. Triaje sólido. Resolución responsable.",
      itSupportSnapshotIntake: "Recepción estructurada",
      itSupportSnapshotPriority: "Seguimiento de prioridad",
      itSupportSnapshotEscalation: "Responsabilidad de escalamiento",
      itSupportSnapshotResolution: "Claridad de resolución",
      itSupportSnapshotText:
        "Diseñado para empresas que necesitan soporte calmado, documentado y profesional desde el primer contacto hasta el cierre final.",
      itSupportCoverageEyebrow: "Cobertura",
      itSupportCoverageTitle: "Dos niveles de soporte técnico.",
      itSupportCoverageIntro:
        "Ofrecemos cobertura técnica estructurada en asistencia de primera línea, solución avanzada de problemas, revisión de incidentes, soporte de flujos de trabajo y responsabilidad posterior a la escalada.",
      serviceHighlightsTitle: "Aspectos destacados del servicio",
      itSupportLevel1Eyebrow: "Respuesta de Primera Línea",
      itSupportLevel1Body:
        "El soporte de Nivel I mantiene en movimiento los problemas de usuarios con recepción clara, asistencia inicial, solución básica de problemas, ayuda de acceso y coordinación de escalamiento.",
      itSupportHighlight1:
        "Recepción de solicitudes de mesa de ayuda y creación de tickets.",
      itSupportHighlight2:
        "Solución básica de problemas y diagnóstico de incidencias.",
      itSupportHighlight3:
        "Coordinación de acceso a cuentas y soporte de sistemas.",
      itSupportHighlight4:
        "Gestión de escalaciones a equipos especializados cuando sea necesario.",
      itSupportLevel2Eyebrow: "Responsabilidad Técnica",
      itSupportLevel2Body:
        "El soporte de Nivel II maneja investigación más profunda, solución avanzada de problemas, soporte de sistemas y flujos de trabajo, análisis de causa raíz y responsabilidad de resolución después de la escalada.",
      itSupportLevel2SystemSupport: "Soporte de sistemas",
      itSupportLevel2WorkflowSupport: "Soporte de flujos de trabajo",
      itSupportLevel2RootCause: "Análisis de causa raíz",
      itSupportDeliveryTitle: "Cómo brindamos soporte",
      itSupportDeliveryText:
        "Mantenemos un ritmo de soporte estructurado que da seguimiento a las solicitudes entrantes desde el primer contacto hasta la resolución, con visibilidad y responsabilidad en cada paso.",
      itSupportDeliveryPoint1: "Recepción y clasificación rápida de tickets.",
      itSupportDeliveryPoint2:
        "Actualizaciones claras de estado y rutas de escalación.",
      itSupportDeliveryPoint3:
        "Comunicación práctica y enfocada en el usuario.",
      itSupportWorkflowEyebrow: "Flujo de Trabajo",
      itSupportWorkflowTitle: "Cómo avanza el soporte de TI.",
      itSupportWorkflowIntro:
        "El proceso de soporte está diseñado para reducir la confusión, proteger la productividad y hacer que cada ticket sea más fácil de seguir desde la solicitud hasta la resolución.",
      itSupportWorkflowReceiveTitle: "Recibir",
      itSupportWorkflowReceiveText:
        "Capturar la solicitud del usuario, los detalles del problema, el sistema afectado y el impacto comercial.",
      itSupportWorkflowClassifyTitle: "Clasificar",
      itSupportWorkflowClassifyText:
        "Confirmar el tipo de problema, urgencia, usuario afectado, prioridad y ruta de soporte.",
      itSupportWorkflowResolveTitle: "Resolver en L1",
      itSupportWorkflowResolveText:
        "Atender solución básica de problemas, soporte al usuario y asistencia de acceso cuando sea posible.",
      itSupportWorkflowEscalateTitle: "Escalar a L2",
      itSupportWorkflowEscalateText:
        "Mover incidentes más profundos a investigación avanzada con notas claras y responsabilidad definida.",
      itSupportWorkflowCloseTitle: "Cerrar con claridad",
      itSupportWorkflowCloseText:
        "Documentar la acción tomada, estado final, causa raíz y resultado de resolución.",
      itSupportFocusEyebrow: "Enfoque Dinámico",
      itSupportFocusTitle: "Elija la prioridad de soporte de TI.",
      itSupportFocusIntro:
        "Seleccione un área prioritaria para mostrar los puntos de cobertura exactos que más importan a su operación.",
      itSupportFocusLevel1Eyebrow: "Soporte de primera línea",
      itSupportFocusLevel1Text:
        "Asistencia estructurada de primer contacto para solicitudes de usuarios, creación de tickets, solución básica de problemas, ayuda de acceso y coordinación de escalamiento.",
      itSupportFocusLevel2Eyebrow: "Responsabilidad avanzada",
      itSupportFocusLevel2Text:
        "Cobertura técnica más profunda para solución avanzada de problemas, revisión de incidentes, soporte de sistemas y flujos de trabajo, análisis de causa raíz y resolución posterior a la escalada.",
      itSupportFocusEscalationTab: "Flujo de Escalamiento",
      itSupportFocusEscalationEyebrow: "Traspaso claro",
      itSupportFocusEscalationText:
        "Una ruta disciplinada de escalamiento que mantiene los problemas visibles, documentados, priorizados y con responsable hasta el cierre final.",
      itSupportFocusEscalationItem1: "Notas del problema",
      itSupportFocusEscalationItem2: "Seguimiento de prioridad",
      itSupportFocusEscalationItem3: "Coordinación de escalamiento",
      itSupportFocusEscalationItem4: "Traspaso interno",
      itSupportFocusEscalationItem5: "Comunicación de estado",
      itSupportFocusEscalationItem6: "Cierre de resolución",
      itSupportLeadEyebrow: "Cobertura de Soporte Confiable",
      itSupportLeadTitle:
        "¿Necesita soporte de TI organizado, ágil y responsable?",
      itSupportLeadText:
        "Use el flujo de consulta para describir su volumen de soporte, problemas de usuarios, flujo de tickets, necesidades de acceso, incidentes recurrentes o requisitos de escalamiento.",
      itSupportLeadPrimaryCta: "Iniciar consulta de soporte de TI",
      whyItWorksTitle: "Por qué funciona",
      itSupportWhyText:
        "El soporte de TI adecuado mantiene a tu equipo productivo, evita que los problemas pequeños se conviertan en situaciones mayores y ayuda a mantener operaciones diarias confiables.",
      backToServices: "Volver a Servicios",
      exploreTrack: "Explorar módulo",

      termsSection1Title: "1. Aceptación de los términos",
      termsSection1Text:
        "Al acceder y usar este sitio web y los servicios proporcionados por Gabriel Services, aceptas y acuerdas quedar sujeto a los términos y disposiciones de este acuerdo. Si no aceptas cumplir con lo anterior, por favor no utilices este servicio.",
      termsSection2Title: "2. Licencia de uso",
      termsSection2Text:
        "Gabriel Services te otorga una licencia limitada para acceder y usar el sitio web y los servicios únicamente con fines legales. Aceptas no:",
      termsSection2List1:
        "Reproducir, duplicar, copiar o vender cualquier parte del sitio web o de los servicios",
      termsSection2List2:
        "Acceder al sitio web con cualquier fin ilícito o no autorizado",
      termsSection2List3:
        "Interrumpir el flujo normal del diálogo o interrumpir de cualquier otra forma los servicios",
      termsSection2List4:
        "Intentar obtener acceso no autorizado a nuestros sistemas o redes",
      termsSection2List5:
        "Usar sistemas automatizados o scripts para recopilar datos sin permiso",
      termsSection2List6:
        "Participar en cualquier forma de acoso o comportamiento abusivo",
      termsSection3Title: "3. Descargo de garantías",
      termsSection3Text:
        "Los materiales del sitio web de Gabriel Services se proporcionan ‘tal cual’. Gabriel Services no otorga garantías, expresas o implícitas, y por la presente rechaza y niega todas las demás garantías, incluidas, entre otras, las garantías o condiciones implícitas de comerciabilidad, idoneidad para un propósito particular o no infracción de propiedad intelectual u otra violación de derechos.",
      termsSection4Title: "4. Limitaciones de responsabilidad",
      termsSection4Text:
        "En ningún caso Gabriel Services o sus proveedores serán responsables por daños (incluidos, entre otros, daños por pérdida de datos o ganancias, o por interrupción del negocio) derivados del uso o la imposibilidad de usar los materiales del sitio web de Gabriel Services, incluso si Gabriel Services o un representante autorizado ha sido notificado oralmente o por escrito sobre la posibilidad de dicho daño.",
      termsSection5Title: "5. Exactitud de los materiales",
      termsSection5Text:
        "Los materiales que aparecen en el sitio web de Gabriel Services podrían incluir errores técnicos, tipográficos o fotográficos. Gabriel Services no garantiza que ninguno de los materiales de su sitio web sea preciso, completo o actual. Gabriel Services puede realizar cambios en los materiales contenidos en su sitio web en cualquier momento y sin previo aviso.",
      termsSection6Title: "6. Enlaces",
      termsSection6Text:
        "Gabriel Services no ha revisado todos los sitios enlazados a su sitio web y no es responsable del contenido de dichos sitios enlazados. La inclusión de cualquier enlace no implica respaldo por parte de Gabriel Services del sitio. El uso de cualquier sitio web enlazado es bajo el propio riesgo del usuario.",
      termsSection7Title: "7. Modificaciones",
      termsSection7Text:
        "Gabriel Services puede revisar estos términos de servicio para su sitio web en cualquier momento y sin previo aviso. Al usar este sitio web, aceptas quedar sujeto a la versión vigente de estos términos de servicio.",
      termsSection8Title: "8. Ley aplicable",
      termsSection8Text:
        "Estos términos y condiciones se rigen e interpretan de conformidad con las leyes de la jurisdicción en la que opera Gabriel Services, y te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de esa ubicación.",
      termsSection9Title: "9. Descripción del servicio",
      termsSection9Text:
        "Gabriel Services proporciona servicios de soporte operativo que incluyen Operaciones Logísticas, Back Office Administrativo, Operaciones de Relaciones con Clientes y Soporte de TI. Los servicios específicos solicitados y acordados entre Gabriel Services y el cliente se detallan en el acuerdo de servicio.",
      termsSection10Title: "10. Términos de pago",
      termsSection10Text:
        "Los términos de pago son los especificados en el acuerdo de servicio individual. Las facturas vencen al recibo, salvo que se acuerde lo contrario por escrito. Los pagos atrasados pueden resultar en la suspensión del servicio.",
      termsSection11Title: "11. Derechos de propiedad intelectual",
      termsSection11Text:
        "Todo el contenido incluido en este sitio web, como texto, gráficos, logotipos, imágenes y software, es propiedad de Gabriel Services o de sus proveedores de contenido y está protegido por leyes internacionales de derechos de autor.",
      termsSection12Title: "12. Limitación del servicio",
      termsSection12Text:
        "Gabriel Services se reserva el derecho de rechazar el servicio a cualquier persona a su exclusiva discreción. Gabriel Services también se reserva el derecho de limitar o terminar servicios, cerrar cuentas y eliminar o editar contenido a nuestra exclusiva discreción.",
      termsSection13Title: "13. Contacto para consultas legales",
      termsSection13Text:
        "Si tienes alguna pregunta sobre estos Términos y Condiciones, contáctanos en el correo electrónico o la dirección proporcionados en nuestra página de Contacto.",
      termsLastUpdated: "Última actualización: 5 de mayo de 2026",

      cookiesLastUpdated: "Última actualización: 5 de mayo de 2026",
      cookiesTitle: "Política de consentimiento de cookies",
      cookiesSection1Title: "1. ¿Qué son las cookies?",
      cookiesSection1Text:
        "Las cookies son pequeños archivos de datos que contienen una cadena de caracteres y se colocan en tu computadora o dispositivo móvil cuando visitas nuestro sitio web. Nos permiten reconocer tu navegador o dispositivo, recordar información sobre tus preferencias y ayudar a personalizar tu experiencia en el sitio web de Gabriel Services.",
      cookiesSection2Title: "2. Tipos de cookies que usamos",
      cookiesSection2EssentialTitle: "Cookies esenciales",
      cookiesSection2EssentialText:
        "Estas cookies son necesarias para que el sitio web funcione correctamente y no pueden deshabilitarse a través de nuestros sistemas. Se utilizan para:",
      cookiesSection2EssentialList1:
        "Habilitar la funcionalidad básica del sitio web",
      cookiesSection2EssentialList2: "Mantener la seguridad y prevenir fraudes",
      cookiesSection2EssentialList3:
        "Conservar las preferencias del usuario, como selección de idioma y tema visual",
      cookiesSection2PerformanceTitle: "Cookies de rendimiento",
      cookiesSection2PerformanceText:
        "Estas cookies nos ayudan a comprender cómo interactúan los visitantes con nuestro sitio web mediante la recopilación y el reporte de información de forma anónima. Nos ayudan a:",
      cookiesSection2PerformanceList1:
        "Identificar las páginas a las que se accede con mayor frecuencia",
      cookiesSection2PerformanceList2:
        "Medir la efectividad de las campañas publicitarias",
      cookiesSection2PerformanceList3:
        "Comprender los patrones de navegación de los usuarios",
      cookiesSection2FunctionalTitle: "Cookies funcionales",
      cookiesSection2FunctionalText:
        "Estas cookies permiten una funcionalidad mejorada y personalización, incluyendo:",
      cookiesSection2FunctionalList1: "Recordar tu preferencia de idioma",
      cookiesSection2FunctionalList2: "Almacenar tu preferencia de tema visual",
      cookiesSection2FunctionalList3:
        "Registrar datos de formularios para mayor comodidad",
      cookiesSection2AnalyticalTitle: "Cookies analíticas",
      cookiesSection2AnalyticalText:
        "Usamos cookies analíticas para comprender cómo se utiliza nuestro sitio web, incluida la duración de las visitas y las rutas que los usuarios siguen dentro del sitio web. Esto nos ayuda a mejorar el diseño y la funcionalidad de nuestro sitio web.",
      cookiesSection3Title: "3. Caché del navegador / almacenamiento local",
      cookiesSection3Text:
        "Para mejorar la experiencia del usuario, guardamos tus elecciones de idioma y tema en la caché de tu navegador mediante localStorage, incluyendo:",
      cookiesSection3List1: "Preferencia de idioma (inglés o español)",
      cookiesSection3List2: "Preferencia de tema visual (modo claro u oscuro)",
      cookiesSection3Text2:
        "Esta información se almacena localmente en tu dispositivo y no se transmite a nuestros servidores.",
      cookiesSection4Title: "4. Cookies de terceros",
      cookiesSection4Text:
        "Las cookies de terceros pueden ser colocadas en tu dispositivo por proveedores de servicios externos, incluyendo:",
      cookiesSection4List1: "Proveedores de análisis",
      cookiesSection4List2: "Redes publicitarias",
      cookiesSection4List3: "Plataformas de redes sociales",
      cookiesSection4Text2:
        "No tenemos control sobre las cookies de terceros. Puedes configurar tu navegador para rechazar cookies o para avisarte cuando se estén enviando cookies.",
      cookiesSection5Title: "5. Cómo controlar las cookies",
      cookiesSection5Text:
        "Tienes derecho a elegir si aceptas o rechazas las cookies. La mayoría de los navegadores web te permiten:",
      cookiesSection5List1:
        "Ver las cookies que se han establecido en tu dispositivo",
      cookiesSection5List2: "Eliminar cookies de tu dispositivo",
      cookiesSection5List3:
        "Bloquear futuras cookies para que no se establezcan en tu dispositivo",
      cookiesSection5List4:
        "Configurar tu navegador para que te notifique cuando una cookie esté a punto de establecerse",
      cookiesSection5Text2:
        "Si eliges bloquear o eliminar cookies, es posible que algunas funciones de nuestro sitio web no funcionen como se esperaba.",
      cookiesSection6Title: "6. Google Analytics",
      cookiesSection6Text:
        "Podemos usar Google Analytics para recopilar información sobre tu uso de nuestro sitio web. Google Analytics recopila información como:",
      cookiesSection6List1: "Dirección IP",
      cookiesSection6List2: "Tipo de dispositivo",
      cookiesSection6List3: "Tipo de navegador",
      cookiesSection6List4:
        "Páginas visitadas y tiempo invertido en cada página",
      cookiesSection6Text2:
        "La información se utiliza para compilar informes sobre la actividad del sitio web, que nos ayudan a comprender cómo se está utilizando nuestro sitio web y a mejorar su diseño y funcionalidad. Google Analytics no identifica a usuarios individuales.",
      cookiesSection7Title: "7. Tu consentimiento",
      cookiesSection7Text:
        "Al continuar usando nuestro sitio web después de recibir este aviso de cookies, aceptas el uso de cookies según lo descrito en esta política. Si no aceptas el uso de cookies, debes deshabilitarlas en la configuración de tu navegador antes de continuar usando nuestro sitio web.",
      cookiesSection8Title: "8. Actualizaciones de esta política",
      cookiesSection8Text:
        "Podemos actualizar esta Política de consentimiento de cookies ocasionalmente para reflejar cambios en la tecnología, la legislación u otros cambios. Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo protegemos tu privacidad.",
      cookiesSection9Title: "9. Contáctanos",
      cookiesSection9Text:
        "Si tienes alguna pregunta sobre nuestra Política de consentimiento de cookies o nuestro uso de cookies, contáctanos a través de la página de Contacto en nuestro sitio web o mediante la información de contacto proporcionada en nuestro sitio web principal.",

      privacySection1Title: "1. Introducción",
      privacySection1Text:
        "Gabriel Services (“nosotros”, “nos” o la “Compañía”) está comprometida con la protección de tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando visitas nuestro sitio web y utilizas nuestros servicios. Por favor, lee esta política cuidadosamente para comprender nuestras prácticas respecto a tus datos personales.",
      privacySection2Title: "2. Información que recopilamos",
      privacySection2DirectTitle: "Información que proporcionas directamente",
      privacySection2DirectList1:
        "Información de contacto: nombre, dirección de correo electrónico, número de teléfono y nombre de la empresa",
      privacySection2DirectList2:
        "Información del servicio: detalles sobre las operaciones de tu negocio y los requisitos del servicio",
      privacySection2DirectList3:
        "Registros de comunicación: contenido de mensajes, correos electrónicos y tickets de soporte",
      privacySection2DirectList4:
        "Información de pago: dirección de facturación y detalles del método de pago, procesados de forma segura",
      privacySection2AutoTitle: "Información recopilada automáticamente",
      privacySection2AutoList1:
        "Información del dispositivo: dirección IP, tipo de navegador, sistema operativo e identificadores del dispositivo",
      privacySection2AutoList2:
        "Datos de uso: páginas visitadas, tiempo invertido en las páginas, enlaces seleccionados y patrones de navegación",
      privacySection2AutoList3:
        "Cookies y tecnologías similares: datos del navegador y almacenamiento local para preferencias",
      privacySection2AutoList4:
        "Información de referencia: cómo accediste a nuestro sitio web",
      privacySection3Title: "3. Cómo usamos tu información",
      privacySection3Text:
        "Usamos la información recopilada para los siguientes fines:",
      privacySection3List1:
        "Proporcionar y gestionar los servicios solicitados",
      privacySection3List2:
        "Procesar transacciones y enviar información relacionada",
      privacySection3List3:
        "Enviar correos electrónicos transaccionales y promocionales",
      privacySection3List4: "Responder consultas y brindar soporte al cliente",
      privacySection3List5: "Mejorar nuestro sitio web y nuestros servicios",
      privacySection3List6: "Analizar patrones de uso del sitio web",
      privacySection3List7: "Prevenir fraudes y garantizar la seguridad",
      privacySection3List8: "Cumplir con obligaciones legales",
      privacySection3List9:
        "Crear datos agregados y anonimizados para análisis",
      privacySection4Title: "4. Base legal para el tratamiento de datos — RGPD",
      privacySection4Text:
        "Según el RGPD, tratamos los datos personales con base en los siguientes fundamentos legales:",
      privacySection4List1:
        "Necesidad contractual: tratamiento necesario para prestar nuestros servicios contigo",
      privacySection4List2:
        "Obligación legal: tratamiento requerido por ley o regulación",
      privacySection4List3:
        "Intereses legítimos: tratamiento necesario para nuestros intereses comerciales legítimos",
      privacySection4List4:
        "Consentimiento: tratamiento basado en tu consentimiento explícito",
      privacySection5Title: "5. Conservación de datos",
      privacySection5Text:
        "Conservamos los datos personales únicamente durante el tiempo necesario para los fines indicados en esta política o según lo exija la ley. Los períodos de conservación varían según el tipo de dato:",
      privacySection5List1:
        "Información de contacto: conservada durante la duración de la relación de servicio, más 7 años para fines contables",
      privacySection5List2:
        "Datos de análisis del sitio web: conservados hasta por 26 meses",
      privacySection5List3:
        "Preferencias del usuario, como idioma o tema visual: almacenadas localmente en tu dispositivo de forma indefinida hasta que sean eliminadas",
      privacySection6Title: "6. Compartición y divulgación de datos",
      privacySection6Text:
        "No vendemos tus datos personales. Podemos compartir información con:",
      privacySection6List1:
        "Proveedores de servicios: terceros que ayudan a proporcionar servicios, bajo acuerdos de tratamiento de datos",
      privacySection6List2:
        "Autoridades legales: cuando sea requerido por ley o para proteger derechos y seguridad",
      privacySection6List3:
        "Transferencias comerciales: en caso de fusión, adquisición o venta de activos",
      privacySection7Title: "7. Tus derechos bajo el RGPD",
      privacySection7Text:
        "Si te encuentras en la Unión Europea o el Espacio Económico Europeo, tienes los siguientes derechos:",
      privacySection7List1:
        "Derecho de acceso: obtener una copia de los datos personales que conservamos sobre ti",
      privacySection7List2:
        "Derecho de rectificación: corregir datos personales inexactos o incompletos",
      privacySection7List3:
        "Derecho de supresión, también conocido como “derecho al olvido”: solicitar la eliminación de tus datos personales",
      privacySection7List4:
        "Derecho a restringir el tratamiento: limitar cómo tratamos tus datos",
      privacySection7List5:
        "Derecho a la portabilidad de los datos: recibir tus datos en un formato portable",
      privacySection7List6:
        "Derecho de oposición: oponerte al tratamiento de tus datos",
      privacySection7List7:
        "Derecho a presentar una reclamación: presentar una queja ante tu autoridad local de protección de datos",
      privacySection8Title: "8. Seguridad de los datos",
      privacySection8Text:
        "Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:",
      privacySection8List1: "Cifrado SSL/TLS para datos en tránsito",
      privacySection8List2: "Protocolos de autenticación seguros",
      privacySection8List3: "Auditorías y pruebas de seguridad periódicas",
      privacySection8List4: "Acceso restringido a datos personales",
      privacySection8List5: "Capacitación del personal en protección de datos",
      privacySection8Text2:
        "Aunque nos esforzamos por proteger tu información, ningún sistema de seguridad es impenetrable y no podemos garantizar seguridad absoluta.",
      privacySection9Title: "9. Transferencias internacionales de datos",
      privacySection9Text:
        "Si accedes a nuestro sitio web desde fuera de los Estados Unidos, tu información puede ser transferida, almacenada y procesada en los Estados Unidos u otros países. Al proporcionarnos información, aceptas dicha transferencia. Nos aseguramos de que las transferencias internacionales estén protegidas mediante garantías adecuadas, incluidas las Cláusulas Contractuales Tipo.",
      privacySection10Title: "10. Privacidad de menores",
      privacySection10Text:
        "Nuestros servicios no están destinados a personas menores de 18 años. No recopilamos conscientemente datos personales de menores. Si llegamos a saber que hemos recopilado datos personales de un menor sin el consentimiento de sus padres o tutores, eliminaremos dichos datos de inmediato.",
      privacySection11Title: "11. Enlaces de terceros",
      privacySection11Text:
        "Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de sitios de terceros. Te recomendamos revisar las políticas de privacidad de cualquier sitio de terceros antes de proporcionar tu información personal.",
      privacySection12Title: "12. Ejercicio de tus derechos",
      privacySection12Text:
        "Para ejercer cualquiera de tus derechos de privacidad, contáctanos utilizando la información proporcionada al final de esta política. Responderemos a tu solicitud dentro de un plazo de 30 días, o según lo exija la ley aplicable. Es posible que debas proporcionar identificación para verificar tu solicitud.",
      privacySection13Title: "13. Responsable de Protección de Datos",
      privacySection13Text:
        "Si tienes preguntas sobre nuestras prácticas de privacidad o deseas ejercer tus derechos bajo el RGPD, puedes comunicarte con nuestro Responsable de Protección de Datos a través de la información de contacto proporcionada en nuestra página de Contacto.",
      privacySection14Title:
        "14. Actualizaciones de esta Política de Privacidad",
      privacySection14Text:
        "Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas, tecnología, requisitos legales u otros factores. La fecha de “Última actualización” al final de esta política indica cuándo fue revisada por última vez. El uso continuo de nuestro sitio web después de los cambios significa que aceptas la política actualizada.",
      privacySection15Title: "15. Contáctanos",
      privacySection15Text:
        "Para consultas de privacidad, solicitudes relacionadas con el RGPD o para ejercer tus derechos sobre tus datos, contáctanos a través de nuestra página de Contacto o utilizando la información de contacto proporcionada en el sitio web principal. Nos comprometemos a atender tus inquietudes con prontitud.",
      privacyLastUpdated: "Última actualización: 5 de mayo de 2026",
    },
  };

  const LANGUAGE_STORAGE_KEY = "language";

  function readClientCache(key) {
    try {
      return window.localStorage?.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeClientCache(key, value) {
    try {
      window.localStorage?.setItem(key, value);
      document.documentElement.dataset.preferenceCache = "localStorage";
    } catch (error) {
      document.documentElement.dataset.preferenceCache = "unavailable";
    }
  }

  function normalizeLanguage(lang) {
    const normalized = String(lang || "").split("-")[0];
    return translations[normalized] ? normalized : "";
  }

  const LOCALIZED_ROUTE_MAP = {};

  function normalizePathForRouteMap(pathname) {
    let path = String(pathname || "/");
    path = path.replace(/^\/redesigned-octo-meme/, "");
    if (path === "") path = "/";
    return path;
  }

  function toLanguageScopedPath(rawHref, lang) {
    if (!rawHref) return rawHref;
    if (/^(mailto:|tel:|javascript:|#)/i.test(rawHref)) return rawHref;

    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(rawHref);
    const base = window.location.origin;
    const url = new URL(rawHref, base);
    if (isAbsolute && url.origin !== base) return rawHref;

    const normalizedPath = normalizePathForRouteMap(url.pathname);
    let nextPath = normalizedPath;

    if (LOCALIZED_ROUTE_MAP[normalizedPath]) {
      nextPath = LOCALIZED_ROUTE_MAP[normalizedPath];
    }

    const projectBase = window.location.pathname.startsWith("/redesigned-octo-meme/")
      ? "/redesigned-octo-meme"
      : "";

    return `${projectBase}${nextPath}${url.search}${url.hash}`;
  }

  function getInitialLanguage() {
    return (
      normalizeLanguage(readClientCache(LANGUAGE_STORAGE_KEY)) ||
      normalizeLanguage(document.documentElement.dataset.pageLanguage) ||
      normalizeLanguage(document.documentElement.lang) ||
      "en"
    );
  }

  const I18N = {
    currentLanguage: getInitialLanguage(),

    init() {
      this.currentLanguage = getInitialLanguage();
      if (!translations[this.currentLanguage]) this.currentLanguage = "en";
      document.documentElement.lang = this.currentLanguage;
      this.applyLanguage();
      this.setupLanguageToggle();
    },

    t(key) {
      const translation = translations[this.currentLanguage]?.[key];
      return translation || translations.en[key] || key;
    },

    setLanguage(lang) {
      if (!translations[lang]) return;
      this.currentLanguage = lang;
      writeClientCache(LANGUAGE_STORAGE_KEY, lang);
      this.applyLanguage();
      document.documentElement.lang = lang;
    },

    toggleLanguage() {
      const newLang = this.currentLanguage === "en" ? "es" : "en";
      this.setLanguage(newLang);
      window.dispatchEvent(
        new CustomEvent("language:changed", { detail: { language: newLang } }),
      );
    },

    applyLanguage() {
      // Apply to data-i18n attributes
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = this.t(key);
      });

      // Apply to data-i18n-placeholder
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = this.t(key);
      });

      // Apply to data-i18n-title
      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        el.title = this.t(key);
      });

      // Apply to data-i18n-aria-label
      document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        el.setAttribute("aria-label", this.t(key));
      });

      // Apply to data-i18n-content for meta descriptions and similar content attributes
      document.querySelectorAll("[data-i18n-content]").forEach((el) => {
        const key = el.getAttribute("data-i18n-content");
        el.setAttribute("content", this.t(key));
      });

      // Apply to data-i18n-data-field-name for contact/security field labels
      document.querySelectorAll("[data-i18n-data-field-name]").forEach((el) => {
        const key = el.getAttribute("data-i18n-data-field-name");
        el.setAttribute("data-field-name", this.t(key));
      });

      // Apply to data-i18n-html (for content with HTML tags)
      document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        el.innerHTML = this.t(key);
      });

      this.syncLanguageScopedLinks();
    },

    syncLanguageScopedLinks() {
      document.querySelectorAll("a[href]").forEach((link) => {
        const originalHref = link.dataset.i18nOriginalHref || link.getAttribute("href");
        if (!originalHref) return;
        if (!link.dataset.i18nOriginalHref) {
          link.dataset.i18nOriginalHref = originalHref;
        }

        const nextHref = toLanguageScopedPath(originalHref, this.currentLanguage);
        if (nextHref && nextHref !== link.getAttribute("href")) {
          link.setAttribute("href", nextHref);
        }
      });
    },

    setupLanguageToggle() {
      const getLanguageToggles = () =>
        document.querySelectorAll("#language-toggle, [data-language-toggle]");
      const getNextLanguage = () => (this.currentLanguage === "en" ? "es" : "en");

      const updateLanguageToggle = () => {
        const nextLanguage = getNextLanguage();
        getLanguageToggles().forEach((toggle) => {
          const isMobileLanguageToggle = toggle.dataset.languageToggle === "mobile";
          toggle.textContent = isMobileLanguageToggle
            ? this.currentLanguage.toUpperCase()
            : nextLanguage.toUpperCase();
          toggle.setAttribute(
            "aria-label",
            nextLanguage === "es"
              ? this.t("switchToSpanish")
              : this.t("switchToEnglish"),
          );
        });
      };

      const bindLanguageToggles = () => {
        getLanguageToggles().forEach((toggle) => {
          if (toggle.dataset.languageToggleBound === "true") return;
          toggle.dataset.languageToggleBound = "true";
          toggle.addEventListener("click", () => this.toggleLanguage());
        });
        updateLanguageToggle();
      };

      bindLanguageToggles();
      window.addEventListener("language:changed", bindLanguageToggles);
    },
  };

  // Global access
  window.I18N = I18N;
  window.I18N_DB = translations;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => I18N.init());
  } else {
    I18N.init();
  }
})();
