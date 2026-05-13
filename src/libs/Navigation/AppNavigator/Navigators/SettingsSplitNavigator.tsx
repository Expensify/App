import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import SettingsSidebar from '@components/Navigation/SettingsSidebar';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import {SidebarWidthContext} from '@libs/Navigation/AppNavigator/createSplitNavigator/SidebarSpacerWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;
const loadEmptyComponent = () => require<ReactComponentModule>('@components/EmptyComponent').default;

type Screens = Partial<Record<keyof SettingsSplitNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_SETTINGS_SCREENS = {
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Preferences/PreferencesPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require<ReactComponentModule>('../../../../pages/settings/Security/SecuritySettingsPage').default,
    [SCREENS.SETTINGS.PROFILE.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Profile/ProfilePage').default,
    [SCREENS.SETTINGS.WALLET.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Wallet/WalletPage').default,
    [SCREENS.SETTINGS.AGENTS.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Agents/AgentsPage').default,
    [SCREENS.SETTINGS.RULES.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Rules/ExpenseRulesPage').default,
    [SCREENS.SETTINGS.HELP]: () => require<ReactComponentModule>('../../../../pages/settings/HelpPage/HelpPage').default,
    [SCREENS.SETTINGS.ABOUT]: () => require<ReactComponentModule>('../../../../pages/settings/AboutPage/AboutPage').default,
    [SCREENS.SETTINGS.TROUBLESHOOT]: () => require<ReactComponentModule>('../../../../pages/settings/Troubleshoot/TroubleshootPage').default,
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: () => require<ReactComponentModule>('../../../../pages/TeachersUnite/SaveTheWorldPage').default,
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default,
} satisfies Screens;

const Split = createSplitNavigator<SettingsSplitNavigatorParamList>();

function SettingsSplitNavigator() {
    const route = useRoute();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // On wide, the sidebar lives OUTSIDE the navigator (see SettingsSidebar). Pass 0 so
    // the SidebarSpacerWrapper and the sidebar card don't reserve / collide with that
    // space — the outside sidebar's animated width is what shifts the central content.
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions(shouldUseNarrowLayout ? undefined : 0);

    return (
        <FocusTrapForScreens>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <SettingsSidebar />
                <View style={{flex: 1}}>
                    {/* On wide, the sidebar is rendered OUTSIDE the navigator. Override the
                        SidebarWidthContext so the SidebarSpacerWrapper inside doesn't push
                        the central content right by 280px — it should fill its flex:1 slot. */}
                    <SidebarWidthContext.Provider value={shouldUseNarrowLayout ? variables.sideBarWithLHBWidth : 0}>
                        <Split.Navigator
                            persistentScreens={[SCREENS.SETTINGS.ROOT]}
                            sidebarScreen={SCREENS.SETTINGS.ROOT}
                            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
                            parentRoute={route}
                            screenOptions={splitNavigatorScreenOptions.centralScreen}
                        >
                            <Split.Screen
                                name={SCREENS.SETTINGS.ROOT}
                                // On wide, the sidebar is rendered by SettingsSidebar outside this
                                // navigator. Inside the navigator the sidebar slot is empty.
                                getComponent={shouldUseNarrowLayout ? loadInitialSettingsPage : loadEmptyComponent}
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
                    </SidebarWidthContext.Provider>
                </View>
            </View>
        </FocusTrapForScreens>
    );
}

export default SettingsSplitNavigator;
