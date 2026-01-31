import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import RHPAccessibilityWrapper from './RHPAccessibilityWrapper';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;

type Screens = Partial<Record<keyof SettingsSplitNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_SETTINGS_SCREENS = {
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/PreferencesPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require<ReactComponentModule>('../../../../pages/settings/Security/SecuritySettingsPage').default,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/ProfilePage').default,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/WalletPage').default,
    [SCREENS.SETTINGS.RULES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/ExpenseRulesPage').default,
    [SCREENS.SETTINGS.ABOUT]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/AboutPage').default,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require<ReactComponentModule>('../../../../pages/settings/Troubleshoot/TroubleshootPage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default,
} satisfies Screens;

const Split = createSplitNavigator<SettingsSplitNavigatorParamList>();

function SettingsSplitNavigator() {
    const route = useRoute();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    return (
        <RHPAccessibilityWrapper>
            <FocusTrapForScreens>
                <View style={{flex: 1}}>
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
                </View>
            </FocusTrapForScreens>
        </RHPAccessibilityWrapper>
    );
}

export {CENTRAL_PANE_SETTINGS_SCREENS};
export default SettingsSplitNavigator;
