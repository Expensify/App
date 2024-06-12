import type {CentralPaneName} from '@libs/Navigation/types';
import withPrepareCentralPaneScreen from '@src/components/withPrepareCentralPaneScreen';
import SCREENS from '@src/SCREENS';

type Screens = Partial<Record<CentralPaneName, () => React.ComponentType>>;

const CENTRAL_PANE_SCREENS = {
    [SCREENS.SETTINGS.WORKSPACES]: () => withPrepareCentralPaneScreen(require('../../../pages/workspace/WorkspacesListPage').default as React.ComponentType),
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Preferences/PreferencesPage').default as React.ComponentType),
    [SCREENS.SETTINGS.SECURITY]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Security/SecuritySettingsPage').default as React.ComponentType),
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Profile/ProfilePage').default as React.ComponentType),
    [SCREENS.SETTINGS.WALLET.ROOT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Wallet/WalletPage').default as React.ComponentType),
    [SCREENS.SETTINGS.ABOUT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/AboutPage/AboutPage').default as React.ComponentType),
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Troubleshoot/TroubleshootPage').default as React.ComponentType),
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => withPrepareCentralPaneScreen(require('../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType),
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => withPrepareCentralPaneScreen(require('../../../pages/settings/Subscription/SubscriptionSettingsPage').default as React.ComponentType),
    [SCREENS.SEARCH.CENTRAL_PANE]: () => withPrepareCentralPaneScreen(require('../../../pages/Search/SearchPage').default as React.ComponentType),
    [SCREENS.REPORT]: () => withPrepareCentralPaneScreen(require('./ReportScreenWrapper').default as React.ComponentType),
} satisfies Screens;

export default CENTRAL_PANE_SCREENS;
