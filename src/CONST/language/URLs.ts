import NEW_EXPENSIFY_URL from '@src/CONST/NEW_EXPENSIFY_URL';

const APP_DOWNLOAD_LINKS = {
    ANDROID: 'https://play.google.com/store/apps/details?id=org.me.mobiexpensifyg',
    IOS: 'https://apps.apple.com/us/app/expensify-travel-expense/id471713959',
    OLD_DOT_ANDROID: 'https://play.google.com/store/apps/details?id=org.me.mobiexpensifyg&hl=en_US&pli=1',
    OLD_DOT_IOS: 'https://apps.apple.com/us/app/expensify-expense-tracker/id471713959',
} as const;

const EMAIL = {
    ACCOUNTING: 'accounting@expensify.com',
    ACCOUNTS_PAYABLE: 'accountspayable@expensify.com',
    ADMIN: 'admin@expensify.com',
    BILLS: 'bills@expensify.com',
    CHRONOS: 'chronos@expensify.com',
    CONCIERGE: 'concierge@expensify.com',
    CONTRIBUTORS: 'contributors@expensify.com',
    FIRST_RESPONDER: 'firstresponders@expensify.com',
    GUIDES_DOMAIN: 'team.expensify.com',
    // cspell:disable-next-line
    QA_DOMAIN: 'applause.expensifail.com',
    HELP: 'help@expensify.com',
    INTEGRATION_TESTING_CREDS: 'integrationtestingcreds@expensify.com',
    NOTIFICATIONS: 'notifications@expensify.com',
    PAYROLL: 'payroll@expensify.com',
    QA: 'qa@expensify.com',
    QA_TRAVIS: 'qa+travisreceipts@expensify.com',
    RECEIPTS: 'receipts@expensify.com',
    STUDENT_AMBASSADOR: 'studentambassadors@expensify.com',
    SVFG: 'svfg@expensify.com',
    EXPENSIFY_EMAIL_DOMAIN: '@expensify.com',
    EXPENSIFY_TEAM_EMAIL_DOMAIN: '@team.expensify.com',
    TEAM: 'team@expensify.com',
    QA_GUIDE: 'qa.guide@team.expensify.com',
} as const;

const OLD_DOT_PUBLIC_URLS = {
    TERMS_URL: 'https://www.expensify.com/terms',
    PRIVACY_URL: 'https://www.expensify.com/privacy',
    LICENSES_URL: 'https://use.expensify.com/licenses',
    ACH_TERMS_URL: 'https://www.expensify.com/achterms',
    WALLET_AGREEMENT_URL: 'https://www.expensify.com/expensify-payments-wallet-terms-of-service',
    BANCORP_WALLET_AGREEMENT_URL: 'https://www.expensify.com/bancorp-bank-wallet-terms-of-service',
    EXPENSIFY_APPROVED_PROGRAM_URL: 'https://use.expensify.com/accountants-program',
    TRAVEL_TERMS_URL: 'https://www.expensify.com/travelterms',
    FEES_URL: 'https://www.expensify.com/fees',
} as const;

const HELP_DOC_LINKS = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Display name used as a lookup key.
    'Intuit Enterprise Suite': 'https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online',
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Display name used as a lookup key.
    'QuickBooks Online': 'https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online',
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Display name used as a lookup key.
    'QuickBooks Desktop': '',
    quickbooks: 'https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online',
    NetSuite: 'https://help.expensify.com/articles/new-expensify/connections/netsuite/Configure-Netsuite',
    Xero: 'https://help.expensify.com/articles/new-expensify/connections/xero/Configure-Xero',
    Intacct: 'https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Configure-Sage-Intacct',
    FinancialForce: 'https://help.expensify.com/articles/expensify-classic/connections/certinia/Connect-To-Certinia',
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Display name used as a lookup key.
    'Sage Intacct': 'https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Configure-Sage-Intacct',
    Certinia: 'https://help.expensify.com/articles/expensify-classic/connections/certinia/Connect-To-Certinia',
    MERGE_EXPENSES: 'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Merging-expenses',
} as const;

const TERMS = {
    CFPB_PREPAID: 'cfpb.gov/prepaid',
    CFPB_COMPLAINT: 'cfpb.gov/complaint',
    FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
} as const;

const AI_FEATURES_PROMO_LEARN_MORE_URLS = {
    SPEND_ANALYSIS: 'https://help.expensify.com/articles/new-expensify/concierge-ai/How-Concierge-Analyzes-Spend',
    EXPENSE_ASSISTANT: 'https://help.expensify.com/articles/new-expensify/concierge-ai/Expense-Assistant',
    BUILD_AGENTS: 'https://help.expensify.com/articles/new-expensify/ai-agents/Create-Agent-Rules',
} as const;

