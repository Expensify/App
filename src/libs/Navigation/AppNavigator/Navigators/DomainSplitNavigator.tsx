import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadDomainInitialPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainInitialPage').default;
const loadDomainSamlPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainSamlPage').default;

const Split = createSplitNavigator<DomainSplitNavigatorParamList>();

function DomainSplitNavigator({route}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    return (
        <FocusTrapForScreens>
            <View style={{flex: 1}}>
                <Split.Navigator
                    persistentScreens={[SCREENS.DOMAIN.INITIAL]}
                    sidebarScreen={SCREENS.DOMAIN.INITIAL}
                    defaultCentralScreen={SCREENS.DOMAIN.SAML}
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
                </Split.Navigator>
            </View>
        </FocusTrapForScreens>
    );
}

DomainSplitNavigator.displayName = 'DomainSplitNavigator';

export default DomainSplitNavigator;
