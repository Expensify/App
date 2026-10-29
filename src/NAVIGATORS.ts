/**
 * This is a file containing constants for navigators located directly in the RootStack in AuthScreens file
 * The ResponsiveStackNavigator displays stack differently based on these constants
 * */
export default {
    CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
    RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
    ONBOARDING_MODAL_NAVIGATOR: 'OnboardingModalNavigator',
    FEATURE_TRAINING_MODAL_NAVIGATOR: 'FeatureTrainingModalNavigator',
    MIGRATED_USER_MODAL_NAVIGATOR: 'MigratedUserModalNavigator',
    SUBMIT_PLAN_MODAL_NAVIGATOR: 'SubmitPlanModalNavigator',
    TEST_DRIVE_DEMO_NAVIGATOR: 'TestDriveDemoNavigator',
    REPORTS_SPLIT_NAVIGATOR: 'ReportsSplitNavigator',
    SETTINGS_SPLIT_NAVIGATOR: 'SettingsSplitNavigator',
    WORKSPACE_NAVIGATOR: 'WorkspaceNavigator',
    WORKSPACE_SPLIT_NAVIGATOR: 'WorkspaceSplitNavigator',
    DOMAIN_SPLIT_NAVIGATOR: 'DomainSplitNavigator',
    SEARCH_FULLSCREEN_NAVIGATOR: 'SearchFullscreenNavigator',
    SHARE_MODAL_NAVIGATOR: 'ShareModalNavigator',
    TEST_TOOLS_MODAL_NAVIGATOR: 'TestToolsModalNavigator',
    TAB_NAVIGATOR: 'TabNavigator',
} as const;
