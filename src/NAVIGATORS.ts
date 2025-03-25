/**
 * This is a file containing constants for navigators located directly in the RootStack in AuthScreens file
 * The ResponsiveStackNavigator displays stack differently based on these constants
 * */
export default {
    CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
    LEFT_MODAL_NAVIGATOR: 'LeftModalNavigator',
    RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
    ONBOARDING_MODAL_NAVIGATOR: 'OnboardingModalNavigator',
    FEATURE_TRANING_MODAL_NAVIGATOR: 'FeatureTrainingModalNavigator',
    WELCOME_VIDEO_MODAL_NAVIGATOR: 'WelcomeVideoModalNavigator',
    EXPLANATION_MODAL_NAVIGATOR: 'ExplanationModalNavigator',
    MIGRATED_USER_MODAL_NAVIGATOR: 'MigratedUserModalNavigator',
    REPORTS_SPLIT_NAVIGATOR: 'ReportsSplitNavigator',
    SETTINGS_SPLIT_NAVIGATOR: 'SettingsSplitNavigator',
    WORKSPACE_SPLIT_NAVIGATOR: 'WorkspaceSplitNavigator',
    SEARCH_FULLSCREEN_NAVIGATOR: 'SearchFullscreenNavigator',
    SHARE_MODAL_NAVIGATOR: 'ShareModalNavigator',
    PUBLIC_RIGHT_MODAL_NAVIGATOR: 'PublicRightModalNavigator',
} as const;
