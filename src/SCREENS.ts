/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */
export default {
    HOME: 'Home',
    LOADING: 'Loading',
    REPORT: 'Report',
    REPORT_ATTACHMENTS: 'ReportAttachments',
    NOT_FOUND: 'not-found',
    TRANSITION_BETWEEN_APPS: 'TransitionBetweenApps',
    VALIDATE_LOGIN: 'ValidateLogin',
    CONCIERGE: 'Concierge',
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

    // Spend tab
    EXPENSES_OLDDOT: 'Expenses_OLDDOT',
    REPORTS_OLDDOT: 'Reports_OLDDOT',
    INSIGHTS_OLDDOT: 'Insights_OLDDOT',

    // Workspaces tab
    INDIVIDUAL_WORKSPACES_OLDDOT: 'IndividualWorkspaces_OLDDOT',
    GROUPS_WORKSPACES_OLDDOT: 'GroupWorkspaces_OLDDOT',
    CARDS_AND_DOMAINS_OLDDOT: 'CardsAndDomains_OLDDOT',
} as const;
