/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */

type Screen = {
    HOME: string,
    LOADING: string,
    REPORT: string,
    REPORT_ATTACHMENTS: string,
    NOT_FOUND: string,
    TRANSITION_BETWEEN_APPS: string,
    SETTINGS: {
        PREFERENCES: string,
        WORKSPACES: string,
    },
    SIGN_IN_WITH_APPLE_DESKTOP: string,
    SIGN_IN_WITH_GOOGLE_DESKTOP: string,
}

const SCREENS: Screen = {
    HOME: 'Home',
    LOADING: 'Loading',
    REPORT: 'Report',
    REPORT_ATTACHMENTS: 'ReportAttachments',
    NOT_FOUND: 'not-found',
    TRANSITION_BETWEEN_APPS: 'TransitionBetweenApps',
    SETTINGS: {
        PREFERENCES: 'Settings_Preferences',
        WORKSPACES: 'Settings_Workspaces',
    },
    SIGN_IN_WITH_APPLE_DESKTOP: 'AppleSignInDesktop',
    SIGN_IN_WITH_GOOGLE_DESKTOP: 'GoogleSignInDesktop',
};

export default SCREENS;
