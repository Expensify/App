import {createNavigationContainerRef, NavigationContainer, NavigationIndependentTree} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import RequireTwoFactorAuthenticationPage from '@pages/RequireTwoFactorAuthenticationPage';
import SCREENS from '@src/SCREENS';

type RequireTwoFactorAuthOverlayParamList = {
    [SCREENS.REQUIRE_TWO_FACTOR_AUTH]: undefined;
};

const Stack = createPlatformStackNavigator<RequireTwoFactorAuthOverlayParamList>();
const navigationRef = createNavigationContainerRef<RequireTwoFactorAuthOverlayParamList>();

function RequireTwoFactorAuthOverlay() {
    return (
        <View style={StyleSheet.absoluteFill}>
            <NavigationIndependentTree>
                <NavigationContainer
                    ref={navigationRef}
                    independent
                >
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen
                            name={SCREENS.REQUIRE_TWO_FACTOR_AUTH}
                            component={RequireTwoFactorAuthenticationPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </NavigationIndependentTree>
        </View>
    );
}

RequireTwoFactorAuthOverlay.displayName = 'RequireTwoFactorAuthOverlay';

export default RequireTwoFactorAuthOverlay;
