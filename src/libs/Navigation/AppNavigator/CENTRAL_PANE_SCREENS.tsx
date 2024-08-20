import type {CentralPaneName} from '@libs/Navigation/types';
import withPrepareCentralPaneScreen from '@src/components/withPrepareCentralPaneScreen';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type Screens = Partial<Record<CentralPaneName, () => React.ComponentType>>;

const CENTRAL_PANE_SCREENS = {
    [SCREENS.SETTINGS.WORKSPACES]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/workspace/WorkspacesListPage').default),
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Preferences/PreferencesPage').default),
    [SCREENS.SETTINGS.SECURITY]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Security/SecuritySettingsPage').default),
    [SCREENS.SETTINGS.PROFILE.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Profile/ProfilePage').default),
    [SCREENS.SETTINGS.WALLET.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Wallet/WalletPage').default),
    [SCREENS.SETTINGS.ABOUT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/AboutPage/AboutPage').default),
    [SCREENS.SETTINGS.TROUBLESHOOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Troubleshoot/TroubleshootPage').default),
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/TeachersUnite/SaveTheWorldPage').default),
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/settings/Subscription/SubscriptionSettingsPage').default),
    [SCREENS.SEARCH.CENTRAL_PANE]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/Search/SearchPage').default),
    [SCREENS.REPORT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../pages/home/ReportScreen').default),
} satisfies Screens;

export default CENTRAL_PANE_SCREENS;
