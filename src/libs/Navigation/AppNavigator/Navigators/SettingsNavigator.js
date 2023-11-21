import {createStackNavigator} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import RHPScreenOptions from '@libs/Navigation/AppNavigator/RHPScreenOptions';
import useThemeStyles from '@styles/useThemeStyles';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

const Stack = createStackNavigator();

const propTypes = {
    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

function SettingsNavigator() {
    const styles = useThemeStyles();

    return (
            <View style={styles.fullScreen}>
                <Stack.Navigator screenOptions={RHPScreenOptions}>
                    <Stack.Screen
                        name="NewNavigator"
                        component={NotFoundPage}
                    />
                </Stack.Navigator>
            </View>
    );
}

SettingsNavigator.propTypes = propTypes;
SettingsNavigator.displayName = 'SettingsNavigator';

export default SettingsNavigator;
