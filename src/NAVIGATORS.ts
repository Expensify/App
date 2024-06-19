/**
 * This is a file containing constants for navigators located directly in the RootStack in AuthScreens file
 * The ResponsiveStackNavigator displays stack differently based on these constants
 * */
export default {
    CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
    BOTTOM_TAB_NAVIGATOR: 'BottomTabNavigator',
    LEFT_MODAL_NAVIGATOR: 'LeftModalNavigator',
    RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
    ONBOARDING_MODAL_NAVIGATOR: 'OnboardingModalNavigator',
    FEATURE_TRANING_MODAL_NAVIGATOR: 'FeatureTrainingModalNavigator',
    WELCOME_VIDEO_MODAL_NAVIGATOR: 'WelcomeVideoModalNavigator',
    EXPLANATION_MODAL_NAVIGATOR: 'ExplanationModalNavigator',
    FULL_SCREEN_NAVIGATOR: 'FullScreenNavigator',
    WORKSPACE_NAVIGATOR: 'WorkspaceNavigator',
} as const;
