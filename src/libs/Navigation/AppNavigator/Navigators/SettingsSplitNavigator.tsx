import {useRoute} from '@react-navigation/native';
import React from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;

type Screens = Partial<Record<keyof SettingsSplitNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_SETTINGS_SCREENS = {
    [SCREENS.SETTINGS.WORKSPACES]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspacesListPage').default,
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/PreferencesPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require<ReactComponentModule>('../../../../pages/settings/Security/SecuritySettingsPage').default,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/ProfilePage').default,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/WalletPage').default,
    [SCREENS.SETTINGS.ABOUT]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/AboutPage').default,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require<ReactComponentModule>('../../../../pages/settings/Troubleshoot/TroubleshootPage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default,
} satisfies Screens;

const Split = createSplitNavigator<SettingsSplitNavigatorParamList>();

function SettingsSplitNavigator() {
    const route = useRoute();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    return (
        <FocusTrapForScreens>
            <Split.Navigator
                persistentScreens={[SCREENS.SETTINGS.ROOT]}
                sidebarScreen={SCREENS.SETTINGS.ROOT}
                defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
                parentRoute={route}
                screenOptions={splitNavigatorScreenOptions.centralScreen}
            >
                <Split.Screen
                    name={SCREENS.SETTINGS.ROOT}
                    getComponent={loadInitialSettingsPage}
                    options={splitNavigatorScreenOptions.sidebarScreen}
                />
                {Object.entries(CENTRAL_PANE_SETTINGS_SCREENS).map(([screenName, componentGetter]) => {
                    return (
                        <Split.Screen
                            key={screenName}
                            name={screenName as keyof Screens}
                            getComponent={componentGetter}
                        />
                    );
                })}
            </Split.Navigator>
        </FocusTrapForScreens>
    );
}

SettingsSplitNavigator.displayName = 'SettingsSplitNavigator';

export {CENTRAL_PANE_SETTINGS_SCREENS};
export default SettingsSplitNavigator;
