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
        "Customer Relations Operations | Gabriel Services",
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
      customerRelations: "Customer Relations Operations",
      itSupport: "IT Support",

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
      homeTagline: "Outsource, Delivered",
      homeH1:
        "Reliable day-to-day execution,<br/>Outstanding operational support<br/>for modern businesses.",
      homeDescription:
        "Gabriel Services helps businesses run smoother with reliable day-to-day support across logistics, customer relations, administrative back office, and IT support.<br/><br/>We integrate with your workflows, keep communication clear, and help your team focus on priorities that drive growth.",
      bookConsultation: "Start a conversation",
      seeServiceCoverage: "Learn more",
      processeDriven: "Process-Driven Operations",
      practicalTransparent:
        "Practical, transparent, responsive, and aligned to your operating rhythm.",
      serviceAreasBuilt: "Service areas built for daily execution",
      logisticsDesc: "Dispatch and tracking continuity.",
      adminDesc: "Records, scheduling, and process upkeep.",
      customerRelDesc: "Communication, follow-up, and service rhythm.",
      itSupportDesc: "Ticket triage and day-to-day request handling.",
      exploreService: "Explore service",
      sitemap: "Sitemap",
      servicesOverview: "Services Overview",
      serviceOverviewTitle: "Service Overview",
      serviceOverviewIntro:
        "Gabriel Services delivers professional operational support across four core areas. Each service is designed to reduce friction, improve consistency, and let your team focus on what matters most.",
      serviceOverviewLogisticsDesc:
        "Structured coordination, shipment tracking, and operational continuity for supply chain activity.",
      serviceOverviewAdminDesc:
        "Documentation, calendar management, reporting, and process discipline to keep your business running smoothly.",
      serviceOverviewCustomerDesc:
        "Customer communications, issue resolution, and follow-up workflows designed to improve satisfaction and retention.",
      serviceOverviewItDesc:
        "Day-to-day technical support, ticket triage, and user-facing assistance for reliable IT continuity.",
      whyBusinessesTitle: "Why businesses work with Gabriel Services",
      whyBusinessesText:
        "Businesses choose Gabriel Services for practical execution, clear communication, and consistent daily support that helps teams stay focused on growth.",
      startSupportTitle: "Start with the support you need",
      requestConsultation: "Contact Gabo Services",
      viewEngagementOptions: "Ask gabo io",

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
        "Get in touch for support, onboarding, projects, and partnership opportunities.",
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
        "Tell us your expectation about the Remote Assistant expertise, knowledge and abilities",
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
        "Apply to help deliver Gabriel Services' core support services: logistics operations, administrative back office, customer relations operations, and day-to-day IT support.",
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
      itSupportServiceIntro:
        "Gabriel Services provides dependable IT support for everyday technical needs, including ticket triage, end-user assistance, and operational system support.",
      serviceHighlightsTitle: "Service Highlights",
      itSupportHighlight1: "Help desk intake and ticket creation",
      itSupportHighlight2: "Basic troubleshooting and issue diagnosis",
      itSupportHighlight3: "Account access and system support coordination",
      itSupportHighlight4:
        "Escalation management to specialized teams when needed",
      itSupportDeliveryTitle: "How We Deliver Support",
      itSupportDeliveryText:
        "We maintain a structured support rhythm that follows incoming requests from first contact through resolution, with visibility and accountability at every step.",
      itSupportDeliveryPoint1: "Fast ticket intake and triage",
      itSupportDeliveryPoint2: "Clear status updates and escalation pathways",
      itSupportDeliveryPoint3: "Practical, user-focused communication",
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
        "Operaciones de Relaciones con Clientes | Gabriel Services",
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
      customerRelations: "Operaciones de Relaciones con Clientes",
      itSupport: "Soporte de TI",

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
      homeTagline: "Tercerización, Entregada",
      homeH1:
        "Ejecución confiable día a día,<br/>Soporte operativo excepcional<br/>para negocios modernos.",
      homeDescription:
        "Gabriel Services brinda experiencia profunda en coordinación, gestión de operaciones, satisfacción del cliente y soporte de PC/escritorio para que su equipo se enfoque en el crecimiento mientras ejecutamos el día a día.<br/><br/>Proporcionamos Logística, Relaciones con Clientes, Back Office Administrativo y Soporte de TI.",
      bookConsultation: "Iniciar una conversación",
      seeServiceCoverage: "Conocer más",
      processeDriven: "Operaciones Impulsadas por Procesos",
      practicalTransparent:
        "Práctico, transparente, responsivo y alineado con su ritmo operativo.",
      serviceAreasBuilt: "Áreas de servicio construidas para ejecución diaria",
      logisticsDesc: "Continuidad de despacho y seguimiento.",
      adminDesc: "Registros, programación y mantenimiento de procesos.",
      customerRelDesc: "Comunicación, seguimiento y ritmo de servicio.",
      itSupportDesc: "Triaje de tickets y manejo de solicitudes diarias.",
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
        "Soporte técnico diario, triaje de tickets y asistencia al usuario para una continuidad confiable de TI.",
      whyBusinessesTitle: "Por qué las empresas trabajan con Gabriel Services",
      whyBusinessesText:
        "Consistencia, ejecución práctica y equipos experimentados y orientados al cliente que se sienten como un nuevo comienzo para sus operaciones.",
      startSupportTitle: "Comience con el apoyo que necesita",
      requestConsultation: "Contactar a Gabo Services",
      viewEngagementOptions: "Preguntar a gabo io",

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
        "Ponte en contacto para soporte, incorporación, proyectos y oportunidades de colaboración.",
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
        "Postúlate para operaciones logísticas, ejecución administrativa de back office, relaciones con clientes y flujos prácticos de soporte de TI.",
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
      itSupportServiceIntro:
        "Gabriel Services proporciona soporte de TI confiable para las necesidades técnicas diarias, incluyendo clasificación de tickets, asistencia a usuarios finales y soporte de sistemas operativos.",
      serviceHighlightsTitle: "Aspectos destacados del servicio",
      itSupportHighlight1:
        "Recepción de solicitudes de mesa de ayuda y creación de tickets.",
      itSupportHighlight2:
        "Solución básica de problemas y diagnóstico de incidencias.",
      itSupportHighlight3:
        "Coordinación de acceso a cuentas y soporte de sistemas.",
      itSupportHighlight4:
        "Gestión de escalaciones a equipos especializados cuando sea necesario.",
      itSupportDeliveryTitle: "Cómo brindamos soporte",
      itSupportDeliveryText:
        "Mantenemos un ritmo de soporte estructurado que da seguimiento a las solicitudes entrantes desde el primer contacto hasta la resolución, con visibilidad y responsabilidad en cada paso.",
      itSupportDeliveryPoint1: "Recepción y clasificación rápida de tickets.",
      itSupportDeliveryPoint2:
        "Actualizaciones claras de estado y rutas de escalación.",
      itSupportDeliveryPoint3:
        "Comunicación práctica y enfocada en el usuario.",
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
