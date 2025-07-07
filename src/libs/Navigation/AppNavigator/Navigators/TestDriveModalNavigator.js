"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var Modal_1 = require("@components/TestDrive/Modal");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
var SCREENS_1 = require("@src/SCREENS");
var Stack = (0, createPlatformStackNavigator_1.default)();
function TestDriveModalNavigator() {
    return (<NoDropZone_1.default>
            <react_native_1.View>
                <Stack.Navigator screenOptions={{ headerShown: false, animation: animation_1.default.SLIDE_FROM_RIGHT }}>
                    <Stack.Screen name={SCREENS_1.default.TEST_DRIVE_MODAL.ROOT} component={Modal_1.default}/>
                </Stack.Navigator>
            </react_native_1.View>
        </NoDropZone_1.default>);
}
TestDriveModalNavigator.displayName = 'TestDriveModalNavigator';
exports.default = TestDriveModalNavigator;
