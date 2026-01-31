import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import useEnableBackAnimationWhenOpenedFromTabBar from '@libs/Navigation/helpers/useEnableBackAnimationWhenOpenedFromTabBar';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import RHPAccessibilityWrapper from './RHPAccessibilityWrapper';

const loadDomainInitialPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainInitialPage').default;
const loadDomainSamlPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainSamlPage').default;
const loadDomainAdminsPage = () => require<ReactComponentModule>('../../../../pages/domain/Admins/DomainAdminsPage').default;
const loadDomainMembersPage = () => require<ReactComponentModule>('../../../../pages/domain/Members/DomainMembersPage').default;

const Split = createSplitNavigator<DomainSplitNavigatorParamList>();

function DomainSplitNavigator({route, navigation}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();
    const styles = useThemeStyles();

    useEnableBackAnimationWhenOpenedFromTabBar(navigation, route.key);

    return (
        <RHPAccessibilityWrapper>
            <FocusTrapForScreens>
                <View style={styles.flex1}>
                    <Split.Navigator
                        persistentScreens={[SCREENS.DOMAIN.INITIAL]}
                    sidebarScreen={SCREENS.DOMAIN.INITIAL}
                    defaultCentralScreen={SCREENS.DOMAIN.ADMINS}
                    parentRoute={route}
                    screenOptions={splitNavigatorScreenOptions.centralScreen}
                >
                    <Split.Screen
                        name={SCREENS.DOMAIN.INITIAL}
                        getComponent={loadDomainInitialPage}
                        options={splitNavigatorScreenOptions.sidebarScreen}
                    />

                    <Split.Screen
                        key={SCREENS.DOMAIN.SAML}
                        name={SCREENS.DOMAIN.SAML}
                        getComponent={loadDomainSamlPage}
                    />

                    <Split.Screen
                        key={SCREENS.DOMAIN.ADMINS}
                        name={SCREENS.DOMAIN.ADMINS}
                        getComponent={loadDomainAdminsPage}
                    />

                    <Split.Screen
                        key={SCREENS.DOMAIN.MEMBERS}
                        name={SCREENS.DOMAIN.MEMBERS}
                        getComponent={loadDomainMembersPage}
                    />
                    </Split.Navigator>
                </View>
            </FocusTrapForScreens>
        </RHPAccessibilityWrapper>
    );
}

export default DomainSplitNavigator;
