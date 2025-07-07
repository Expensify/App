"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FocusTrapContainerElement_1 = require("@components/FocusTrap/FocusTrapContainerElement");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TabSelector_1 = require("@components/TabSelector/TabSelector");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var OnyxTabNavigator_1 = require("@libs/Navigation/OnyxTabNavigator");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NewChatPage_1 = require("./NewChatPage");
var WorkspaceNewRoomPage_1 = require("./workspace/WorkspaceNewRoomPage");
function NewChatSelectorPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var navigation = (0, native_1.useNavigation)();
    // The focus trap container elements of the header and back button, tab bar, and active tab
    var _a = (0, react_1.useState)(null), headerWithBackBtnContainerElement = _a[0], setHeaderWithBackButtonContainerElement = _a[1];
    var _b = (0, react_1.useState)(null), tabBarContainerElement = _b[0], setTabBarContainerElement = _b[1];
    var _c = (0, react_1.useState)(null), activeTabContainerElement = _c[0], setActiveTabContainerElement = _c[1];
    var formState = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM, { canBeMissing: false })[0];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var chatPageInputRef = (0, react_1.useRef)(null);
    var roomPageInputRef = (0, react_1.useRef)(null);
    // Theoretically, the focus trap container element can be null (due to component unmount/remount), so we filter out the null elements
    var containerElements = (0, react_1.useMemo)(function () {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter(function (element) { return !!element; });
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);
    var onTabFocusTrapContainerElementChanged = (0, react_1.useCallback)(function (activeTabElement) {
        setActiveTabContainerElement(activeTabElement !== null && activeTabElement !== void 0 ? activeTabElement : null);
    }, []);
    // We're focusing the input using internal onPageSelected to fix input focus inconsistencies on native.
    // More info: https://github.com/Expensify/App/issues/59388
    var onTabSelectFocusHandler = function (_a) {
        var index = _a.index;
        // We runAfterInteractions since the function is called in the animate block on web-based
        // implementation, this fixes an animation glitch and matches the native internal delay
        react_native_1.InteractionManager.runAfterInteractions(function () {
            var _a, _b;
            // Chat tab (0) / Room tab (1) according to OnyxTabNavigator (see below)
            if (index === 0) {
                (_a = chatPageInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
            else if (index === 1) {
                (_b = roomPageInputRef.current) === null || _b === void 0 ? void 0 : _b.focus();
            }
        });
    };
    (0, react_1.useEffect)(function () {
        (0, Report_1.setNewRoomFormLoading)(false);
    }, []);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableKeyboardAvoidingView={false} shouldShowOfflineIndicator={false} shouldEnableMaxHeight testID={NewChatSelectorPage.displayName} focusTrapSettings={{ containerElements: containerElements }}>
            <FocusTrapContainerElement_1.default onContainerElementChanged={setHeaderWithBackButtonContainerElement} style={[styles.w100]}>
                <HeaderWithBackButton_1.default title={translate('sidebarScreen.fabNewChat')} onBackButtonPress={navigation.goBack}/>
            </FocusTrapContainerElement_1.default>

            <OnyxTabNavigator_1.default id={CONST_1.default.TAB.NEW_CHAT_TAB_ID} tabBar={TabSelector_1.default} onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement} onActiveTabFocusTrapContainerElementChanged={onTabFocusTrapContainerElementChanged} disableSwipe={!!(formState === null || formState === void 0 ? void 0 : formState.isLoading) && shouldUseNarrowLayout} onTabSelect={onTabSelectFocusHandler}>
                <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB.NEW_CHAT}>
                    {function () { return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                            <NewChatPage_1.default ref={chatPageInputRef}/>
                        </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>); }}
                </OnyxTabNavigator_1.TopTab.Screen>
                <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB.NEW_ROOM}>
                    {function () { return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                            <WorkspaceNewRoomPage_1.default ref={roomPageInputRef}/>
                        </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>); }}
                </OnyxTabNavigator_1.TopTab.Screen>
            </OnyxTabNavigator_1.default>
        </ScreenWrapper_1.default>);
}
NewChatSelectorPage.displayName = 'NewChatSelectorPage';
exports.default = NewChatSelectorPage;
