"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var OnboardingWelcomeVideo_1 = require("@components/OnboardingWelcomeVideo");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var SCREENS_1 = require("@src/SCREENS");
var Stack = (0, createPlatformStackNavigator_1.default)();
function WelcomeVideoModalNavigator() {
    return (<NoDropZone_1.default>
            <react_native_1.View>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name={SCREENS_1.default.WELCOME_VIDEO.ROOT} component={OnboardingWelcomeVideo_1.default}/>
                </Stack.Navigator>
            </react_native_1.View>
        </NoDropZone_1.default>);
}
WelcomeVideoModalNavigator.displayName = 'WelcomeVideoModalNavigator';
exports.default = WelcomeVideoModalNavigator;
