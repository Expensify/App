import React from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import getRootNavigatorScreenOptions from '../getRootNavigatorScreenOptions';

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

const Stack = createSplitStackNavigator<SettingsSplitNavigatorParamList>();

function SettingsSplitNavigator() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const screenOptions = getRootNavigatorScreenOptions(shouldUseNarrowLayout, styles, StyleUtils);

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
                {Object.entries(CENTRAL_PANE_SETTINGS_SCREENS).map(([screenName, componentGetter]) => {
                    const options = {...screenOptions.centralPaneNavigator};

                    if (screenName === SCREENS.SETTINGS.WORKSPACES) {
                        options.animationEnabled = false;
                    }

                    return (
                        <Stack.Screen
                            key={screenName}
                            name={screenName as keyof Screens}
                            getComponent={componentGetter}
                            options={options}
                        />
                    );
                })}
            </Stack.Navigator>
        </FocusTrapForScreens>
    );
}

SettingsSplitNavigator.displayName = 'SettingsSplitNavigator';

export {CENTRAL_PANE_SETTINGS_SCREENS};
export default SettingsSplitNavigator;
