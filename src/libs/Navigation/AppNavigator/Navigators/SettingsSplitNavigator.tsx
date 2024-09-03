import React from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import withPrepareCentralPaneScreen from '@src/components/withPrepareCentralPaneScreen';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;

type Screens = Partial<Record<keyof SettingsSplitNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_SETTINGS_SCREENS = {
    [SCREENS.SETTINGS.WORKSPACES]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/workspace/WorkspacesListPage').default),
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Preferences/PreferencesPage').default),
    [SCREENS.SETTINGS.SECURITY]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Security/SecuritySettingsPage').default),
    [SCREENS.SETTINGS.PROFILE.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Profile/ProfilePage').default),
    [SCREENS.SETTINGS.WALLET.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Wallet/WalletPage').default),
    [SCREENS.SETTINGS.ABOUT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/AboutPage/AboutPage').default),
    [SCREENS.SETTINGS.TROUBLESHOOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Troubleshoot/TroubleshootPage').default),
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default),
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default),
} satisfies Screens;

const Stack = createSplitStackNavigator<SettingsSplitNavigatorParamList>();

function SettingsSplitNavigator() {
    return (
        <FocusTrapForScreens>
            <Stack.Navigator
                sidebarScreen={SCREENS.SETTINGS.ROOT}
                defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            >
                <Stack.Screen
                    name={SCREENS.SETTINGS.ROOT}
                    getComponent={loadInitialSettingsPage}
                />
                {Object.entries(CENTRAL_PANE_SETTINGS_SCREENS).map(([screenName, componentGetter]) => (
                    <Stack.Screen
                        key={screenName}
                        name={screenName as keyof Screens}
                        getComponent={componentGetter}
                    />
                ))}
            </Stack.Navigator>
        </FocusTrapForScreens>
    );
}

SettingsSplitNavigator.displayName = 'SettingsSplitNavigator';

export {CENTRAL_PANE_SETTINGS_SCREENS};
export default SettingsSplitNavigator;
