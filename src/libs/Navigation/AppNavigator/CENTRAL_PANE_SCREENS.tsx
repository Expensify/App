import type {CentralPaneName} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

type Screens = Partial<Record<CentralPaneName, () => React.ComponentType>>;

const CENTRAL_PANE_SCREENS = {
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../pages/workspace/WorkspacesListPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require('../../../pages/settings/Preferences/PreferencesPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../pages/settings/Security/SecuritySettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require('../../../pages/settings/Profile/ProfilePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require('../../../pages/settings/Wallet/WalletPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ABOUT]: () => require('../../../pages/settings/AboutPage/AboutPage').default as React.ComponentType,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require('../../../pages/settings/Troubleshoot/TroubleshootPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require('../../../pages/TeachersUnite/SaveTheWorldPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => require('../../../pages/settings/Subscription/SubscriptionSettingsPage').default as React.ComponentType,
    [SCREENS.SEARCH.CENTRAL_PANE]: () => require('../../../pages/Search/SearchPage').default as React.ComponentType,
    [SCREENS.REPORT]: () => require('./ReportScreenWrapper').default as React.ComponentType,
} satisfies Screens;

export default CENTRAL_PANE_SCREENS;
