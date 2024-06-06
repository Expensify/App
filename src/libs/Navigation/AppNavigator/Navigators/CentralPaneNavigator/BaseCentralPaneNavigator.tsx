import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import SearchPage from '@pages/Search/SearchPage';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const Stack = createStackNavigator<CentralPaneNavigatorParamList>();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

type Screens = Partial<Record<keyof CentralPaneNavigatorParamList, () => React.ComponentType>>;

const settingsScreens = {
    [SCREENS.SETTINGS.WORKSPACES]: () => require<ReactComponentModule>('../../../../../pages/workspace/WorkspacesListPage').default,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require<ReactComponentModule>('../../../../../pages/settings/Preferences/PreferencesPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require<ReactComponentModule>('../../../../../pages/settings/Security/SecuritySettingsPage').default,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require<ReactComponentModule>('../../../../../pages/settings/Profile/ProfilePage').default,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require<ReactComponentModule>('../../../../../pages/settings/Wallet/WalletPage').default,
    [SCREENS.SETTINGS.ABOUT]: () => require<ReactComponentModule>('../../../../../pages/settings/AboutPage/AboutPage').default,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require<ReactComponentModule>('../../../../../pages/settings/Troubleshoot/TroubleshootPage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<ReactComponentModule>('../../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => require<ReactComponentModule>('../../../../../pages/settings/Subscription/SubscriptionSettingsPage').default,
} satisfies Screens;

function BaseCentralPaneNavigator() {
    const styles = useThemeStyles();
    const options = {
        headerShown: false,
        title: 'New Expensify',

        // Prevent unnecessary scrolling
        cardStyle: styles.cardStyleNavigator,
    };

    return (
        <Stack.Navigator screenOptions={options}>
            <Stack.Screen
                name={SCREENS.REPORT}
                // We do it this way to avoid adding the url params to url
                initialParams={{openOnAdminRoom: openOnAdminRoom === 'true' || undefined}}
                component={ReportScreenWrapper}
            />
            <Stack.Screen
                name={SCREENS.SEARCH.CENTRAL_PANE}
                initialParams={{sortBy: CONST.SEARCH_TABLE_COLUMNS.DATE, sortOrder: CONST.SORT_ORDER.DESC}}
                component={SearchPage}
            />

            {Object.entries(settingsScreens).map(([screenName, componentGetter]) => (
                <Stack.Screen
                    key={screenName}
                    name={screenName as keyof Screens}
                    getComponent={componentGetter}
                />
            ))}
        </Stack.Navigator>
    );
}

export default BaseCentralPaneNavigator;
