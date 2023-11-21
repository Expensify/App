import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import createCustomStackNavigator from '@libs/Navigation/AppNavigator/createCustomStackNavigator';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

const RootStack = createCustomStackNavigator();

function SettingsNavigator() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth);

    return (
        <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
            <RootStack.Navigator
                isSmallScreenWidth={isSmallScreenWidth}
                initialRouteName={ROUTES.SETTINGS_NEW_PROFILE}
                mode="modal"
            >
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_NAVIGATOR}
                    options={screenOptions.centralPaneNavigator}
                    component={NotFoundPage}
                />
                                <RootStack.Screen
                    name={ROUTES.SETTINGS_NEW_PROFILE}
                    options={screenOptions.fullScreen}
                    getComponent={NotFoundPage}
                />
            </RootStack.Navigator>
        </View>
    );
}

SettingsNavigator.propTypes = propTypes;
SettingsNavigator.displayName = 'SettingsNavigator';

export default SettingsNavigator;
