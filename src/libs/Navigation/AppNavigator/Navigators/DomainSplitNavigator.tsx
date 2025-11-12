import React, {useEffect} from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import {workspaceOrDomainSplitsWithoutEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadDomainInitialPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainInitialPage').default;
const loadDomainSamlPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainSamlPage').default;

const Split = createSplitNavigator<DomainSplitNavigatorParamList>();

function DomainSplitNavigator({route, navigation}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();
    const styles = useThemeStyles();

    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            // We want to call this function only once.
            unsubscribe();

            // If we open this screen from a different tab, then it won't have animation.
            if (!workspaceOrDomainSplitsWithoutEnteringAnimation.has(route.key)) {
                return;
            }

            // We want to set animation after mounting so it will animate on going UP to the settings split.
            navigation.setOptions({animation: Animations.SLIDE_FROM_RIGHT});
        });

        return unsubscribe;
    }, [navigation, route.key]);

    return (
        <FocusTrapForScreens>
            <View style={styles.flex1}>
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
