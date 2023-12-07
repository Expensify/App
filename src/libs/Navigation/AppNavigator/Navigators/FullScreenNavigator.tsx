import React from 'react';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useThemeStyles from '@styles/useThemeStyles';
import SCREENS from '@src/SCREENS';
import createCustomFullScreenNavigator from '@libs/Navigation/AppNavigator/createCustomFullScreenNavigator';

const loadPage = () => require('../../../../pages/settings/InitialSettingsPage').default as React.ComponentType;

const RootStack = createCustomFullScreenNavigator();

function FullScreenNavigator() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth, styles);

    return (
        <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
            <RootStack.Navigator isSmallScreenWidth={isSmallScreenWidth}>
                <RootStack.Screen
                    name={SCREENS.SETTINGS_HOME}
                    options={screenOptions.homeScreen}
                    getComponent={loadPage}
                />
                <RootStack.Screen
                    name={SCREENS.SETTINGS_CENTRAL_PANE}
                    options={screenOptions.centralPaneNavigator}
                    component={ModalStackNavigators.AccountSettingsModalStackNavigator}
                />
            </RootStack.Navigator>
        </View>
    );
}

FullScreenNavigator.displayName = 'FullScreenNavigator';

export default FullScreenNavigator;
