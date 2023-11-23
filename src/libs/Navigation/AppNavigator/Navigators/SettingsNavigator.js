import React from 'react';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createCustomStackNavigator from '@libs/Navigation/AppNavigator/createCustomStackNavigator';
import CustomFullScreenRouter from '@libs/Navigation/AppNavigator/createCustomStackNavigator/CustomFullScreenRouter';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useThemeStyles from '@styles/useThemeStyles';
import SCREENS from '@src/SCREENS';

const loadPage = () => require('../../../../pages/settings/InitialSettingsPage').default;

const propTypes = {};

const RootStack = createCustomStackNavigator(CustomFullScreenRouter);

function SettingsNavigator() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth);

    return (
        <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
            <RootStack.Navigator
                isSmallScreenWidth={isSmallScreenWidth}
                mode="modal"
            >
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

SettingsNavigator.propTypes = propTypes;
SettingsNavigator.displayName = 'SettingsNavigator';

export default SettingsNavigator;
