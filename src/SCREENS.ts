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
        WALLET_DOMAIN_CARD: 'Settings_Wallet_DomainCard',
        WALLET_CARD_GET_PHYSICAL: {
            NAME: 'Settings_Card_Get_Physical_Name',
            PHONE: 'Settings_Card_Get_Physical_Phone',
            ADDRESS: 'Settings_Card_Get_Physical_Address',
            CONFIRM: 'Settings_Card_Get_Physical_Confirm',
        },
    },
    SAVE_THE_WORLD: {
        ROOT: 'SaveTheWorld_Root',
    },
    SIGN_IN_WITH_APPLE_DESKTOP: 'AppleSignInDesktop',
    SIGN_IN_WITH_GOOGLE_DESKTOP: 'GoogleSignInDesktop',
    DESKTOP_SIGN_IN_REDIRECT: 'DesktopSignInRedirect',
    SAML_SIGN_IN: 'SAMLSignIn',
} as const;

export {PROTECTED_SCREENS};