const EXAMPLE_PHONE_NUMBER = '+15005550006';
const FORMATTED_EXAMPLE_PHONE_NUMBER = '+1-(201)-867-5309';
const CONCIERGE_CHAT_NAME = 'Concierge';
const CONCIERGE_EXPLAIN_LINK_PATH = '/concierge/explain';
const SET_NOTIFICATION_LINK = 'https://community.expensify.com/discussion/5651/deep-dive-best-practices-when-youre-running-into-trouble-receiving-emails-from-expensify';
const DEEP_DIVE_EXPENSIFY_CARD = 'https://community.expensify.com/discussion/4848/deep-dive-expensify-card-and-quickbooks-online-auto-reconciliation-how-it-works';
const DEEP_DIVE_ERECEIPTS = 'https://community.expensify.com/discussion/5542/deep-dive-what-are-ereceipts/';
const DEEP_DIVE_PER_DIEM = 'https://community.expensify.com/discussion/4772/how-to-add-a-single-rate-per-diem';
const DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL =
    'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense#how-do-i-enable-camera-access-for-mobile-browsers-so-i-can-take-photos-of-my-receipts';
const CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL = 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules';
const SELECT_WORKFLOWS_HELP_URL = 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows';
const UNLOCK_BANK_ACCOUNT_HELP_URL = 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Unlock-a-Business-Bank-Account';
const ONFIDO_FACIAL_SCAN_POLICY_URL = 'https://onfido.com/facial-scan-policy-and-release/';
const ONFIDO_PRIVACY_POLICY_URL = 'https://onfido.com/privacy/';
const ONFIDO_TERMS_OF_SERVICE_URL = 'https://onfido.com/terms-of-service/';
const ELECTRONIC_DISCLOSURES_URL = 'https://use.expensify.com/esignagreement';
const CFPB_PREPAID_URL = 'https://cfpb.gov/prepaid';
const FEES_URL = 'https://www.expensify.com/fees';
const TRAVEL_TERMS_URL = 'https://www.expensify.com/travelterms';
const PRICING = 'https://www.expensify.com/pricing';
const CUSTOM_AGENTS_HELP_URL = 'https://help.expensify.com/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents';
const COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS =
    'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-a-mastercard-commercial-feed';
const COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP = 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-a-visa-commercial-feed';
const COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP =
    'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-an-american-express-corporate-feed';
const COMPANY_CARDS_STRIPE_HELP = 'https://dashboard.stripe.com/login?redirect=%2Fexpenses%2Fsettings';
const COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL = 'https://help.expensify.com/new-expensify/hubs/connect-credit-cards/';
const COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL = 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/Import-Company-Card-Transactions-From-a-Spreadsheet';
const CUSTOM_REPORT_NAME_HELP_URL = 'https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#formulas';
const IMPORT_TAGS_EXPENSIFY_URL = 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-tags#import-a-spreadsheet-1';
const IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS = 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-tags#multi-level-tags';
const UBER_TERMS_LINK = 'https://www.uber.com/us/en/business/sign-up/terms/expense-partners/';
const ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL = 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Enable-Global-Reimbursement';
const PERSONAL_DATA_PROTECTION_INFO_URL = 'https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information';
const COLLECT_UPGRADE_HELP_URL = 'https://help.expensify.com/Hidden/collect-upgrade';
const DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK = 'https://help.expensify.com/expensify-classic/hubs/copilots-and-delegates/';
const DOMAIN_VERIFICATION_HELP_URL = 'https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain';
const SAML_HELP_URL = 'https://help.expensify.com/articles/expensify-classic/domains/Set-Up-SAML-SSO';

export {
    AI_FEATURES_PROMO_LEARN_MORE_URLS,
    APP_DOWNLOAD_LINKS,
    CFPB_PREPAID_URL,
    COLLECT_UPGRADE_HELP_URL,
    COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP,
    COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL,
    COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL,
    COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS,
    COMPANY_CARDS_STRIPE_HELP,
    COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP,
    CONCIERGE_CHAT_NAME,
    CONCIERGE_EXPLAIN_LINK_PATH,
    CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL,
    CUSTOM_AGENTS_HELP_URL,
    CUSTOM_REPORT_NAME_HELP_URL,
    DEEP_DIVE_ERECEIPTS,
    DEEP_DIVE_EXPENSIFY_CARD,
    DEEP_DIVE_PER_DIEM,
    DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK,
    DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL,
    DOMAIN_VERIFICATION_HELP_URL,
    ELECTRONIC_DISCLOSURES_URL,
    EMAIL,
    ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL,
    EXAMPLE_PHONE_NUMBER,
    FEES_URL,
    FORMATTED_EXAMPLE_PHONE_NUMBER,
    HELP_DOC_LINKS,
    IMPORT_TAGS_EXPENSIFY_URL,
    IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS,
    NEW_EXPENSIFY_URL,
    OLD_DOT_PUBLIC_URLS,
    ONFIDO_FACIAL_SCAN_POLICY_URL,
    ONFIDO_PRIVACY_POLICY_URL,
    ONFIDO_TERMS_OF_SERVICE_URL,
    PERSONAL_DATA_PROTECTION_INFO_URL,
    PRICING,
    SAML_HELP_URL,
    SELECT_WORKFLOWS_HELP_URL,
    SET_NOTIFICATION_LINK,
    TERMS,
    TRAVEL_TERMS_URL,
    UBER_TERMS_LINK,
    UNLOCK_BANK_ACCOUNT_HELP_URL,
};
