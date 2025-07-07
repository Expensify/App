"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ModalStackNavigators = require("@libs/Navigation/AppNavigator/ModalStackNavigators");
var useCustomScreenOptions_1 = require("@libs/Navigation/AppNavigator/useCustomScreenOptions");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var NarrowPaneContext_1 = require("./NarrowPaneContext");
var Overlay_1 = require("./Overlay");
var Stack = (0, createPlatformStackNavigator_1.default)();
function PublicRightModalNavigatorComponent(_a) {
    var navigation = _a.navigation;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var screenOptions = (0, useCustomScreenOptions_1.default)();
    return (<NarrowPaneContext_1.NarrowPaneContextProvider>
            <NoDropZone_1.default>
                {!shouldUseNarrowLayout && <Overlay_1.default onPress={navigation.goBack}/>}
                <react_native_1.View style={styles.RHPNavigatorContainer(shouldUseNarrowLayout)}>
                    <Stack.Navigator screenOptions={screenOptions} id={NAVIGATORS_1.default.PUBLIC_RIGHT_MODAL_NAVIGATOR}>
                        <Stack.Screen name={SCREENS_1.default.PUBLIC_CONSOLE_DEBUG} component={ModalStackNavigators.ConsoleModalStackNavigator}/>
                    </Stack.Navigator>
                </react_native_1.View>
            </NoDropZone_1.default>
        </NarrowPaneContext_1.NarrowPaneContextProvider>);
}
exports.default = PublicRightModalNavigatorComponent;
