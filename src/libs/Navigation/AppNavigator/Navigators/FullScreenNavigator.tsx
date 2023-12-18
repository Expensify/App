import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createCustomFullScreenNavigator from '@libs/Navigation/AppNavigator/createCustomFullScreenNavigator';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import SCREENS from '@src/SCREENS';

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
                    name={SCREENS.SETTINGS.ROOT}
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
