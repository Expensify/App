import type {ValueOf} from 'type-fest';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {AuthScreensParamList, CentralPaneScreensParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

type Screens = Partial<Record<keyof AuthScreensParamList, () => React.ComponentType>>;

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

const CENTRAL_PANE_SCREEN_NAMES = Object.keys(CENTRAL_PANE_SCREENS);

type CentralPaneName = keyof typeof CENTRAL_PANE_SCREENS;

function getCentralPaneScreenInitialParams(screenName: CentralPaneName): Partial<ValueOf<CentralPaneScreensParamList>> {
    const url = getCurrentUrl();
    const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

    if (screenName === SCREENS.SEARCH.CENTRAL_PANE) {
        return {sortBy: CONST.SEARCH_TABLE_COLUMNS.DATE, sortOrder: CONST.SORT_ORDER.DESC};
    }

    if (screenName === SCREENS.REPORT && openOnAdminRoom === 'true') {
        return {openOnAdminRoom: true};
    }

    return undefined;
}

export type {CentralPaneName};

export {CENTRAL_PANE_SCREENS, CENTRAL_PANE_SCREEN_NAMES, getCentralPaneScreenInitialParams};
