import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator<CentralPaneNavigatorParamList>();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

type Screens = Partial<Record<keyof CentralPaneNavigatorParamList, () => React.ComponentType>>;

// const workspaceSettingsScreens = {
//     [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../../../pages/workspace/WorkspacesListPage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.PROFILE]: () => require('../../../../../pages/workspace/WorkspaceProfilePage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.CARD]: () => require('../../../../../pages/workspace/card/WorkspaceCardPage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.REIMBURSE]: () => require('../../../../../pages/workspace/reimburse/WorkspaceReimbursePage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.BILLS]: () => require('../../../../../pages/workspace/bills/WorkspaceBillsPage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.INVOICES]: () => require('../../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.TRAVEL]: () => require('../../../../../pages/workspace/travel/WorkspaceTravelPage').default as React.ComponentType,
//     [SCREENS.WORKSPACE.MEMBERS]: () => require('../../../../../pages/workspace/WorkspaceMembersPage').default as React.ComponentType,
// } satisfies Screens;

const settingsScreens = {
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../../../pages/workspace/WorkspacesListPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require('../../../../../pages/settings/Preferences/PreferencesPage').default as React.ComponentType,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../../../pages/settings/Security/SecuritySettingsPage').default as React.ComponentType,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require('../../../../../pages/settings/Profile/ProfilePage').default as React.ComponentType,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require('../../../../../pages/settings/Wallet/WalletPage').default as React.ComponentType,
    [SCREENS.SETTINGS.ABOUT]: () => require('../../../../../pages/settings/AboutPage/AboutPage').default as React.ComponentType,
};

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
            {/* <Stack.Screen
                name={SCREENS.SETTINGS_CENTRAL_PANE}
                // options={screenOptions.centralPaneNavigator}
                component={ModalStackNavigators.AccountSettingsModalStackNavigator}
            /> */}
            {Object.entries(settingsScreens).map(([screenName, componentGetter]) => (
                <Stack.Screen
                    key={screenName}
                    name={screenName as keyof Screens}
                    getComponent={componentGetter}
                />
            ))}
            {/* {Object.entries(workspaceSettingsScreens).map(([screenName, componentGetter]) => (
                <Stack.Screen
                    key={screenName}
                    name={screenName as keyof Screens}
                    getComponent={componentGetter}
                />
            ))} */}
        </Stack.Navigator>
    );
}

export default BaseCentralPaneNavigator;
