/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */

const PROTECTED_SCREENS = {
    HOME: 'Home',
    CONCIERGE: 'Concierge',
    REPORT_ATTACHMENTS: 'ReportAttachments',
} as const;

export default {
    ...PROTECTED_SCREENS,
    LOADING: 'Loading',
    REPORT: 'Report',
    NOT_FOUND: 'not-found',
    TRANSITION_BETWEEN_APPS: 'TransitionBetweenApps',
    VALIDATE_LOGIN: 'ValidateLogin',
    SETTINGS: {
        ROOT: 'Settings_Root',
        PREFERENCES: 'Settings_Preferences',
        WORKSPACES: 'Settings_Workspaces',
        SECURITY: 'Settings_Security',
        STATUS: 'Settings_Status',
        WALLET: 'Settings_Wallet',
        WALLET_DOMAIN_CARDS: 'Settings_Wallet_DomainCards',
    },
    SAVE_THE_WORLD: {
        ROOT: 'SaveTheWorld_Root',
    },
    SIGN_IN_WITH_APPLE_DESKTOP: 'AppleSignInDesktop',
    SIGN_IN_WITH_GOOGLE_DESKTOP: 'GoogleSignInDesktop',
    DESKTOP_SIGN_IN_REDIRECT: 'DesktopSignInRedirect',
    SAML_SIGN_IN: 'SAMLSignIn',

    // Iframe screens from olddot
    HOME_OLDDOT: 'Home_OLDDOT',

    // Money tab
    EXPENSES_OLDDOT: 'Expenses_OLDDOT',
    REPORTS_OLDDOT: 'Reports_OLDDOT',
    INSIGHTS_OLDDOT: 'Insights_OLDDOT',

    // Workspaces tab
    INDIVIDUAL_WORKSPACE_OLDDOT: 'IndividualWorkspace_OLDDOT',
    GROUPS_WORKSPACES_OLDDOT: 'GroupsWorkspaces_OLDDOT',
    DOMAINS_OLDDOT: 'Domains_OLDDOT',
    DOMAIN_OLDDOT: 'Domain_OLDDOT',

    // Breadcrumb screens
    WORKSPACE_OLDDOT: 'Workspace_OLDDOT',

    WORKSPACE_OVERVIEW_OLDDOT: 'Workspace_Overview_OLDDOT',
    WORKSPACE_EXPENSES_OLDDOT: 'Workspace_Expenses_OLDDOT',
    WORKSPACE_REPORTS_OLDDOT: 'Workspace_Reports_OLDDOT',
    WORKSPACE_CONNECTIONS_OLDDOT: 'Workspace_Connections_OLDDOT',
    WORKSPACE_CATEGORIES_OLDDOT: 'Workspace_Categories_OLDDOT',
    WORKSPACE_TAGS_OLDDOT: 'Workspace_Tags_OLDDOT',
    WORKSPACE_TAX_OLDDOT: 'Workspace_Tax_OLDDOT',
    WORKSPACE_MEMBERS_OLDDOT: 'Workspace_Members_OLDDOT',
    WORKSPACE_REIMBURSEMENT_OLDDOT: 'Workspace_Reimbursement_OLDDOT',
    WORKSPACE_TRAVEL_OLDDOT: 'Workspace_Travel_OLDDOT',
    WORKSPACE_PER_DIEM_OLDDOT: 'Workspace_PerDiem_OLDDOT',
    WORKSPACE_EXPORT_FORMATS_OLDDOT: 'Workspace_ExportFormats_OLDDOT',
    WORKSPACE_INVOICES_OLDDOT: 'Workspace_Invoices_OLDDOT',
    WORKSPACE_PLAN_OLDDOT: 'Workspace_Plan_OLDDOT',

    DOMAIN_COMPANY_CARDS_OLDDOT: 'Domain_CompanyCards_OLDDOT',
    DOMAIN_ADMINS_OLDDOT: 'Domain_Admins_OLDDOT',
    DOMAIN_MEMBERS_OLDDOT: 'Domain_Members_OLDDOT',
    DOMAIN_GROUPS_OLDDOT: 'Domain_Groups_OLDDOT',
    DOMAIN_REPORTING_TOOLS_OLDDOT: 'Domain_ReportingTools_OLDDOT',
    DOMAIN_SAML_OLDDOT: 'Domain_SAML_OLDDOT',
} as const;

export {PROTECTED_SCREENS};
