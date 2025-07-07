"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var FocusTrapForScreen_1 = require("@components/FocusTrap/FocusTrapForScreen");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var TestToolsModalPage_1 = require("@components/TestToolsModalPage");
var useIsAuthenticated_1 = require("@hooks/useIsAuthenticated");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var TestTool_1 = require("@userActions/TestTool");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var Overlay_1 = require("./Overlay");
var Stack = (0, createPlatformStackNavigator_1.default)();
function TestToolsModalNavigator() {
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var outerViewRef = (0, react_1.useRef)(null);
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    var handleOuterClick = (0, react_1.useCallback)(function () {
        requestAnimationFrame(function () {
            (0, TestTool_1.default)();
        });
    }, []);
    var handleInnerClick = (0, react_1.useCallback)(function (e) {
        e.stopPropagation();
    }, []);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE, function () { return (0, TestTool_1.default)(); }, { shouldBubble: true });
    return (<NoDropZone_1.default>
            <Overlay_1.default />
            <PressableWithoutFeedback_1.default ref={outerViewRef} onPress={handleOuterClick} style={[styles.getTestToolsNavigatorOuterView(shouldUseNarrowLayout), styles.cursorDefault]} accessibilityRole="button" accessibilityLabel="button">
                <FocusTrapForScreen_1.default>
                    <react_native_1.View onStartShouldSetResponder={function () { return true; }} onClick={handleInnerClick} style={styles.getTestToolsNavigatorInnerView(shouldUseNarrowLayout, isAuthenticated)}>
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name={SCREENS_1.default.TEST_TOOLS_MODAL.ROOT} component={TestToolsModalPage_1.default}/>
                        </Stack.Navigator>
                    </react_native_1.View>
                </FocusTrapForScreen_1.default>
            </PressableWithoutFeedback_1.default>
        </NoDropZone_1.default>);
}
TestToolsModalNavigator.displayName = 'TestToolsModalNavigator';
exports.default = TestToolsModalNavigator;
